import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  JANELA_FALHAS_MS,
  MAX_FALHAS_SENHA,
  bloqueioPorTentativas,
  lerJson,
  limparTentativas,
  registrarSenhaErrada,
  respostaDeErro,
  senhaDoCorpo,
} from "./http";
import { ErroRegistro, mensagemSegura, resumoDoErro } from "./erros";
import { validarRegistro } from "./linhas";
import type { RegistroBackend } from "./tipos";

// Rotas /api/* do registro central e seus utilitários, com um backend falso:
// códigos HTTP (400/401/413/429/502), redação de erros e o whitelist de campos.

const backendFalso: RegistroBackend = {
  nome: "postgres",
  inserirResultado: vi.fn(async () => ({ ok: true, status: 201 })),
  listarResultados: vi.fn(async (senha: string) => {
    if (senha !== "certa") throw new ErroRegistro("senha incorreta");
    return [];
  }),
  inserirVisita: vi.fn(async () => true),
  listarVisitas: vi.fn(async (senha: string) => {
    if (senha !== "certa") throw new ErroRegistro("senha incorreta");
    return [];
  }),
  sondar: vi.fn(async () => ({ gravacao: "ok" as const, status: 200, detalhe: "ok" })),
  importar: vi.fn(async (senha: string) => {
    if (senha !== "certa") throw new ErroRegistro("senha incorreta");
    return { resultados: 1, visitas: 2 };
  }),
};

vi.mock("@/lib/registro", () => ({ backendAtual: () => backendFalso }));

const { POST: postResultados } = await import("@/app/api/resultados/route");
const { POST: postPainelResultados } = await import("@/app/api/painel/resultados/route");
const { POST: postPainelVisitas } = await import("@/app/api/painel/visitas/route");
const { POST: postImportar } = await import("@/app/api/importar/route");
const { POST: postExportar } = await import("@/app/api/exportar/route");
const { GET: getSonda } = await import("@/app/api/registro-central/route");

function req(body: unknown, extra: Record<string, string> = {}, texto?: string): Request {
  return new Request("http://site/api/x", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extra },
    body: texto ?? JSON.stringify(body),
  });
}

const registro = {
  id: "r1", createdAt: "2026-09-12T00:00:00Z", instrumentId: "phq-9", acronym: "PHQ-9", instrumentName: "x",
  totalScore: 1, maxScore: 27, bandLabel: "Mínimo", severity: "none",
};

