import type { DetalheItem, RecordSubscale, ResultRecord } from "../history";
import type { Visita, VisitaRegistro } from "../visitas";
import type { Severity } from "../types";

// Conversão entre os registros do site (camelCase) e as linhas das tabelas
// (snake_case), compartilhada pelos dois backends. Também valida o que chega
// pela rede e aplica os mesmos limites das restrições CHECK de
// supabase/setup.sql, para nunca estourar uma restrição por tamanho.

/** Limites das colunas (iguais aos CHECKs do schema). */
export const LIMITES = {
  client_id: 64,
  instrument_id: 60,
  acronym: 30,
  instrument_name: 160,
  respondent: 80,
  band_label: 120,
  severity: 20,
  /** bytes do jsonb (pg_column_size) */
  subscales: 16384,
  detalhes: 262144,
  pontuacao: 1000,
  duracao: 86400,
  ip: 45,
  pais: 8,
  regiao: 80,
  cidade: 120,
  caminho: 200,
  referer: 300,
  user_agent: 300,
  idioma: 40,
} as const;

/** Linha da tabela `resultados` pronta para inserir (sem id/created_at). */
export interface LinhaResultado {
  client_id: string;
  instrument_id: string;
  acronym: string;
  instrument_name: string;
  respondent: string | null;
  total_score: number;
  max_score: number;
  band_label: string;
  severity: string;
  positive: boolean | null;
  metric_is_mean: boolean;
  subscales: RecordSubscale[] | null;
  duracao_segundos: number | null;
  detalhes: DetalheItem[] | null;
}

/** Linha de `resultados` como volta do banco (Supabase REST ou SQL). */
export interface LinhaResultadoBruta {
  client_id?: string | null;
  id?: string;
  created_at: unknown;
  instrument_id: string;
  acronym: string;
  instrument_name: string;
  respondent?: string | null;
  total_score: unknown;
  max_score: unknown;
  band_label: string;
  severity: string;
  positive?: boolean | null;
  metric_is_mean?: boolean | null;
  subscales?: RecordSubscale[] | null;
  notes?: string[] | null;
  duracao_segundos?: number | null;
  detalhes?: DetalheItem[] | null;
}

export interface LinhaVisita {
  ip: string | null;
  pais: string | null;
  regiao: string | null;
  cidade: string | null;
  caminho: string | null;
  referer: string | null;
  user_agent: string | null;
  idioma: string | null;
}

export interface LinhaVisitaBruta extends Partial<LinhaVisita> {
  id: unknown;
  created_at: unknown;
}

/** Corta pelo número de caracteres (code points), como char_length do Postgres. */
export function cortar(v: string, max: number): string {
  const pontos = Array.from(v);
  return pontos.length > max ? pontos.slice(0, max).join("") : v;
}

function cortarOuNulo(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? cortar(t, max) : null;
}

