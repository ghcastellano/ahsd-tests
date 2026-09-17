import type { Cell, Mark } from "./types";

// Chave VISUAL de uma célula: duas células com a mesma chave se desenham
// iguais no CellSvg. Serve para os geradores não oferecerem duas alternativas
// idênticas ao olho (ex.: um círculo "girado 45°" é o mesmo círculo; uma barra
// "preenchida" é a mesma barra, porque linhas não têm preenchimento).

/** Período de simetria rotacional (graus) de cada marca, como desenhada. */
const PERIODO: Record<Mark, number> = {
  circle: 1,
  dot: 1,
  square: 90,
  diamond: 90,
  cross: 90,
  star: 72,
  triangle: 360, // isósceles: só volta a si mesmo com 360°
  hbar: 180,
  vbar: 180,
  slash: 180,
  backslash: 180,
};

/** Marcas que desenham o preenchimento interno; as demais são linhas ou ponto sólido. */
const USA_FILL = new Set<Mark>(["circle", "square", "triangle", "diamond", "star", "cross"]);

export function rotacaoEfetiva(marks: Mark[], rotation: number | undefined): number {
  const r = (((rotation ?? 0) % 360) + 360) % 360;
  if (r === 0 || marks.length === 0) return 0;
  // Se TODAS as marcas voltam a si mesmas com esse giro, ele é invisível.
  return marks.every((m) => r % PERIODO[m] === 0) ? 0 : r;
}

/** hbar girada 90° É a vbar (e vice-versa); slash 90° é backslash. */
const GIRO_90: Partial<Record<Mark, Mark>> = { hbar: "vbar", vbar: "hbar", slash: "backslash", backslash: "slash" };

export function visualKey(c: Cell): string {
  const r0 = (((c.rotation ?? 0) % 360) + 360) % 360;
  const marksBrutas = [...c.marks];
  // Linhas: um giro de 90°/270° equivale a trocar a marca; 180°, à própria marca.
  const trocaLinhas = r0 % 180 === 90 && marksBrutas.every((m) => GIRO_90[m]);
  const marks = (trocaLinhas ? marksBrutas.map((m) => GIRO_90[m]!) : marksBrutas).sort();
  const rotacao = trocaLinhas ? 0 : c.rotation;
  const usaFill = marks.some((m) => USA_FILL.has(m));
  return JSON.stringify({
    m: marks,
    o: c.outer ?? "",
    of: c.outer && USA_FILL.has(c.outer) ? c.outerFill ?? "none" : "",
    i: usaFill ? c.innerFill ?? "none" : "",
    r: rotacaoEfetiva(marks, rotacao),
    s: c.size ?? 2,
    // O CellSvg desenha no máximo 4 posições: 5 elementos aparecem como 4.
    n: Math.min(4, Math.max(1, c.count ?? 1)),
  });
}
