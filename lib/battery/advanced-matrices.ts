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
    kind: "d3",
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
  // Quadrado latino sobre {A, B, AUSENTE} com ordem e deslocamento sorteados
  // (12 quadrados): antes o layout era fixo (AB_/B_A/_AB) em todos os itens e
  // sementes, e depois do primeiro item virava reconhecimento de padrão.
  const simbolos = shuffle([a, b, null] as (Mark | null)[], rand);
  const desloc = rand() < 0.5 ? 1 : 2;
  if (simbolos[(desloc * 2 + 2) % 3] === null) {
    // a incógnita (2,2) precisa ter um símbolo: troca o nulo de lugar
    const i = simbolos.indexOf(null); const j = (i + 1) % 3;
    [simbolos[i], simbolos[j]] = [simbolos[j], simbolos[i]];
  }
  const at = (r: number, c: number) => simbolos[(desloc * r + c) % 3];
  const grid: Cell[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => ({ marks: at(r, c) ? [at(r, c)!] : [] })));
  const certo = at(2, 2)!;
  const outroDaLinha = certo === a ? b : a;
  const answer: Cell = { marks: [certo] };
  grid[2][2] = answer;

  // Distratores visualmente distintos da resposta. (Girar ou "preencher" o
  // elemento certo não serve: um círculo girado é o mesmo círculo, e linhas
  // não têm preenchimento — a alternativa sairia idêntica à correta.)
  const outro = shuffle(ELEMENTS, rand).find((e) => e !== a && e !== b)!;
  const distractors: Cell[] = [
    { marks: [outroDaLinha] }, // repete o que já está na linha
    { marks: [] }, // repete o vazio
    { marks: [a, b] }, // soma os dois
    { marks: [outro] }, // elemento que não pertence ao item
    { marks: [certo], count: 2 }, // o certo, mas em dobro
    { marks: [certo, outro] }, // o certo contaminado por um estranho
  ];

  const { options, answerIndex } = buildOptions(answer, distractors, key, rand);
  return {
    id,
    difficulty,
    kind: "d2",
    grid,
    options,
    answerIndex,
    explanation:
      "Distribuição de dois: cada linha e cada coluna contêm os dois elementos e uma célula vazia, uma vez cada — a ausência também é um valor da regra. Na última linha (e na última coluna) já apareceram dois dos três valores; falta o terceiro.",
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
  // A linha com 3 marcas à direita é sorteada (antes era sempre a do meio, e
  // a resposta de XOR tinha sempre 2 marcas, AND 1, OR 3: uma pista de contagem).
  const linhaCheia = Math.floor(rand() * 3);
  function rowFor(r: number): [Mark[], Mark[]] {
    // Garante interseção e diferença não vazias, para a operação ser informativa.
    const shared = [vocab[r % vocab.length]];
    const onlyLeft = [vocab[(r + 1) % vocab.length]];
    const onlyRight =
      r === linhaCheia
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
  // Intrusos só do vocabulário do item: um elemento que nunca apareceu na matriz seria eliminável de graça.
  const others: Mark[] = vocab.filter((m) => !answer.marks.includes(m));
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
    kind: `logic-${op}`,
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
    size: 1, // elementos pequenos: não vazam do contorno
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
    kind: "dual",
    grid,
    options,
    answerIndex,
    explanation:
      "Dois componentes, duas regras independentes: a forma externa segue distribuição de três (cada linha usa as três formas), enquanto a quantidade do elemento interno cresce da esquerda para a direita. O contorno e o conteúdo obedecem a regras separadas — resolva um componente de cada vez.",
  };
}


// ---------------------------------------------------------------------------
// 5. Operação lógica (interno) + distribuição de dois (externo): "extrema"
// ---------------------------------------------------------------------------

function logicD2Item(id: string, seed: number, op: LogicOp, difficulty: Difficulty): Item {
  const rand = mulberry32(seed);

  // Externo: quadrado latino sobre {A, B, AUSENTE}, deslocamento e ordem sorteados.
  const [oa, ob] = shuffle(SHAPES, rand).slice(0, 2);
  const simbolos = shuffle([oa, ob, null] as (Mark | null)[], rand);
  const desloc = rand() < 0.5 ? 1 : 2;
  const outerAt = (r: number, c: number): Mark | undefined => simbolos[(desloc * r + c) % 3] ?? undefined;

  // Interno: 4 marcas lineares/pontuais (sem "circle", que se confundiria com um contorno).
  const vocab = shuffle(ELEMENTS.filter((m) => m !== "circle"), rand).slice(0, 4);
  const linhaCheia = Math.floor(rand() * 3);
  const rowFor = (r: number): [Mark[], Mark[]] => {
    const shared = vocab[r];
    const onlyLeft = vocab[(r + 1) % 4];
    const onlyRight = r === linhaCheia ? [vocab[(r + 2) % 4], vocab[(r + 3) % 4]] : [vocab[(r + 2) % 4]];
    return [shuffle([shared, onlyLeft], rand), shuffle([shared, ...onlyRight], rand)];
  };

  const grid: Cell[][] = [];
  for (let r = 0; r < 3; r++) {
    const [left, right] = rowFor(r);
    grid.push([
      { marks: left, outer: outerAt(r, 0), size: 1 },
      { marks: right, outer: outerAt(r, 1), size: 1 },
      { marks: applyOp(op, left, right), outer: outerAt(r, 2), size: 1 },
    ]);
  }
  const answer = grid[2][2];
  const [l2, r2] = [grid[2][0].marks, grid[2][1].marks];
  const outrosOuters = [oa, ob, undefined].filter((o) => o !== answer.outer);
  const opsErradas = (["or", "and", "xor"] as LogicOp[]).filter((o) => o !== op).map((o) => applyOp(o, l2, r2));
  const semUm = answer.marks.length > 1 ? answer.marks.slice(1) : [];
  const comIntruso = [...answer.marks, vocab.find((m) => !answer.marks.includes(m))!];

  // Cada distrator viola EXATAMENTE uma regra; nenhum é célula visível.
  const distractors: Cell[] = [
    ...outrosOuters.map((o) => ({ ...answer, outer: o })),
    ...opsErradas.map((m) => ({ ...answer, marks: m })),
    { ...answer, marks: comIntruso },
    ...(semUm.length ? [{ ...answer, marks: semUm }] : []),
    { ...answer, marks: l2 },
    { ...answer, marks: r2 },
    { ...answer, outer: outrosOuters[0], marks: opsErradas[0] },
  ].filter((c) => c.marks.length > 0);

  const visiveis = new Set(grid.flat().slice(0, 8).map(visualKey));
  const { options, answerIndex } = buildOptions(answer, distractors.filter((c) => !visiveis.has(visualKey(c))), visualKey, rand);
  return {
    id,
    difficulty,
    kind: `logicD2-${op}`,
    grid,
    options,
    answerIndex,
    explanation:
      `Duas regras em componentes diferentes. Contorno: distribuição de dois — em cada linha e coluna aparecem as duas formas e uma célula SEM contorno (a ausência é um valor). ` +
      `Conteúdo: operação lógica por linha — a terceira célula contém ${OP_TEXT[op]}.`,
  };
}

