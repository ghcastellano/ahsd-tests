import { describe, expect, it } from "vitest";
import { challengeItems, matrixPredictions, seriesPredictions } from "./desafio";

// Solucionador independente: coordenadas + conjuntos; não usa transform,
// combine, answerIndex, IDs ou explicações para inferir a resposta.
const transformSet = (mask: number, t: number) => {
  const positions = Array.from({ length: 9 }, (_, i) => i).filter(i => Math.floor(mask / 2 ** i) % 2);
  const maps = [
    (r: number, c: number) => [r, c], (r: number, c: number) => [c, 2 - r],
    (r: number, c: number) => [2 - r, 2 - c], (r: number, c: number) => [2 - c, r],
    (r: number, c: number) => [r, 2 - c], (r: number, c: number) => [2 - c, 2 - r],
    (r: number, c: number) => [2 - r, c], (r: number, c: number) => [c, r],
  ];
  return new Set(positions.map(i => { const [r, c] = maps[t](Math.floor(i / 3), i % 3); return 3 * r + c; }));
};
const encode = (positions: Set<number>) => [...positions].reduce((sum, i) => sum + 2 ** i, 0);
const rotate = (mask: number, t: number) => encode(transformSet(mask, t));
const operate = (a: number, b: number, t: number, u: number, op: number) => {
  const x = transformSet(a, t), y = transformSet(b, u);
  return encode(new Set(Array.from({ length: 9 }, (_, i) => i).filter(i => op === 0 ? x.has(i) !== y.has(i) : op === 1 ? x.has(i) && y.has(i) : x.has(i) || y.has(i))));
};

describe("desafio Mensa: gabaritos por inferência independente", () => {
  it("infere uma única resposta das células visíveis em 120 sementes (2.880 itens)", () => {
    for (let seed = 0; seed < 120; seed++) {
      const items = challengeItems(seed);
      expect(items).toHaveLength(24);
      const seen = new Set<string>();
      for (const q of items) {
        const signature = JSON.stringify([q.grid?.flat().slice(0, 8), q.sequence, q.pairs]);
        expect(seen.has(signature)).toBe(false); seen.add(signature);
        const predictions = new Set<number>();
        if (q.grid) {
          // Substituir a resposta oculta por lixo não pode afetar a inferência.
          const visible = q.grid.map(row => [...row]); visible[2][2] = -1;
          for (const rows of [visible, [0, 1, 2].map(c => visible.map(r => r[c]))]) {
            for (let t = 0; t < 8; t++) for (let u = 0; u < 8; u++) for (let op = 0; op < 3; op++) {
              if (rows.slice(0, 2).every(r => operate(r[0], r[1], t, u, op) === r[2])) predictions.add(operate(rows[2][0], rows[2][1], t, u, op));
            }
          }
          expect(matrixPredictions(visible)).toEqual(predictions);
        } else if (q.sequence) {
          const s = q.sequence;
          for (let t = 0; t < 8; t++) for (let u = 0; u < 8; u++) {
            for (const lag of [1, 2]) {
              if (s.slice(lag).every((v, i) => rotate(s[i], i % 2 ? u : t) === v)) predictions.add(rotate(s[s.length - lag], (s.length - lag) % 2 ? u : t));
            }
          }
          expect(seriesPredictions(s)).toEqual(predictions);
        } else {
          for (let t = 0; t < 8; t++) for (const invert of [false, true]) {
            const wrong = q.pairs!.flatMap(([a, b], i) => ((invert ? 511 - rotate(a, t) : rotate(a, t)) === b ? [] : [i]));
            if (wrong.length === 1) predictions.add(wrong[0]);
          }
          // A quantidade de pretos por lado é constante nos seis pares.
          for (const side of [0, 1]) expect(new Set(q.pairs!.map(p => transformSet(p[side], 0).size)).size).toBe(1);
        }
        expect([...predictions], `${seed}/${q.id}`).toEqual([q.options[q.answerIndex]]);
        expect(q.options).toHaveLength(6);
        expect(new Set(q.options).size).toBe(6);
        if (!q.pairs) for (let bit = 0; bit < 9; bit++) expect(q.options.filter(mask => mask & (1 << bit))).toHaveLength(3);
      }
    }
  }, 60000);
  it("reproduz sorteios e varia os estímulos e as transformações", () => {
    expect(challengeItems(42)).toEqual(challengeItems(42));
    expect(challengeItems(42)).not.toEqual(challengeItems(43));
    expect(new Set(challengeItems(42).map(q => q.family)).size).toBe(4);
  });
});
