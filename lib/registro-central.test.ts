import { describe, it, expect, vi, afterEach } from "vitest";
import { interpretarSonda, sondarGravacao } from "./registro-central";
import { fetchRemoteRecords, insertRemoteRecordDetalhado, motivoDaFalha, type ResultRecord } from "./history";

const rec: ResultRecord = {
  id: "t1", createdAt: "2026-09-12T00:00:00Z", instrumentId: "phq-9", acronym: "PHQ-9", instrumentName: "x",
  totalScore: 1, maxScore: 27, bandLabel: "Mínimo", severity: "none",
};

function resposta(status: number, body = "") {
  return { ok: status >= 200 && status < 300, status, text: async () => body } as unknown as Response;
}

afterEach(() => vi.unstubAllGlobals());

describe("interpretarSonda", () => {
  it("23514 = RLS passou (gravação OK); 42501/401 = bloqueada; 404 = tabela ausente; null = sem conexão", () => {
    expect(interpretarSonda(400, '{"code":"23514"}').gravacao).toBe("ok");
    expect(interpretarSonda(401, '{"code":"42501","message":"row-level security"}').gravacao).toBe("bloqueada");
    expect(interpretarSonda(403, "").gravacao).toBe("bloqueada");
    expect(interpretarSonda(401, '{"message":"Invalid API key"}').gravacao).toBe("chave-invalida");
    expect(interpretarSonda(404, "").gravacao).toBe("tabela-ausente");
    expect(interpretarSonda(null, "").gravacao).toBe("sem-conexao");
    expect(interpretarSonda(500, "boom").gravacao).toBe("desconhecido");
  });
});

describe("sondarGravacao", () => {
  it("envia uma linha inválida de propósito e nunca lança", async () => {
    const fetchMock = vi.fn(async (_u: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body));
      expect(body.total_score).toBeGreaterThan(1000);
      return resposta(400, '{"code":"23514"}');
    });
    vi.stubGlobal("fetch", fetchMock);
    expect((await sondarGravacao()).gravacao).toBe("ok");
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("rede"); }));
    expect((await sondarGravacao()).gravacao).toBe("sem-conexao");
    vi.stubGlobal("fetch", vi.fn(async () => resposta(201)));
    expect((await sondarGravacao()).gravacao).toBe("desconhecido");
  });
});

/** Resposta JSON como as rotas /api/* devolvem (com json() e text()). */
function respostaJson(status: number, corpo: unknown) {
  const texto = JSON.stringify(corpo);
  return { ok: status >= 200 && status < 300, status, text: async () => texto, json: async () => JSON.parse(texto) } as unknown as Response;
}

