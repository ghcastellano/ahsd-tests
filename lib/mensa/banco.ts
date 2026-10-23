import { visualKey } from "../battery/visual-key";
import { challengeItems, type PatternItem } from "./desafio";
import { advancedMatrixItems } from "../battery/advanced-matrices";
import { figureSeriesItems } from "../battery/figure-series";
import { classificationItems } from "../battery/classification";
import { buildOptions, mulberry32, shuffle } from "../battery/rng";
import type { Item } from "../battery/types";

export const VERSION = "mensa-br-3";
export type Mode = "principal" | "velocidade" | "brasil" | "desafio";
export const PROTOCOLS = {
  principal: {
    name: "Matrizes · referência Norway online",
    count: 35,
    seconds: 1500,
    description: "35 matrizes em 25 min, dificuldade crescente. É o modo-base: reproduz o regime público do desafio Mensa Norway que a própria Mensa Brasil indica como referência online, sem copiar itens oficiais.",
  },
  velocidade: {
    name: "Matrizes · velocidade Norway supervisionado",
    count: 45,
    seconds: 1200,
    description: "45 matrizes em 20 min. Treina o regime oficialmente descrito pela Mensa Norge para o teste supervisionado: reconhecimento rápido de padrões figurais, sem as composições extremas do banco antigo.",
  },
  brasil: {
    name: "Cobertura Mensa Brasil · famílias candidatas",
    count: 36,
    seconds: 2700,
    description: "16 Raven/APM-like + 8 G36/G38/R1-like + 4 TIG-NV-like + 4 dominós D48/D70-like + 4 itens exploratórios. Mistura autoral para cobertura, não previsão do teste sorteado.",
  },
  desafio: {
    name: "Overtraining · acima do alvo",
    count: 24,
    seconds: 2400,
    description: "Banco deliberadamente mais difícil, com composições de várias operações. Serve para overtraining e NÃO representa a dificuldade esperada da preparação principal.",
  },
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

function matrixBand(item: Item): 1 | 2 | 3 | 4 | 99 {
  if (item.kind === "logic-or" || item.kind === "logic-and") return 1;
  if (item.kind === "d3" || item.kind === "d2") return 2;
  if (item.kind === "logic-xor") return 3;
  if (item.kind === "dual") return 4;
  return 99; // exclui logicD2 e triad: ficam somente no overtraining.
}

// `seen` pode ser compartilhado entre famílias da mesma sessão: assim um estímulo
// nunca aparece duas vezes com rótulos diferentes (ex.: Raven/APM-like e G36-like).
function matrixSession(seed: number, count: number, speed: boolean, domain = "Raven/APM-like", seen = new Set<string>()): FigureItem[] {
  const rand = mulberry32(seed ^ (speed ? 0x41f3 : 0x83af));
  const buckets = new Map<number, FigureItem[]>([[1, []], [2, []], [3, []], [4, []]]);

  for (let batch = 0; batch < 18; batch++) {
    for (const item of advancedMatrixItems(seed + batch * 104729)) {
      const band = matrixBand(item);
      if (band === 99 || (speed && band === 4)) continue;
      const q: FigureItem = { type: "figura", id: `${item.id}-n${batch}`, domain, item };
      const signature = stimulusKey(q);
      if (seen.has(signature)) continue;
      seen.add(signature);
      buckets.get(band)!.push(q);
    }
  }

  for (const [band, xs] of buckets) buckets.set(band, shuffle(xs, rand));

  const quotas = speed
    ? [Math.ceil(count * 0.34), Math.ceil(count * 0.36), count - Math.ceil(count * 0.34) - Math.ceil(count * 0.36), 0]
    : [Math.ceil(count * 0.23), Math.ceil(count * 0.31), Math.ceil(count * 0.29), count - Math.ceil(count * 0.23) - Math.ceil(count * 0.31) - Math.ceil(count * 0.29)];

  const selected: FigureItem[] = [];
  [1, 2, 3, 4].forEach((band, i) => selected.push(...buckets.get(band)!.slice(0, quotas[i])));
  if (selected.length !== count) throw new Error(`Banco de matrizes insuficiente: ${selected.length}/${count}`);

  return selected.sort((a, b) => matrixBand(a.item) - matrixBand(b.item));
}

function matrixFamily(
  seed: number,
  count: number,
  domain: string,
  allowedKinds: string[],
  offset: number,
  seen = new Set<string>(),
): FigureItem[] {
  const rand = mulberry32(seed ^ offset);
  const pool: FigureItem[] = [];

  for (let batch = 0; batch < 24 && pool.length < count * 6; batch++) {
    for (const item of shuffle(advancedMatrixItems(seed + offset + batch * 104729), rand)) {
      if (!allowedKinds.includes(item.kind ?? "") || item.difficulty === "extrema") continue;
      const q: FigureItem = { type: "figura", id: `${item.id}-f${offset}-${batch}`, domain, item };
      const signature = stimulusKey(q);
      if (seen.has(signature)) continue;
      seen.add(signature);
      pool.push(q);
    }
  }

  const ordered = pool.sort((a, b) => matrixBand(a.item) - matrixBand(b.item));
  if (ordered.length < count) throw new Error(`Banco insuficiente: ${domain} ${ordered.length}/${count}`);
  return ordered.slice(0, count);
}

function mixedBrazilSession(seed: number): MensaItem[] {
  const rand = mulberry32(seed ^ 0x53b2);

  // Estas famílias são rótulos editoriais baseados apenas em descrições públicas
  // de formato/construto. Os itens são autorais e não reproduzem instrumentos
  // psicológicos restritos ou seus estímulos.
  const seen = new Set<string>(); // nenhum estímulo repetido entre as famílias
  const raven = matrixSession(seed + 101, 16, false, "Raven/APM-like", seen);
  const gSeries = matrixFamily(
    seed + 211,
    8,
    "G36/G38/R1-like",
    ["d3", "d2", "dual", "logic-or"],
    0x361,
    seen,
  );
  const tig = matrixFamily(
    seed + 307,
    4,
    "TIG-NV-like",
    ["logic-or", "logic-and", "d3", "dual"],
    0x71a,
    seen,
  );

  const dominoes = complementItems(seed + 401)
    .filter((q) => q.type === "domino")
    .slice(0, 4)
    .map((q, i): PairItem => ({
      ...q,
      id: `${q.id}-br-${i}`,
      domain: "D48/D70-like · dominós",
      explanation: `Formato autoral de dominós para familiarização com relações abstratas. ${q.explanation}`,
    }));

  // Séries e classificação também respeitam o conjunto compartilhado: o banco de
  // séries pode gerar dois itens visualmente idênticos para a mesma semente.
  const pickFigures = (pool: FigureItem["item"][], count: number, domain: string, tag: string): FigureItem[] => {
    const out: FigureItem[] = [];
    for (const item of shuffle(pool, rand)) {
      if (out.length >= count) break;
      const q: FigureItem = { type: "figura", id: `${item.id}-expl-${tag}-${out.length}`, domain, item };
      const signature = stimulusKey(q);
      if (seen.has(signature)) continue;
      seen.add(signature);
      out.push(q);
    }
    return out;
  };
  const series = pickFigures(figureSeriesItems(seed + 503), 2, "Exploratório · séries visuais", "ser");
  const classification = pickFigures(classificationItems(seed + 607), 2, "Exploratório · classificação", "class");

  return [...raven, ...gSeries, ...tig, ...dominoes, ...series, ...classification];
}

export function makeMensaItems(mode: Mode, seed: number): MensaItem[] {
  if (mode === "desafio") return challengeItems(seed);
  if (mode === "velocidade") return matrixSession(seed, PROTOCOLS.velocidade.count, true);
  if (mode === "brasil") return mixedBrazilSession(seed);
  return matrixSession(seed, PROTOCOLS.principal.count, false);
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
