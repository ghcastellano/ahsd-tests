import { visualKey } from "../battery/visual-key";
import { challengeItems, type PatternItem } from "./desafio";
import { advancedMatrixItems } from "../battery/advanced-matrices";
import { figureSeriesItems } from "../battery/figure-series";
import { classificationItems } from "../battery/classification";
import { buildOptions, mulberry32, shuffle } from "../battery/rng";
import type { Item } from "../battery/types";

export const VERSION = "mensa-br-2";
export type Mode = "principal" | "desafio" | "complemento";
export const PROTOCOLS = {
  desafio: { name: "Desafio avançado", count: 24, seconds: 2400, description: "12 matrizes com transformações e operações → 6 séries compostas → 6 classificações por relação. Mais etapas de raciocínio; dificuldade não normatizada." },
  principal: { name: "Preparação principal", count: 24, seconds: 1800, description: "12 matrizes → 6 séries de figuras → 6 classificações. Inclui cinco matrizes de carga extrema do nosso banco." },
  complemento: { name: "Complemento de formatos", count: 12, seconds: 720, description: "6 dominós → 6 mostradores. Familiarização opcional; uso atual desses formatos pela Mensa Brasil não confirmado." },
} as const;
export type Pair = [number, number];
export interface PairItem {
  type: "domino" | "mostrador";
  id: string;
  domain: string;
  grid?: Pair[][];
  sequence?: Pair[];
  options: Pair[];
  answerIndex: number;
  explanation: string;
}
export interface FigureItem { type: "figura"; id: string; domain: string; item: Item }
export type MensaItem = FigureItem | PairItem | PatternItem;
export const answerOf = (q: MensaItem) => q.type === "figura" ? q.item.answerIndex : q.answerIndex;
export const explanationOf = (q: MensaItem) => q.type === "figura" ? q.item.explanation : q.explanation;
const mod = (n: number, m: number) => ((n % m) + m) % m;
const key = (p: Pair) => p.join(",");

// Produto 2×3 ou 3×2: nenhum valor de uma metade/ponteiro é mais frequente.
export function pairOptions(correct: Pair, base: number, rand: () => number) {
  const widths = rand() < 0.5 ? [2, 3] : [3, 2];
  const values = correct.map((v, j) => [v, ...shuffle(Array.from({ length: base }, (_, n) => n).filter(n => n !== v), rand).slice(0, widths[j] - 1)]);
  const pairs = values[0].flatMap(a => values[1].map(b => [a, b] as Pair));
  return buildOptions(correct, pairs, key, rand);
}

