import type { Cell, Difficulty, Item, Mark } from "./types";
import { buildOptions, mulberry32, shuffle } from "./rng";
import { visualKey } from "./visual-key";

// Matrizes 3x3 no estilo das Matrizes Progressivas Avançadas.
//
// Taxonomia de regras (Carpenter, Just & Shell, 1990), da mais fácil à mais
// difícil: constante-na-linha (CR) < progressão quantitativa (PP) <
// adição/subtração (A/S) < distribuição de três (D3) < distribuição de dois (D2).
// As duas últimas exigem integrar as três células ao mesmo tempo e raciocinar
// sobre o valor AUSENTE — daí a carga de memória de trabalho.
//
// Operações lógicas (Verguts & De Boeck, 2002): união (OR), interseção (AND) e
// exclusiva (XOR), aplicadas ao conjunto de elementos das duas primeiras células.
//
// Alavancas de dificuldade usadas aqui:
//  - múltiplas regras por item, em componentes diferentes (externo/interno);
//  - ausência de pista de decomposição (o componente não é separado por espaço);
//  - distratores que satisfazem PARTE das regras (erro plausível, não aleatório).

const SHAPES: Mark[] = ["circle", "square", "triangle", "diamond", "star", "cross"];
const ELEMENTS: Mark[] = ["hbar", "vbar", "slash", "backslash", "dot", "circle"];
const FILLS = ["none", "half", "solid"] as const;

// Chave visual: alternativas que se desenham iguais contam como uma só.
const key = visualKey;

// ---------------------------------------------------------------------------
// 1. Distribuição de três (D3) em dois atributos simultâneos
// ---------------------------------------------------------------------------

function d3Item(id: string, seed: number, difficulty: Difficulty): Item {
  const rand = mulberry32(seed);
  const shapes = shuffle(SHAPES, rand).slice(0, 3);
  const fills = shuffle([...FILLS], rand);
  // Dois quadrados latinos com deslocamentos diferentes: a forma anda por
  // (linha+coluna), o preenchimento por (2*linha+coluna). Sem alinhamento
  // entre eles, não dá para deduzir um a partir do outro.
  const cellAt = (r: number, c: number): Cell => ({
    marks: [shapes[(r + c) % 3]],
    innerFill: fills[(2 * r + c) % 3],
  });

  const grid: Cell[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cellAt(r, c)));
  const answer = grid[2][2];

  const distractors: Cell[] = [
    // certo na forma, errado no preenchimento (satisfaz 1 das 2 regras)
    { marks: answer.marks, innerFill: fills[(2 * 2 + 2 + 1) % 3] },
    { marks: answer.marks, innerFill: fills[(2 * 2 + 2 + 2) % 3] },
    // certo no preenchimento, errado na forma
    { marks: [shapes[(2 + 2 + 1) % 3]], innerFill: answer.innerFill },
    { marks: [shapes[(2 + 2 + 2) % 3]], innerFill: answer.innerFill },
    // errado nos dois
    { marks: [shapes[(2 + 2 + 1) % 3]], innerFill: fills[(2 * 2 + 2 + 1) % 3] },
    { marks: [shapes[(2 + 2 + 2) % 3]], innerFill: fills[(2 * 2 + 2 + 2) % 3] },
  ];

  const { options, answerIndex } = buildOptions(answer, distractors, key, rand);
  return {
    id,
    difficulty,
    grid,
    options,
    answerIndex,
    explanation:
      "Distribuição de três em dois atributos: cada linha contém as três formas, uma vez cada, e também os três preenchimentos, uma vez cada — mas em ordens diferentes. A resposta é a combinação que falta na última linha.",
  };
}

// ---------------------------------------------------------------------------
// 2. Distribuição de dois (D2) — a regra mais difícil: um dos valores é AUSÊNCIA
// ---------------------------------------------------------------------------

