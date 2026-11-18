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
  const shiftA = rand() < 0.5 ? 1 : 2;
  const shiftB = shiftA === 1 ? 2 : 1;
  const variant = Math.floor(rand() * 3); // 0: forma+preenchimento, 1: forma+quantidade, 2: forma+tamanho

  if (variant === 1) {
    const counts = shuffle([1, 2, 3], rand);
    const cellAt = (r: number, c: number): Cell => ({
      marks: [shapes[(shiftA * r + c) % 3]],
      count: counts[(shiftB * r + c) % 3],
      size: 1,
    });
    const grid: Cell[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cellAt(r, c)));
    const answer = grid[2][2];
    const distractors: Cell[] = [
      { ...answer, count: counts[(shiftB * 2 + 2 + 1) % 3] },
      { ...answer, count: counts[(shiftB * 2 + 2 + 2) % 3] },
      { ...answer, marks: [shapes[(shiftA * 2 + 2 + 1) % 3]] },
      { ...answer, marks: [shapes[(shiftA * 2 + 2 + 2) % 3]] },
      { marks: [shapes[(shiftA * 2 + 2 + 1) % 3]], count: counts[(shiftB * 2 + 2 + 1) % 3], size: 1 },
      { marks: [shapes[(shiftA * 2 + 2 + 2) % 3]], count: counts[(shiftB * 2 + 2 + 2) % 3], size: 1 },
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
        "Distribuição de três em dois atributos: cada linha e coluna contém as três formas e as três quantidades (1, 2 e 3), uma vez cada, em ordens independentes. A resposta é a combinação que falta na última linha.",
    };
  }

  if (variant === 2) {
    const sizes = shuffle([1, 2, 3] as const, rand);
    const cellAt = (r: number, c: number): Cell => ({
      marks: [shapes[(shiftA * r + c) % 3]],
      size: sizes[(shiftB * r + c) % 3],
      innerFill: "none",
    });
    const grid: Cell[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cellAt(r, c)));
    const answer = grid[2][2];
    const distractors: Cell[] = [
      { ...answer, size: sizes[(shiftB * 2 + 2 + 1) % 3] },
      { ...answer, size: sizes[(shiftB * 2 + 2 + 2) % 3] },
      { ...answer, marks: [shapes[(shiftA * 2 + 2 + 1) % 3]] },
      { ...answer, marks: [shapes[(shiftA * 2 + 2 + 2) % 3]] },
      { marks: [shapes[(shiftA * 2 + 2 + 1) % 3]], size: sizes[(shiftB * 2 + 2 + 1) % 3], innerFill: "none" },
      { marks: [shapes[(shiftA * 2 + 2 + 2) % 3]], size: sizes[(shiftB * 2 + 2 + 2) % 3], innerFill: "none" },
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
        "Distribuição de três em forma e tamanho: cada linha contém as três formas e os três tamanhos (pequeno, médio, grande), uma vez cada, em ordens independentes.",
    };
  }

  const fills = shuffle([...FILLS], rand);
  // Dois quadrados latinos com deslocamentos diferentes: sem alinhamento entre eles.
  const cellAt = (r: number, c: number): Cell => ({
    marks: [shapes[(shiftA * r + c) % 3]],
    innerFill: fills[(shiftB * r + c) % 3],
  });

  const grid: Cell[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cellAt(r, c)));
  const answer = grid[2][2];

  const distractors: Cell[] = [
    // certo na forma, errado no preenchimento (satisfaz 1 das 2 regras)
    { marks: answer.marks, innerFill: fills[(shiftB * 2 + 2 + 1) % 3] },
    { marks: answer.marks, innerFill: fills[(shiftB * 2 + 2 + 2) % 3] },
    // certo no preenchimento, errado na forma
    { marks: [shapes[(shiftA * 2 + 2 + 1) % 3]], innerFill: answer.innerFill },
    { marks: [shapes[(shiftA * 2 + 2 + 2) % 3]], innerFill: answer.innerFill },
    // errado nos dois
    { marks: [shapes[(shiftA * 2 + 2 + 1) % 3]], innerFill: fills[(shiftB * 2 + 2 + 1) % 3] },
    { marks: [shapes[(shiftA * 2 + 2 + 2) % 3]], innerFill: fills[(shiftB * 2 + 2 + 2) % 3] },
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
  const outerShift = rand() < 0.5 ? 1 : 2;
  const descCount = rand() < 0.5;
  const colInner = rand() < 0.5;
  const countAt = (c: number) => (descCount ? 3 - c : c + 1) as 1 | 2 | 3;

  const cellAt = (r: number, c: number): Cell => ({
    outer: outers[(outerShift * r + c) % 3],
    marks: [inners[(colInner ? c : r) % 3]],
    count: countAt(c),
    size: 1, // elementos pequenos: não vazam do contorno
  });

  const grid: Cell[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cellAt(r, c)));
  const answer = grid[2][2];

  const distractors: Cell[] = [
    { ...answer, outer: outers[(outerShift * 2 + 2 + 1) % 3] }, // externo errado
    { ...answer, outer: outers[(outerShift * 2 + 2 + 2) % 3] },
    { ...answer, count: countAt(1) }, // quantidade errada
    { ...answer, count: countAt(0) },
    { ...answer, marks: [inners[(2 + 1) % 3]] }, // elemento interno errado
    { ...answer, outer: outers[(outerShift * 2 + 2 + 1) % 3], count: countAt(1) }, // dois erros
  ];

  const { options, answerIndex } = buildOptions(answer, distractors, key, rand);
  const dirText = descCount ? "decresce (3 → 2 → 1)" : "cresce (1 → 2 → 3)";
  const innerAxis = colInner ? "constante por coluna" : "constante por linha";
  return {
    id,
    difficulty,
    kind: "dual",
    grid,
    options,
    answerIndex,
    explanation:
      `Dois componentes, duas regras independentes: a forma externa segue distribuição de três (cada linha usa as três formas), o tipo de elemento interno é ${innerAxis}, e a quantidade ${dirText} da esquerda para a direita.`,
  };
}

