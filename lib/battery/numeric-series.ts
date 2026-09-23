import type { Difficulty, Item } from "./types";
import { buildOptions, mulberry32 } from "./rng";

// Séries numéricas e de letras, escalonadas por tipo de regra.
//
// Itens autorados um a um (e não gerados ao acaso) de propósito: qualquer
// sequência finita admite infinitas continuações válidas, então cada item foi
// escrito para que a regra pretendida seja a MAIS SIMPLES consistente, e para
// que nenhum distrator seja alcançável por uma regra de complexidade igual ou
// menor. Os testes automatizados conferem essa segunda condição.

interface Spec {
  seq: (number | string)[];
  answer: number | string;
  distractors: (number | string)[];
  why: string;
  difficulty: Difficulty;
}

const SPECS: Spec[] = [
  // --- Tier 1: regra única de primeira ordem ---
  {
    seq: [3, 7, 11, 15, 19], answer: 23, distractors: [21, 22, 24, 25, 27],
    why: "Progressão aritmética: soma 4 a cada passo.", difficulty: "media",
  },
  {
    seq: [2, 6, 18, 54], answer: 162, distractors: [108, 152, 160, 216, 486],
    why: "Progressão geométrica: multiplica por 3 a cada passo.", difficulty: "media",
  },
  {
    seq: [1, 4, 9, 16, 25], answer: 36, distractors: [30, 32, 35, 42, 49],
    why: "Quadrados perfeitos: 1², 2², 3², 4², 5², 6².", difficulty: "media",
  },

  // --- Tier 2: regra com operando variável ---
  {
    seq: [2, 3, 5, 8, 12, 17], answer: 23, distractors: [20, 21, 22, 24, 26],
    why: "As diferenças crescem de um em um: +1, +2, +3, +4, +5, +6.", difficulty: "media",
  },
  {
    seq: [1, 2, 6, 24, 120], answer: 720, distractors: [240, 360, 480, 600, 840],
    why: "Fatorial: multiplica pelo próximo inteiro (×2, ×3, ×4, ×5, ×6).", difficulty: "dificil",
  },
  {
    seq: [10, 7, 14, 11, 22, 19], answer: 38, distractors: [26, 30, 33, 36, 40],
    why: "Operações alternadas: −3, depois ×2, repetidamente.", difficulty: "dificil",
  },

  // --- Tier 3: exige decomposição estrutural ---
  {
    seq: [3, 20, 6, 17, 12, 14, 24], answer: 11, distractors: [9, 10, 12, 13, 48],
    why: "Duas séries intercaladas: nas posições ímpares 3, 6, 12, 24 (dobra); nas pares 20, 17, 14, 11 (−3).", difficulty: "dificil",
  },
  {
    seq: [5, 1, 10, 3, 20, 5, 40], answer: 7, distractors: [6, 8, 9, 15, 80],
    why: "Duas séries intercaladas: 5, 10, 20, 40 (dobra) e 1, 3, 5, 7 (+2).", difficulty: "dificil",
  },
  {
    seq: [1, 3, 7, 13, 21, 31], answer: 43, distractors: [39, 41, 42, 45, 51],
    why: "Diferenças de segunda ordem: +2, +4, +6, +8, +10, +12.", difficulty: "dificil",
  },

  // --- Tier 4: recursivas e compostas ---
  {
    seq: [1, 1, 2, 3, 5, 8, 13], answer: 21, distractors: [16, 18, 20, 24, 26],
    why: "Cada termo é a soma dos dois anteriores (sequência de Fibonacci).", difficulty: "dificil",
  },
  {
    seq: [2, 3, 8, 19, 46], answer: 111, distractors: [92, 96, 105, 115, 138],
    why: "Recursão ponderada: cada termo é o dobro do anterior mais o que veio antes dele (2·46 + 19 = 111).", difficulty: "extrema",
  },
  {
    seq: [3, 7, 15, 31, 63], answer: 127, distractors: [95, 118, 126, 129, 189],
    why: "Cada termo é o dobro do anterior mais 1.", difficulty: "dificil",
  },
  {
    seq: [2, 3, 5, 7, 11, 13], answer: 17, distractors: [14, 15, 16, 19, 21],
    why: "Sequência dos números primos.", difficulty: "dificil",
  },

  // --- Tier 5: posicionais e baseadas em dígitos ---
  {
    seq: ["A", "C", "F", "J", "O"], answer: "U", distractors: ["P", "Q", "R", "S", "T"],
    why: "Saltos crescentes no alfabeto: +2, +3, +4, +5, +6 posições.", difficulty: "dificil",
  },
  {
    seq: ["B", "D", "H", "P"], answer: "F", distractors: ["R", "T", "V", "X", "Z"],
    why: "A posição no alfabeto dobra (2, 4, 8, 16, 32) e dá a volta em 26: 32 − 26 = 6 → F.", difficulty: "extrema",
  },
  {
    seq: [11, 22, 33, 44, 55], answer: 66, distractors: [56, 60, 65, 67, 77],
    why: "Múltiplos de 11 com dígitos repetidos.", difficulty: "media",
  },
  {
    seq: [1, 8, 27, 64], answer: 125, distractors: [100, 108, 120, 128, 216],
    why: "Cubos perfeitos: 1³, 2³, 3³, 4³, 5³.", difficulty: "dificil",
  },
  {
    seq: [4, 9, 16, 25, 36], answer: 49, distractors: [42, 45, 48, 50, 64],
    why: "Quadrados a partir de 2²: 2², 3², 4², 5², 6², 7².", difficulty: "media",
  },
  {
    seq: [100, 50, 52, 26, 28, 14], answer: 16, distractors: [7, 12, 15, 17, 28],
    why: "Operações alternadas: divide por 2, depois soma 2, repetidamente.", difficulty: "dificil",
  },
  {
    seq: [1, 2, 4, 7, 11, 16, 22], answer: 29, distractors: [26, 27, 28, 30, 33],
    why: "As diferenças formam a sequência natural: +1, +2, +3, +4, +5, +6, +7.", difficulty: "dificil",
  },
  // --- Banco adicional (mesmos critérios de autoria), para variar por tentativa ---
  { seq: [5, 8, 11, 14, 17], answer: 20, distractors: [18, 19, 21, 22, 23], why: "Progressão aritmética: soma 3 a cada passo.", difficulty: "media" },
  { seq: [3, 6, 12, 24, 48], answer: 96, distractors: [72, 84, 92, 100, 144], why: "Progressão geométrica: multiplica por 2 a cada passo.", difficulty: "media" },
  { seq: [2, 5, 10, 17, 26], answer: 37, distractors: [35, 36, 38, 40, 50], why: "Quadrados mais um: 1²+1, 2²+1, 3²+1, 4²+1, 5²+1, 6²+1.", difficulty: "media" },
  { seq: [7, 14, 21, 28, 35], answer: 42, distractors: [40, 41, 43, 45, 49], why: "Múltiplos de 7: soma 7 a cada passo.", difficulty: "media" },
  { seq: [1, 3, 6, 10, 15], answer: 21, distractors: [18, 19, 20, 22, 25], why: "Números triangulares: as diferenças crescem de um em um (+2, +3, +4, +5, +6).", difficulty: "media" },
  { seq: [64, 32, 16, 8, 4], answer: 2, distractors: [0, 1, 3, 5, 6], why: "Divide por 2 a cada passo.", difficulty: "media" },
  { seq: [2, 4, 8, 14, 22, 32], answer: 44, distractors: [40, 42, 43, 46, 48], why: "Diferenças de segunda ordem: +2, +4, +6, +8, +10, +12.", difficulty: "dificil" },
  { seq: [1, 4, 10, 22, 46], answer: 94, distractors: [70, 90, 92, 96, 100], why: "Cada termo é o dobro do anterior mais 2.", difficulty: "dificil" },
  { seq: [4, 5, 7, 11, 19, 35], answer: 67, distractors: [51, 59, 63, 69, 70], why: "As diferenças dobram: +1, +2, +4, +8, +16, +32.", difficulty: "dificil" },
  { seq: [2, 9, 4, 12, 6, 15, 8], answer: 18, distractors: [10, 12, 16, 17, 21], why: "Duas séries intercaladas: 2, 4, 6, 8 (+2) e 9, 12, 15, 18 (+3).", difficulty: "dificil" },
  { seq: [1, 10, 2, 20, 4, 40, 8], answer: 80, distractors: [16, 60, 70, 90, 160], why: "Duas séries intercaladas, ambas dobrando: 1, 2, 4, 8 e 10, 20, 40, 80.", difficulty: "dificil" },
  { seq: [3, 4, 7, 11, 18, 29], answer: 47, distractors: [40, 44, 46, 48, 58], why: "Cada termo é a soma dos dois anteriores (18 + 29 = 47).", difficulty: "dificil" },
  { seq: [5, 6, 8, 11, 15, 20], answer: 26, distractors: [24, 25, 27, 28, 30], why: "As diferenças crescem de um em um: +1, +2, +3, +4, +5, +6.", difficulty: "dificil" },
  { seq: [2, 6, 12, 20, 30], answer: 42, distractors: [36, 40, 41, 44, 48], why: "Produto de inteiros consecutivos: 1·2, 2·3, 3·4, 4·5, 5·6, 6·7.", difficulty: "dificil" },
  { seq: [1, 8, 9, 64, 25, 216], answer: 49, distractors: [36, 48, 50, 81, 512], why: "Duas séries intercaladas: quadrados dos ímpares (1, 9, 25, 49) e cubos (8, 64, 216).", difficulty: "dificil" },
  { seq: [9, 8, 16, 15, 30, 29], answer: 58, distractors: [28, 44, 56, 57, 60], why: "Operações alternadas: −1, depois ×2, repetidamente.", difficulty: "dificil" },
  { seq: [1, 4, 13, 40, 121], answer: 364, distractors: [242, 360, 363, 365, 484], why: "Cada termo é o triplo do anterior mais 1.", difficulty: "dificil" },
  { seq: ["Z", "X", "U", "Q"], answer: "L", distractors: ["K", "M", "N", "O", "P"], why: "Saltos decrescentes no alfabeto: −2, −3, −4, −5 posições (Z→X→U→Q→L).", difficulty: "dificil" },
  { seq: ["A", "B", "D", "G", "K", "P"], answer: "V", distractors: ["T", "U", "W", "X", "Y"], why: "Saltos crescentes: +1, +2, +3, +4, +5, +6 posições (P = 16 → V = 22).", difficulty: "extrema" },
  { seq: [1, 2, 6, 15, 31], answer: 56, distractors: [46, 50, 52, 57, 60], why: "As diferenças são os quadrados: +1, +4, +9, +16, +25.", difficulty: "extrema" },
  // --- Teto (extrema, auditoria 2026-09): recorrências de 3 termos, operando variável, intercalação heterogênea ---
  { seq: [1, 3, 10, 41, 206], answer: 1237, distractors: [1236, 1031, 1030, 824, 412], why: "Multiplica por um inteiro crescente e soma 1: ×2+1, ×3+1, ×4+1, ×5+1, ×6+1 (206·6 + 1 = 1237).", difficulty: "extrema" },
  { seq: [2, 1, 6, 2, 18, 6, 54, 24, 162], answer: 120, distractors: [486, 48, 72, 96, 30], why: "Duas séries intercaladas com regras diferentes: nas posições ímpares 2, 6, 18, 54, 162 (×3); nas pares 1, 2, 6, 24 (fatorial: ×2, ×3, ×4) → ×5 = 120.", difficulty: "extrema" },
  { seq: [1, 2, 2, 4, 8, 32], answer: 256, distractors: [64, 128, 40, 48, 512], why: "Fibonacci multiplicativo: cada termo é o PRODUTO dos dois anteriores (8 · 32 = 256).", difficulty: "extrema" },
  { seq: [7, 14, 19, 29, 40, 44, 52], answer: 59, distractors: [57, 60, 61, 62, 66], why: "Cada termo é o anterior mais a soma dos seus dígitos: 52 + (5 + 2) = 59. As diferenças não têm padrão — a regra está nos dígitos.", difficulty: "extrema" },
  { seq: [5, 10, 8, 16, 13, 26, 22, 44], answer: 39, distractors: [40, 41, 42, 48, 88], why: "Operações alternadas com operando crescente: ×2, −2, ×2, −3, ×2, −4, ×2, −5 (44 − 5 = 39).", difficulty: "extrema" },
  { seq: ["A", "Z", "C", "X", "F", "U", "J", "R"], answer: "O", distractors: ["M", "N", "P", "K", "Q"], why: "Duas séries de letras intercaladas: A, C, F, J avança +2, +3, +4, +5 (→ O); Z, X, U, R recua −2, −3, −4. O próximo termo pertence à primeira: J + 5 = O.", difficulty: "extrema" },
  { seq: [1, 1, 4, 3, 9, 4, 16, 7, 25], answer: 11, distractors: [36, 10, 12, 14, 18], why: "Duas séries intercaladas de tipos diferentes: quadrados (1, 4, 9, 16, 25) e uma recursão tipo Fibonacci (1, 3, 4, 7 → 4 + 7 = 11). O próximo termo é da segunda.", difficulty: "extrema" },
  { seq: [1, 1, 2, 4, 7, 13, 24], answer: 44, distractors: [37, 48, 40, 42, 46], why: "Cada termo é a soma dos TRÊS anteriores (7 + 13 + 24 = 44). O distrator 37 é a soma de dois (Fibonacci).", difficulty: "extrema" },
];

