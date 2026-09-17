import type { Instrument, InstrumentResult, Severity } from "./types";
import { ADMIN_RPC, RESULTS_TABLE, SUPABASE_KEY, SUPABASE_URL, remoteEnabled } from "./remote-config";

// Registro de resultado gravado no histórico (local e, quando ativo, central).
// Por privacidade, NÃO armazenamos as respostas individuais — apenas o
// resultado agregado (pontuações, faixas e subescalas).

export interface RecordSubscale {
  name: string;
  raw: number;
  max: number;
  mean?: number;
}

/**
 * Um item de TREINO, para revisão no histórico: o que foi marcado, o que era
 * certo, a regra e o tempo. Só os treinos (treino-*) gravam isto; os
 * instrumentos clínicos continuam sem respostas individuais.
 */
export interface DetalheItem {
  /** Posição do item na prova (1-based). */
  n: number;
  id: string;
  /** Alternativa marcada (1-based) ou texto digitado; null = não respondido. */
  escolhida: string | number | null;
  /** Alternativa correta (1-based) ou resposta esperada. */
  correta: string | number;
  acertou: boolean;
  /** Regra/explicação do item. */
  regra?: string;
  /** Segundos gastos no item, quando medido. */
  tempoSeg?: number;
  /** Domínio/bloco/dificuldade (ex.: "dificil", "verbal", "condicoes"). */
  grupo?: string;
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
  /** Tempo total gasto, em segundos (do início ao término). */
  durationSeconds?: number;
  /** Revisão item a item (só treinos). */
  detalhes?: DetalheItem[];
}

const STORAGE_KEY = "ahsd:historico:v1";
const MAX_LOCAL_RECORDS = 500;

/**
 * Id único e CURTO (~14 caracteres). Ele viaja no link de compartilhamento,
 * então um UUID de 36 caracteres custaria caro no tamanho da URL. A colisão
 * é irrelevante aqui: o id só serve para não duplicar registros.
 */
export function makeRecordId(): string {
  const tempo = Date.now().toString(36);
  let aleatorio = Math.random().toString(36).slice(2, 8);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    aleatorio = buf[0].toString(36).padStart(6, "0").slice(0, 6);
  }
  return `${tempo}${aleatorio}`;
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

/**
 * Envia o registro para o banco central (quando ativado). Melhor-esforço e
 * idempotente: UNIQUE(client_id) faz o banco recusar repetições com 409, que
 * tratamos como sucesso ("já estava sincronizado").
 *
 * Deliberadamente NÃO usamos upsert (`resolution=ignore-duplicates`): o modo
 * upsert do PostgREST exige política de UPDATE no RLS, e dar UPDATE ao papel
 * anônimo permitiria a qualquer visitante sobrescrever resultados alheios.
 */
export async function insertRemoteRecord(record: ResultRecord): Promise<boolean> {
  return (await insertRemoteRecordDetalhado(record)).ok;
}

/** Resultado de um envio ao registro central, com o motivo quando falha. */
export interface EnvioRemoto {
  ok: boolean;
  /** HTTP devolvido pelo banco (ausente quando a rede falhou). */
  status?: number;
  /** Texto curto e acionável para a tela. */
  motivo?: string;
}

/** Traduz a resposta do PostgREST/Supabase para um motivo legível. */
export function motivoDaFalha(status: number | undefined, body: string): string {
  if (status === undefined) return "sem conexão com o banco central (rede, VPN/bloqueador ou projeto pausado)";
  if (status === 401 || status === 403 || body.includes("42501")) {
    return `o banco recusou a gravação (HTTP ${status}${body.includes("42501") ? ", política RLS" : ""}) — a chave ou a permissão de inserção mudou`;
  }
  if (status === 404 || body.includes("PGRST205") || body.includes("PGRST202")) return "a tabela de resultados não existe no banco central";
  if (status === 400 || status === 422) return `o banco rejeitou os dados (HTTP ${status}${body.includes("23514") ? ", restrição de valores" : ""})`;
  if (status >= 500) return `o banco central está fora do ar (HTTP ${status})`;
  return `falha inesperada (HTTP ${status})`;
}

