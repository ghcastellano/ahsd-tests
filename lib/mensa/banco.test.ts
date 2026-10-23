import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import MensaStimulus, { PairSvg } from "../../components/MensaStimulus";
import { answerOf, complementItems, makeMensaItems, PROTOCOLS, remainingSeconds, stimulusKey, summarize } from "./banco";

const cycle = (n: number, base: number) => (n % base + base) % base;
describe("preparação Mensa Brasil", () => {
  it("calibra o modo principal em 35 matrizes sem itens extremos", () => {
    for (let seed = 0; seed < 30; seed++) {
      const items = makeMensaItems("principal", seed);
      expect(items).toHaveLength(35);
      // rótulo de família com evidência (o que a tela mostra em cada item)
      expect(items.every(q => q.domain === "Raven/APM-like")).toBe(true);
      expect(items.filter(q => q.type === "figura" && q.item.difficulty === "extrema")).toHaveLength(0);
      expect(new Set(items.map(q => q.id)).size).toBe(35);
      for (const q of items) if (q.type === "figura") {
        expect(q.item.textOptions).toBeUndefined();
        expect((q.item.options ?? q.item.set)![answerOf(q)]).toBeDefined();
      }
    }
  });
  it("usa 45 matrizes no modo de velocidade e mantém o teto fora do overtraining", () => {
    for (let seed = 0; seed < 20; seed++) {
      const items = makeMensaItems("velocidade", seed);
      expect(items).toHaveLength(45);
      expect(items.every(q => q.domain === "Raven/APM-like")).toBe(true);
      expect(items.filter(q => q.type === "figura" && (q.item.kind === "dual" || q.item.difficulty === "extrema"))).toHaveLength(0);
    }
  });
  it("mantém cobertura brasileira separada por famílias explicitamente rotuladas", () => {
    const items = makeMensaItems("brasil", 42);
    expect(items).toHaveLength(36);
    const counts = items.reduce<Record<string, number>>((acc, q) => {
      acc[q.domain] = (acc[q.domain] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts["Raven/APM-like"]).toBe(16);
    expect(counts["G36/G38/R1-like"]).toBe(8);
    expect(counts["TIG-NV-like"]).toBe(4);
    expect(counts["D48/D70-like · dominós"]).toBe(4);
    expect(counts["Exploratório · séries visuais"]).toBe(2);
    expect(counts["Exploratório · classificação"]).toBe(2);
    expect(items.filter(q => q.type === "figura" && q.item.difficulty === "extrema")).toHaveLength(0);
  });
  it("reproduz a semente e varia estímulos, não apenas a ordem das alternativas", () => {
    for (const mode of ["principal", "velocidade", "brasil", "desafio"] as const) {
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
        const predictions = new Map<string, number[]>();
        for (const left of [[0, 1], [1, 0]]) for (const right of [[0, 1], [1, 0]]) for (const signs of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const solve = (row: [number, number][]) => [0, 1].map(j => cycle(row[0][left[j]] + signs[j] * row[1][right[j]], 7));
          if (grid.slice(0, 2).every(row => solve(row).every((v, j) => v === row[2][j]))) {
            const next = solve(grid[2]); predictions.set(next.join(","), next);
          }
        }
        expect(predictions.size).toBe(1);
        expected = [...predictions.values()][0];
      } else {
        const predictions = new Map<string, number[]>();
        for (const source of [[0, 1], [1, 0]]) {
          const ds = [0, 1].map(j => q.sequence!.slice(1).map((pair, i) => cycle(pair[j] - q.sequence![i][source[j]], 12)));
          const accel = ds.map(differences => differences.slice(1).map((d, i) => cycle(d - differences[i], 12)));
          if (!accel.every(a => new Set(a).size === 1)) continue;
          const next = [0, 1].map(j => cycle(q.sequence![4][source[j]] + ds[j][3] + accel[j][0], 12));
          predictions.set(next.join(","), next);
        }
        expect(predictions.size).toBe(1);
        expected = [...predictions.values()][0];
      }
      expect(q.options[q.answerIndex]).toEqual(expected);
      expect(q.options.filter(p => p.every((v, i) => v === expected[i]))).toHaveLength(1);
    }
  });
  it("elimina o atalho da moda de cada componente em 12.000 itens", () => {
    for (let seed = 0; seed < 1000; seed++) for (const q of complementItems(seed)) for (const half of [0, 1]) {
      const frequencies = new Map<number, number>();
      for (const p of q.options) frequencies.set(p[half], (frequencies.get(p[half]) ?? 0) + 1);
      expect(new Set(frequencies.values()).size).toBe(1);
      expect(frequencies.size).toBeGreaterThan(1);
    }
  });
  it("não repete estímulos numa sessão e a assinatura independe do gabarito", () => {
    for (let seed = 0; seed < 30; seed++) for (const mode of ["principal", "velocidade", "brasil", "desafio"] as const) {
      const items = makeMensaItems(mode, seed);
      expect(new Set(items.map(stimulusKey)).size).toBe(items.length);
    }
    const q = complementItems(1)[0];
    expect(stimulusKey(q)).toBe(stimulusKey({ ...q, id: "outro", answerIndex: 999, options: [] }));
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
    expect(summarize(items, items.map(answerOf))).toEqual({ correct: 35, wrong: 0, omitted: 0 });
    expect(summarize(items, [answerOf(items[0]), (answerOf(items[1]) + 1) % 6])).toEqual({ correct: 1, wrong: 1, omitted: 33 });
    expect(remainingSeconds(1800000, 0)).toBe(1800);
    expect(remainingSeconds(1800000, 1250400)).toBe(550);
    expect(remainingSeconds(1800000, 1900000)).toBe(0);
  });
});
