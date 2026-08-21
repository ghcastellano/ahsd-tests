import type { Instrument, InstrumentResult, Severity } from "./types";
import { SUPABASE_KEY, SUPABASE_URL, remoteEnabled } from "./remote-config";

// Registro de resultado gravado no histórico (local e, quando ativo, central).
// Por privacidade, NÃO armazenamos as respostas individuais — apenas o
// resultado agregado (pontuações, faixas e subescalas).

export interface RecordSubscale {
  name: string;
  raw: number;
  max: number;
  mean?: number;
}

export interface ResultRecord {
  id: string;
  createdAt: string; // ISO 8601
  instrumentId: string;
  acronym: string;
  instrumentName: string;
  respondent?: string;
  totalScore: number;
  maxScore: number;
  bandLabel: string;
  severity: Severity;
  positive?: boolean;
  metricIsMean?: boolean;
  subscales?: RecordSubscale[];
  notes?: string[];
}

const STORAGE_KEY = "ahsd:historico:v1";
const MAX_LOCAL_RECORDS = 500;

/** Id único com fallback: crypto.randomUUID só existe em contexto seguro (HTTPS). */
export function makeRecordId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Monta um registro a partir de um resultado calculado (função pura).
 * As `notes` do resultado NÃO entram no registro: elas podem revelar a resposta
 * de um item específico (ex.: o item 9 do PHQ-9), o que quebraria a promessa de
 * não armazenar respostas individuais.
 */
export function recordFromResult(
  inst: Instrument,
  result: InstrumentResult,
  respondent: string | undefined,
  id: string,
  createdAt: string,
): ResultRecord {
  const trimmed = respondent?.trim();
  return {
    id,
    createdAt,
    instrumentId: inst.id,
    acronym: inst.acronym,
    instrumentName: inst.name,
    respondent: trimmed && trimmed.length > 0 ? trimmed.slice(0, 80) : undefined,
    totalScore: result.totalScore,
    maxScore: result.maxScore,
    bandLabel: result.band.label,
    severity: result.band.severity,
    positive: result.positive,
    metricIsMean: result.metricIsMean,
    subscales: result.subscales?.map((s) => ({
      name: s.name,
      raw: s.raw,
      max: s.max,
      mean: s.mean,
    })),
  };
}

export function loadLocalRecords(): ResultRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ResultRecord[]) : [];
  } catch {
    return [];
  }
}

/** Retorna false quando o armazenamento falhou (modo privado, cota etc.). */
export function saveLocalRecord(record: ResultRecord): boolean {
  if (typeof window === "undefined") return false;
  try {
    const all = [record, ...loadLocalRecords()].slice(0, MAX_LOCAL_RECORDS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

export function clearLocalRecords(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Envia o registro para o banco central (quando ativado). Melhor-esforço. */
export async function insertRemoteRecord(record: ResultRecord): Promise<boolean> {
  if (!remoteEnabled()) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/resultados`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      // created_at fica de fora de propósito: o servidor carimba com now(),
      // impedindo datas forjadas de bagunçar a ordenação do painel.
      body: JSON.stringify({
        client_id: record.id,
        instrument_id: record.instrumentId,
        acronym: record.acronym,
        instrument_name: record.instrumentName,
        respondent: record.respondent ?? null,
        total_score: record.totalScore,
        max_score: record.maxScore,
        band_label: record.bandLabel,
        severity: record.severity,
        positive: record.positive ?? null,
        metric_is_mean: record.metricIsMean ?? false,
        subscales: record.subscales ?? null,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface RemoteRow {
  client_id?: string;
  id?: string;
  created_at: string;
  instrument_id: string;
  acronym: string;
  instrument_name: string;
  respondent: string | null;
  total_score: number;
  max_score: number;
  band_label: string;
  severity: Severity;
  positive: boolean | null;
  metric_is_mean: boolean | null;
  subscales: RecordSubscale[] | null;
  notes: string[] | null;
}

/** Lista os registros centrais mediante a senha do painel (RPC segura). */
export async function fetchRemoteRecords(password: string): Promise<ResultRecord[]> {
  if (!remoteEnabled()) throw new Error("Registro central não está ativado.");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/admin_listar_resultados`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_senha: password }),
  });
  if (!res.ok) {
    const body = await res.text();
    // A função SQL lança exatamente 'senha incorreta'; um substring mais curto
    // ("senha") também casaria com o erro PGRST202 de função-não-encontrada,
    // cuja mensagem ecoa o parâmetro "p_senha".
    if (body.includes("senha incorreta")) throw new Error("Senha incorreta.");
    throw new Error(`Falha ao consultar o registro central (${res.status}).`);
  }
  const rows = (await res.json()) as RemoteRow[];
  return rows.map((r) => ({
    id: r.client_id ?? r.id ?? "",
    createdAt: r.created_at,
    instrumentId: r.instrument_id,
    acronym: r.acronym,
    instrumentName: r.instrument_name,
    respondent: r.respondent ?? undefined,
    totalScore: Number(r.total_score),
    maxScore: Number(r.max_score),
    bandLabel: r.band_label,
    severity: r.severity,
    positive: r.positive ?? undefined,
    metricIsMean: r.metric_is_mean ?? undefined,
    subscales: r.subscales ?? undefined,
    notes: r.notes ?? undefined,
  }));
}

export function formatDateTimeBR(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function csvEscape(value: string): string {
  // Neutraliza injeção de fórmula: célula começando com = + - @ seria
  // executada pelo Excel/LibreOffice ao abrir o arquivo.
  let v = value;
  if (/^[=+\-@]/.test(v)) v = `'${v}`;
  if (/[";\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

/** Números no padrão pt-BR (vírgula decimal), consistente com a interface. */
function csvNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
}

/** Gera CSV (separador ';', padrão pt-BR/Excel) a partir dos registros. */
export function buildCsv(records: ResultRecord[]): string {
  const header = [
    "data_hora",
    "instrumento",
    "sigla",
    "respondente",
    "pontuacao",
    "maximo",
    "faixa",
    "rastreio_positivo",
    "subescalas",
  ];
  const lines = records.map((r) => {
    const subs = (r.subscales ?? [])
      .map(
        (s) =>
          `${s.name}: ${s.mean !== undefined ? `média ${csvNumber(s.mean)}` : `${csvNumber(s.raw)}/${csvNumber(s.max)}`}`,
      )
      .join(" | ");
    return [
      formatDateTimeBR(r.createdAt),
      r.instrumentName,
      r.acronym,
      r.respondent ?? "",
      csvNumber(r.totalScore),
      csvNumber(r.maxScore),
      r.bandLabel,
      r.positive === undefined ? "" : r.positive ? "sim" : "não",
      subs,
    ]
      .map(csvEscape)
      .join(";");
  });
  return [header.join(";"), ...lines].join("\r\n");
}