// ---------------------------------------------------------------------------
// 4b. Rotação progressiva + preenchimento independente
// ---------------------------------------------------------------------------

function rotProgItem(id: string, seed: number, difficulty: Difficulty): Item {
  const rand = mulberry32(seed);
  // Triângulo tem período de 360°: 0°, 90°, 180°, 270° são todos visualmente distintos.
  const fills = shuffle([...FILLS], rand);
  const stepCol = rand() < 0.5 ? 90 : 270;
  const stepRow = rand() < 0.5 ? 90 : 180;
  const baseRot = Math.floor(rand() * 4) * 90;
  const rotAt = (r: number, c: number) => (baseRot + r * stepRow + c * stepCol) % 360;
  const shiftFill = rand() < 0.5 ? 1 : 2;

  const cellAt = (r: number, c: number): Cell => ({
    marks: ["triangle"],
    rotation: rotAt(r, c),
    innerFill: fills[(shiftFill * r + c) % 3],
  });

  const grid: Cell[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cellAt(r, c)));
  const answer = grid[2][2];

  const rotsErradas = [90, 180, 270].map((d) => ((answer.rotation ?? 0) + d) % 360);
  const fillsErrados = fills.filter((f) => f !== answer.innerFill);
  const distractors: Cell[] = [
    { ...answer, rotation: rotsErradas[0] },
    { ...answer, rotation: rotsErradas[1] },
    { ...answer, innerFill: fillsErrados[0] },
    { ...answer, innerFill: fillsErrados[1] },
    { ...answer, rotation: rotsErradas[2], innerFill: fillsErrados[0] },
    { ...answer, rotation: rotsErradas[0], innerFill: fillsErrados[1] },
  ];

  const { options, answerIndex } = buildOptions(answer, distractors, key, rand);
  return {
    id,
    difficulty,
    kind: "rot-prog",
    grid,
    options,
    answerIndex,
    explanation:
      `Progressão rotacional + preenchimento: o triângulo gira ${stepCol === 90 ? "90° no sentido horário" : "90° no sentido anti-horário"} a cada coluna, e o preenchimento segue distribuição de três (cada linha usa vazio, metade e sólido uma vez cada).`,
  };
}

// ---------------------------------------------------------------------------
// 4c. Constante por linha + constante por coluna
// ---------------------------------------------------------------------------