/** Quantos itens de cada dificuldade entram numa tentativa (a distribuição original de 20). */
export const POR_DIFICULDADE: Record<Difficulty, number> = { media: 5, dificil: 12, extrema: 3 };

/**
 * 20 itens por tentativa, amostrados do banco de 40 por dificuldade, com a
 * semente. Mesma distribuição de dificuldade sempre; itens diferentes a cada
 * semente, agrupados média → difícil → extrema (ordem do banco dentro do grupo).
 */
export function numericSeriesItems(seed = 0): Item[] {
  const rand = mulberry32(9000 + (seed >>> 0) * 1_000_003);
  const escolhidos = new Set<number>();
  for (const dif of Object.keys(POR_DIFICULDADE) as Difficulty[]) {
    const idx = SPECS.map((s, i) => (s.difficulty === dif ? i : -1)).filter((i) => i >= 0);
    for (let k = idx.length - 1; k > 0; k--) { const j = Math.floor(rand() * (k + 1)); [idx[k], idx[j]] = [idx[j], idx[k]]; }
    idx.slice(0, POR_DIFICULDADE[dif]).forEach((i) => escolhidos.add(i));
  }
  const ordem: Record<Difficulty, number> = { media: 0, dificil: 1, extrema: 2 };
  return SPECS.map((s, i) => ({ s, i }))
    .filter(({ i }) => escolhidos.has(i))
    .sort((a, b) => ordem[a.s.difficulty] - ordem[b.s.difficulty] || a.i - b.i)
    .map(({ s, i }, n) => {
    const r = mulberry32(9000 + i * 71 + (seed >>> 0) * 7919);
    const { options, answerIndex } = buildOptions(String(s.answer), s.distractors.map(String), (v) => v, r);
    return {
      id: `ns${String(n + 1).padStart(2, "0")}`,
      difficulty: s.difficulty,
      prompt: s.seq.join(", ") + ", ?",
      textOptions: options,
      answerIndex,
      explanation: s.why,
    };
  });
}
