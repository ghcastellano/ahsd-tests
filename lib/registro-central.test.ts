import { describe, it, expect, vi, afterEach } from "vitest";
import { interpretarSonda, sondarGravacao } from "./registro-central";
import { insertRemoteRecordDetalhado, motivoDaFalha, type ResultRecord } from "./history";

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

describe("insertRemoteRecordDetalhado / motivoDaFalha", () => {
  it("201 e 409 contam como gravado; falhas trazem motivo legível", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => resposta(201)));
    expect(await insertRemoteRecordDetalhado(rec)).toEqual({ ok: true, status: 201 });
    vi.stubGlobal("fetch", vi.fn(async () => resposta(409)));
    expect((await insertRemoteRecordDetalhado(rec)).ok).toBe(true);
    vi.stubGlobal("fetch", vi.fn(async () => resposta(401, '{"code":"42501"}')));
    const r = await insertRemoteRecordDetalhado(rec);
    expect(r.ok).toBe(false);
    expect(r.motivo).toMatch(/recusou a gravação.*RLS/);
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("Failed to fetch"); }));
    expect((await insertRemoteRecordDetalhado(rec)).motivo).toMatch(/sem conexão/);
  });
  it("cobre os códigos mais comuns", () => {
    expect(motivoDaFalha(404, "")).toMatch(/não existe/);
    expect(motivoDaFalha(400, '{"code":"23514"}')).toMatch(/rejeitou os dados/);
    expect(motivoDaFalha(503, "")).toMatch(/fora do ar/);
    expect(motivoDaFalha(418, "")).toMatch(/inesperada/);
  });
});
