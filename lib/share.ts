import type { Severity } from "./types";
import type { ResultRecord } from "./history";

// Compartilhamento de resultados SEM servidor: o registro viaja codificado no
// fragmento (#) de um link — ex.: /painel-ahsd#add=v1.eyJ... — e é importado no
// painel do aparelho de quem abre. O fragmento nunca é enviado a servidores.
//
// Decodificação é superfície de ataque (qualquer um pode forjar um link), então
// a validação é estrita: whitelist de campos, tipos, limites de tamanho.

const PREFIX = "v1.";
const MAX_CODE_LENGTH = 20_000;
const SEVERITIES: Severity[] = ["info", "none", "low", "mild", "moderate", "high", "severe"];

// btoa/atob + TextEncoder existem no navegador e no Node 18+. Não usar Buffer
// aqui: o polyfill de Buffer que o Next injeta no cliente não suporta
// o encoding "base64url" e quebra em runtime.
function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodeRecord(record: ResultRecord): string {
  return PREFIX + toBase64Url(JSON.stringify(record));
}

function str(v: unknown, max: number): string | null {
  return typeof v === "string" && v.length > 0 && v.length <= max ? v : null;
}

function num(v: unknown, min: number, max: number): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : null;
}

/**
 * Decodifica e valida um código de compartilhamento.
 * Retorna null para qualquer coisa fora do formato — nunca lança.
 */
export function decodeRecord(codeRaw: string): ResultRecord | null {
  const code = codeRaw.trim();
  if (!code.startsWith(PREFIX) || code.length > MAX_CODE_LENGTH) return null;
  const json = fromBase64Url(code.slice(PREFIX.length));
  if (!json) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
  const p = parsed as Record<string, unknown>;

  const id = str(p.id, 64);
  const createdAt = str(p.createdAt, 40);
  const instrumentId = str(p.instrumentId, 60);
  const acronym = str(p.acronym, 30);
  const instrumentName = str(p.instrumentName, 160);
  const totalScore = num(p.totalScore, -1000, 1000);
  const maxScore = num(p.maxScore, 0, 1000);
  const bandLabel = str(p.bandLabel, 120);
  const severity = SEVERITIES.includes(p.severity as Severity) ? (p.severity as Severity) : null;

  if (
    !id || !createdAt || !instrumentId || !acronym || !instrumentName ||
    totalScore === null || maxScore === null || !bandLabel || !severity ||
    Number.isNaN(new Date(createdAt).getTime())
  ) {
    return null;
  }

  let subscales: ResultRecord["subscales"];
  if (p.subscales !== undefined) {
    if (!Array.isArray(p.subscales) || p.subscales.length > 20) return null;
    subscales = [];
    for (const s of p.subscales as unknown[]) {
      if (typeof s !== "object" || s === null) return null;
      const o = s as Record<string, unknown>;
      const name = str(o.name, 160);
      const raw = num(o.raw, -1000, 1000);
      const max = num(o.max, 0, 1000);
      const mean = o.mean === undefined ? undefined : num(o.mean, -1000, 1000);
      if (!name || raw === null || max === null || mean === null) return null;
      subscales.push({ name, raw, max, ...(mean !== undefined ? { mean } : {}) });
    }
  }

  let respondent: string | undefined;
  if (p.respondent !== undefined) {
    const r = str(p.respondent, 80);
    if (r === null) return null; // presente porém inválido -> rejeita tudo
    respondent = r;
  }

  // Objeto reconstruído campo a campo — descarta qualquer chave desconhecida.
  return {
    id,
    createdAt,
    instrumentId,
    acronym,
    instrumentName,
    ...(respondent ? { respondent } : {}),
    totalScore,
    maxScore,
    bandLabel,
    severity,
    ...(typeof p.positive === "boolean" ? { positive: p.positive } : {}),
    ...(typeof p.metricIsMean === "boolean" ? { metricIsMean: p.metricIsMean } : {}),
    ...(subscales ? { subscales } : {}),
  };
}

/** Monta o link de importação para o painel. */
export function shareLink(origin: string, record: ResultRecord): string {
  return `${origin}/painel-ahsd#add=${encodeRecord(record)}`;
}

/** Extrai o código de um fragmento de URL ("#add=..."), se houver. */
export function codeFromHash(hash: string): string | null {
  const m = hash.match(/^#add=(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}
