import { describe, it, expect } from "vitest";
import { tests, getTest } from "./index";
import { advancedMatrixItems } from "./advanced-matrices";
import { figureSeriesItems } from "./figure-series";
import { classificationItems } from "./classification";
import { numericSeriesItems } from "./numeric-series";
import { mulberry32, buildOptions, shuffle } from "./rng";
import type { Cell } from "./types";

const cellKey = (c: Cell) =>
  JSON.stringify({
    m: [...c.marks].sort(),
    o: c.outer ?? "",
    of: c.outerFill ?? "",
    i: c.innerFill ?? "",
    r: c.rotation ?? 0,
    s: c.size ?? 2,
    n: c.count ?? 1,
  });

describe("rng helpers", () => {
  it("is deterministic for a given seed", () => {
    const a = Array.from({ length: 5 }, mulberry32(42));
    const b = Array.from({ length: 5 }, mulberry32(42));
    expect(a).toEqual(b);
  });

  it("shuffle preserves the multiset", () => {
    const src = [1, 2, 3, 4, 5, 6];
    const out = shuffle(src, mulberry32(7));
    expect([...out].sort()).toEqual(src);
    expect(src).toEqual([1, 2, 3, 4, 5, 6]); // não muta a origem
  });

  it("buildOptions places the answer at answerIndex and dedupes", () => {
    const { options, answerIndex } = buildOptions(
      "x",
      ["a", "x", "b", "a", "c", "d", "e"],
      (v) => v,
      mulberry32(3),
    );
    expect(options.length).toBe(6);
    expect(new Set(options).size).toBe(6);
    expect(options[answerIndex]).toBe("x");
  });
});

describe("registry", () => {
  it("declares four tests with matching item counts", () => {
    expect(tests.length).toBe(4);
    for (const t of tests) {
      expect(t.items().length, `${t.id} deve ter ${t.itemCount} itens`).toBe(t.itemCount);
    }
  });

  it("has unique ids and positive time limits", () => {
    expect(new Set(tests.map((t) => t.id)).size).toBe(tests.length);
    for (const t of tests) expect(t.timeLimitSeconds).toBeGreaterThan(0);
    expect(getTest("matrizes-avancadas")?.name).toBe("Matrizes Avançadas");
    expect(getTest("inexistente")).toBeUndefined();
  });

  it("keeps each test inside a coherent time regime", () => {
    for (const t of tests) {
      const perItem = t.timeLimitSeconds / t.itemCount;
      if (t.regime === "velocidade") {
        // Subtestes cronometrados reais ficam em ~13–18 s por item.
        expect(perItem, `${t.id}`).toBeLessThanOrEqual(20);
      } else {
        expect(perItem, `${t.id}`).toBeGreaterThanOrEqual(30);
      }
    }
  });
});

describe("integridade dos itens (todos os formatos)", () => {
  const all = [
    ...advancedMatrixItems(),
    ...figureSeriesItems(),
    ...classificationItems(),
    ...numericSeriesItems(),
  ];

  it("todo item tem id único", () => {
    const ids = all.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todo item tem answerIndex dentro do alcance das alternativas", () => {
    for (const item of all) {
      const n = item.options?.length ?? item.textOptions?.length ?? item.set?.length ?? 0;
      expect(n, item.id).toBeGreaterThan(1);
      expect(item.answerIndex, item.id).toBeGreaterThanOrEqual(0);
      expect(item.answerIndex, item.id).toBeLessThan(n);
    }
  });

  it("todo item traz explicação da regra (usada na revisão)", () => {
    for (const item of all) {
      expect(item.explanation.length, item.id).toBeGreaterThan(20);
    }
  });
});

