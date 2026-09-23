import { advancedMatrixItems } from "../battery/advanced-matrices";
import { figureSeriesItems } from "../battery/figure-series";
import { classificationItems } from "../battery/classification";
import { buildOptions, mulberry32, shuffle } from "../battery/rng";
import type { Item } from "../battery/types";

export const VERSION = "mensa-br-1";
export type Mode = "principal" | "complemento";
export const PROTOCOLS = {
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
export type MensaItem = FigureItem | PairItem;
export const answerOf = (q: MensaItem) => q.type === "figura" ? q.item.answerIndex : q.answerIndex;
export const explanationOf = (q: MensaItem) => q.type === "figura" ? q.item.explanation : q.explanation;
const mod = (n: number, m: number) => ((n % m) + m) % m;
const key = (p: Pair) => p.join(",");

/** Exercícios novos de formato, não itens ou réplicas de D48/D70/Clocks. */
export function complementItems(seed: number): PairItem[] {
  const rand = mulberry32(seed ^ 0x713ac);
  const number = (max: number) => Math.floor(rand() * max);
  const domino = Array.from({ length: 6 }, (_, n): PairItem => {
    const subtractTop = n % 2 === 1;
    const subtractBottom = n >= 3;
    const grid: Pair[][] = Array.from({ length: 3 }, () => {
      const a: Pair = [number(7), number(7)];
      const b: Pair = [1 + number(6), 1 + number(6)];
      return [a, b, [mod(a[0] + (subtractTop ? -b[0] : b[0]), 7), mod(a[1] + (subtractBottom ? -b[1] : b[1]), 7)]];
    });
    const correct = grid[2][2];
    // Distratores incluem respostas que respeitam só uma metade.
    const offsets = shuffle([1, 2, 3, 4, 5, 6], rand);
    const candidates: Pair[] = [
      [correct[0], mod(correct[1] + offsets[0], 7)],
      [correct[0], mod(correct[1] + offsets[1], 7)],
      [mod(correct[0] + offsets[2], 7), correct[1]],
      [mod(correct[0] + offsets[3], 7), correct[1]],
      [mod(correct[0] + offsets[4], 7), mod(correct[1] + offsets[5], 7)],
    ];
    return {
      type: "domino", id: `domino-${seed}-${n}`, domain: "Dominós", grid,
      ...buildOptions(correct, shuffle(candidates, rand), key, rand),
      explanation: `Em cada linha, a terceira peça usa a primeira ${subtractTop ? "menos" : "mais"} a segunda na metade superior, e a primeira ${subtractBottom ? "menos" : "mais"} a segunda na inferior. A contagem é cíclica de 0 a 6 (depois de 6 vem 0; antes de 0 vem 6). Na última linha: ${grid[2][0][0]} ${subtractTop ? "−" : "+"} ${grid[2][1][0]} → ${correct[0]}; ${grid[2][0][1]} ${subtractBottom ? "−" : "+"} ${grid[2][1][1]} → ${correct[1]}.`,
    };
  });
  const clocks = Array.from({ length: 6 }, (_, n): PairItem => {
    const initial: Pair = [number(12), number(12)];
    const step: Pair = [1 + number(5), -(1 + number(5))];
    const acceleration: Pair = [n % 3 === 0 ? 0 : 1, n % 3 === 2 ? -1 : 0];
    const sequence: Pair[] = [initial];
    for (let k = 0; k < 5; k++) sequence.push(sequence[k].map((v, j) => mod(v + step[j] + k * acceleration[j], 12)) as Pair);
    const correct = sequence.pop()!;
    const candidates: Pair[] = [
      [mod(correct[0] - acceleration[0], 12), mod(correct[1] - acceleration[1], 12)],
      [sequence[4][0], correct[1]], [correct[0], sequence[4][1]],
      ...Array.from({ length: 11 }, (_, i): Pair => [mod(correct[0] + i + 1, 12), correct[1]]),
      ...Array.from({ length: 11 }, (_, i): Pair => [correct[0], mod(correct[1] + i + 1, 12)]),
    ];
    const describe = (j: number) => Array.from({ length: 5 }, (_, k) => step[j] + k * acceleration[j]).map(v => `${Math.abs(v)} ${v >= 0 ? "horário" : "anti-horário"}`).join("; ");
    return { type: "mostrador", id: `mostrador-${seed}-${n}`, domain: "Mostradores", sequence,
      ...buildOptions(correct, candidates, key, rand),
      explanation: `Acompanhe cada ponteiro separadamente. Passos do curto: ${describe(0)}. Passos do longo: ${describe(1)}. Cada posição vale 1/12 de volta. No próximo mostrador, curto aponta para ${correct[0] === 0 ? 12 : correct[0]} e longo para ${correct[1] === 0 ? 12 : correct[1]}. São ponteiros independentes, não um relógio marcando horas reais.`,
    };
  });
  return [...shuffle(domino, rand), ...shuffle(clocks, rand)];
}

export function makeMensaItems(mode: Mode, seed: number): MensaItem[] {
  if (mode === "complemento") return complementItems(seed);
  const rand = mulberry32(seed ^ 0x83af);
  const matrices = advancedMatrixItems(seed);
  const selected = [...shuffle(matrices.filter(q => q.difficulty === "dificil"), rand).slice(0, 7), ...shuffle(matrices.filter(q => q.difficulty === "extrema"), rand)];
  const figure = (items: Item[], domain: string): FigureItem[] => items.map(item => ({ type: "figura", id: item.id, domain, item }));
  return [...figure(selected, "Matrizes"), ...figure(shuffle(figureSeriesItems(seed), rand).slice(0, 6), "Séries"), ...figure(shuffle(classificationItems(seed), rand).slice(0, 6), "Classificação")];
}

export function remainingSeconds(deadline: number, now: number) { return Math.max(0, Math.ceil((deadline - now) / 1000)); }
export function summarize(items: MensaItem[], answers: (number | null)[]) {
  const correct = items.filter((q, i) => answers[i] === answerOf(q)).length;
  const omitted = items.filter((_, i) => answers[i] == null).length;
  return { correct, omitted, wrong: items.length - correct - omitted };
}
