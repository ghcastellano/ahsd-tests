// PRNG determinístico (mulberry32) + utilitários de embaralhamento.
// Determinismo importa: os itens precisam ser idênticos entre servidor e
// cliente (hidratação do Next) e reproduzíveis nos testes automatizados.

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pick<T>(arr: readonly T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

/**
 * Insere `correct` em uma lista de distratores e embaralha, devolvendo as
 * opções e o índice da resposta. `keyOf` deduplica: distratores idênticos à
 * resposta (ou entre si) são descartados antes do preenchimento.
 */
export function buildOptions<T>(
  correct: T,
  candidates: T[],
  keyOf: (v: T) => string,
  rand: () => number,
  total = 6,
): { options: T[]; answerIndex: number } {
  const seen = new Set([keyOf(correct)]);
  const distractors: T[] = [];
  for (const c of candidates) {
    const k = keyOf(c);
    if (seen.has(k)) continue;
    seen.add(k);
    distractors.push(c);
    if (distractors.length === total - 1) break;
  }
  const options = shuffle([correct, ...distractors], rand);
  return { options, answerIndex: options.findIndex((o) => keyOf(o) === keyOf(correct)) };
}
