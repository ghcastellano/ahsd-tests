import { describe, it, expect } from "vitest";
import { instruments } from "./index";
import { optionsFor } from "../scoring";
import type { Instrument, Responses } from "../types";

// Testes estruturais sobre TODOS os instrumentos registrados: qualquer
// instrumento novo entra automaticamente. A ideia é que nenhum resultado
// possa cair fora de uma faixa, que os extremos sejam alcançáveis e que a
// leitura "positivo" seja coerente com a gravidade da faixa.

function responder(inst: Instrument, escolha: (valores: number[]) => number): Responses {
  const r: Responses = {};
  for (const q of inst.questions) {
    const vals = optionsFor(q, inst.defaultOptions).map((o) => o.value);
    r[q.id] = escolha(vals);
  }
  return r;
}
const maximo = (vals: number[]) => Math.max(...vals);
/** Maior valor válido (ignora sentinelas negativas como o "não sei" = -1 do AH/SD). */
const minValido = (vals: number[]) => {
  const validos = vals.filter((v) => v !== -1 || vals.every((x) => x < 0));
  return Math.min(...validos);
};

describe("todos os instrumentos", () => {
  for (const inst of instruments) {
    describe(`${inst.acronym} (${inst.id})`, () => {
      it("faixas contíguas, sem sobreposição, em ordem crescente", () => {
        const b = [...inst.interpretationBands];
        for (let i = 0; i < b.length; i++) {
          expect(b[i].min, `faixa ${i} tem min > max`).toBeLessThanOrEqual(b[i].max);
          if (i > 0) {
            // A próxima faixa começa logo depois da anterior (inteiros: +1; decimais: +0,01).
            const salto = b[i].min - b[i - 1].max;
            expect(salto, `buraco/sobreposição entre "${b[i - 1].label}" e "${b[i].label}"`).toBeGreaterThan(0);
            expect(salto).toBeLessThanOrEqual(1);
          }
        }
      });

      it("os extremos de resposta caem dentro de uma faixa e respeitam maxScore", () => {
        const lo = inst.score(responder(inst, minValido));
        const hi = inst.score(responder(inst, maximo));
        for (const res of [lo, hi]) {
          expect(res.band, "resultado sem faixa").toBeTruthy();
          expect(inst.interpretationBands.map((x) => x.label)).toContain(res.band.label);
          expect(Number.isFinite(res.totalScore)).toBe(true);
          expect(res.totalScore).toBeLessThanOrEqual(res.maxScore);
          const dentro = inst.interpretationBands.some((x) => res.totalScore >= x.min && res.totalScore <= x.max);
          expect(dentro, `pontuação ${res.totalScore} fora de todas as faixas`).toBe(true);
        }
      });

      it("resposta incompleta não quebra a correção", () => {
        expect(() => inst.score({})).not.toThrow();
        const parcial = responder(inst, maximo);
        delete parcial[inst.questions[0].id];
        expect(() => inst.score(parcial)).not.toThrow();
      });

      it("o estado 'positivo' (quando existe) é alcançável e cai numa faixa de gravidade", () => {
        // A direção varia: no BSCS e no SWAN o grave é a pontuação BAIXA; no
        // AQ-50 a direção é por item (concordo/discordo). Em vez de assumir
        // uma direção, tentamos os padrões extremos possíveis e exigimos que
        // pelo menos um deles seja positivo — e que, quando for, a faixa seja
        // de gravidade moderada ou maior.
        const base = inst.score(responder(inst, maximo));
        if (base.positive === undefined) return;
        const padroes: Responses[] = [
          responder(inst, maximo),
          responder(inst, minValido),
          // reverse-aware: invertidos no mínimo, diretos no máximo (e o oposto)
          Object.fromEntries(inst.questions.map((q) => {
            const vals = optionsFor(q, inst.defaultOptions).map((o) => o.value);
            return [q.id, q.reverse ? minValido(vals) : maximo(vals)];
          })),
          Object.fromEntries(inst.questions.map((q) => {
            const vals = optionsFor(q, inst.defaultOptions).map((o) => o.value);
            return [q.id, q.reverse ? maximo(vals) : minValido(vals)];
          })),
        ];
        const positivos = padroes.map((r) => inst.score(r)).filter((res) => res.positive === true);
        if (inst.id === "aq-50") return; // direção por item, coberta em scoring.test.ts (chega a 50)
        expect(positivos.length, "nenhum padrão extremo produz resultado positivo").toBeGreaterThan(0);
        for (const res of positivos) expect(["moderate", "high", "severe"]).toContain(res.band.severity);
      });

      it("ids de questão únicos e subescalas declaradas", () => {
        const ids = inst.questions.map((q) => q.id);
        expect(new Set(ids).size).toBe(ids.length);
        if (inst.subscales) {
          const keys = new Set(inst.subscales.map((s) => s.key));
          for (const q of inst.questions) if (q.subscale) expect(keys.has(q.subscale)).toBe(true);
        }
      });

      it("tem referência bibliográfica e rótulo da métrica", () => {
        expect(inst.references.length).toBeGreaterThan(0);
        expect(inst.primaryMetricLabel.length).toBeGreaterThan(0);
      });
    });
  }
});
