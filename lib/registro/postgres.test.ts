import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { criarBackendPostgres, LOTE_IMPORTACAO, MOTIVO_SEM_SENHA, type Executor } from "./postgres";
import { MOTIVO_SEM_DETALHES } from "./linhas";
import type { DetalheItem, RecordSubscale, ResultRecord } from "../history";
import type { Visita } from "../visitas";

// Backend Postgres de verdade, rodando num Postgres de verdade (PGlite, em
// memória): schema, gravação idempotente, senha, listagens, importação e
// truncamento — sem rede e sem mocks.

/** Senha inicial do painel: vem SÓ do ambiente (não existe senha padrão no código). */
const SENHA = "senha-de-teste-9f3k";

const base: ResultRecord = {
  id: "r-1",
  createdAt: "2026-09-12T00:00:00.000Z",
  instrumentId: "treino-classificacao",
  acronym: "CLAS",
  instrumentName: "Treino de classificação",
  respondent: "Gabi",
  totalScore: 12.5,
  maxScore: 14,
  bandLabel: "Alto",
  severity: "high",
  positive: false,
  metricIsMean: false,
  subscales: [{ name: "Bloco A", raw: 6, max: 7, mean: 0.86 }],
  durationSeconds: 321,
  detalhes: [
    { n: 1, id: "a", escolhida: 2, correta: 2, acertou: true, regra: "cor", tempoSeg: 4, grupo: "facil" },
    { n: 2, id: "b", escolhida: null, correta: 1, acertou: false, regra: "forma", tempoSeg: 9 },
  ],
};

const visita: Visita = {
  ip: "187.10.20.30",
  pais: "BR",
  regiao: "SP",
  cidade: "São Paulo",
  caminho: "/teste-qi",
  referer: "https://google.com/search",
  userAgent: "Mozilla/5.0 (iPhone) Safari/604.1",
  idioma: "pt-BR",
};

let db: PGlite;
let exec: Executor;

function executorDe(banco: PGlite): Executor {
  return (sql, params) => banco.query<Record<string, unknown>>(sql, params as unknown[] | undefined);
}

beforeAll(async () => {
  vi.stubEnv("PAINEL_SENHA_INICIAL", SENHA);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  db = new PGlite();
  exec = executorDe(db);
}, 60_000);

afterAll(async () => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await db.close();
});