function d2Item(id: string, seed: number, difficulty: Difficulty): Item {
  const rand = mulberry32(seed);
  const [a, b] = shuffle(ELEMENTS, rand).slice(0, 2);
  // Cada linha tem: um elemento A, um elemento B e uma célula VAZIA — em ordens
  // que variam por linha. O solucionador precisa perceber que "nada" é um valor.
  const layout = [
    [a, b, null],
    [b, null, a],
    [null, a, null], // (2,2) é a incógnita
  ] as (Mark | null)[][];

  const grid: Cell[][] = layout.map((row) =>
    row.map((m) => ({ marks: m ? [m] : [] })),
  );
  // Na última linha já apareceram: vazio (col 0) e `a` (col 1) -> falta `b`.
  const answer: Cell = { marks: [b] };
  grid[2][2] = answer;

  // Distratores visualmente distintos da resposta. (Girar ou "preencher" o
  // elemento certo não serve: um círculo girado é o mesmo círculo, e linhas
  // não têm preenchimento — a alternativa sairia idêntica à correta.)
  const outro = shuffle(ELEMENTS, rand).find((e) => e !== a && e !== b)!;
  const distractors: Cell[] = [
    { marks: [a] }, // repete o que já está na linha
    { marks: [] }, // repete o vazio
    { marks: [a, b] }, // soma os dois
    { marks: [outro] }, // elemento que não pertence ao item
    { marks: [b], count: 2 }, // o certo, mas em dobro
    { marks: [b, outro] }, // o certo contaminado por um estranho
  ];

  const { options, answerIndex } = buildOptions(answer, distractors, key, rand);
  return {
    id,
    difficulty,
    grid,
    options,
    answerIndex,
    explanation:
      "Distribuição de dois: cada linha contém dois elementos diferentes e uma célula vazia — a ausência também é um valor da regra. Na última linha já apareceram a célula vazia e um dos elementos; falta o outro.",
  };
}

// ---------------------------------------------------------------------------
// 3. Operações lógicas sobre conjuntos de elementos (XOR / AND / OR)
// ---------------------------------------------------------------------------

type LogicOp = "xor" | "and" | "or";

const OP_TEXT: Record<LogicOp, string> = {
  xor: "elementos que aparecem em apenas UMA das duas primeiras células (os repetidos se cancelam)",
  and: "apenas os elementos presentes nas DUAS primeiras células",
  or: "todos os elementos das duas primeiras células, somados",
};

function applyOp(op: LogicOp, x: Mark[], y: Mark[]): Mark[] {
  const sx = new Set(x);
  const sy = new Set(y);
  switch (op) {
    case "xor":
      return [...new Set([...x.filter((m) => !sy.has(m)), ...y.filter((m) => !sx.has(m))])];
    case "and":
      return x.filter((m) => sy.has(m));
    case "or":
      return [...new Set([...x, ...y])];
  }
}

function logicItem(id: string, seed: number, op: LogicOp, difficulty: Difficulty): Item {
  const rand = mulberry32(seed);
  const vocab = shuffle(ELEMENTS, rand).slice(0, 4);

  // Cada linha usa uma combinação DIFERENTE do vocabulário. Sem isso, duas
  // linhas podem sair idênticas e o item vira cópia da linha de cima — dá para
  // acertar sem entender a operação.
  function rowFor(r: number): [Mark[], Mark[]] {
    // Garante interseção e diferença não vazias, para a operação ser informativa.
    const shared = [vocab[r % vocab.length]];
    const onlyLeft = [vocab[(r + 1) % vocab.length]];
    const onlyRight =
      r === 1
        ? [vocab[(r + 2) % vocab.length], vocab[(r + 3) % vocab.length]]
        : [vocab[(r + 2) % vocab.length]];
    return [
      shuffle([...shared, ...onlyLeft], rand),
      shuffle([...new Set([...shared, ...onlyRight])], rand),
    ];
  }

  const grid: Cell[][] = [];
  for (let r = 0; r < 3; r++) {
    const [left, right] = rowFor(r);
    grid.push([{ marks: left }, { marks: right }, { marks: applyOp(op, left, right) }]);
  }
  const answer = grid[2][2];
  const [l2, r2] = [grid[2][0].marks, grid[2][1].marks];

  // Distratores: primeiro os "quase certos" (resultado da operação ERRADA —
  // o erro plausível de quem confundiu XOR com OR), depois variações do
  // conjunto correto. Pool amplo o bastante para sempre fechar 6 opções
  // distintas mesmo quando várias operações coincidem nesta linha.
  const others: Mark[] = ELEMENTS.filter((m) => !answer.marks.includes(m));
  const distractors: Cell[] = [
    { marks: applyOp("or", l2, r2) },
    { marks: applyOp("and", l2, r2) },
    { marks: applyOp("xor", l2, r2) },
    { marks: l2 },
    { marks: r2 },
    ...others.map((m) => ({ marks: [...answer.marks, m] })),
    ...answer.marks.map((_, i) => ({ marks: answer.marks.filter((_, j) => j !== i) })),
    ...others.map((m) => ({ marks: [m] })),
  ].filter((c) => c.marks.length > 0);

  const { options, answerIndex } = buildOptions(answer, distractors, key, rand);
  return {
    id,
    difficulty,
    grid,
    options,
    answerIndex,
    explanation: `Operação lógica por linha: a terceira célula contém ${OP_TEXT[op]}.`,
  };
}

