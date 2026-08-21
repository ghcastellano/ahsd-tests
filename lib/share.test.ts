import { describe, it, expect } from "vitest";
import { codeFromHash, decodeRecord, encodeRecord, extractCode, shareLink } from "./share";
import type { ResultRecord } from "./history";

const full: ResultRecord = {
  id: "abc-123",
  createdAt: "2026-08-19T12:00:00.000Z",
  instrumentId: "gad-7",
  acronym: "GAD-7",
  instrumentName: "Transtorno de Ansiedade Generalizada — 7 itens",
  respondent: "Maria José",
  totalScore: 14,
  maxScore: 21,
  bandLabel: "Moderado",
  severity: "moderate",
  positive: true,
  metricIsMean: false,
  subscales: [{ name: "Parte A", raw: 4, max: 6 }, { name: "Média", raw: 10, max: 21, mean: 3.5 }],
};

describe("share codec", () => {
  it("round-trips a full record", () => {
    const decoded = decodeRecord(encodeRecord(full));
    expect(decoded).toEqual(full);
  });

  it("round-trips a minimal record (no optional fields)", () => {
    const minimal: ResultRecord = {
      id: "x",
      createdAt: "2026-08-19T12:00:00.000Z",
      instrumentId: "ace",
      acronym: "ACE",
      instrumentName: "Experiências Adversas na Infância",
      totalScore: 3,
      maxScore: 10,
      bandLabel: "Exposição intermediária",
      severity: "moderate",
    };
    expect(decodeRecord(encodeRecord(minimal))).toEqual(minimal);
  });

  it("produces URL-safe codes and working links/hashes", () => {
    const code = encodeRecord(full);
    expect(code).toMatch(/^v1\.[A-Za-z0-9_-]+$/);
    const link = shareLink("https://ahsdtests.vercel.app", full);
    const hash = new URL(link).hash;
    expect(decodeRecord(codeFromHash(hash)!)).toEqual(full);
  });

  it("rejects garbage, wrong prefix and oversized codes", () => {
    expect(decodeRecord("lixo")).toBeNull();
    expect(decodeRecord("v2." + "a".repeat(50))).toBeNull();
    expect(decodeRecord("v1." + "A".repeat(30_000))).toBeNull();
    expect(decodeRecord("v1.!!!!não-base64!!!")).toBeNull();
  });

  it("rejects records with missing or invalid required fields", () => {
    const bad = (mut: (r: Record<string, unknown>) => void) => {
      const r: Record<string, unknown> = JSON.parse(JSON.stringify(full));
      mut(r);
      return decodeRecord("v1." + Buffer.from(JSON.stringify(r)).toString("base64url"));
    };
    expect(bad((r) => delete r.id)).toBeNull();
    expect(bad((r) => (r.totalScore = "14"))).toBeNull();
    expect(bad((r) => (r.totalScore = 99_999))).toBeNull();
    expect(bad((r) => (r.severity = "apocalyptic"))).toBeNull();
    expect(bad((r) => (r.createdAt = "ontem à noite"))).toBeNull();
    expect(bad((r) => (r.respondent = "x".repeat(500)))).toBeNull();
    expect(bad((r) => (r.instrumentName = "x".repeat(500)))).toBeNull();
    expect(bad((r) => (r.subscales = Array(30).fill({ name: "s", raw: 1, max: 2 })))).toBeNull();
    expect(bad((r) => (r.subscales = [{ name: "s", raw: "1", max: 2 }]))).toBeNull();
  });

  it("strips unknown fields (whitelist reconstruction)", () => {
    const withExtra = { ...full, __proto__x: "evil", script: "<img onerror=1>", role: "admin" };
    const decoded = decodeRecord("v1." + Buffer.from(JSON.stringify(withExtra)).toString("base64url"));
    expect(decoded).toEqual(full);
    expect(Object.keys(decoded!)).not.toContain("script");
    expect(Object.keys(decoded!)).not.toContain("role");
  });

  it("codeFromHash only matches #add= fragments", () => {
    expect(codeFromHash("#add=v1.abc")).toBe("v1.abc");
    expect(codeFromHash("#outro=x")).toBeNull();
    expect(codeFromHash("")).toBeNull();
  });

  it("codeFromHash never throws on malformed percent-escapes (truncated links)", () => {
    // decodeURIComponent("%E0%A4") lançaria URIError; aqui degrada para o texto cru.
    expect(() => codeFromHash("#add=%E0%A4")).not.toThrow();
    expect(codeFromHash("#add=%E0%A4")).toBe("%E0%A4");
  });

  it("extractCode accepts raw codes and full links, ignores prose", () => {
    const code = encodeRecord(full);
    expect(extractCode(code)).toBe(code);
    expect(extractCode(`https://ahsdtests.vercel.app/painel-ahsd#add=${code}`)).toBe(code);
    // Palavras de uma mensagem colada junto não viram "códigos inválidos".
    expect(extractCode("Resultado")).toBeNull();
    expect(extractCode("do")).toBeNull();
    expect(extractCode("painel:")).toBeNull();
  });
});