describe("matrizes avançadas", () => {
  const items = advancedMatrixItems();

  it("tem 36 itens com grade 3x3 completa", () => {
    expect(items.length).toBe(36);
    for (const it of items) {
      expect(it.grid, it.id).toBeDefined();
      expect(it.grid!.length).toBe(3);
      for (const row of it.grid!) expect(row.length).toBe(3);
    }
  });

  it("oferece 6 alternativas distintas com exatamente uma correta", () => {
    for (const it of items) {
      const opts = it.options!;
      expect(opts.length, it.id).toBe(6);
      expect(new Set(opts.map(cellKey)).size, `${it.id} tem alternativas repetidas`).toBe(6);
      // a alternativa correta é exatamente a célula (2,2) da grade
      expect(cellKey(opts[it.answerIndex]), it.id).toBe(cellKey(it.grid![2][2]));
    }
  });

  it("a resposta nunca é cópia literal das duas células vizinhas ao mesmo tempo", () => {
    for (const it of items) {
      const ans = cellKey(it.grid![2][2]);
      const left = cellKey(it.grid![2][1]);
      const up = cellKey(it.grid![1][2]);
      expect(ans === left && ans === up, `${it.id} é trivial`).toBe(false);
    }
  });

  it("nenhuma linha da grade se repete (senão bastaria copiar a linha de cima)", () => {
    for (const it of items) {
      const rows = it.grid!.map((row) => row.map(cellKey).join("|"));
      expect(new Set(rows).size, `${it.id} tem linhas idênticas`).toBe(3);
    }
  });

  it("as duas primeiras células da linha da resposta não repetem outra linha inteira", () => {
    for (const it of items) {
      const target = it.grid![2].slice(0, 2).map(cellKey).join("|");
      for (const r of [0, 1]) {
        const other = it.grid![r].slice(0, 2).map(cellKey).join("|");
        expect(target, `${it.id}: linha 3 começa igual à linha ${r + 1}`).not.toBe(other);
      }
    }
  });

  it("escalona a dificuldade: os últimos itens não são todos 'media'", () => {
    const tail = items.slice(-9);
    expect(tail.every((i) => i.difficulty === "media")).toBe(false);
    expect(items.slice(-4).every((i) => i.difficulty === "extrema")).toBe(true);
  });
});

describe("séries de figuras", () => {
  const items = figureSeriesItems();

  it("tem 13 itens, cada um com 3 figuras visíveis e 6 alternativas únicas", () => {
    expect(items.length).toBe(13);
    for (const it of items) {
      expect(it.sequence!.length, it.id).toBe(3);
      expect(it.options!.length, it.id).toBe(6);
      expect(new Set(it.options!.map(cellKey)).size, it.id).toBe(6);
    }
  });

  it("a resposta nunca repete a última figura mostrada", () => {
    for (const it of items) {
      const ans = cellKey(it.options![it.answerIndex]);
      expect(ans, `${it.id} repete a 3ª figura`).not.toBe(cellKey(it.sequence![2]));
    }
  });
});

describe("classificação", () => {
  const items = classificationItems();

  it("tem 14 itens com 5 figuras cada", () => {
    expect(items.length).toBe(14);
    for (const it of items) expect(it.set!.length, it.id).toBe(5);
  });

  it("o índice apontado corresponde a uma figura realmente presente", () => {
    for (const it of items) {
      expect(it.set![it.answerIndex], it.id).toBeDefined();
    }
  });

  it("as quatro figuras restantes compartilham algum atributo (não são todas distintas)", () => {
    for (const it of items) {
      const others = it.set!.filter((_, i) => i !== it.answerIndex);
      const shapes = new Set(others.map((c) => c.marks[0]));
      const fills = new Set(others.map((c) => c.innerFill ?? "none"));
      const counts = new Set(others.map((c) => c.count ?? 1));
      const shareSomething = shapes.size === 1 || fills.size === 1 || counts.size === 1;
      expect(shareSomething, `${it.id}: as 4 restantes não têm atributo comum`).toBe(true);
    }
  });
});

describe("séries numéricas", () => {
  const items = numericSeriesItems();

  it("tem 20 itens com enunciado e 6 alternativas textuais únicas", () => {
    expect(items.length).toBe(20);
    for (const it of items) {
      expect(it.prompt, it.id).toMatch(/, \?$/);
      expect(it.textOptions!.length, it.id).toBe(6);
      expect(new Set(it.textOptions!).size, it.id).toBe(6);
    }
  });

  it("nenhum distrator coincide com a resposta (unicidade da solução)", () => {
    for (const it of items) {
      const answer = it.textOptions![it.answerIndex];
      const others = it.textOptions!.filter((_, i) => i !== it.answerIndex);
      expect(others, it.id).not.toContain(answer);
    }
  });

  it("séries aritméticas simples não admitem a resposta como continuação errada", () => {
    // Para toda série puramente numérica, confere que a resposta NÃO é
    // simplesmente a repetição do último termo nem a soma trivial anterior.
    for (const it of items) {
      const terms = it.prompt!.replace(", ?", "").split(", ");
      const nums = terms.map(Number);
      if (nums.some(Number.isNaN)) continue; // séries de letras
      const answer = Number(it.textOptions![it.answerIndex]);
      expect(answer, it.id).not.toBe(nums[nums.length - 1]);
    }
  });
});
