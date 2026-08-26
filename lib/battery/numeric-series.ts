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
];

export function numericSeriesItems(): Item[] {
  return SPECS.map((s, i) => {
    const rand = mulberry32(9000 + i * 71);
    const { options, answerIndex } = buildOptions(
      String(s.answer),
      s.distractors.map(String),
      (v) => v,
      rand,
    );
    return {
      id: `ns${String(i + 1).padStart(2, "0")}`,
      difficulty: s.difficulty,
      prompt: s.seq.join(", ") + ", ?",
      textOptions: options,
      answerIndex,
      explanation: s.why,
    };
  });
}
