// Motor de itens de raciocínio fluido (matrizes progressivas 3x3), no formato
// clássico usado por testes como Raven e pelos testes de admissão da Mensa.
// TODOS os itens são originais e gerados por regras determinísticas — cada
// atributo (forma, preenchimento, rotação, tamanho, quantidade) segue um padrão
// por linha, por coluna ou em quadrado latino. A resposta é a célula (2,2).

export type Shape = "circle" | "square" | "triangle" | "diamond" | "cross" | "star";
export type Fill = "none" | "half" | "solid";

export interface CellSpec {
  shape: Shape;
  fill: Fill;
  rotation: number; // graus
  size: 1 | 2 | 3;
  count: 1 | 2 | 3 | 4;
}

export type Tier = "facil" | "medio" | "dificil";

export type Attr = "shape" | "fill" | "rotation" | "size" | "count";

export interface Rule {
  attr: Attr;
  /**
   * byRow: valor depende da linha; byCol: da coluna;
   * latin: (linha+coluna) % n — quadrado latino;
   * latin2: (2*linha+coluna) % 3 — quadrado latino com outro deslocamento.
   */
  kind: "byRow" | "byCol" | "latin" | "latin2";
  values: (string | number)[];
}

export interface MatrixItem {
  id: number;
  tier: Tier;
  base: CellSpec;
  rules: Rule[];
}

const BASE: CellSpec = { shape: "circle", fill: "solid", rotation: 0, size: 2, count: 1 };

const DOMAINS: Record<Attr, (string | number)[]> = {
  shape: ["circle", "square", "triangle", "diamond", "cross", "star"],
  fill: ["none", "half", "solid"],
  rotation: [0, 45, 90],
  size: [1, 2, 3],
  count: [1, 2, 3, 4],
};

function item(id: number, tier: Tier, rules: Rule[], base: Partial<CellSpec> = {}): MatrixItem {
  return { id, tier, base: { ...BASE, ...base }, rules };
}