function constRowColItem(id: string, seed: number, difficulty: Difficulty): Item {
  const rand = mulberry32(seed);
  const shapes = shuffle(SHAPES, rand).slice(0, 3);
  const fills = shuffle([...FILLS], rand);
  const rowShape = rand() < 0.5;

  const cellAt = (r: number, c: number): Cell => ({
    marks: [shapes[rowShape ? r : c]],
    innerFill: fills[rowShape ? c : r],
  });

  const grid: Cell[][] = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cellAt(r, c)));
  const answer = grid[2][2];

  const distractors: Cell[] = [
    { marks: [shapes[0]], innerFill: answer.innerFill },
    { marks: [shapes[1]], innerFill: answer.innerFill },
    { marks: answer.marks, innerFill: fills[0] },
    { marks: answer.marks, innerFill: fills[1] },
    { marks: [shapes[0]], innerFill: fills[1] },
    { marks: [shapes[1]], innerFill: fills[0] },
  ];

  const { options, answerIndex } = buildOptions(answer, distractors, key, rand);
  return {
    id,
    difficulty,
    kind: "const-rc",
    grid,
    options,
    answerIndex,
    explanation: rowShape
      ? "Eixos ortogonais: a forma é constante em cada LINHA e o preenchimento é constante em cada COLUNA."
      : "Eixos ortogonais: a forma é constante em cada COLUNA e o preenchimento é constante em cada LINHA.",
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
// 6. Três componentes / quatro regras em eixos distintos, alternativas equilibradas: "extrema"
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
  // Somas mistas (4 e 3): se as três linhas somassem o mesmo, a coluna 3 ficaria
  // constante e a "adição" viraria "constante na coluna".
  const soma4 = shuffle(PARES_SOMA.filter((p) => p[0] + p[1] === 4), rand);
  const soma3 = shuffle(PARES_SOMA.filter((p) => p[0] + p[1] === 3), rand);
  const pares = (rand() < 0.5 ? [soma4[0], soma3[0], soma3[1]] : [soma4[0], soma4[1], soma3[0]]).sort((p, q) => (q[0] + q[1]) - (p[0] + p[1]));

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
  // Um distrator por regra primeiro (a quantidade ENTRA sempre), depois os demais.
  const distractors: Cell[] = [
    { ...answer, count: somaErrada[0] },
    { ...answer, outer: shapes[(2 + 2 + 1) % 3] },
    { ...answer, outerFill: fills[(2 * 2 + 2 + 1) % 3] },
    { ...answer, marks: [inners[0]] },
    ...somaErrada.slice(1).map((n) => ({ ...answer, count: n })),
    { ...answer, outer: shapes[(2 + 2 + 2) % 3] },
    { ...answer, outerFill: fills[(2 * 2 + 2 + 2) % 3] },
    { ...answer, marks: [inners[1]] },
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
      "Confira todos os componentes: os atributos estão equilibrados entre as alternativas.",
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

  // Bloco "media" (14 itens): regras intercaladas para não repetir padrão em sequência.
  const mediaSeq: Array<(id: string, s: number) => Item> = [
    (id, s) => d3Item(id, s, "media"),
    (id, s) => constRowColItem(id, s, "media"),
    (id, s) => logicItem(id, s, "or", "media"),
    (id, s) => rotProgItem(id, s, "media"),
    (id, s) => d3Item(id, s, "media"),
    (id, s) => logicItem(id, s, "and", "media"),
    (id, s) => constRowColItem(id, s, "media"),
    (id, s) => rotProgItem(id, s, "media"),
    (id, s) => d3Item(id, s, "media"),
    (id, s) => logicItem(id, s, "or", "media"),
    (id, s) => rotProgItem(id, s, "media"),
    (id, s) => constRowColItem(id, s, "media"),
    (id, s) => d3Item(id, s, "media"),
    (id, s) => logicItem(id, s, "and", "media"),
  ];
  mediaSeq.forEach((fn, i) => items.push(fn(next(), 1000 + i * 37 + k)));

  // Bloco "dificil" (17 itens): dual, XOR, D2, rotação e D3 intercalados.
  const dificilSeq: Array<(id: string, s: number) => Item> = [
    (id, s) => dualItem(id, s, "dificil"),
    (id, s) => logicItem(id, s, "xor", "dificil"),
    (id, s) => d2Item(id, s, "dificil"),
    (id, s) => rotProgItem(id, s, "dificil"),
    (id, s) => dualItem(id, s, "dificil"),
    (id, s) => logicItem(id, s, "xor", "dificil"),
    (id, s) => d3Item(id, s, "dificil"),
    (id, s) => d2Item(id, s, "dificil"),
    (id, s) => dualItem(id, s, "dificil"),
    (id, s) => logicItem(id, s, "xor", "dificil"),
    (id, s) => rotProgItem(id, s, "dificil"),
    (id, s) => d2Item(id, s, "dificil"),
    (id, s) => dualItem(id, s, "dificil"),
    (id, s) => logicItem(id, s, "xor", "dificil"),
    (id, s) => d3Item(id, s, "dificil"),
    (id, s) => d2Item(id, s, "dificil"),
    (id, s) => dualItem(id, s, "dificil"),
  ];
  dificilSeq.forEach((fn, i) => items.push(fn(next(), 2500 + i * 43 + k)));

  // Bloco "extrema" (5 itens): teto real intercalado.
  const extremaSeq: Array<(id: string, s: number) => Item> = [
    (id, s) => triadItem(id, s, "extrema"),
    (id, s) => logicD2Item(id, s, "xor", "extrema"),
    (id, s) => triadItem(id, s, "extrema"),
    (id, s) => logicD2Item(id, s, "and", "extrema"),
    (id, s) => triadItem(id, s, "extrema"),
  ];
  extremaSeq.forEach((fn, i) => items.push(fn(next(), 4500 + i * 59 + k)));

  return items.map((item, i) => balanceMatrixOptions(item, mulberry32(k + 7001 + i * 101)));
}

export type MatrixRuleKind =
  | "d3"
  | "const-rc"
  | "rot-prog"
  | "logic-or"
  | "logic-and"
  | "logic-xor"
  | "dual"
  | "d2"
  | "logicD2-xor"
  | "logicD2-and"
  | "triad";

export interface MatrixSlot {
  kind: MatrixRuleKind;
  difficulty: Difficulty;
}

export function buildMatrixBank(
  prefix: string,
  slots: readonly MatrixSlot[],
  baseOffset: number,
  seed = 0,
): Item[] {
  const k = (seed >>> 0) * 1_000_003 + baseOffset;
  const items = slots.map((slot, i) => {
    const id = `${prefix}${String(i + 1).padStart(2, "0")}`;
    const s = k + (i + 1) * 7919;
    switch (slot.kind) {
      case "d3":
        return d3Item(id, s, slot.difficulty);
      case "const-rc":
        return constRowColItem(id, s, slot.difficulty);
      case "rot-prog":
        return rotProgItem(id, s, slot.difficulty);
      case "logic-or":
        return logicItem(id, s, "or", slot.difficulty);
      case "logic-and":
        return logicItem(id, s, "and", slot.difficulty);
      case "logic-xor":
        return logicItem(id, s, "xor", slot.difficulty);
      case "dual":
        return dualItem(id, s, slot.difficulty);
      case "d2":
        return d2Item(id, s, slot.difficulty);
      case "logicD2-xor":
        return logicD2Item(id, s, "xor", slot.difficulty);
      case "logicD2-and":
        return logicD2Item(id, s, "and", slot.difficulty);
      case "triad":
        return triadItem(id, s, slot.difficulty);
    }
  });
  return items.map((item, i) => balanceMatrixOptions(item, mulberry32(k + 9001 + i * 131)));
}

function balanceMatrixOptions(item: Item, rand: () => number): Item {
  if (!["d3", "dual", "triad", "logicD2-xor", "logicD2-and"].includes(item.kind ?? "")) return item;
  const correct = item.grid![2][2];
  const shape = (c: Cell) => item.kind === "d3" ? c.marks[0] : c.outer;
  const shapes = [...new Set(item.grid!.flat().map(shape))];
  if (item.kind === "triad") {
    const fills = [correct.outerFill, ...FILLS.filter(f => f !== correct.outerFill)];
    const marks = [correct.marks[0], ...new Set(item.grid!.flat().map(c => c.marks[0]).filter(m => m !== correct.marks[0]))];
    const outers = [correct.outer, ...shapes.filter(o => o !== correct.outer)];
    const counts = [correct.count, ...shuffle([1, 2, 3, 4].filter(n => n !== correct.count), rand)];
    const candidates = Array.from({ length: 6 }, (_, i) => ({ ...correct, outer: outers[i % 3], outerFill: fills[(i + Math.floor(i / 3)) % 3], marks: [marks[(i + 2 * Math.floor(i / 3)) % 3]], count: counts[Math.floor(i / 3)] }));
    return { ...item, ...buildOptions(correct, candidates, visualKey, rand), explanation: item.explanation };
  }
  const wrong = shuffle(item.options!.filter(c => {
    const restored = item.kind === "d3" ? { ...c, marks: correct.marks } : { ...c, outer: correct.outer };
    return visualKey(restored) !== visualKey(correct);
  }), rand)[0];
  // Todos os atributos internos incorretos mudam juntos. Cada conteúdo aparece
  // três vezes e cada contorno duas; a moda das alternativas não revela a chave.
  const contents = [correct, wrong];
  const candidates = shapes.flatMap(outer => contents.map(c => item.kind === "d3" ? { ...c, marks: [outer!] } : { ...c, outer }));
  const options = buildOptions(correct, candidates, visualKey, rand);
  return { ...item, ...options, explanation: item.explanation };
}