beforeEach(() => {
  limparTentativas();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("lerJson", () => {
  it("413 pelo content-length anunciado e pelo tamanho real; 400 em JSON inválido", async () => {
    const grande = await lerJson(req({}, { "content-length": "999999" }), 1000);
    expect(grande.ok).toBe(false);
    if (!grande.ok) expect(grande.resposta.status).toBe(413);
    const real = await lerJson(req(null, {}, `{"x":"${"a".repeat(2000)}"}`), 1000);
    if (!real.ok) expect(real.resposta.status).toBe(413);
    else throw new Error("deveria recusar");
    const invalido = await lerJson(req(null, {}, "{não é json"), 1000);
    if (!invalido.ok) {
      expect(invalido.resposta.status).toBe(400);
      expect(await invalido.resposta.json()).toEqual({ erro: "JSON inválido" });
    } else throw new Error("deveria recusar");
    const ok = await lerJson(req({ senha: "s" }), 1000);
    expect(ok).toEqual({ ok: true, dados: { senha: "s" } });
  });
  it("senhaDoCorpo só aceita string", () => {
    expect(senhaDoCorpo({ senha: "abc" })).toBe("abc");
    expect(senhaDoCorpo({ senha: 123 })).toBe("");
    expect(senhaDoCorpo(null)).toBe("");
    expect(senhaDoCorpo("x")).toBe("");
  });
});

describe("mensagemSegura / resumoDoErro", () => {
  it("redige a connection string e categoriza erros do driver sem ecoar nomes internos", () => {
    vi.stubEnv("DATABASE_URL", "postgresql://neondb_owner:SEGREDO123@ep-x.neon.tech/neondb");
    const e = new Error("not a valid URL (connection string: postgresql://neondb_owner:SEGREDO123@ep-x.neon.tech/neondb)");
    expect(mensagemSegura(e)).not.toContain("SEGREDO123");
    expect(mensagemSegura(e)).toContain("[DATABASE_URL]");
    expect(resumoDoErro(e)).toBe("DATABASE_URL inválida (use a connection string do Neon)");
    expect(resumoDoErro(new Error('password authentication failed for user "neondb_owner"'))).not.toContain("neondb_owner");
    expect(resumoDoErro(new Error('relation "public.segredo" does not exist'))).toBe("tabela ou objeto ausente no banco");
    expect(resumoDoErro(new TypeError("fetch failed"))).toBe("sem conexão com o banco");
    expect(resumoDoErro(Object.assign(new Error("x"), { code: "42501" }))).toBe("permissão negada no banco");
    expect(resumoDoErro(new Error("algo muito específico do planner"))).toBe("erro interno do banco");
    expect(resumoDoErro(new ErroRegistro("senha incorreta"))).toBe("senha incorreta");
    vi.unstubAllEnvs();
  });
});

describe("respostaDeErro", () => {
  it("401 para senha incorreta, 502 com texto curado para ErroRegistro e 502 genérico para o resto", async () => {
    const r401 = respostaDeErro(new ErroRegistro("senha incorreta"));
    expect(r401.status).toBe(401);
    expect(await r401.json()).toEqual({ erro: "senha incorreta" });
    const curado = respostaDeErro(new ErroRegistro("importação disponível só com DATABASE_URL (Postgres/Neon)"));
    expect(curado.status).toBe(502);
    expect((await curado.json()).erro).toContain("DATABASE_URL");
    const cru = respostaDeErro(new Error('password authentication failed for user "neondb_owner" postgres://u:p@h/db'));
    expect(cru.status).toBe(502);
    const corpo = await cru.json();
    expect(corpo.erro).toBe("falha no banco central: o banco recusou as credenciais de DATABASE_URL");
    expect(JSON.stringify(corpo)).not.toContain("neondb_owner");
    expect(console.error).toHaveBeenCalled();
  });
});

describe("freio de tentativas de senha", () => {
  it("bloqueia o IP com 429 após MAX_FALHAS_SENHA erros e libera quando a janela passa", () => {
    const r = req({}, { "x-real-ip": "9.9.9.9" });
    const t0 = 1_000_000;
    for (let i = 0; i < MAX_FALHAS_SENHA; i++) {
      expect(bloqueioPorTentativas(r, t0 + i)).toBeNull();
      registrarSenhaErrada(r, t0 + i);
    }
    const bloqueado = bloqueioPorTentativas(r, t0 + MAX_FALHAS_SENHA);
    expect(bloqueado?.status).toBe(429);
    expect(bloqueado?.headers.get("Retry-After")).toMatch(/^\d+$/);
    // Outro IP não é afetado.
    expect(bloqueioPorTentativas(req({}, { "x-real-ip": "8.8.8.8" }), t0 + MAX_FALHAS_SENHA)).toBeNull();
    // Passada a janela, pode tentar de novo.
    expect(bloqueioPorTentativas(r, t0 + JANELA_FALHAS_MS + MAX_FALHAS_SENHA)).toBeNull();
  });
});

describe("POST /api/resultados", () => {
  it("400 em registro inválido, 200 { ok, status } no sucesso e 413 em corpo grande", async () => {
    const invalido = await postResultados(req({ record: { id: "x" } }));
    expect(invalido.status).toBe(400);
    expect((await invalido.json()).ok).toBe(false);
    const ok = await postResultados(req({ record: registro }));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ ok: true, status: 201 });
    expect(backendFalso.inserirResultado).toHaveBeenCalledWith(expect.objectContaining({ id: "r1" }));
    const grande = await postResultados(req({ record: { ...registro, notes: ["n".repeat(400 * 1024)] } }));
    expect(grande.status).toBe(413);
  });
  it("devolve o { ok:false, status, motivo } do backend com HTTP 200 e nunca o texto cru de uma exceção", async () => {
    vi.mocked(backendFalso.inserirResultado).mockResolvedValueOnce({ ok: false, status: 500, motivo: "o banco central falhou: sem conexão com o banco" });
    const r = await postResultados(req({ record: registro }));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: false, status: 500, motivo: "o banco central falhou: sem conexão com o banco" });
    vi.mocked(backendFalso.inserirResultado).mockRejectedValueOnce(new Error("postgres://u:SENHA@h/db explodiu"));
    const r2 = await postResultados(req({ record: registro }));
    const j = await r2.json();
    expect(j.ok).toBe(false);
    expect(JSON.stringify(j)).not.toContain("SENHA");
    expect(JSON.stringify(j)).not.toContain("explodiu");
  });
});