export async function insertRemoteRecordDetalhado(record: ResultRecord, comDetalhes = true): Promise<EnvioRemoto> {
  if (!remoteEnabled()) return { ok: false, motivo: "registro central desativado" };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${RESULTS_TABLE}`, {
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
        // Colunas novas (detalhes.sql). Se o banco ainda não as tiver, o
        // PostgREST responde PGRST204 e reenviamos sem elas (o resumo não se perde).
        ...(comDetalhes ? { duracao_segundos: record.durationSeconds ?? null, detalhes: record.detalhes ?? null } : {}),
      }),
    });
    // 409 = client_id já existe: o registro está no banco, missão cumprida.
    if (res.ok || res.status === 409) return { ok: true, status: res.status };
    const body = await res.text().catch(() => "");
    if (comDetalhes && body.includes("PGRST204")) {
      const semDetalhes = await insertRemoteRecordDetalhado(record, false);
      if (semDetalhes.ok) return { ...semDetalhes, motivo: "gravado sem a revisão item a item: o banco ainda não tem as colunas novas (rode supabase/detalhes.sql)" };
      return semDetalhes;
    }
    return { ok: false, status: res.status, motivo: motivoDaFalha(res.status, body) };
  } catch {
    return { ok: false, motivo: motivoDaFalha(undefined, "") };
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
  duracao_segundos?: number | null;
  detalhes?: DetalheItem[] | null;
}

/** Lista os registros centrais mediante a senha do painel (RPC segura). */
export async function fetchRemoteRecords(password: string): Promise<ResultRecord[]> {
  if (!remoteEnabled()) throw new Error("Registro central não está ativado.");
  // AbortSignal.timeout não existe no Safari < 16; lá seguimos sem prazo, o
  // que é melhor do que quebrar a consulta inteira com um TypeError.
  const prazo =
    typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(20_000)
      : undefined;
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${ADMIN_RPC}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_senha: password }),
      // Sem isso, uma rede que engasga deixa o painel em "Carregando…" para
      // sempre, sem nada explicando o que houve.
      signal: prazo,
    });
  } catch {
    // "Failed to fetch" é a mensagem crua do navegador, em inglês e sem pista
    // do que fazer — traduzimos para algo acionável.
    throw new Error(
      "Não foi possível falar com o banco central (sem conexão, VPN/firewall ou o projeto Supabase pausado). Os registros deste aparelho continuam na lista acima.",
    );
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // A função SQL lança exatamente 'senha incorreta'; um substring mais curto
    // ("senha") também casaria com o erro PGRST202 de função-não-encontrada,
    // cuja mensagem ecoa o parâmetro "p_senha".
    if (body.includes("senha incorreta")) throw new Error("Senha incorreta.");
    throw new Error(`Falha ao consultar o registro central (${res.status}).`);
  }
  // A resposta pode ser interrompida no meio (prazo estourado, conexão caiu):
  // sem isso escaparia um DOMException cru, em inglês, para a tela.
  let rows: RemoteRow[];
  try {
    rows = (await res.json()) as RemoteRow[];
  } catch {
    throw new Error("A resposta do banco central veio incompleta. Tente novamente.");
  }
  if (!Array.isArray(rows)) throw new Error("Resposta inesperada do banco central.");
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
    durationSeconds: r.duracao_segundos ?? undefined,
    detalhes: r.detalhes ?? undefined,
  }));
}

export function formatDateTimeBR(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export function csvEscape(value: string): string {
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
    "duracao_seg",
    "itens_errados",
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
      r.durationSeconds === undefined ? "" : String(r.durationSeconds),
      (r.detalhes ?? []).filter((d) => !d.acertou).map((d) => `#${d.n}${d.escolhida === null ? " (em branco)" : ""}`).join(" "),
    ]
      .map(csvEscape)
      .join(";");
  });
  return [header.join(";"), ...lines].join("\r\n");
}