describe("criarBackendPostgres (PGlite)", () => {
  it("cria o schema de forma idempotente e semeia PAINEL_SENHA_INICIAL uma vez só", async () => {
    const b = criarBackendPostgres(exec);
    expect((await b.sondar()).gravacao).toBe("ok");
    // Segunda instância sobre o mesmo banco: create if not exists + não ressemeia.
    const b2 = criarBackendPostgres(exec);
    expect((await b2.sondar()).gravacao).toBe("ok");
    const { rows } = await exec("select count(*)::int as n from public.admin_config");
    expect(Number(rows[0].n)).toBe(1);
    const tabelas = await exec(
      "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
    );
    expect(tabelas.rows.map((r) => r.table_name)).toEqual(["admin_config", "resultados", "visitas"]);
  }, 30_000);

  it("sondar devolve ok com o detalhe do Postgres e, quando o banco falha, só uma categoria (sem o texto cru)", async () => {
    const b = criarBackendPostgres(exec);
    expect(await b.sondar()).toEqual({ gravacao: "ok", status: 200, detalhe: "Postgres/Neon: conexão e schema OK" });
    const quebrado = criarBackendPostgres(async () => {
      throw new Error("connection refused postgres://user:senha@host/db");
    });
    const s = await quebrado.sondar();
    expect(s).toEqual({ gravacao: "sem-conexao", status: null, detalhe: "Postgres/Neon: sem conexão com o banco" });
    const credenciais = criarBackendPostgres(async () => {
      throw new Error('password authentication failed for user "neondb_owner"');
    });
    expect((await credenciais.sondar()).detalhe).toBe("Postgres/Neon: o banco recusou as credenciais de DATABASE_URL");
    expect(console.error).toHaveBeenCalled();
  });

  it("inserirResultado grava (201) e a repetição conta como ok com 409", async () => {
    const b = criarBackendPostgres(exec);
    expect(await b.inserirResultado(base)).toEqual({ ok: true, status: 201 });
    expect(await b.inserirResultado(base)).toEqual({ ok: true, status: 409 });
    const { rows } = await exec("select count(*)::int as n from public.resultados where client_id = $1", [base.id]);
    expect(Number(rows[0].n)).toBe(1);
  });

  it("created_at vem do servidor, nunca do cliente", async () => {
    const b = criarBackendPostgres(exec);
    await b.inserirResultado({ ...base, id: "r-data", createdAt: "1999-01-01T00:00:00.000Z" });
    const lista = await b.listarResultados(SENHA);
    const r = lista.find((x) => x.id === "r-data")!;
    expect(Date.parse(r.createdAt)).toBeGreaterThan(Date.parse("2020-01-01T00:00:00Z"));
  });

  it("listarResultados exige a senha certa e devolve os campos mapeados, mais recentes primeiro", async () => {
    const b = criarBackendPostgres(exec);
    await exec("delete from public.resultados");
    await b.inserirResultado({ ...base, id: "r-antigo", respondent: undefined });
    await exec("update public.resultados set created_at = now() - interval '1 day' where client_id = 'r-antigo'");
    await b.inserirResultado({ ...base, id: "r-novo" });
    await expect(b.listarResultados("errada")).rejects.toThrow("senha incorreta");
    await expect(b.listarResultados("")).rejects.toThrow("senha incorreta");
    const lista = await b.listarResultados(SENHA);
    expect(lista.map((r) => r.id)).toEqual(["r-novo", "r-antigo"]);
    const r = lista[0];
    expect(r.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
    expect(r.instrumentId).toBe(base.instrumentId);
    expect(r.acronym).toBe(base.acronym);
    expect(r.instrumentName).toBe(base.instrumentName);
    expect(r.respondent).toBe("Gabi");
    expect(r.totalScore).toBe(12.5); // numeric volta como texto: Number() no mapeamento
    expect(r.maxScore).toBe(14);
    expect(r.bandLabel).toBe("Alto");
    expect(r.severity).toBe("high");
    expect(r.positive).toBe(false);
    expect(r.metricIsMean).toBe(false);
    expect(r.subscales).toEqual(base.subscales);
    expect(r.durationSeconds).toBe(321);
    expect(r.detalhes).toEqual(base.detalhes);
    expect(lista[1].respondent).toBeUndefined();
  });

  it("inserirVisita e listarVisitas (senha certa; mais recentes primeiro)", async () => {
    const b = criarBackendPostgres(exec);
    await exec("delete from public.visitas");
    expect(await b.inserirVisita(visita)).toBe(true);
    await new Promise((r) => setTimeout(r, 5)); // created_at distinto: a ordem "mais recente primeiro" fica determinística
    expect(await b.inserirVisita({ ...visita, ip: null, caminho: "/sobre" })).toBe(true);
    await expect(b.listarVisitas("errada")).rejects.toThrow("senha incorreta");
    const vs = await b.listarVisitas(SENHA);
    expect(vs).toHaveLength(2);
    expect(vs[0].caminho).toBe("/sobre");
    expect(vs[0].ip).toBeNull();
    expect(vs[1]).toMatchObject({ ...visita });
    expect(vs[1].id).toMatch(/^[0-9a-f-]{36}$/);
    expect(Date.parse(vs[1].createdAt)).not.toBeNaN();
  });

  it("trunca textos longos e limita números para nunca estourar os CHECKs", async () => {
    const b = criarBackendPostgres(exec);
    const longo: ResultRecord = {
      ...base,
      id: "x".repeat(100),
      instrumentId: "i".repeat(100),
      acronym: "a".repeat(50),
      instrumentName: "n".repeat(500),
      respondent: "r".repeat(200),
      bandLabel: "b".repeat(300),
      severity: "severe",
      totalScore: 99999,
      maxScore: -5,
      durationSeconds: 1_000_000,
    };
    expect((await b.inserirResultado(longo)).ok).toBe(true);
    const r = (await b.listarResultados(SENHA)).find((x) => x.id === "x".repeat(64))!;
    expect(r).toBeDefined();
    expect(r.instrumentId).toHaveLength(60);
    expect(r.acronym).toHaveLength(30);
    expect(r.instrumentName).toHaveLength(160);
    expect(r.respondent).toHaveLength(80);
    expect(r.bandLabel).toHaveLength(120);
    expect(r.totalScore).toBe(1000);
    expect(r.maxScore).toBe(0);
    expect(r.durationSeconds).toBe(86400);

    const vl: Visita = { ...visita, ip: "1".repeat(100), cidade: "c".repeat(500), userAgent: "u".repeat(1000), idioma: "i".repeat(100) };
    expect(await b.inserirVisita(vl)).toBe(true);
    const v = (await b.listarVisitas(SENHA))[0];
    expect(v.ip).toHaveLength(45);
    expect(v.cidade).toHaveLength(120);
    expect(v.userAgent).toHaveLength(300);
    expect(v.idioma).toHaveLength(40);
  });

  it("revisão item a item acima do limite: grava o resumo (201) com motivo e sem detalhes na listagem", async () => {
    const b = criarBackendPostgres(exec);
    const detalhes: DetalheItem[] = Array.from({ length: 6000 }, (_, i) => ({
      n: i + 1, id: `item-${i}`, escolhida: 3, correta: 2, acertou: false, regra: "regra longa o bastante", tempoSeg: 7,
    }));
    expect(new TextEncoder().encode(JSON.stringify(detalhes)).length).toBeGreaterThan(262144 * 0.6);
    const r = await b.inserirResultado({ ...base, id: "r-gigante", detalhes });
    expect(r).toEqual({ ok: true, status: 201, motivo: MOTIVO_SEM_DETALHES });
    // Repetição: continua avisando, agora com 409.
    expect(await b.inserirResultado({ ...base, id: "r-gigante", detalhes })).toEqual({ ok: true, status: 409, motivo: MOTIVO_SEM_DETALHES });
    const gravado = (await b.listarResultados(SENHA)).find((x) => x.id === "r-gigante")!;
    expect(gravado.detalhes).toBeUndefined();
    expect(gravado.subscales).toEqual(base.subscales);
    expect(gravado.durationSeconds).toBe(321);
  });

  it("violação de CHECK de verdade (jsonb maior que o texto) vira 422 sem gravar", async () => {
    const b = criarBackendPostgres(exec);
    // 1200 objetos minúsculos: 9.600 bytes de texto passam pela folga de 60 %,
    // mas o jsonb ocupa mais que 16 KiB e o CHECK da coluna recusa.
    const subscales = Array.from({ length: 1200 }, () => ({ a: 1 })) as unknown as RecordSubscale[];
    expect(await b.inserirResultado({ ...base, id: "r-check", subscales })).toEqual({
      ok: false, status: 422, motivo: "o banco rejeitou os dados (restrição de valores)",
    });
    const { rows } = await exec("select count(*)::int as n from public.resultados where client_id = 'r-check'");
    expect(Number(rows[0].n)).toBe(0);
  });

  it("importar é idempotente, preserva created_at e aceita os dois formatos de exportação", async () => {
    const b = criarBackendPostgres(exec);
    await exec("delete from public.resultados");
    await exec("delete from public.visitas");
    const dados = {
      resultados: [
        // formato atual (registro do site, camelCase)
        { ...base, id: "imp-1", createdAt: "2025-03-04T05:06:07.000Z" },
        // formato antigo (linha do Supabase, snake_case)
        {
          id: "0b2f60bf-67ef-4de4-8512-c02469207d50",
          client_id: "imp-2",
          created_at: "2025-01-02T03:04:05+00:00",
          instrument_id: "phq-9",
          acronym: "PHQ-9",
          instrument_name: "Questionário de Saúde do Paciente",
          respondent: null,
          total_score: "9",
          max_score: "27",
          band_label: "Leve",
          severity: "mild",
          positive: true,
          metric_is_mean: false,
          subscales: null,
          duracao_segundos: 60,
          detalhes: null,
        },
        { lixo: true },
      ],
      visitas: [
        { created_at: "2025-01-02T03:04:05.000Z", ip: "1.1.1.1", caminho: "/", user_agent: "curl/8" },
        { createdAt: "2025-01-02T03:04:06.000Z", ip: "2.2.2.2", caminho: "/sobre", userAgent: "Mozilla" },
        // repetida dentro do próprio lote
        { created_at: "2025-01-02T03:04:05.000Z", ip: "1.1.1.1", caminho: "/", user_agent: "curl/8" },
        { nada: 1 },
      ],
    };
    await expect(b.importar("errada", dados)).rejects.toThrow("senha incorreta");
    expect(await b.importar(SENHA, dados)).toEqual({ resultados: 2, visitas: 2 });
    expect(await b.importar(SENHA, dados)).toEqual({ resultados: 0, visitas: 0 });
    const lista = await b.listarResultados(SENHA);
    expect(lista.map((r) => r.id)).toEqual(["imp-1", "imp-2"]);
    expect(lista[0].createdAt).toBe("2025-03-04T05:06:07.000Z");
    expect(lista[0].detalhes).toEqual(base.detalhes);
    expect(lista[1].createdAt).toBe("2025-01-02T03:04:05.000Z");
    expect(lista[1].totalScore).toBe(9);
    expect(lista[1].durationSeconds).toBe(60);
    const vs = await b.listarVisitas(SENHA);
    expect(vs.map((v) => v.ip)).toEqual(["2.2.2.2", "1.1.1.1"]);
    expect(vs[1].createdAt).toBe("2025-01-02T03:04:05.000Z");
    expect(vs[1].userAgent).toBe("curl/8");
    // Listas vazias/ausentes: nada a fazer.
    expect(await b.importar(SENHA, {})).toEqual({ resultados: 0, visitas: 0 });
  });

  it("reimportar a exportação do próprio banco não duplica acessos gravados ao vivo (now() com microssegundos)", async () => {
    const b = criarBackendPostgres(exec);
    await exec("delete from public.visitas");
    // Como o now() do Postgres real: precisão de microssegundos.
    await exec(
      "insert into public.visitas (created_at, ip, caminho, user_agent) values ('2026-10-23 18:46:22.846123+00', '1.1.1.1', '/', 'curl/8')",
    );
    await exec("insert into public.visitas (created_at, ip, caminho) values ('2026-10-23 18:46:22.846999+00', null, '/sobre')");
    const exportadas = await b.listarVisitas(SENHA);
    expect(exportadas).toHaveLength(2);
    expect(exportadas[1].createdAt).toBe("2026-10-23T18:46:22.846Z"); // ISO só tem milissegundos
    // A exportação passa por JSON (como em /api/exportar -> /api/importar).
    const backup = JSON.parse(JSON.stringify({ visitas: exportadas })) as { visitas: unknown[] };
    expect(await b.importar(SENHA, backup)).toEqual({ resultados: 0, visitas: 0 });
    const { rows } = await exec("select count(*)::int as n from public.visitas");
    expect(Number(rows[0].n)).toBe(2);
    // Um acesso diferente no mesmo milissegundo (outro IP) ainda entra.
    expect(await b.importar(SENHA, { visitas: [{ ...backup.visitas[1] as object, ip: "3.3.3.3" }] })).toEqual({ resultados: 0, visitas: 1 });
  });

  it("importa mais de um lote (450 linhas = 3 lotes) com os parâmetros deslocados certos e continua idempotente", async () => {
    const b = criarBackendPostgres(exec);
    await exec("delete from public.resultados");
    await exec("delete from public.visitas");
    const N = 2 * LOTE_IMPORTACAO + 50;
    const resultados = Array.from({ length: N }, (_, i) => ({
      ...base,
      id: `lote-${i}`,
      respondent: `Pessoa ${i}`,
      totalScore: i % 100,
      createdAt: new Date(Date.UTC(2025, 0, 1, 0, 0, 0, i)).toISOString(),
      detalhes: i % 2 === 0 ? base.detalhes : undefined,
    }));
    const visitas = Array.from({ length: N }, (_, i) => ({
      createdAt: new Date(Date.UTC(2025, 5, 1, 0, 0, i)).toISOString(),
      ip: `10.0.${Math.floor(i / 256)}.${i % 256}`,
      caminho: `/p/${i}`,
      userAgent: `ua-${i}`,
    }));
    expect(await b.importar(SENHA, { resultados, visitas })).toEqual({ resultados: N, visitas: N });
    expect(await b.importar(SENHA, { resultados, visitas })).toEqual({ resultados: 0, visitas: 0 });
    const lista = await b.listarResultados(SENHA);
    expect(lista).toHaveLength(N);
    // Uma linha do terceiro lote, com os campos e a data no lugar certo.
    const i = 2 * LOTE_IMPORTACAO + 20;
    const r = lista.find((x) => x.id === `lote-${i}`)!;
    expect(r).toMatchObject({ respondent: `Pessoa ${i}`, totalScore: i % 100, createdAt: resultados[i].createdAt });
    expect(r.detalhes).toEqual(base.detalhes);
    expect(lista.find((x) => x.id === `lote-${i + 1}`)!.detalhes).toBeUndefined();
    const vs = await b.listarVisitas(SENHA);
    expect(vs).toHaveLength(N);
    const v = vs.find((x) => x.caminho === `/p/${i}`)!;
    expect(v).toMatchObject({ ip: visitas[i].ip, userAgent: `ua-${i}`, createdAt: visitas[i].createdAt });
  }, 60_000);

  it("confere a senha com bcrypt (hash guardado, nunca a senha)", async () => {
    const { rows } = await exec("select senha_hash from public.admin_config where id = 1");
    expect(String(rows[0].senha_hash)).toMatch(/^\$2[aby]\$10\$/);
    expect(String(rows[0].senha_hash)).not.toContain(SENHA);
  });
});

describe("senha do painel: sem PAINEL_SENHA_INICIAL o painel falha fechado (não há senha padrão)", () => {
  let db2: PGlite;
  beforeAll(async () => {
    db2 = new PGlite();
  }, 60_000);
  afterAll(async () => {
    vi.stubEnv("PAINEL_SENHA_INICIAL", SENHA);
    await db2.close();
  });

  it("sem a variável: schema nasce, nada é semeado, a sonda avisa e a leitura recusa com orientação", async () => {
    vi.stubEnv("PAINEL_SENHA_INICIAL", "");
    const exec2 = executorDe(db2);
    const b = criarBackendPostgres(exec2);
    const s = await b.sondar();
    expect(s.gravacao).toBe("ok");
    expect(s.detalhe).toContain(MOTIVO_SEM_SENHA);
    const { rows } = await exec2("select count(*)::int as n from public.admin_config");
    expect(Number(rows[0].n)).toBe(0);
    // Gravação anônima funciona normalmente; só o painel fica fechado.
    expect(await b.inserirResultado({ ...base, id: "sem-senha" })).toEqual({ ok: true, status: 201 });
    expect(await b.inserirVisita(visita)).toBe(true);
    await expect(b.listarResultados("qualquer")).rejects.toThrow(MOTIVO_SEM_SENHA);
    await expect(b.listarVisitas("")).rejects.toThrow(MOTIVO_SEM_SENHA);
    await expect(b.importar("x", { resultados: [] })).rejects.toThrow(MOTIVO_SEM_SENHA);
  }, 30_000);

  it("definida depois (Redeploy): é semeada na próxima conferência e não é trocada por outro valor da variável", async () => {
    const exec2 = executorDe(db2);
    vi.stubEnv("PAINEL_SENHA_INICIAL", "primeira-senha");
    const b = criarBackendPostgres(exec2);
    await expect(b.listarResultados("errada")).rejects.toThrow("senha incorreta");
    expect((await b.listarResultados("primeira-senha")).map((r) => r.id)).toEqual(["sem-senha"]);
    expect((await b.sondar()).detalhe).toBe("Postgres/Neon: conexão e schema OK");
    // A variável só vale quando a tabela nasce vazia: mudar depois não troca a senha.
    vi.stubEnv("PAINEL_SENHA_INICIAL", "outra-senha");
    const b2 = criarBackendPostgres(exec2);
    await expect(b2.listarResultados("outra-senha")).rejects.toThrow("senha incorreta");
    expect(await b2.listarResultados("primeira-senha")).toHaveLength(1);
    const { rows } = await exec2("select count(*)::int as n from public.admin_config");
    expect(Number(rows[0].n)).toBe(1);
  }, 30_000);
});
