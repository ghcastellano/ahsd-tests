import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import MensaStimulus, { PairSvg } from "../../components/MensaStimulus";
import { answerOf, complementItems, makeMensaItems, PROTOCOLS, remainingSeconds, summarize } from "./banco";

const cycle = (n: number, base: number) => (n % base + base) % base;
describe("preparação Mensa Brasil", () => {
  it("mantém o plano editorial e cinco matrizes extremas, sem tarefas verbais", () => {
    for (let seed = 0; seed < 50; seed++) {
      const items = makeMensaItems("principal", seed);
      expect(items).toHaveLength(PROTOCOLS.principal.count);
      expect(items.map(q => q.domain)).toEqual([...Array(12).fill("Matrizes"), ...Array(6).fill("Séries"), ...Array(6).fill("Classificação")]);
      expect(items.filter(q => q.type === "figura" && q.domain === "Matrizes" && q.item.difficulty === "extrema")).toHaveLength(5);
      expect(new Set(items.map(q => q.id)).size).toBe(24);
      for (const q of items) if (q.type === "figura") {
        expect(q.item.textOptions).toBeUndefined();
        expect((q.item.options ?? q.item.set)![answerOf(q)]).toBeDefined();
      }
    }
  });
  it("reproduz a semente e varia estímulos, não apenas a ordem das alternativas", () => {
    for (const mode of ["principal", "complemento"] as const) {
      expect(makeMensaItems(mode, 42)).toEqual(makeMensaItems(mode, 42));
      const stimuli = (seed: number) => makeMensaItems(mode, seed).map(q => JSON.stringify(q.type === "figura" ? [q.item.grid, q.item.sequence, q.item.set] : [q.grid, q.sequence])).sort();
      expect(stimuli(42)).not.toEqual(stimuli(43));
    }
  });
  it("resolve dominós a partir das linhas visíveis e mostradores pelas diferenças observadas", () => {
    for (let seed = 0; seed < 400; seed++) for (const q of complementItems(seed)) {
      expect(q.options).toHaveLength(6);
      expect(new Set(q.options.map(p => p.join(","))).size).toBe(6);
      let expected: number[];
      if (q.type === "domino") {
        const grid = q.grid!;
        expect(new Set(q.options.map(p => p[0])).size).toBeGreaterThan(1);
        expect(new Set(q.options.map(p => p[1])).size).toBeGreaterThan(1);
        expected = [0, 1].map(half => {
          // Infere a operação das duas linhas completas; não usa metadados/gabarito.
          const operators = [1, -1].filter(sign => grid.slice(0, 2).every(row => cycle(row[0][half] + sign * row[1][half], 7) === row[2][half]));
          expect(operators).toHaveLength(1);
          return cycle(grid[2][0][half] + operators[0] * grid[2][1][half], 7);
        });
      } else {
        expected = [0, 1].map(hand => {
          const positions = q.sequence!.map(pair => pair[hand]);
          const differences = positions.slice(1).map((p, i) => cycle(p - positions[i], 12));
          const acceleration = differences.slice(1).map((d, i) => cycle(d - differences[i], 12));
          expect(new Set(acceleration).size).toBe(1);
          return cycle(positions[4] + differences[3] + acceleration[0], 12);
        });
      }
      expect(q.options[q.answerIndex]).toEqual(expected);
      expect(q.options.filter(p => p.every((v, i) => v === expected[i]))).toHaveLength(1);
    }
  });
  it("omite a célula-resposta na apresentação e mostra SVGs acessíveis", () => {
    const q = complementItems(42)[0];
    const html = renderToStaticMarkup(createElement(MensaStimulus, { q, uid: "test" }));
    expect((html.match(/<svg/g) ?? []).length).toBe(8);
    expect(html).toContain("?</span>");
    const clock = renderToStaticMarkup(createElement(PairSvg, { pair: [0, 6], type: "mostrador" }));
    expect(clock).toContain("ponteiro curto na posição 12, longo na posição 6");
  });
  it("separa erros de omissões e atualiza prazo por tempo real, mesmo após suspensão", () => {
    const items = makeMensaItems("principal", 42);
    expect(summarize(items, items.map(answerOf))).toEqual({ correct: 24, wrong: 0, omitted: 0 });
    expect(summarize(items, [answerOf(items[0]), (answerOf(items[1]) + 1) % 6])).toEqual({ correct: 1, wrong: 1, omitted: 22 });
    expect(remainingSeconds(1800000, 0)).toBe(1800);
    expect(remainingSeconds(1800000, 1250400)).toBe(550);
    expect(remainingSeconds(1800000, 1900000)).toBe(0);
  });
});
