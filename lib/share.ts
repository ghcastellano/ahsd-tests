import type { Severity } from "./types";
import type { RecordSubscale, ResultRecord } from "./history";
import { getInstrument } from "./instruments";

// Compartilhamento de resultados SEM servidor: o registro viaja codificado no
// fragmento (#) de um link — que nunca é enviado a servidores.
//
// Formato v2 (compacto). O v1 era JSON completo em base64 e gerava links de
// ~470 caracteres, feios de colar no WhatsApp. Três economias:
//   1. campos posicionais separados por "|", sem nomes de chave nem aspas;
//   2. data como segundos desde a época em base36 (7 caracteres, não 24);
//   3. nome e sigla do instrumento derivados do próprio id quando ele é
//      conhecido, e nomes de subescala trocados pelo índice na definição.
// Resultado típico: ~126 caracteres de link para um teste sem subescalas.
//
// O primeiro campo é um checksum: links longos são cortados por aplicativos de
// mensagem, e sem ele um corte no fim abriria um resultado com o nome do
// respondente truncado sem nenhum sinal de que faltava coisa.
//
// Decodificar é superfície de ataque (qualquer um pode forjar um link), então
// a validação continua estrita: tipos, limites de tamanho e reconstrução
// campo a campo. O v1 continua sendo aceito para não quebrar links já enviados.

const P1 = "v1.";
const P2 = "v2.";
const MAX_CODE_LENGTH = 20_000;
const SEVERITIES: Severity[] = ["info", "none", "low", "mild", "moderate", "high", "severe"];

// ---------------------------------------------------------------------------
// base64url (btoa/atob existem no navegador e no Node 18+; o polyfill de Buffer
// que o Next injeta no cliente não suporta "base64url" e quebraria em runtime)
// ---------------------------------------------------------------------------

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Campos com escape (o separador é "|", então ele e a barra invertida escapam)
// ---------------------------------------------------------------------------

// Três separadores em uso: "|" entre campos, ";" entre subescalas e "," dentro
// de cada subescala. Todos escapam, mais a própria barra invertida.
const ESCAPES: Array<[string, string]> = [
  ["\\", "\\\\"],
  ["|", "\\p"],
  [";", "\\s"],
  [",", "\\c"],
];

function esc(s: string): string {
  let out = "";
  for (const ch of s) {
    const par = ESCAPES.find(([bruto]) => bruto === ch);
    out += par ? par[1] : ch;
  }
  return out;
}

/**
 * Desfaz o escape em UMA passada. Dois `replace` encadeados estariam errados:
 * "Ana \pedro" vira "Ana \\pedro" ao escapar, e trocar "\p" antes de "\\"
 * devolveria "Ana \|edro".
 */
function unesc(s: string): string {
  let out = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) {
      const par = ESCAPES.find(([, escapado]) => escapado === s[i] + s[i + 1]);
      out += par ? par[0] : s[i + 1];
      i++;
    } else out += s[i];
  }
  return out;
}

function splitEscaped(s: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "\\" && i + 1 < s.length) {
      cur += s[i] + s[i + 1];
      i++;
    } else if (s[i] === sep) {
      out.push(cur);
      cur = "";
    } else cur += s[i];
  }
  out.push(cur);
  return out;
}

const num = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100));

/**
 * Checksum FNV-1a de 16 bits, em base36 (até 4 caracteres). Vai no PRIMEIRO
 * campo de propósito: aplicativos de mensagem cortam links longos, e um corte
 * no fim removeria só os campos opcionais — o resultado abriria com o nome do
 * respondente truncado e cara de completo. Com o checksum na frente, qualquer
 * corte invalida o código e a página mostra o aviso de link cortado.
 */
export function checksum(s: string): string {
  let h = 0x811c;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i) & 0xff;
    h = (h * 0x0101) & 0xffff;
  }
  return h.toString(36);
}

/** Índices das subescalas de um instrumento, por nome (para não trafegar nomes). */
function subscaleIndex(instrumentId: string): Map<string, number> | null {
  const inst = getInstrument(instrumentId);
  if (!inst?.subscales?.length) return null;
  return new Map(inst.subscales.map((s, i) => [s.name, i]));
}

function subscaleNames(instrumentId: string): string[] | null {
  const inst = getInstrument(instrumentId);
  return inst?.subscales?.map((s) => s.name) ?? null;
}

// ---------------------------------------------------------------------------
// Codificação
// ---------------------------------------------------------------------------

