import type { Cell, Difficulty, Item, Mark } from "./types";
import { buildOptions, mulberry32, pick, shuffle } from "./rng";

// Séries de figuras (formato dos subtestes de séries: 3 figuras, escolher a 4ª
// que continua a transformação). Regime de VELOCIDADE: itens curtos, dominados
// por uma regra principal, resolvidos em ~15 s.

const SHAPES: Mark[] = ["circle", "square", "triangle", "diamond", "star", "cross"];
const FILLS = ["none", "half", "solid"] as const;

const key = (c: Cell) =>
  JSON.stringify({
    m: [...c.marks].sort(),
    f: c.innerFill ?? "",
    r: c.rotation ?? 0,
    s: c.size ?? 2,
    n: c.count ?? 1,
  });

type SeriesRule = "rotacao" | "quantidade" | "tamanho" | "preenchimento" | "rotacao-quantidade";

function build(rule: SeriesRule, seed: number): { seq: Cell[]; answer: Cell; distractors: Cell[]; why: string } {
  const rand = mulberry32(seed);
  const shape = pick(SHAPES.filter((s) => s === "triangle" || s === "star" || s === "cross"), rand);
  const anyShape = pick(SHAPES, rand);
  const step = 4;

  const at = (i: number): Cell => {
    switch (rule) {
      case "rotacao":
        return { marks: [shape], rotation: (i * 45) % 180 };
      case "quantidade":
        return { marks: [anyShape], count: (i + 1) as 1 | 2 | 3 | 4 };
      case "tamanho":
        // Ciclo 1→2→3→1: com `Math.min` o 4º elemento repetiria o 3º e o item
        // ficaria degenerado (a resposta seria a própria figura anterior).
        return { marks: [anyShape], size: ((i % 3) + 1) as 1 | 2 | 3 };
      case "preenchimento":
        return { marks: [anyShape], innerFill: FILLS[i % 3] };
      case "rotacao-quantidade":
        return {
          marks: [shape],
          rotation: (i * 45) % 180,
          count: (i % 2 === 0 ? 1 : 2) as 1 | 2,
        };
    }
  };

  const seq = [at(0), at(1), at(2)];
  const answer = at(3);
  const why: Record<SeriesRule, string> = {
    rotacao: "A figura gira 45° a cada passo.",
    quantidade: "A quantidade de elementos aumenta de um em um.",
    tamanho: "O tamanho da figura avança em ciclo: pequeno → médio → grande → pequeno.",
    preenchimento: "O preenchimento avança em ciclo: vazio → metade → cheio.",
    "rotacao-quantidade": "Duas regras ao mesmo tempo: a figura gira 45° por passo e a quantidade alterna entre um e dois elementos.",
  };

  const distractors: Cell[] = shuffle(
    [
      at(2), // repete o anterior
      at(4), // pula um passo
      { ...answer, rotation: ((answer.rotation ?? 0) + 45) % 180 },
      { ...answer, count: (((answer.count ?? 1) % 4) + 1) as 1 | 2 | 3 | 4 },
      { ...answer, innerFill: FILLS[(FILLS.indexOf((answer.innerFill ?? "none") as never) + 1) % 3] },
      { ...answer, size: (((answer.size ?? 2) % 3) + 1) as 1 | 2 | 3 },
      { ...answer, marks: [pick(SHAPES.filter((s) => s !== answer.marks[0]), rand)] },
    ],
    rand,
  );

  void step;
  return { seq, answer, distractors, why: why[rule] };
}

export function figureSeriesItems(): Item[] {
  const rules: SeriesRule[] = [
    "quantidade", "rotacao", "preenchimento", "tamanho",
    "quantidade", "rotacao", "preenchimento", "rotacao-quantidade",
    "tamanho", "rotacao-quantidade", "preenchimento", "rotacao-quantidade",
    "rotacao-quantidade",
  ];
  return rules.map((rule, i) => {
    const seed = 7000 + i * 61;
    const { seq, answer, distractors, why } = build(rule, seed);
    const { options, answerIndex } = buildOptions(answer, distractors, key, mulberry32(seed + 5));
    const difficulty: Difficulty = rule === "rotacao-quantidade" ? "dificil" : "media";
    return {
      id: `fs${String(i + 1).padStart(2, "0")}`,
      difficulty,
      sequence: seq,
      options,
      answerIndex,
      explanation: why,
    };
  });
}