describe("rotas protegidas por senha", () => {
  it("/api/painel/resultados: 400 sem senha, 401 senha errada, 200 { registros }", async () => {
    expect((await postPainelResultados(req({}))).status).toBe(400);
    const errada = await postPainelResultados(req({ senha: "errada" }));
    expect(errada.status).toBe(401);
    expect(await errada.json()).toEqual({ erro: "senha incorreta" });
    const certa = await postPainelResultados(req({ senha: "certa" }));
    expect(certa.status).toBe(200);
    expect(await certa.json()).toEqual({ registros: [] });
  });
  it("/api/painel/visitas: 401 / 200 { visitas } / 502 genérico em erro do driver", async () => {
    expect((await postPainelVisitas(req({ senha: "errada" }))).status).toBe(401);
    expect(await (await postPainelVisitas(req({ senha: "certa" }))).json()).toEqual({ visitas: [] });
    vi.mocked(backendFalso.listarVisitas).mockRejectedValueOnce(new Error('relation "public.visitas" does not exist'));
    const r = await postPainelVisitas(req({ senha: "certa" }));
    expect(r.status).toBe(502);
    expect((await r.json()).erro).toBe("falha no banco central: tabela ou objeto ausente no banco");
  });
  it("/api/importar: 400 em corpo errado, 401, 200 { resultados, visitas }, 502 com texto curado", async () => {
    expect((await postImportar(req({ senha: "certa" }))).status).toBe(400);
    expect((await postImportar(req({ senha: "certa", resultados: "x" }))).status).toBe(400);
    expect((await postImportar(req({ senha: "errada", resultados: [] }))).status).toBe(401);
    expect(await (await postImportar(req({ senha: "certa", resultados: [], visitas: [] }))).json()).toEqual({ resultados: 1, visitas: 2 });
    vi.mocked(backendFalso.importar).mockRejectedValueOnce(new ErroRegistro("importação disponível só com DATABASE_URL (Postgres/Neon)"));
    const r = await postImportar(req({ senha: "certa", resultados: [] }));
    expect(r.status).toBe(502);
    expect((await r.json()).erro).toContain("DATABASE_URL");
  });
  it("/api/exportar: 401 senha errada; 200 com origem/resultados/visitas; visitas_status 502 se só os acessos falharem", async () => {
    expect((await postExportar(req({ senha: "errada" }))).status).toBe(401);
    const ok = await postExportar(req({ senha: "certa" }));
    expect(await ok.json()).toEqual({ origem: "postgres", resultados: [], visitas: [], visitas_status: 200 });
    vi.mocked(backendFalso.listarVisitas).mockRejectedValueOnce(new Error("sem tabela"));
    expect(await (await postExportar(req({ senha: "certa" }))).json()).toMatchObject({ visitas: [], visitas_status: 502 });
  });
  it("a senha errada repetida vira 429 nas quatro rotas", async () => {
    const ip = { "x-real-ip": "7.7.7.7" };
    for (let i = 0; i < MAX_FALHAS_SENHA; i++) expect((await postPainelResultados(req({ senha: "errada" }, ip))).status).toBe(401);
    expect((await postPainelResultados(req({ senha: "certa" }, ip))).status).toBe(429);
    expect((await postPainelVisitas(req({ senha: "certa" }, ip))).status).toBe(429);
    expect((await postImportar(req({ senha: "certa", resultados: [] }, ip))).status).toBe(429);
    expect((await postExportar(req({ senha: "certa" }, ip))).status).toBe(429);
    expect(backendFalso.listarResultados).toHaveBeenCalledTimes(MAX_FALHAS_SENHA);
  });
});

describe("GET /api/registro-central", () => {
  it("devolve a sonda com o nome do backend e o texto da situação", async () => {
    const j = await (await getSonda()).json();
    expect(j).toMatchObject({ gravacao: "ok", backend: "postgres", texto: expect.stringContaining("OK") });
  });
});

describe("validarRegistro (whitelist)", () => {
  it("exige os obrigatórios com os tipos certos, descarta campos desconhecidos e normaliza severity", () => {
    expect(validarRegistro(null)).toBeNull();
    expect(validarRegistro([])).toBeNull();
    expect(validarRegistro({ ...registro, totalScore: "1" })).toBeNull();
    expect(validarRegistro({ ...registro, id: "" })).toBeNull();
    expect(validarRegistro({ ...registro, subscales: "x" })).toBeNull();
    expect(validarRegistro({ ...registro, detalhes: {} })).toBeNull();
    const v = validarRegistro({ ...registro, severity: "inventada", extra: "fora", __proto__x: 1, metricIsMean: "sim" })!;
    expect(v).not.toBeNull();
    expect(v.severity).toBe("info");
    expect("extra" in v).toBe(false);
    expect(v.metricIsMean).toBeUndefined();
    expect(Object.keys(v).sort()).toEqual([
      "acronym", "bandLabel", "createdAt", "detalhes", "durationSeconds", "id", "instrumentId", "instrumentName",
      "maxScore", "metricIsMean", "notes", "positive", "respondent", "severity", "subscales", "totalScore",
    ]);
  });
});
