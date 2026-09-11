import type {
  InterpretationBand,
  Question,
  QuestionOption,
  Responses,
  SubscaleResult,
} from "./types";

/**
 * Reverse a Likert value within the [min,max] range of its option set.
 * e.g. on a 0..3 scale, value 0 -> 3, 1 -> 2. On 1..5, 1 -> 5, 2 -> 4.
 */
export function reverseValue(value: number, min: number, max: number): number {
  return min + max - value;
}

export function optionRange(options: QuestionOption[]): { min: number; max: number } {
  const vals = options.map((o) => o.value);
  return { min: Math.min(...vals), max: Math.max(...vals) };
}

/** Resolve the option set applicable to a question. */
export function optionsFor(q: Question, defaults: QuestionOption[]): QuestionOption[] {
  return q.options ?? defaults;
}

/**
 * Sum a set of questions' answered values, applying reverse-scoring where flagged.
 * Missing answers are treated as 0 contribution (callers should validate completeness).
 */
export function sumScore(
  questions: Question[],
  responses: Responses,
  defaults: QuestionOption[],
): number {
  let total = 0;
  for (const q of questions) {
    const v = responses[q.id];
    if (v === undefined || Number.isNaN(v)) continue;
    if (q.reverse) {
      const { min, max } = optionRange(optionsFor(q, defaults));
      total += reverseValue(v, min, max);
    } else {
      total += v;
    }
  }
  return total;
}

/** Maximum attainable score for a set of questions (respecting per-question options). */
export function maxScore(questions: Question[], defaults: QuestionOption[]): number {
  let total = 0;
  for (const q of questions) {
    // Reverse-scoring only flips orientation; the top contribution is still `max`.
    const { max } = optionRange(optionsFor(q, defaults));
    total += max;
  }
  return total;
}

/** Find the interpretation band containing `value` (inclusive bounds). */
export function bandFor(value: number, bands: InterpretationBand[]): InterpretationBand {
  const found = bands.find((b) => value >= b.min && value <= b.max);
  if (found) return found;
  // Fora de todas as faixas (valor abaixo da primeira, buraco decimal): a
  // faixa MAIS PRÓXIMA. Devolver a última, como antes, fazia um total 0 da
  // BIS-11 virar "Impulsividade alta".
  let melhor = bands[0];
  let dist = Number.POSITIVE_INFINITY;
  for (const b of bands) {
    const d = value < b.min ? b.min - value : value > b.max ? value - b.max : 0;
    if (d < dist) {
      dist = d;
      melhor = b;
    }
  }
  return melhor;
}

/** Whether every question in the list has a recorded answer. */
export function isComplete(questions: Question[], responses: Responses): boolean {
  return questions.every((q) => responses[q.id] !== undefined);
}

export function countAnswered(questions: Question[], responses: Responses): number {
  return questions.filter((q) => responses[q.id] !== undefined).length;
}

/**
 * Compute per-subscale raw sums and means for instruments organised by subscale.
 */
export function scoreSubscales(
  questions: Question[],
  responses: Responses,
  defaults: QuestionOption[],
  subscales: { key: string; name: string; description?: string }[],
): SubscaleResult[] {
  return subscales.map((s) => {
    const items = questions.filter((q) => q.subscale === s.key);
    const raw = sumScore(items, responses, defaults);
    const max = maxScore(items, defaults);
    const mean = items.length ? raw / items.length : 0;
    return {
      key: s.key,
      name: s.name,
      description: s.description,
      raw,
      max,
      mean: Math.round(mean * 100) / 100,
    };
  });
}
