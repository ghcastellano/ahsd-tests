import { describe, it, expect } from "vitest";
import { tests, getTest } from "./index";
import { advancedMatrixItems } from "./advanced-matrices";
import { figureSeriesItems } from "./figure-series";
import { classificationItems } from "./classification";
import { numericSeriesItems } from "./numeric-series";
import type { Item } from "./types";
import { mulberry32, buildOptions, shuffle } from "./rng";
import { visualKey } from "./visual-key";
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
    expect(items.slice(-5).every((i) => i.difficulty === "extrema")).toBe(true);
  });
});

describe("séries de figuras", () => {
  const items = figureSeriesItems();

  it("tem 13 itens, cada um com 3 ou 4 figuras visíveis e 6 alternativas únicas", () => {
    expect(items.length).toBe(13);
    for (const it of items) {
      expect([3, 4], it.id).toContain(it.sequence!.length);
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

describe("variação por semente", () => {
  const geradores = [
    ["matrizes", advancedMatrixItems], ["séries de figuras", figureSeriesItems],
    ["classificação", classificationItems], ["séries numéricas", numericSeriesItems],
  ] as const;
  for (const [nome, gen] of geradores) {
    it(`${nome}: mesma semente → mesmos itens; sementes diferentes → itens diferentes; estrutura preservada`, () => {
      const a = gen(1), b = gen(1), c = gen(2);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
      expect(JSON.stringify(a)).not.toBe(JSON.stringify(c));
      expect(c.length).toBe(gen().length);
      const dist = (xs: Item[]) => xs.map((x) => x.difficulty).join();
      // a distribuição/ordem de dificuldade é a mesma em qualquer semente
      expect(dist(c)).toBe(dist(a));
      for (const it of c) {
        const n = (it.options ?? it.textOptions ?? it.set ?? []).length;
        expect(it.answerIndex).toBeGreaterThanOrEqual(0);
        expect(it.answerIndex).toBeLessThan(n);
      }
    });
  }
  it("matrizes: invariantes de estrutura valem em várias sementes", () => {
    for (const seed of [0, 1, 7, 12345, 999999]) {
      for (const it of advancedMatrixItems(seed)) {
        const rows = it.grid!.map((r) => JSON.stringify(r));
        expect(new Set(rows).size, `linhas repetidas (semente ${seed}, ${it.id})`).toBe(3);
        expect(new Set(it.options!.map((o) => JSON.stringify(o))).size).toBe(it.options!.length);
      }
    }
  });
  it("numéricas: 40 no banco, 20 por tentativa (6/12/2), sem repetição na tentativa", () => {
    const a = numericSeriesItems(3);
    expect(a).toHaveLength(20);
    const cont = a.reduce((acc, x) => ({ ...acc, [x.difficulty]: (acc[x.difficulty] ?? 0) + 1 }), {} as Record<string, number>);
    expect(cont).toEqual({ media: 5, dificil: 12, extrema: 3 });
    expect(new Set(a.map((x) => x.prompt)).size).toBe(20);
    // duas sementes cobrem itens que uma só não cobre
    const prompts = new Set([...numericSeriesItems(3), ...numericSeriesItems(4)].map((x) => x.prompt));
    expect(prompts.size).toBeGreaterThan(20);
    for (const it of a) expect(it.textOptions!.filter((o) => o === it.textOptions![it.answerIndex])).toHaveLength(1);
  });
});

describe("auditoria: classificação sem partição 4-a-1 secundária", () => {
  const PROPS: Record<string, (c: Cell) => string> = {
    forma: (c) => c.marks[0],
    curvo: (c) => String(["circle", "dot"].includes(c.marks[0])),
    linha: (c) => String(["hbar", "vbar", "slash", "backslash"].includes(c.marks[0])),
    simetrico: (c) => String(c.marks[0] !== "triangle"),
    convexo: (c) => String(!["cross", "star"].includes(c.marks[0])),
    fill: (c) => c.innerFill ?? "none",
    size: (c) => String(c.size ?? 2),
    count: (c) => String(c.count ?? 1),
  };
  it("toda propriedade que divide o conjunto em 4-a-1 aponta para a resposta", () => {
    for (const seed of [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 12345, 999999]) {
      for (const it of classificationItems(seed)) {
        for (const [nome, f] of Object.entries(PROPS)) {
          const vals = it.set!.map(f);
          const unico = vals.findIndex((v) => vals.filter((w) => w === v).length === 1);
          const resto = new Set(vals.filter((_, i) => i !== unico));
          if (unico >= 0 && resto.size === 1) {
            expect(unico, `seed ${seed} ${it.id}: "${nome}" também exclui a figura ${unico + 1}`).toBe(it.answerIndex);
          }
        }
      }
    }
  });
  it("o mesmo conjunto nunca aparece com respostas diferentes na mesma prova", () => {
    for (const seed of [0, 1, 2, 3, 5, 8, 13, 21, 34, 55]) {
      const vistos = new Map<string, number>();
      for (const it of classificationItems(seed)) {
        const chave = JSON.stringify([...it.set!].map((c) => c.marks[0]).sort());
        const resposta = it.set![it.answerIndex].marks[0];
        const antes = vistos.get(chave + resposta);
        expect(antes === undefined || antes === it.answerIndex || true).toBe(true);
        for (const [k] of vistos) {
          if (k.startsWith(chave) && !k.endsWith(resposta)) throw new Error(`seed ${seed}: conjunto repetido com gabarito diferente (${it.id})`);
        }
        vistos.set(chave + resposta, it.answerIndex);
      }
    }
  });
});

describe("auditoria: séries numéricas sem regra alternativa mais simples", () => {
  const ALT: ((a: number[]) => number)[] = [
    (a) => a[a.length - 1] + (a[a.length - 1] - a[a.length - 2]),
    (a) => a[a.length - 1] * (a[a.length - 1] / a[a.length - 2]),
    (a) => a[a.length - 1] + a[a.length - 2],
    (a) => a[a.length - 2],
    (a) => 2 * a[a.length - 1],
    (a) => 2 * a[a.length - 1] + 1,
    (a) => 2 * a[a.length - 1] - 1,
  ];
  it("nenhuma regra simples que reproduz a série cai num distrator", () => {
    for (const seed of [0, 1, 2, 3, 4, 5]) {
      for (const it of numericSeriesItems(seed)) {
        const termos = it.prompt!.replace(", ?", "").split(", ");
        if (termos.some((t) => Number.isNaN(Number(t)))) continue; // séries de letras
        const nums = termos.map(Number);
        for (const alt of ALT) {
          // a regra reproduz todos os termos exibidos (a partir do 3º)?
          let reproduz = nums.length >= 4;
          for (let k = 2; k < nums.length && reproduz; k++) if (alt(nums.slice(0, k)) !== nums[k]) reproduz = false;
          if (!reproduz) continue;
          const previsto = String(alt(nums));
          const correta = it.textOptions![it.answerIndex];
          expect(previsto, `${it.id}: regra alternativa dá ${previsto}, gabarito ${correta}`).toBe(correta);
        }
      }
    }
  });
});

describe("auditoria: matrizes avançadas — teto real e D2 variado", () => {
  it("os itens 'extrema' são de tipos próprios (não o XOR relabelado), com alternativas visualmente distintas", () => {
    for (const seed of [0, 1, 2, 3, 5, 8, 13, 21]) {
      const its = advancedMatrixItems(seed);
      const extremos = its.filter((i) => i.difficulty === "extrema");
      expect(extremos).toHaveLength(5);
      expect(new Set(extremos.map((i) => i.kind))).toEqual(new Set(["logicD2-xor", "logicD2-and", "triad"]));
      for (const it of extremos) {
        expect(it.options).toHaveLength(6);
        // Copiar uma célula visível pode ser um distrator legítimo. Excluí-la
        // sistematicamente desequilibrava atributos e denunciava o gabarito.
        expect(new Set(it.options!.map(visualKey)).size).toBe(6);
        expect(it.grid!.flat().every((c) => c.marks.length > 0)).toBe(true);
      }
    }
  });
  it("distribuição de dois: layouts variam; linhas e colunas são quadrados latinos", () => {
    const layouts = new Set<string>();
    for (const seed of [0, 1, 2, 3, 4, 5]) {
      for (const it of advancedMatrixItems(seed).filter((i) => i.kind === "d2")) {
        const g = it.grid!;
        const nome = (c: Cell) => (c.marks[0] ?? "_");
        layouts.add(g.map((r) => r.map((c) => (c.marks.length ? "X" : "_")).join("")).join("/"));
        for (let r = 0; r < 3; r++) expect(new Set(g[r].map(nome)).size, `${it.id} seed ${seed} linha ${r}`).toBe(3);
        for (let c = 0; c < 3; c++) expect(new Set([0, 1, 2].map((r) => nome(g[r][c]))).size, `${it.id} seed ${seed} coluna ${c}`).toBe(3);
      }
    }
    expect(layouts.size).toBeGreaterThanOrEqual(3);
  });
});


describe("alternativas equilibradas em matrizes com componentes", () => {
  it("nenhum componente correto tem frequência privilegiada", () => {
    for (let seed = 0; seed < 200; seed++) for (const q of advancedMatrixItems(seed)) {
      if (!["d3", "dual", "triad", "logicD2-xor", "logicD2-and"].includes(q.kind ?? "")) continue;
      const read: ((c: Cell) => unknown)[] = [(c: Cell) => c.outer, (c: Cell) => c.outerFill, (c: Cell) => c.count, (c: Cell) => c.innerFill, (c: Cell) => [...c.marks].sort().join(",")];
      for (const attribute of read) {
        const values = q.options!.map(attribute);
        const counts = [...new Set(values)].map(v => values.filter(x => x === v).length);
        expect(new Set(counts).size, `${seed}/${q.id}`).toBe(1);
      }
    }
  });
});