/** Limita um número a [min, max]; NaN/Infinity viram min. */
export function faixa(v: unknown, min: number, max: number): number {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

/** Mantém o JSON só se couber na coluna (com folga: o jsonb ocupa mais que o texto). */
function jsonCabendo<T>(v: T | null | undefined, maxBytes: number): T | null {
  if (v === null || v === undefined) return null;
  const bytes = new TextEncoder().encode(JSON.stringify(v)).length;
  return bytes <= maxBytes * 0.6 ? v : null;
}

/** Data em ISO 8601 a partir do que o driver devolver (Date ou texto). */
export function paraIso(v: unknown): string {
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? "" : v.toISOString();
  if (typeof v !== "string") return v === null || v === undefined ? "" : String(v);
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toISOString();
}

/** Monta a linha de `resultados` a partir do registro, dentro dos limites do schema. */
export function linhaDoResultado(r: ResultRecord): LinhaResultado {
  const duracao =
    r.durationSeconds === undefined || r.durationSeconds === null
      ? null
      : Math.round(faixa(r.durationSeconds, 0, LIMITES.duracao));
  return {
    client_id: cortar(r.id, LIMITES.client_id),
    instrument_id: cortar(r.instrumentId, LIMITES.instrument_id),
    acronym: cortar(r.acronym, LIMITES.acronym),
    instrument_name: cortar(r.instrumentName, LIMITES.instrument_name),
    respondent: cortarOuNulo(r.respondent, LIMITES.respondent),
    total_score: faixa(r.totalScore, -LIMITES.pontuacao, LIMITES.pontuacao),
    max_score: faixa(r.maxScore, 0, LIMITES.pontuacao),
    band_label: cortar(r.bandLabel, LIMITES.band_label),
    severity: cortar(r.severity, LIMITES.severity),
    positive: typeof r.positive === "boolean" ? r.positive : null,
    metric_is_mean: r.metricIsMean === true,
    subscales: jsonCabendo(r.subscales, LIMITES.subscales),
    duracao_segundos: duracao,
    detalhes: jsonCabendo(r.detalhes, LIMITES.detalhes),
  };
}

/** Aviso devolvido quando a revisão item a item ficou de fora por tamanho (igual nos dois backends). */
export const MOTIVO_SEM_DETALHES = "gravado sem a revisão item a item: ela passou do tamanho que o banco aceita";

/** O registro tinha revisão item a item, mas a linha saiu sem ela (passou do limite da coluna)? */
export function detalhesCortados(r: ResultRecord, linha: LinhaResultado): boolean {
  return Array.isArray(r.detalhes) && r.detalhes.length > 0 && linha.detalhes === null;
}

/** Linha do banco -> registro do site (mesmo mapeamento que o painel sempre usou). */
export function resultadoDaLinha(l: LinhaResultadoBruta): ResultRecord {
  return {
    id: l.client_id ?? l.id ?? "",
    createdAt: paraIso(l.created_at),
    instrumentId: l.instrument_id,
    acronym: l.acronym,
    instrumentName: l.instrument_name,
    respondent: l.respondent ?? undefined,
    totalScore: Number(l.total_score),
    maxScore: Number(l.max_score),
    bandLabel: l.band_label,
    severity: l.severity as Severity,
    positive: l.positive ?? undefined,
    metricIsMean: l.metric_is_mean ?? undefined,
    subscales: l.subscales ?? undefined,
    notes: l.notes ?? undefined,
    durationSeconds: l.duracao_segundos ?? undefined,
    detalhes: l.detalhes ?? undefined,
  };
}

export function linhaDaVisita(v: Visita): LinhaVisita {
  return {
    ip: cortarOuNulo(v.ip, LIMITES.ip),
    pais: cortarOuNulo(v.pais, LIMITES.pais),
    regiao: cortarOuNulo(v.regiao, LIMITES.regiao),
    cidade: cortarOuNulo(v.cidade, LIMITES.cidade),
    caminho: cortarOuNulo(v.caminho, LIMITES.caminho),
    referer: cortarOuNulo(v.referer, LIMITES.referer),
    user_agent: cortarOuNulo(v.userAgent, LIMITES.user_agent),
    idioma: cortarOuNulo(v.idioma, LIMITES.idioma),
  };
}

export function visitaDaLinha(l: LinhaVisitaBruta): VisitaRegistro {
  return {
    id: String(l.id ?? ""),
    createdAt: paraIso(l.created_at),
    ip: l.ip ?? null,
    pais: l.pais ?? null,
    regiao: l.regiao ?? null,
    cidade: l.cidade ?? null,
    caminho: l.caminho ?? null,
    referer: l.referer ?? null,
    userAgent: l.user_agent ?? null,
    idioma: l.idioma ?? null,
  };
}

const SEVERIDADES: Severity[] = ["info", "none", "low", "mild", "moderate", "high", "severe"];

function textoObrigatorio(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

/**
 * Valida um registro vindo da rede (corpo de /api/resultados ou linha de
 * importação): campos obrigatórios com os tipos certos e só os campos
 * conhecidos passam adiante. Devolve null quando inválido.
 */
export function validarRegistro(x: unknown): ResultRecord | null {
  if (!x || typeof x !== "object" || Array.isArray(x)) return null;
  const o = x as Record<string, unknown>;
  const id = textoObrigatorio(o.id);
  const createdAt = textoObrigatorio(o.createdAt);
  const instrumentId = textoObrigatorio(o.instrumentId);
  const acronym = textoObrigatorio(o.acronym);
  const instrumentName = textoObrigatorio(o.instrumentName);
  const bandLabel = textoObrigatorio(o.bandLabel);
  const severity = textoObrigatorio(o.severity);
  if (!id || !createdAt || !instrumentId || !acronym || !instrumentName || !bandLabel || !severity) return null;
  if (typeof o.totalScore !== "number" || !Number.isFinite(o.totalScore)) return null;
  if (typeof o.maxScore !== "number" || !Number.isFinite(o.maxScore)) return null;
  if (o.respondent !== undefined && o.respondent !== null && typeof o.respondent !== "string") return null;
  if (o.positive !== undefined && o.positive !== null && typeof o.positive !== "boolean") return null;
  if (o.subscales !== undefined && o.subscales !== null && !Array.isArray(o.subscales)) return null;
  if (o.detalhes !== undefined && o.detalhes !== null && !Array.isArray(o.detalhes)) return null;
  if (o.notes !== undefined && o.notes !== null && !Array.isArray(o.notes)) return null;
  if (o.durationSeconds !== undefined && o.durationSeconds !== null && typeof o.durationSeconds !== "number") return null;
  return {
    id,
    createdAt,
    instrumentId,
    acronym,
    instrumentName,
    respondent: typeof o.respondent === "string" ? o.respondent : undefined,
    totalScore: o.totalScore,
    maxScore: o.maxScore,
    bandLabel,
    severity: (SEVERIDADES as string[]).includes(severity) ? (severity as Severity) : "info",
    positive: typeof o.positive === "boolean" ? o.positive : undefined,
    metricIsMean: o.metricIsMean === true ? true : undefined,
    subscales: Array.isArray(o.subscales) ? (o.subscales as RecordSubscale[]) : undefined,
    notes: Array.isArray(o.notes) ? (o.notes as string[]) : undefined,
    durationSeconds: typeof o.durationSeconds === "number" ? o.durationSeconds : undefined,
    detalhes: Array.isArray(o.detalhes) ? (o.detalhes as DetalheItem[]) : undefined,
  };
}

/**
 * Resultado de uma exportação, em qualquer dos dois formatos: linha do banco
 * (snake_case, como /api/exportar devolvia com o Supabase) ou registro do site
 * (camelCase, como devolve hoje). Devolve null quando não dá para entender.
 */
export function resultadoImportado(x: unknown): ResultRecord | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if ("instrument_id" in o) return validarRegistro(resultadoDaLinha(o as unknown as LinhaResultadoBruta));
  return validarRegistro(o);
}

/** Visita de uma exportação (snake_case ou camelCase), com a data original. */
export function visitaImportada(x: unknown): { createdAt: string; visita: Visita } | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const texto = (k: string): string | null => (typeof o[k] === "string" ? (o[k] as string) : null);
  const createdAt = paraIso(o.created_at ?? o.createdAt);
  if (!createdAt || Number.isNaN(Date.parse(createdAt))) return null;
  return {
    createdAt,
    visita: {
      ip: texto("ip"),
      pais: texto("pais"),
      regiao: texto("regiao"),
      cidade: texto("cidade"),
      caminho: texto("caminho"),
      referer: texto("referer"),
      userAgent: texto("user_agent") ?? texto("userAgent"),
      idioma: texto("idioma"),
    },
  };
}