describe("insertRemoteRecordDetalhado (contrato de POST /api/resultados)", () => {
  it("envia { record } para /api/resultados e repassa { ok, status, motivo } da rota", async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe("/api/resultados");
      expect(JSON.parse(String(init.body))).toEqual({ record: rec });
      return respostaJson(200, { ok: true, status: 201 });
    });
    vi.stubGlobal("fetch", fetchMock);
    expect(await insertRemoteRecordDetalhado(rec)).toEqual({ ok: true, status: 201, motivo: undefined });
  });
  it("409 (já estava lá) conta como ok; o motivo de aviso é propagado", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaJson(200, { ok: true, status: 409 })));
    expect(await insertRemoteRecordDetalhado(rec)).toMatchObject({ ok: true, status: 409 });
    vi.stubGlobal("fetch", vi.fn(async () => respostaJson(200, { ok: true, status: 201, motivo: "gravado sem a revisão item a item: ela passou do tamanho que o banco aceita" })));
    const r = await insertRemoteRecordDetalhado(rec);
    expect(r.ok).toBe(true);
    expect(r.motivo).toMatch(/sem a revisão item a item/);
  });
  it("HTTP 200 com { ok:false, status, motivo } (o banco recusou) vira falha com o motivo da rota", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaJson(200, { ok: false, status: 401, motivo: "o banco recusou a gravação (HTTP 401, política RLS) — a chave ou a permissão de inserção mudou" })));
    const r = await insertRemoteRecordDetalhado(rec);
    expect(r).toEqual({ ok: false, status: 401, motivo: expect.stringMatching(/recusou a gravação.*RLS/) });
    vi.stubGlobal("fetch", vi.fn(async () => respostaJson(200, { ok: false, status: 500, motivo: "o banco central falhou: sem conexão com o banco" })));
    expect(await insertRemoteRecordDetalhado(rec)).toEqual({ ok: false, status: 500, motivo: "o banco central falhou: sem conexão com o banco" });
  });
  it("erros HTTP da própria rota: usa o motivo/erro do corpo ou cai em motivoDaFalha", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaJson(400, { ok: false, status: 400, motivo: "registro inválido (campos obrigatórios ausentes ou com tipo errado)" })));
    expect(await insertRemoteRecordDetalhado(rec)).toEqual({ ok: false, status: 400, motivo: expect.stringMatching(/registro inválido/) });
    vi.stubGlobal("fetch", vi.fn(async () => respostaJson(413, { erro: "corpo grande demais" })));
    expect(await insertRemoteRecordDetalhado(rec)).toEqual({ ok: false, status: 413, motivo: "corpo grande demais" });
    vi.stubGlobal("fetch", vi.fn(async () => resposta(502, "<html>bad gateway</html>")));
    expect((await insertRemoteRecordDetalhado(rec)).motivo).toMatch(/fora do ar/);
  });
  it("fetch lançando = sem conexão com o servidor do site; 2xx sem JSON cai no fallback por status", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    expect((await insertRemoteRecordDetalhado(rec)).motivo).toMatch(/sem conexão/);
    // Intencional: resposta 2xx sem corpo interpretável ainda conta como gravada.
    vi.stubGlobal("fetch", vi.fn(async () => resposta(201)));
    expect(await insertRemoteRecordDetalhado(rec)).toEqual({ ok: true, status: 201 });
  });
  it("motivoDaFalha cobre os códigos mais comuns", () => {
    expect(motivoDaFalha(404, "")).toMatch(/não existe/);
    expect(motivoDaFalha(400, '{"code":"23514"}')).toMatch(/rejeitou os dados/);
    expect(motivoDaFalha(413, "")).toMatch(/grande demais/);
    expect(motivoDaFalha(503, "")).toMatch(/fora do ar/);
    expect(motivoDaFalha(418, "")).toMatch(/inesperada/);
    expect(motivoDaFalha(undefined, "")).toMatch(/sem conexão/);
  });
});

describe("fetchRemoteRecords (contrato de POST /api/painel/resultados)", () => {
  it("envia { senha } e devolve a lista de { registros }", async () => {
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      expect(url).toBe("/api/painel/resultados");
      expect(JSON.parse(String(init.body))).toEqual({ senha: "s3nha" });
      return respostaJson(200, { registros: [rec] });
    });
    vi.stubGlobal("fetch", fetchMock);
    expect(await fetchRemoteRecords("s3nha")).toEqual([rec]);
  });
  it("401 vira 'Senha incorreta.'; 429/502 trazem o erro da rota; resposta sem lista é inesperada", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => respostaJson(401, { erro: "senha incorreta" })));
    await expect(fetchRemoteRecords("x")).rejects.toThrow("Senha incorreta.");
    vi.stubGlobal("fetch", vi.fn(async () => respostaJson(429, { erro: "muitas tentativas de senha; aguarde 15 min" })));
    await expect(fetchRemoteRecords("x")).rejects.toThrow(/429.*muitas tentativas/);
    vi.stubGlobal("fetch", vi.fn(async () => respostaJson(502, { erro: "painel sem senha configurada: defina a variável PAINEL_SENHA_INICIAL na Vercel e faça Redeploy" })));
    await expect(fetchRemoteRecords("x")).rejects.toThrow(/PAINEL_SENHA_INICIAL/);
    vi.stubGlobal("fetch", vi.fn(async () => respostaJson(200, { outra: 1 })));
    await expect(fetchRemoteRecords("x")).rejects.toThrow(/inesperada/);
    vi.stubGlobal("fetch", vi.fn(async () => resposta(200, "")));
    await expect(fetchRemoteRecords("x")).rejects.toThrow(/incompleta/);
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    await expect(fetchRemoteRecords("x")).rejects.toThrow(/servidor do site/);
  });
});
