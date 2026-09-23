import { buildOptions, mulberry32, shuffle } from "../battery/rng";

/** Um mosaico de nove posições. Cada bit é um quadrado preto, sem sobreposição. */
export interface PatternItem {
  type: "padrao";
  id: string;
  domain: string;
  family: "composicao" | "intercalacao" | "alternancia" | "relacao";
  grid?: number[][];
  sequence?: number[];
  pairs?: [number, number][];
  options: number[];
  answerIndex: number;
  explanation: string;
}
export const FULL = 511;
export type Operation = "xor" | "and" | "or";
export const OPERATIONS: Operation[] = ["xor", "and", "or"];
const names = ["identidade", "rotação de 90° no sentido horário", "rotação de 180°", "rotação de 270° no sentido horário", "reflexão esquerda–direita", "reflexão esquerda–direita seguida de rotação de 90°", "reflexão esquerda–direita seguida de rotação de 180°", "reflexão esquerda–direita seguida de rotação de 270°"];
const operations = { xor: "exclusão: ficam as posições pretas em apenas um dos dois mosaicos", and: "interseção: ficam as posições pretas nos dois mosaicos", or: "união: ficam as posições pretas em pelo menos um dos dois mosaicos" };

export function transform(mask: number, rule: number): number {
  let out = 0;
  for (let i = 0; i < 9; i++) if (mask & (1 << i)) {
    let r = Math.floor(i / 3), c = i % 3;
    if (rule >= 4) c = 2 - c;
    for (let k = 0; k < rule % 4; k++) [r, c] = [c, 2 - r];
    out |= 1 << (r * 3 + c);
  }
  return out;
}
const combine = (a: number, b: number, op: Operation) => op === "xor" ? a ^ b : op === "and" ? a & b : a | b;
const count = (n: number) => n.toString(2).replaceAll("0", "").length;
const informative = (n: number) => count(n) >= 2 && count(n) <= 7;
const MASKS = Array.from({ length: 510 }, (_, i) => i + 1).filter(informative);

/** Alternativas em três pares complementares: cada posição fica preta 3/6 vezes.
 * Não há mosaico majoritário; qualquer soma de frequências das posições empata.
 * Um complemento é sempre plausível em tarefas de presença/ausência. */
export function patternOptions(correct: number, preferred: number[], rand: () => number) {
  const reps = [correct];
  for (const m of [...shuffle(preferred, rand), ...shuffle(MASKS, rand)]) {
    if (!informative(m) || reps.some(v => v === m || (v ^ FULL) === m)) continue;
    reps.push(m);
    if (reps.length === 3) break;
  }
  return buildOptions(correct, reps.flatMap(m => [m, m ^ FULL]), String, rand);
}

// Gramática explícita de verificação. Usa apenas as células visíveis; jamais
// consulta o índice correto nem a célula oculta. O teste independente implementa
// as mesmas relações com conjuntos/coordenadas, sem usar estas operações.
export function matrixPredictions(grid: number[][]): Set<number> {
  const predictions = new Set<number>();
  for (const vertical of [false, true]) {
    const rows = vertical ? [0, 1, 2].map(c => [grid[0][c], grid[1][c], grid[2][c]]) : grid;
    for (let left = 0; left < 8; left++) for (let right = 0; right < 8; right++) for (const op of OPERATIONS) {
      const apply = (a: number, b: number) => combine(transform(a, left), transform(b, right), op);
      if (rows.slice(0, 2).every(row => apply(row[0], row[1]) === row[2])) predictions.add(apply(rows[2][0], rows[2][1]));
    }
  }
  return predictions;
}
export function seriesPredictions(sequence: number[]): Set<number> {
  const predictions = new Set<number>();
  for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) {
    // Duas subsequências; a transformação depende da paridade da posição.
    if (sequence.slice(2).every((v, i) => transform(sequence[i], i % 2 ? b : a) === v)) predictions.add(transform(sequence[sequence.length - 2], sequence.length % 2 ? b : a));
    // Duas operações alternadas entre vizinhos.
    if (sequence.slice(1).every((v, i) => transform(sequence[i], i % 2 ? b : a) === v)) predictions.add(transform(sequence.at(-1)!, (sequence.length - 1) % 2 ? b : a));
  }
  return predictions;
}
export function relationOutliers(pairs: [number, number][]): Set<number> {
  const outliers = new Set<number>();
  for (let t = 0; t < 8; t++) for (const inverse of [false, true]) {
    const wrong = pairs.flatMap(([a, b], i) => ((transform(a, t) ^ (inverse ? FULL : 0)) !== b ? [i] : []));
    if (wrong.length === 1) outliers.add(wrong[0]);
  }
  return outliers;
}

