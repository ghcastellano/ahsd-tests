import type { Cell, Difficulty, Item, Mark } from "./types";
import { buildOptions, mulberry32, pick, shuffle } from "./rng";
import { visualKey } from "./visual-key";

// Séries de figuras (formato dos subtestes de séries: 3 figuras, escolher a 4ª
// que continua a transformação). Regime de VELOCIDADE: itens curtos, dominados
// por uma regra principal, resolvidos em ~15 s.

const SHAPES: Mark[] = ["circle", "square", "triangle", "diamond", "star", "cross"];
const FILLS = ["none", "half", "solid"] as const;

// Chave visual: alternativas que se desenham iguais contam como uma só.
const key = visualKey;

type SeriesRule = "rotacao" | "quantidade" | "tamanho" | "preenchimento" | "rotacao-quantidade";

function build(rule: SeriesRule, seed: number): { seq: Cell[]; answer: Cell; distractors: Cell[]; why: string } {
  const rand = mulberry32(seed);
  // Só o triângulo gira: a estrela tem período de 72°, então 90° e 135° se
  // desenham como 18° e −9° — a resposta ficaria a 9° de um distrator.
  const shape: Mark = "triangle";
  const anyShape = pick(SHAPES, rand);
  const step = 4;
  // Ponto de partida e sentido do giro sorteados: a série de rotação varia
  // entre tentativas mesmo com a forma fixa.
  const giroInicial = Math.floor(rand() * 4) * 45;
  const sentido = rand() < 0.5 ? 1 : -1;
  const giro = (i: number) => (((giroInicial + sentido * i * 45) % 360) + 360) % 360;

  const at = (i: number): Cell => {
    switch (rule) {
      case "rotacao":
        return { marks: [shape], rotation: giro(i) };
      case "quantidade":
        // O CellSvg desenha até 4 elementos; acima disso a figura repetiria a de 4.
        return { marks: [anyShape], count: Math.min(4, i + 1) as 1 | 2 | 3 | 4 };
      case "tamanho":
        // Ciclo 1→2→3→1: com `Math.min` o 4º elemento repetiria o 3º e o item
        // ficaria degenerado (a resposta seria a própria figura anterior).
        return { marks: [anyShape], size: ((i % 3) + 1) as 1 | 2 | 3 };
      case "preenchimento":
        return { marks: [anyShape], innerFill: FILLS[i % 3] };
      case "rotacao-quantidade":
        return {
          marks: [shape],
          rotation: giro(i),
          count: (i % 2 === 0 ? 1 : 2) as 1 | 2,
        };
    }
  };

  // Regras cíclicas (1→2→3→1) mostram QUATRO figuras: com três, "ciclo" e
  // "vai-e-volta" são igualmente simples e o item fica ambíguo.
  const ciclica = rule === "tamanho" || rule === "preenchimento";
  const seq = ciclica ? [at(0), at(1), at(2), at(3)] : [at(0), at(1), at(2)];
  const answer = at(seq.length);
  const why: Record<SeriesRule, string> = {
    rotacao: "A figura gira 45° a cada passo, sempre no mesmo sentido.",
    quantidade: "A quantidade de elementos aumenta de um em um.",
    tamanho: "O tamanho da figura avança em ciclo: pequeno → médio → grande → pequeno.",
    preenchimento: "O preenchimento avança em ciclo: vazio → metade → cheio.",
    "rotacao-quantidade": "Duas regras ao mesmo tempo: a figura gira 45° por passo e a quantidade alterna entre um e dois elementos.",
  };

  const distractors: Cell[] = shuffle(
    [
      at(seq.length - 1), // repete o anterior
      at(seq.length + 1), // pula um passo
      { ...answer, rotation: ((answer.rotation ?? 0) + 45) % 360 },
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

export function figureSeriesItems(seed = 0): Item[] {
  const k = (seed >>> 0) * 1_000_003;
  const rules: SeriesRule[] = [
    "quantidade", "rotacao", "preenchimento", "tamanho",
    "quantidade", "rotacao", "preenchimento", "rotacao-quantidade",
    "tamanho", "rotacao-quantidade", "preenchimento", "rotacao-quantidade",
    "rotacao-quantidade",
  ];
  return rules.map((rule, i) => {
    const s = 7000 + i * 61 + k;
    const { seq, answer, distractors, why } = build(rule, s);
    const { options, answerIndex } = buildOptions(answer, distractors, key, mulberry32(s + 5));
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