export function encodeRecord(record: ResultRecord): string {
  const inst = getInstrument(record.instrumentId);
  const ts = Math.floor(new Date(record.createdAt).getTime() / 1000);
  const idxByName = subscaleIndex(record.instrumentId);

  const subs = (record.subscales ?? [])
    .map((s) => {
      const i = idxByName?.get(s.name);
      const head = i === undefined ? esc(s.name) : String(i);
      // Três formas para `mean`, porque "ausente" e "igual a raw" são coisas
      // diferentes na exibição (média x/5 vs bruto x/max):
      //   3 campos            → mean ausente
      //   4º campo vazio      → mean === raw (economiza os dígitos)
      //   4º campo preenchido → mean próprio
      const tail =
        s.mean === undefined ? "" : s.mean === s.raw ? "," : `,${num(s.mean)}`;
      return `${head},${num(s.raw)},${num(s.max)}${tail}`;
    })
    .join(";");

  const campos = [
    esc(record.instrumentId),
    ts.toString(36),
    esc(record.id),
    num(record.totalScore),
    num(record.maxScore),
    esc(record.bandLabel),
    String(Math.max(0, SEVERITIES.indexOf(record.severity))),
    record.positive === undefined ? "0" : record.positive ? "1" : "2",
    record.metricIsMean === undefined ? "0" : record.metricIsMean ? "1" : "2",
    esc(record.respondent ?? ""),
    subs,
    // Sigla e nome só viajam quando o instrumento não é conhecido localmente
    // (registros de treino, por exemplo).
    inst ? "" : esc(record.acronym),
    inst ? "" : esc(record.instrumentName),
  ];

  // Remove campos vazios do fim — economia extra em resultados simples.
  while (campos.length > 0 && campos[campos.length - 1] === "") campos.pop();

  const corpo = campos.join("|");
  return P2 + toBase64Url(`${checksum(corpo)}|${corpo}`);
}

// ---------------------------------------------------------------------------
// Decodificação (v2 e v1)
// ---------------------------------------------------------------------------

function str(v: unknown, max: number): string | null {
  return typeof v === "string" && v.length > 0 && v.length <= max ? v : null;
}

/** Número já tipado (v1, que trafega JSON): string numérica NÃO é aceita. */
function numIn(v: unknown, min: number, max: number): number | null {
  return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max ? v : null;
}

/** Número vindo de texto (v2, que trafega campos posicionais). */
function numTxt(v: unknown, min: number, max: number): number | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  return numIn(Number(v), min, max);
}

function decodeV2(codigo: string): ResultRecord | null {
  // Primeiro campo é o checksum; o resto é o registro.
  const corte = codigo.indexOf("|");
  if (corte === -1) return null;
  const payload = codigo.slice(corte + 1);
  if (codigo.slice(0, corte) !== checksum(payload)) return null;

  const f = splitEscaped(payload, "|");
  if (f.length < 6) return null;

  const instrumentId = str(unesc(f[0]), 60);
  const tsSec = parseInt(f[1] ?? "", 36);
  const id = str(unesc(f[2] ?? ""), 64);
  const totalScore = numTxt(f[3], -1000, 1000);
  const maxScore = numTxt(f[4], 0, 1000);
  const bandLabel = str(unesc(f[5] ?? ""), 120);
  // Precisa ser índice inteiro: "3.5" indexaria fora da lista e devolveria um
  // registro com `severity` indefinida, que o banco recusa (coluna NOT NULL).
  const sevBruto = numTxt(f[6] ?? "0", 0, SEVERITIES.length - 1);
  const sevIdx = sevBruto !== null && Number.isInteger(sevBruto) ? sevBruto : null;

  if (
    !instrumentId || !id || !bandLabel ||
    !Number.isFinite(tsSec) || totalScore === null || maxScore === null || sevIdx === null
  ) {
    return null;
  }

  const inst = getInstrument(instrumentId);
  const acronym = inst?.acronym ?? str(unesc(f[11] ?? ""), 30);
  const instrumentName = inst?.name ?? str(unesc(f[12] ?? ""), 160);
  if (!acronym || !instrumentName) return null;

  const positiveCode = f[7] ?? "0";
  const respondent = str(unesc(f[9] ?? ""), 80) ?? undefined;

  let subscales: RecordSubscale[] | undefined;
  const subsRaw = f[10] ?? "";
  if (subsRaw.length > 0) {
    const names = subscaleNames(instrumentId);
    const parts = splitEscaped(subsRaw, ";");
    if (parts.length > 20) return null;
    subscales = [];
    for (const part of parts) {
      const c = splitEscaped(part, ",");
      if (c.length < 3 || c.length > 4) return null;
      const head = unesc(c[0]);
      const asIndex = /^\d+$/.test(c[0]) ? Number(c[0]) : null;
      const name =
        asIndex !== null && names && names[asIndex] !== undefined
          ? names[asIndex]
          : str(head, 160);
      const raw = numTxt(c[1], -1000, 1000);
      const max = numTxt(c[2], 0, 1000);
      // c[3] ausente = sem média; vazio = média igual ao bruto.
      const mean =
        c[3] === undefined ? undefined : c[3] === "" ? raw : numTxt(c[3], -1000, 1000);
      if (!name || raw === null || max === null || mean === null) return null;
      subscales.push({ name, raw, max, ...(mean !== undefined ? { mean } : {}) });
    }
  }

  return {
    id,
    createdAt: new Date(tsSec * 1000).toISOString(),
    instrumentId,
    acronym,
    instrumentName,
    ...(respondent ? { respondent } : {}),
    totalScore,
    maxScore,
    bandLabel,
    severity: SEVERITIES[sevIdx],
    ...(positiveCode === "1" ? { positive: true } : positiveCode === "2" ? { positive: false } : {}),
    ...(f[8] === "1" ? { metricIsMean: true } : f[8] === "2" ? { metricIsMean: false } : {}),
    ...(subscales ? { subscales } : {}),
  };
}