/** Exercícios novos de formato, não itens ou réplicas de D48/D70/Clocks. */
export function complementItems(seed: number): PairItem[] {
  const rand = mulberry32(seed ^ 0x713ac);
  const number = (max: number) => Math.floor(rand() * max);
  const domino = Array.from({ length: 6 }, (_, n): PairItem => {
    const subtractTop = n % 2 === 1;
    const subtractBottom = n >= 3;
    const swapLeft = n >= 4, swapRight = n >= 2;
    let grid: Pair[][] = [];
    // Rejeita relações alternativas do mesmo vocabulário que prevejam outro par.
    for (let attempt = 0; attempt < 1000; attempt++) {
      grid = Array.from({ length: 3 }, () => {
        const a: Pair = [number(7), number(7)], b: Pair = [1 + number(6), 1 + number(6)];
        return [a, b, [mod(a[swapLeft ? 1 : 0] + (subtractTop ? -1 : 1) * b[swapRight ? 1 : 0], 7), mod(a[swapLeft ? 0 : 1] + (subtractBottom ? -1 : 1) * b[swapRight ? 0 : 1], 7)]];
      });
      const predictions = new Set<string>();
      for (const l of [false, true]) for (const r of [false, true]) for (const top of [-1, 1]) for (const bottom of [-1, 1]) {
        const apply = (row: Pair[]) => [mod(row[0][l ? 1 : 0] + top * row[1][r ? 1 : 0], 7), mod(row[0][l ? 0 : 1] + bottom * row[1][r ? 0 : 1], 7)] as Pair;
        if (grid.slice(0, 2).every(row => key(apply(row)) === key(row[2]))) predictions.add(key(apply(grid[2])));
      }
      if (predictions.size === 1) break;
      if (attempt === 999) throw new Error("Dominó ambíguo");
    }
    const correct = grid[2][2];
    return {
      type: "domino", id: `domino-${seed}-${n}`, domain: "Dominós", grid,
      ...pairOptions(correct, 7, rand),
      explanation: `Em cada linha, ${swapLeft ? "troque as metades da primeira peça; " : "mantenha as metades da primeira peça; "}${swapRight ? "troque as metades da segunda; " : "mantenha as metades da segunda; "}depois faça primeira ${subtractTop ? "menos" : "mais"} segunda na metade superior e primeira ${subtractBottom ? "menos" : "mais"} segunda na inferior. A contagem é cíclica de 0 a 6. Resultado da última linha: ${correct[0]} acima e ${correct[1]} abaixo.`,
    };
  });
  const clocks = Array.from({ length: 6 }, (_, n): PairItem => {
    const swapped = n >= 3;
    let sequence: Pair[] = [], correct: Pair = [0, 0], step: Pair = [0, 0];
    const acceleration: Pair = [n % 3 === 0 ? 0 : 1, n % 3 === 2 ? -1 : 0];
    for (let attempt = 0; attempt < 1000; attempt++) {
      step = [1 + number(5), -(1 + number(5))];
      sequence = [[number(12), number(12)]];
      for (let k = 0; k < 5; k++) sequence.push([0, 1].map(j => mod(sequence[k][swapped ? 1 - j : j] + step[j] + k * acceleration[j], 12)) as Pair);
      correct = sequence.pop()!;
      const predictions = new Set<string>();
      for (const swap of [false, true]) {
        const differences = [0, 1].map(j => sequence.slice(1).map((p, i) => mod(p[j] - sequence[i][swap ? 1 - j : j], 12)));
        if (!differences.every(ds => new Set(ds.slice(1).map((d, i) => mod(d - ds[i], 12))).size === 1)) continue;
        predictions.add(key([0, 1].map(j => mod(sequence[4][swap ? 1 - j : j] + differences[j][3] + mod(differences[j][1] - differences[j][0], 12), 12)) as Pair));
      }
      if (predictions.size === 1) break;
      if (attempt === 999) throw new Error("Mostrador ambíguo");
    }
    const describe = (j: number) => Array.from({ length: 5 }, (_, k) => step[j] + k * acceleration[j]).map(v => `${Math.abs(v)} ${v >= 0 ? "horário" : "anti-horário"}`).join("; ");
    return { type: "mostrador", id: `mostrador-${seed}-${n}`, domain: "Mostradores", sequence,
      ...pairOptions(correct, 12, rand),
      explanation: `${swapped ? "O próximo ponteiro curto parte da posição anterior do longo e vice-versa; troque as posições antes de aplicar os passos." : "Acompanhe cada ponteiro separadamente."} Passos do curto: ${describe(0)}. Passos do longo: ${describe(1)}. Cada posição vale 1/12 de volta. No próximo mostrador, curto aponta para ${correct[0] === 0 ? 12 : correct[0]} e longo para ${correct[1] === 0 ? 12 : correct[1]}. São posições geométricas, não um relógio marcando horas reais.`,
    };
  });
  return [...shuffle(domino, rand), ...shuffle(clocks, rand)];
}

export function makeMensaItems(mode: Mode, seed: number): MensaItem[] {
  if (mode === "desafio") return challengeItems(seed);
  if (mode === "complemento") return complementItems(seed);
  const rand = mulberry32(seed ^ 0x83af);
  const seen = new Set<string>();
  const take = (count: number, domain: string, generate: (seed: number) => Item[], predicate: (q: Item) => boolean = () => true): FigureItem[] => {
    const selected: FigureItem[] = [];
    for (let batch = 0; batch < 20 && selected.length < count; batch++) {
      for (const item of shuffle(generate(seed + batch * 104729).filter(predicate), rand)) {
        const q: FigureItem = { type: "figura", id: `${item.id}-m${batch}`, domain, item };
        const signature = stimulusKey(q);
        if (seen.has(signature)) continue;
        seen.add(signature); selected.push(q);
        if (selected.length === count) break;
      }
    }
    if (selected.length !== count) throw new Error(`Banco insuficiente: ${domain}`);
    return selected;
  };
  return [...take(7, "Matrizes", advancedMatrixItems, q => q.difficulty === "dificil"), ...take(5, "Matrizes", advancedMatrixItems, q => q.difficulty === "extrema"), ...take(6, "Séries", figureSeriesItems), ...take(6, "Classificação", classificationItems)];
}

export function remainingSeconds(deadline: number, now: number) { return Math.max(0, Math.ceil((deadline - now) / 1000)); }
export function summarize(items: MensaItem[], answers: (number | null)[]) {
  const correct = items.filter((q, i) => answers[i] === answerOf(q)).length;
  const omitted = items.filter((_, i) => answers[i] == null).length;
  return { correct, omitted, wrong: items.length - correct - omitted };
}

/** Identidade do estímulo visível; não depende de ID, gabarito ou ordem das opções. */
export function stimulusKey(q: MensaItem): string {
  if (q.type === "figura") return JSON.stringify([q.type, q.item.grid?.flat().slice(0, 8).map(visualKey), q.item.sequence?.map(visualKey), q.item.set?.map(visualKey).sort()]);
  return JSON.stringify([q.type, q.grid?.flat().slice(0, 8), q.sequence, q.type === "padrao" ? q.pairs?.map(p => p.join(",")).sort() : undefined]);
}
