import { describe, it, expect } from "vitest";
import { buildCsv, formatDateTimeBR, recordFromResult, type ResultRecord } from "./history";
import { phq9 } from "./instruments/phq9";
import { ahsdIndicadores } from "./instruments/ahsd-indicadores";
import type { Responses } from "./types";

function answers(instQuestions: { id: string }[], value: number): Responses {
  return Object.fromEntries(instQuestions.map((q) => [q.id, value]));
}

const AT = "2026-08-18T21:30:00.000Z";

describe("recordFromResult", () => {
  it("captures score, band and subscales without raw answers", () => {
    const result = ahsdIndicadores.score(answers(ahsdIndicadores.questions, 4));
    const rec = recordFromResult(ahsdIndicadores, result, "  Gustavo  ", "id-1", AT);
    expect(rec.instrumentId).toBe("ahsd-indicadores");
    expect(rec.respondent).toBe("Gustavo"); // trimmed
    expect(rec.totalScore).toBe(4); // índice geral (média 1–5)
    expect(rec.maxScore).toBe(5);
    expect(rec.subscales?.length).toBe(6);
    expect(rec.createdAt).toBe(AT);
    // no answers field of any kind
    expect(JSON.stringify(rec)).not.toContain('"q1"');
  });

  it("omits respondent when blank", () => {
    const result = phq9.score(answers(phq9.questions, 1));
    const rec = recordFromResult(phq9, result, "   ", "id-2", AT);
    expect(rec.respondent).toBeUndefined();
    expect(rec.totalScore).toBe(9);
    expect(rec.bandLabel).toBe("Leve");
  });

  it("truncates very long respondent names to 80 chars", () => {
    const result = phq9.score(answers(phq9.questions, 0));
    const rec = recordFromResult(phq9, result, "x".repeat(200), "id-3", AT);
    expect(rec.respondent?.length).toBe(80);
  });

  it("never carries result notes (they can disclose individual answers)", () => {
    // PHQ-9 com o item 9 endossado gera uma nota sobre ideação de autolesão.
    const result = phq9.score({ ...answers(phq9.questions, 0), q9: 2 });
    expect(result.notes?.length).toBeGreaterThan(0);
    const rec = recordFromResult(phq9, result, "Ana", "id-4", AT);
    expect(rec.notes).toBeUndefined();
  });
});

describe("buildCsv", () => {
  const base: ResultRecord = {
    id: "r1",
    createdAt: AT,
    instrumentId: "phq-9",
    acronym: "PHQ-9",
    instrumentName: "Questionário de Saúde do Paciente — Depressão",
    respondent: 'Maria; "a" líder',
    totalScore: 12,
    maxScore: 27,
    bandLabel: "Moderado",
    severity: "moderate",
    positive: true,
    subscales: [{ name: "Parte A", raw: 4, max: 6 }],
  };

  it("escapes separators and quotes and includes header", () => {
    const csv = buildCsv([base]);
    const lines = csv.split("\r\n");
    expect(lines[0]).toContain("data_hora;instrumento;sigla;respondente");
    expect(lines[1]).toContain('"Maria; ""a"" líder"');
    expect(lines[1]).toContain("12;27;Moderado;sim");
    expect(lines[1]).toContain("Parte A: 4/6");
  });

  it("handles empty record list", () => {
    const csv = buildCsv([]);
    expect(csv.split("\r\n").length).toBe(1);
  });

  it("writes decimals with pt-BR comma (Excel pt-BR compatible)", () => {
    const csv = buildCsv([
      {
        ...base,
        respondent: undefined,
        totalScore: 3.83,
        maxScore: 5,
        metricIsMean: true,
        subscales: [{ name: "Intelectual", raw: 27, max: 35, mean: 3.86 }],
      },
    ]);
    expect(csv).toContain(";3,83;5;");
    expect(csv).toContain("média 3,86");
    expect(csv).not.toContain("3.83");
  });

  it("neutralizes spreadsheet formula injection in text cells", () => {
    const csv = buildCsv([{ ...base, respondent: "=HYPERLINK(1,2)", subscales: undefined }]);
    expect(csv).toContain("'=HYPERLINK(1,2)");
  });
});

describe("formatDateTimeBR", () => {
  it("formats ISO dates and tolerates garbage", () => {
    expect(formatDateTimeBR(AT)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(formatDateTimeBR("not-a-date")).toBe("not-a-date");
  });
});
