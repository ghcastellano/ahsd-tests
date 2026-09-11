import { getInstrument } from "./instruments";

// Formata o valor de uma subescala para exibição. O máximo por item NÃO é
// sempre 5: a BIS-11 vai de 1 a 4 e o SWAN de -3 a +3. Como o registro guarda
// apenas soma/máximo/média, o máximo por item é derivado do instrumento
// (máximo da subescala ÷ número de itens) quando ele é conhecido.

export interface SubscaleLike {
  name: string;
  raw: number;
  max: number;
  mean?: number;
}

/** Formatação numérica única do site: inteiro sem casas, decimal com até 2 casas, vírgula. */
export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "").replace(".", ",");
}

/** Máximo por item da subescala, ou null quando não dá para derivar. */
export function perItemMax(instrumentId: string, s: SubscaleLike): number | null {
  const inst = getInstrument(instrumentId);
  const sub = inst?.subscales?.find((x) => x.name === s.name);
  if (!inst || !sub) return null;
  const n = inst.questions.filter((q) => q.subscale === sub.key).length;
  return n > 0 ? Math.round((s.max / n) * 100) / 100 : null;
}

/** "média 3,2/5" quando a leitura é por média; "18/32" quando é por soma. */
export function formatSubscaleValue(instrumentId: string, s: SubscaleLike): string {
  if (s.mean === undefined) return `${fmt(s.raw)}/${fmt(s.max)}`;
  const topo = perItemMax(instrumentId, s);
  return topo === null ? `média ${fmt(s.mean)}` : `média ${fmt(s.mean)}/${fmt(topo)}`;
}

/** Fração 0–1 para a barra, coerente com o rótulo. */
export function subscaleFraction(instrumentId: string, s: SubscaleLike): number {
  if (s.mean === undefined) return s.max > 0 ? s.raw / s.max : 0;
  const topo = perItemMax(instrumentId, s);
  if (topo === null) return s.max > 0 ? s.raw / s.max : 0;
  // Escalas com mínimo negativo (SWAN): desloca para 0..1 assumindo simetria.
  const inst = getInstrument(instrumentId);
  const sub = inst?.subscales?.find((x) => x.name === s.name);
  const opts = inst?.questions.find((q) => q.subscale === sub?.key)?.options ?? inst?.defaultOptions ?? [];
  const minOpt = opts.length ? Math.min(...opts.map((o) => o.value)) : 0;
  if (minOpt < 0) return (s.mean - minOpt) / (topo - minOpt);
  return s.mean / topo;
}