/** Formato antigo: JSON completo em base64. Mantido para links já enviados. */
function decodeV1(payload: string): ResultRecord | null {
  const json = fromBase64Url(payload);
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
  const totalScore = numIn(p.totalScore, -1000, 1000);
  const maxScore = numIn(p.maxScore, 0, 1000);
  const bandLabel = str(p.bandLabel, 120);
  const severity = SEVERITIES.includes(p.severity as Severity) ? (p.severity as Severity) : null;

  if (
    !id || !createdAt || !instrumentId || !acronym || !instrumentName ||
    totalScore === null || maxScore === null || !bandLabel || !severity ||
    Number.isNaN(new Date(createdAt).getTime())
  ) {
    return null;
  }

  let subscales: RecordSubscale[] | undefined;
  if (p.subscales !== undefined) {
    if (!Array.isArray(p.subscales) || p.subscales.length > 20) return null;
    subscales = [];
    for (const s of p.subscales as unknown[]) {
      if (typeof s !== "object" || s === null) return null;
      const o = s as Record<string, unknown>;
      const name = str(o.name, 160);
      const raw = numIn(o.raw, -1000, 1000);
      const max = numIn(o.max, 0, 1000);
      const mean = o.mean === undefined ? undefined : numIn(o.mean, -1000, 1000);
      if (!name || raw === null || max === null || mean === null) return null;
      subscales.push({ name, raw, max, ...(mean !== undefined ? { mean } : {}) });
    }
  }

  let respondent: string | undefined;
  if (p.respondent !== undefined) {
    const rr = str(p.respondent, 80);
    if (rr === null) return null;
    respondent = rr;
  }

  return {
    id, createdAt, instrumentId, acronym, instrumentName,
    ...(respondent ? { respondent } : {}),
    totalScore, maxScore, bandLabel, severity,
    ...(typeof p.positive === "boolean" ? { positive: p.positive } : {}),
    ...(typeof p.metricIsMean === "boolean" ? { metricIsMean: p.metricIsMean } : {}),
    ...(subscales ? { subscales } : {}),
  };
}

/** Decodifica e valida um código. Nunca lança; devolve null para lixo. */
export function decodeRecord(codeRaw: string): ResultRecord | null {
  const code = codeRaw.trim();
  if (code.length > MAX_CODE_LENGTH) return null;
  if (code.startsWith(P2)) {
    const payload = fromBase64Url(code.slice(P2.length));
    return payload === null ? null : decodeV2(payload);
  }
  if (code.startsWith(P1)) return decodeV1(code.slice(P1.length));
  return null;
}

/** Link para a página de resultado compartilhado. */
export function shareLink(origin: string, record: ResultRecord): string {
  return `${origin}/resultado#${encodeRecord(record)}`;
}

/**
 * Extrai o código de um fragmento de URL, aceitando `#v2.…` e o antigo
 * `#add=v1.…`. Fragmentos que não são código (âncoras comuns, o `#:~:text=`
 * que o Chrome anexa ao copiar um trecho) devolvem null — e não um "código
 * inválido", que faria o painel acusar erro sem motivo.
 */
export function codeFromHash(hash: string): string | null {
  const m = hash.match(/^#(?:add=)?(.+)$/);
  if (!m) return null;
  let bruto = m[1];
  try {
    bruto = decodeURIComponent(bruto);
  } catch {
    // Link cortado no meio de um escape "%XX": segue com o texto cru, que a
    // validação do checksum vai recusar de qualquer forma.
  }
  return bruto.startsWith(P1) || bruto.startsWith(P2) ? bruto : null;
}

/**
 * Normaliza um token colado: aceita o código puro ("v1."/"v2.…") ou um link
 * completo. Devolve null para palavras soltas de uma mensagem colada junto.
 */
export function extractCode(token: string): string | null {
  if (token.startsWith(P1) || token.startsWith(P2)) return token;
  const hashAt = token.indexOf("#");
  return hashAt === -1 ? null : codeFromHash(token.slice(hashAt));
}