// ---------------------------------------------------------------------------
// 6. Três componentes / quatro regras em eixos distintos, distratores n−1: "extrema"
// ---------------------------------------------------------------------------

/** Pares (a, b) com a + b ≤ 4, para a regra de adição na quantidade. */
const PARES_SOMA: [number, number][] = [[1, 3], [3, 1], [2, 2], [1, 2], [2, 1]];

function triadItem(id: string, seed: number, difficulty: Difficulty): Item {
  const rand = mulberry32(seed);
  const shapes = shuffle(SHAPES, rand).slice(0, 3);
  const fills = shuffle([...FILLS], rand);
  const inners = shuffle(ELEMENTS.filter((m) => m !== "circle" && m !== "dot"), rand).slice(0, 3);

  // Três pares distintos; a linha de soma 4 vai primeiro: assim as duas primeiras
  // linhas nunca são ambas permutações de {1,2,3}, o que abriria a leitura
  // "distribuição de três" na quantidade com outra resposta.
  const pares = shuffle(PARES_SOMA, rand).slice(0, 3).sort((p, q) => (q[0] + q[1]) - (p[0] + p[1]));

  const cellAt = (r: number, c: number): Cell => ({
    outer: shapes[(r + c) % 3],
    outerFill: fills[(2 * r + c) % 3],
    marks: [inners[c]],
    count: c < 2 ? pares[r][c] : pares[r][0] + pares[r][1],
    size: 1,
  });

  const grid: Cell[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cellAt(r, c)));
  const answer = grid[2][2];
  const [a2, b2] = pares[2];
  const somaErrada = [Math.abs(a2 - b2), Math.min(4, a2 + b2 + 1), b2].filter((n) => n >= 1 && n !== answer.count);

  // Cada distrator viola exatamente UMA das quatro regras; nenhum é célula visível.
  const distractors: Cell[] = [
    { ...answer, outer: shapes[(2 + 2 + 1) % 3] },
    { ...answer, outer: shapes[(2 + 2 + 2) % 3] },
    { ...answer, outerFill: fills[(2 * 2 + 2 + 1) % 3] },
    { ...answer, outerFill: fills[(2 * 2 + 2 + 2) % 3] },
    { ...answer, marks: [inners[0]] },
    { ...answer, marks: [inners[1]] },
    ...somaErrada.map((n) => ({ ...answer, count: n })),
  ];

  const visiveis = new Set(grid.flat().slice(0, 8).map(visualKey));
  const { options, answerIndex } = buildOptions(answer, distractors.filter((c) => !visiveis.has(visualKey(c))), visualKey, rand);
  return {
    id,
    difficulty,
    kind: "triad",
    grid,
    options,
    answerIndex,
    explanation:
      "Quatro regras em eixos diferentes. Contorno: cada linha tem as três formas E os três preenchimentos, uma vez cada, em ordens independentes. " +
      "Elemento interno: constante em cada COLUNA. Quantidade do elemento: a terceira célula tem a soma das duas primeiras (adição, como nos itens finais do APM). " +
      "Cada alternativa errada respeita três das quatro regras.",
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
  // Bloco 4 (28–36): distribuição de dois com layout sorteado, depois os dois
  // tipos de teto (duas regras em componentes diferentes; quatro regras em
  // eixos distintos com distratores n−1). Antes, "extrema" era o mesmo XOR
  // dos itens 15–18 com outro rótulo.
  for (let i = 0; i < 4; i++) items.push(d2Item(next(), 4000 + i * 53 + k, "dificil"));
  for (let i = 0; i < 2; i++) items.push(logicD2Item(next(), 4500 + i * 59 + k, i ? "and" : "xor", "extrema"));
  for (let i = 0; i < 3; i++) items.push(triadItem(next(), 4700 + i * 61 + k, "extrema"));

  return items;
}