// ---------------------------------------------------------------------------
// 4. Dois componentes com regras independentes (sem pista de separação)
// ---------------------------------------------------------------------------

function dualItem(id: string, seed: number, difficulty: Difficulty): Item {
  const rand = mulberry32(seed);
  const outers = shuffle(SHAPES, rand).slice(0, 3);
  const inners = shuffle(ELEMENTS, rand).slice(0, 3);
  // Componente externo: distribuição de três.
  // Componente interno: progressão quantitativa (quantidade cresce na linha).
  const cellAt = (r: number, c: number): Cell => ({
    outer: outers[(r + c) % 3],
    marks: [inners[r % 3]],
    count: (c + 1) as 1 | 2 | 3,
  });

  const grid: Cell[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cellAt(r, c)));
  const answer = grid[2][2];

  const distractors: Cell[] = [
    { ...answer, outer: outers[(2 + 2 + 1) % 3] }, // externo errado
    { ...answer, outer: outers[(2 + 2 + 2) % 3] },
    { ...answer, count: 2 }, // quantidade errada
    { ...answer, count: 1 },
    { ...answer, marks: [inners[(2 + 1) % 3]] }, // elemento interno errado
    { ...answer, outer: outers[(2 + 2 + 1) % 3], count: 2 }, // dois erros
  ];

  const { options, answerIndex } = buildOptions(answer, distractors, key, rand);
  return {
    id,
    difficulty,
    grid,
    options,
    answerIndex,
    explanation:
      "Dois componentes, duas regras independentes: a forma externa segue distribuição de três (cada linha usa as três formas), enquanto a quantidade do elemento interno cresce da esquerda para a direita. Nada separa visualmente os dois componentes — descobrir o eixo de decomposição faz parte do item.",
  };
}

// ---------------------------------------------------------------------------
// Banco: 36 itens em dificuldade crescente (formato APM Set II)
// ---------------------------------------------------------------------------

// `seed` desloca a semente de cada item: outra tentativa, outras figuras,
// mesmas regras e mesma escalada de dificuldade (a taxonomia é fixa).
export function advancedMatrixItems(seed = 0): Item[] {
  const items: Item[] = [];
  const k = (seed >>> 0) * 1_000_003;
  let n = 0;
  const next = () => `am${String(++n).padStart(2, "0")}`;

  // Bloco 1 (1–9): distribuição de três em dois atributos.
  for (let i = 0; i < 9; i++) items.push(d3Item(next(), 1000 + i * 37 + k, "media"));
  // Bloco 2 (10–18): operações lógicas — OR e AND primeiro.
  for (let i = 0; i < 5; i++) items.push(logicItem(next(), 2000 + i * 41 + k, i % 2 ? "and" : "or", "media"));
  for (let i = 0; i < 4; i++) items.push(logicItem(next(), 2500 + i * 43 + k, "xor", "dificil"));
  // Bloco 3 (19–27): dois componentes sem pista de separação.
  for (let i = 0; i < 9; i++) items.push(dualItem(next(), 3000 + i * 47 + k, "dificil"));
  // Bloco 4 (28–36): distribuição de dois (a regra de maior carga).
  for (let i = 0; i < 5; i++) items.push(d2Item(next(), 4000 + i * 53 + k, "dificil"));
  for (let i = 0; i < 4; i++) items.push(logicItem(next(), 4500 + i * 59 + k, "xor", "extrema"));

  return items;
}