// 30 itens: 10 fáceis (1 regra), 10 médios (2 regras), 10 difíceis (3 regras).
// Regras de rotação usam apenas triângulo/estrela (formas sem simetria de 90°,
// para que cada rotação seja visualmente inequívoca).
export const items: MatrixItem[] = [
  // ---- Fáceis ----
  item(1, "facil", [{ attr: "count", kind: "byCol", values: [1, 2, 3] }]),
  item(2, "facil", [{ attr: "size", kind: "byCol", values: [1, 2, 3] }], { shape: "square" }),
  item(3, "facil", [{ attr: "fill", kind: "byCol", values: ["none", "half", "solid"] }], { shape: "triangle" }),
  item(4, "facil", [{ attr: "rotation", kind: "byCol", values: [0, 45, 90] }], { shape: "triangle" }),
  item(5, "facil", [{ attr: "count", kind: "byRow", values: [1, 2, 3] }], { shape: "diamond" }),
  item(6, "facil", [{ attr: "shape", kind: "latin", values: ["circle", "square", "triangle"] }]),
  item(7, "facil", [{ attr: "size", kind: "byRow", values: [1, 2, 3] }], { shape: "cross" }),
  item(8, "facil", [{ attr: "rotation", kind: "byRow", values: [0, 45, 90] }], { shape: "star" }),
  item(9, "facil", [{ attr: "fill", kind: "byRow", values: ["solid", "half", "none"] }]),
  item(10, "facil", [{ attr: "shape", kind: "byCol", values: ["diamond", "cross", "star"] }]),

  // ---- Médios ----
  item(11, "medio", [
    { attr: "shape", kind: "latin", values: ["circle", "square", "triangle"] },
    { attr: "fill", kind: "byRow", values: ["none", "half", "solid"] },
  ]),
  item(12, "medio", [
    { attr: "count", kind: "latin", values: [1, 2, 3] },
    { attr: "shape", kind: "byRow", values: ["square", "circle", "triangle"] },
  ]),
  item(13, "medio", [
    { attr: "size", kind: "latin", values: [1, 2, 3] },
    { attr: "shape", kind: "byCol", values: ["star", "diamond", "cross"] },
  ]),
  item(14, "medio", [
    { attr: "fill", kind: "latin", values: ["none", "half", "solid"] },
    { attr: "count", kind: "byCol", values: [1, 2, 3] },
  ]),
  item(15, "medio", [
    { attr: "rotation", kind: "latin", values: [0, 45, 90] },
    { attr: "size", kind: "byRow", values: [1, 2, 3] },
  ], { shape: "triangle" }),
  item(16, "medio", [
    { attr: "shape", kind: "latin2", values: ["circle", "triangle", "square"] },
    { attr: "size", kind: "byCol", values: [1, 2, 3] },
  ]),
  item(17, "medio", [
    { attr: "count", kind: "byRow", values: [2, 3, 4] },
    { attr: "fill", kind: "byCol", values: ["solid", "none", "half"] },
  ], { shape: "square" }),
  item(18, "medio", [
    { attr: "shape", kind: "byRow", values: ["cross", "star", "diamond"] },
    { attr: "size", kind: "latin", values: [1, 2, 3] },
  ]),
  item(19, "medio", [
    { attr: "fill", kind: "latin2", values: ["solid", "half", "none"] },
    { attr: "shape", kind: "byCol", values: ["triangle", "circle", "square"] },
  ]),
  item(20, "medio", [
    { attr: "rotation", kind: "byCol", values: [0, 45, 90] },
    { attr: "count", kind: "byRow", values: [1, 2, 3] },
  ], { shape: "star" }),

  // ---- Difíceis ----
  item(21, "dificil", [
    { attr: "shape", kind: "latin", values: ["circle", "square", "triangle"] },
    { attr: "fill", kind: "latin2", values: ["none", "half", "solid"] },
    { attr: "size", kind: "byRow", values: [1, 2, 3] },
  ]),
  item(22, "dificil", [
    { attr: "count", kind: "latin2", values: [1, 2, 3] },
    { attr: "shape", kind: "latin", values: ["diamond", "cross", "star"] },
    { attr: "fill", kind: "byRow", values: ["half", "solid", "none"] },
  ]),
  item(23, "dificil", [
    { attr: "rotation", kind: "latin", values: [0, 45, 90] },
    { attr: "count", kind: "byCol", values: [1, 2, 3] },
    { attr: "fill", kind: "byRow", values: ["solid", "none", "half"] },
  ], { shape: "triangle" }),
  item(24, "dificil", [
    { attr: "size", kind: "latin2", values: [1, 2, 3] },
    { attr: "shape", kind: "byRow", values: ["square", "star", "circle"] },
    { attr: "fill", kind: "byCol", values: ["half", "solid", "none"] },
  ]),
  item(25, "dificil", [
    { attr: "shape", kind: "latin", values: ["square", "triangle", "circle"] },
    { attr: "count", kind: "byRow", values: [3, 2, 1] },
    { attr: "size", kind: "byCol", values: [1, 2, 3] },
  ]),
  item(26, "dificil", [
    { attr: "fill", kind: "latin", values: ["none", "solid", "half"] },
    { attr: "rotation", kind: "byRow", values: [0, 45, 90] },
    { attr: "size", kind: "byCol", values: [1, 3, 2] },
  ], { shape: "star" }),
  item(27, "dificil", [
    { attr: "shape", kind: "latin2", values: ["circle", "square", "triangle"] },
    { attr: "fill", kind: "latin", values: ["none", "half", "solid"] },
    { attr: "count", kind: "byRow", values: [1, 2, 3] },
  ]),
  item(28, "dificil", [
    { attr: "rotation", kind: "latin2", values: [0, 45, 90] },
    { attr: "count", kind: "latin", values: [1, 2, 3] },
    { attr: "fill", kind: "byCol", values: ["solid", "half", "none"] },
  ], { shape: "triangle" }),
  item(29, "dificil", [
    { attr: "shape", kind: "latin", values: ["diamond", "star", "cross"] },
    { attr: "size", kind: "latin2", values: [1, 2, 3] },
    { attr: "fill", kind: "byRow", values: ["solid", "half", "none"] },
  ]),
  item(30, "dificil", [
    { attr: "count", kind: "latin", values: [2, 3, 4] },
    { attr: "shape", kind: "latin2", values: ["star", "cross", "diamond"] },
    { attr: "fill", kind: "latin", values: ["solid", "none", "half"] },
  ]),
];

/**
 * Variante dos 30 itens para uma semente: mesmas regras (mesma dificuldade),
 * outra superfície — a ordem dos valores de cada regra é embaralhada e a forma
 * de base muda. Itens com regra de rotação continuam em triângulo/estrela
 * (rotação só é inequívoca nessas formas). Semente 0 = banco original.
 */
export function itemsForSeed(seed: number): MatrixItem[] {
  if (!seed) return items;
  const rand = mulberry32((seed >>> 0) * 2654435761 + 7);
  const shuffle = <T,>(arr: T[]): T[] => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  };
  return items.map((it) => {
    const temRotacao = it.rules.some((r) => r.attr === "rotation");
    const temForma = it.rules.some((r) => r.attr === "shape");
    const formas: Shape[] = temRotacao ? ["triangle", "star"] : (DOMAINS.shape as Shape[]);
    const shape = temForma ? it.base.shape : formas[Math.floor(rand() * formas.length)];
    return { ...it, base: { ...it.base, shape }, rules: it.rules.map((r) => ({ ...r, values: shuffle(r.values) })) };
  });
}