export function challengeItems(seed: number): PatternItem[] {
  const rand = mulberry32(seed ^ 0x912ad);
  const choose = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
  const mask = () => choose(MASKS);
  const result: PatternItem[] = [];
  const seen = new Set<string>();
  const add = (item: PatternItem) => {
    const signature = JSON.stringify([item.grid?.flat().slice(0, 8), item.sequence, item.pairs]);
    if (seen.has(signature)) return false;
    seen.add(signature); result.push(item); return true;
  };
  // Cada posição cobre uma operação; transformações e eixo são sorteados.
  for (let n = 0; n < 12; n++) {
    let accepted = false;
    for (let attempt = 0; attempt < 2000 && !accepted; attempt++) {
      const left = 1 + Math.floor(rand() * 7), right = Math.floor(rand() * 8), op = OPERATIONS[n % 3];
      const rows = Array.from({ length: 3 }, () => { const a = mask(), b = mask(); return [a, b, combine(transform(a, left), transform(b, right), op)]; });
      if (rows.some(r => !informative(r[2]) || r[0] === r[2] || r[1] === r[2] || transform(r[0], left) === r[0] || (right !== 0 && transform(r[1], right) === r[1]))) continue;
      const vertical = rand() < 0.5;
      const grid = vertical ? [0, 1, 2].map(c => rows.map(r => r[c])) : rows;
      const correct = grid[2][2];
      const predictions = matrixPredictions(grid);
      if (predictions.size !== 1 || !predictions.has(correct)) continue;
      const distractors = [rows[2][0], rows[2][1], ...OPERATIONS.map(o => combine(rows[2][0], rows[2][1], o)), ...OPERATIONS.map(o => combine(transform(rows[2][0], left), transform(rows[2][1], right), o))];
      accepted = add({ type: "padrao", id: `comp-${seed}-${n}`, domain: "Matrizes compostas", family: "composicao", grid,
        ...patternOptions(correct, distractors, rand),
        explanation: `Leia por ${vertical ? "colunas, de cima para baixo" : "linhas, da esquerda para a direita"}. Primeiro mosaico: ${names[left]}; segundo: ${names[right]}. Depois aplique ${operations[op]}. Faça a transformação ANTES de combinar as posições. A mesma composição explica as duas ${vertical ? "colunas" : "linhas"} completas e determina a célula ausente.`,
      });
    }
    if (!accepted) throw new Error(`Não foi possível construir matriz unívoca: ${seed}/${n}`);
  }
  for (let n = 0; n < 6; n++) {
    let accepted = false;
    for (let attempt = 0; attempt < 2000 && !accepted; attempt++) {
      const a = 1 + Math.floor(rand() * 7), b = 1 + Math.floor(rand() * 7);
      if (a === b) continue;
      const interleaved = n % 2 === 0;
      const sequence = interleaved ? [mask(), mask()] : [mask()];
      while (sequence.length < 8) {
        const i = sequence.length;
        sequence.push(transform(sequence[i - (interleaved ? 2 : 1)], (interleaved ? i : i - 1) % 2 ? b : a));
      }
      const correct = sequence.pop()!;
      if (new Set(sequence).size < 4 || correct === sequence.at(-1)) continue;
      const predictions = seriesPredictions(sequence);
      if (predictions.size !== 1 || !predictions.has(correct)) continue;
      accepted = add({ type: "padrao", id: `serie-comp-${seed}-${n}`, domain: "Séries compostas", family: interleaved ? "intercalacao" : "alternancia", sequence,
        ...patternOptions(correct, [sequence.at(-1)!, ...Array.from({ length: 8 }, (_, t) => transform(sequence.at(-1)!, t))], rand),
        explanation: interleaved ? `Separe as posições ímpares (1, 3, 5, 7) das pares (2, 4, 6, 8). Nas ímpares, aplique ${names[a]}; nas pares, ${names[b]}. A posição 8 deriva da 6 pela regra das pares.` : `As transformações entre vizinhos alternam: ${names[a]}, depois ${names[b]}, repetidamente. São sete transições até a resposta: a última usa ${names[a]}.`,
      });
    }
    if (!accepted) throw new Error(`Não foi possível construir série unívoca: ${seed}/${n}`);
  }
  for (let n = 0; n < 6; n++) {
    let accepted = false;
    for (let attempt = 0; attempt < 2000 && !accepted; attempt++) {
      const t = 1 + Math.floor(rand() * 7), inverse = n % 2 === 1;
      const inputs = shuffle(MASKS.filter(m => count(m) === 4), rand).slice(0, 6);
      const pairs: [number, number][] = inputs.map(a => [a, transform(a, t) ^ (inverse ? FULL : 0)]);
      const outlier = Math.floor(rand() * 6);
      const right = pairs[outlier][1];
      // Troca um preto e um branco: conserva contagem, evita intruso por quantidade.
      const on = choose(Array.from({ length: 9 }, (_, i) => i).filter(i => right & (1 << i)));
      const off = choose(Array.from({ length: 9 }, (_, i) => i).filter(i => !(right & (1 << i))));
      pairs[outlier][1] ^= (1 << on) | (1 << off);
      if (relationOutliers(pairs).size !== 1 || !relationOutliers(pairs).has(outlier)) continue;
      accepted = add({ type: "padrao", id: `relacao-${seed}-${n}`, domain: "Classificação relacional", family: "relacao", pairs, options: [0, 1, 2, 3, 4, 5], answerIndex: outlier,
        explanation: `Cinco pares aplicam ao mosaico da esquerda ${names[t]}${inverse ? ", seguida da inversão preto ↔ branco" : ""}, produzindo o da direita. O par ${outlier + 1} viola essa relação, embora conserve a quantidade de posições pretas. Compare posições, não apenas contagem.`,
      });
    }
    if (!accepted) throw new Error(`Não foi possível construir classificação unívoca: ${seed}/${n}`);
  }
  return result;
}
