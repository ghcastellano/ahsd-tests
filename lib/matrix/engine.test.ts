import { describe, it, expect } from "vitest";
import {
  answerOf,
  cellAt,
  grade,
  items,
  optionsFor,
  TIME_LIMIT_SECONDS,
  type CellSpec,
  itemsForSeed,
} from "./engine";

const SHAPES = ["circle", "square", "triangle", "diamond", "cross", "star"];
const FILLS = ["none", "half", "solid"];
const ROTS = [0, 45, 90];
const key = (s: CellSpec) => JSON.stringify(s);

describe("matrix item bank", () => {
  it("has 30 items: 10 per tier, unique ids", () => {
    expect(items.length).toBe(30);
    const tiers = { facil: 0, medio: 0, dificil: 0 };
    for (const it of items) tiers[it.tier]++;
    expect(tiers).toEqual({ facil: 10, medio: 10, dificil: 10 });
    expect(new Set(items.map((i) => i.id)).size).toBe(30);
  });

  it("every grid cell has valid attribute values", () => {
    for (const it of items) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const s = cellAt(it, r, c);
          expect(SHAPES).toContain(s.shape);
          expect(FILLS).toContain(s.fill);
          expect(ROTS).toContain(s.rotation);
          expect([1, 2, 3]).toContain(s.size);
          expect([1, 2, 3, 4]).toContain(s.count);
        }
      }
    }
  });

  it("rotated cells only use rotation-unambiguous shapes (triangle/star)", () => {
    for (const it of items) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const s = cellAt(it, r, c);
          if (s.rotation !== 0) {
            expect(["triangle", "star"]).toContain(s.shape);
          }
        }
      }
    }
  });

  it("grid varies and the answer is never a trivial copy on both axes", () => {
    for (const it of items) {
      const all = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) all.push(key(cellAt(it, r, c)));
      // Nunca uma grade constante.
      expect(new Set(all).size).toBeGreaterThan(1);
      // A última linha e a última coluna não podem ser AMBAS constantes —
      // senão a resposta seria cópia simultânea dos dois vizinhos.
      const rowConst = new Set([0, 1, 2].map((c) => key(cellAt(it, 2, c)))).size === 1;
      const colConst = new Set([0, 1, 2].map((r) => key(cellAt(it, r, 2)))).size === 1;
      expect(rowConst && colConst).toBe(false);
    }
  });

  it("medium and hard items vary on both axes (no copy-the-row shortcuts)", () => {
    for (const it of items.filter((i) => i.tier !== "facil")) {
      const rowConst = new Set([0, 1, 2].map((c) => key(cellAt(it, 2, c)))).size === 1;
      const colConst = new Set([0, 1, 2].map((r) => key(cellAt(it, r, 2)))).size === 1;
      expect(rowConst).toBe(false);
      expect(colConst).toBe(false);
    }
  });

  it("every item offers 6 distinct options with exactly one correct", () => {
    for (const it of items) {
      const { options, answerIndex } = optionsFor(it);
      expect(options.length).toBe(6);
      expect(new Set(options.map(key)).size).toBe(6);
      const matches = options.filter((o) => key(o) === key(answerOf(it)));
      expect(matches.length).toBe(1);
      expect(key(options[answerIndex])).toBe(key(answerOf(it)));
    }
  });

  it("options are deterministic across calls (stable shuffle)", () => {
    for (const it of items.slice(0, 5)) {
      const a = optionsFor(it);
      const b = optionsFor(it);
      expect(a.options.map(key)).toEqual(b.options.map(key));
      expect(a.answerIndex).toBe(b.answerIndex);
    }
  });
});

describe("grading", () => {
  it("scores all-correct as 30/30 and empty as 0 answered", () => {
    const perfect = items.map((it) => optionsFor(it).answerIndex);
    const s = grade(perfect);
    expect(s.correct).toBe(30);
    expect(s.byTier.facil.correct).toBe(10);
    expect(s.byTier.dificil.correct).toBe(10);

    const blank = grade(items.map(() => null));
    expect(blank.correct).toBe(0);
    expect(blank.answered).toBe(0);
  });

  it("counts partial answers by tier", () => {
    // Acerta somente os 10 fáceis (ids 1-10 = índices 0-9).
    const chosen = items.map((it, i) => (i < 10 ? optionsFor(it).answerIndex : null));
    const s = grade(chosen);
    expect(s.correct).toBe(10);
    expect(s.byTier.facil.correct).toBe(10);
    expect(s.byTier.medio.correct).toBe(0);
    expect(s.answered).toBe(10);
  });

  it("wrong picks score zero", () => {
    const chosen = items.map((it) => (optionsFor(it).answerIndex + 1) % 6);
    expect(grade(chosen).correct).toBe(0);
  });
});

describe("timer config", () => {
  it("is 25 minutes", () => {
    expect(TIME_LIMIT_SECONDS).toBe(1500);
  });
});

describe("variação por semente (/teste-qi)", () => {
  it("semente 0 é o banco original; outra semente muda a superfície e mantém regras e dificuldade", () => {
    expect(itemsForSeed(0)).toBe(items);
    const a = itemsForSeed(42), b = itemsForSeed(42), c = itemsForSeed(43);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(items));
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(c));
    a.forEach((it, i) => {
      expect(it.tier).toBe(items[i].tier);
      expect(it.rules.map((r) => r.attr + r.kind)).toEqual(items[i].rules.map((r) => r.attr + r.kind));
      expect(it.rules.map((r) => [...r.values].sort().join())).toEqual(items[i].rules.map((r) => [...r.values].sort().join()));
    });
  });
  it("em qualquer semente: rotação só em triângulo/estrela, 6 opções únicas com uma correta, e a correção usa os itens da semente", () => {
    for (const seed of [1, 5, 12345, 777777]) {
      const its = itemsForSeed(seed);
      for (const it of its) {
        for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
          const s = cellAt(it, r, c);
          if (s.rotation !== 0) expect(["triangle", "star"]).toContain(s.shape);
        }
        const { options, answerIndex } = optionsFor(it, seed);
        expect(options.length).toBe(6);
        expect(new Set(options.map((o) => JSON.stringify(o))).size).toBe(6);
        expect(JSON.stringify(options[answerIndex])).toBe(JSON.stringify(answerOf(it)));
      }
      const perfeito = its.map((it) => optionsFor(it, seed).answerIndex);
      expect(grade(perfeito, its, seed).correct).toBe(30);
      // as respostas certas da semente 0 NÃO corrigem a prova de outra semente (as opções mudam)
      const daOutra = items.map((it) => optionsFor(it, 0).answerIndex);
      expect(grade(daOutra, its, seed).correct).toBeLessThan(30);
    }
  });
});