export function cellAt(it: MatrixItem, row: number, col: number): CellSpec {
  const spec: CellSpec = { ...it.base };
  for (const rule of it.rules) {
    const n = rule.values.length;
    let idx: number;
    switch (rule.kind) {
      case "byRow":
        idx = row % n;
        break;
      case "byCol":
        idx = col % n;
        break;
      case "latin":
        idx = (row + col) % n;
        break;
      case "latin2":
        idx = (2 * row + col) % 3;
        break;
    }
    (spec as Record<Attr, string | number>)[rule.attr] = rule.values[idx];
  }
  return spec;
}

export function answerOf(it: MatrixItem): CellSpec {
  return cellAt(it, 2, 2);
}

const key = (s: CellSpec) => JSON.stringify(s);

/** PRNG determinístico (mulberry32) para embaralhar opções de forma estável. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function mutate(spec: CellSpec, attr: Attr, step: number): CellSpec {
  const domain = DOMAINS[attr];
  const cur = domain.indexOf(spec[attr] as string | number);
  const next = domain[(cur + step + domain.length) % domain.length];
  return { ...spec, [attr]: next };
}

/**
 * Seis alternativas por item: a resposta + 5 distratores (vizinhos da matriz e
 * mutações de um atributo), embaralhadas deterministicamente.
 * Retorna as opções e o índice da correta.
 */
export function optionsFor(it: MatrixItem, seed = 0): { options: CellSpec[]; answerIndex: number } {
  const answer = answerOf(it);
  const seen = new Set([key(answer)]);
  const distractors: CellSpec[] = [];

  const candidates: CellSpec[] = [
    cellAt(it, 2, 1),
    cellAt(it, 1, 2),
    cellAt(it, 2, 0),
    cellAt(it, 0, 2),
  ];
  const attrs: Attr[] = ["shape", "fill", "count", "size", "rotation"];
  for (const attr of attrs) {
    candidates.push(mutate(answer, attr, 1), mutate(answer, attr, -1));
  }

  for (const c of candidates) {
    // Rotação só é usada como distrator em formas sem simetria ambígua.
    if (c.rotation !== 0 && c.shape !== "triangle" && c.shape !== "star") continue;
    const k = key(c);
    if (!seen.has(k)) {
      seen.add(k);
      distractors.push(c);
      if (distractors.length === 5) break;
    }
  }

  const options = [answer, ...distractors];
  const rand = mulberry32(it.id * 7919 + 13 + (seed >>> 0) * 31);
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { options, answerIndex: options.findIndex((o) => key(o) === key(answer)) };
}

export interface MatrixScore {
  correct: number;
  total: number;
  byTier: Record<Tier, { correct: number; total: number }>;
  answered: number;
}

/** Corrige o teste: `chosen[i]` é o índice da opção escolhida no item i (ou null). */
export function grade(chosen: (number | null)[], its: MatrixItem[] = items, seed = 0): MatrixScore {
  const byTier: MatrixScore["byTier"] = {
    facil: { correct: 0, total: 0 },
    medio: { correct: 0, total: 0 },
    dificil: { correct: 0, total: 0 },
  };
  let correct = 0;
  let answered = 0;
  its.forEach((it, i) => {
    byTier[it.tier].total++;
    const pick = chosen[i];
    if (pick !== null && pick !== undefined) answered++;
    if (pick !== null && pick !== undefined && pick === optionsFor(it, seed).answerIndex) {
      correct++;
      byTier[it.tier].correct++;
    }
  });
  return { correct, total: its.length, byTier, answered };
}

export const TIME_LIMIT_SECONDS = 25 * 60;

const NOME_ATRIBUTO: Record<Attr, string> = {
  shape: "a forma",
  fill: "o preenchimento",
  rotation: "a rotação",
  size: "o tamanho",
  count: "a quantidade",
};

const NOME_PADRAO: Record<Rule["kind"], string> = {
  byRow: "é constante em cada linha (muda só de uma linha para outra)",
  byCol: "é constante em cada coluna (muda só de uma coluna para outra)",
  latin: "segue um quadrado latino: cada linha e cada coluna têm os três valores, uma vez cada",
  latin2: "segue um quadrado latino com outro deslocamento: cada linha e cada coluna têm os três valores, sem repetir",
};

/** Explica, em português, as regras que geram um item (para a revisão no resultado). */
export function describeRules(it: MatrixItem): string[] {
  return it.rules.map((r) => `${NOME_ATRIBUTO[r.attr][0].toUpperCase()}${NOME_ATRIBUTO[r.attr].slice(1)} ${NOME_PADRAO[r.kind]}.`);
}

