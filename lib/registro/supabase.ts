import { motivoDaFalha } from "../history";
import { sondarGravacao } from "../registro-central";
import {
  ADMIN_RPC,
  ADMIN_VISITS_RPC,
  RESULTS_TABLE,
  SUPABASE_KEY,
  SUPABASE_URL,
  VISITS_TABLE,
  remoteEnabled,
} from "../remote-config";
import type { EnvioRemoto, ResultRecord, Sonda, Visita, VisitaRegistro } from "./tipos";
import type { RegistroBackend } from "./tipos";
import {
  MOTIVO_SEM_DETALHES,
  detalhesCortados,
  linhaDaVisita,
  linhaDoResultado,
  resultadoDaLinha,
  visitaDaLinha,
  type LinhaResultadoBruta,
  type LinhaVisitaBruta,
} from "./linhas";
import { ErroRegistro } from "./erros";

// Backend Supabase (fallback quando não há DATABASE_URL): a mesma API REST do
// PostgREST que o navegador usava antes, agora chamada pelo servidor. A
// segurança continua a do projeto: a chave pública só INSERE (RLS) e a leitura
// passa pelas funções admin_listar_* protegidas pela senha (bcrypt no banco).

const CABECALHOS = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

function prazo(ms: number): AbortSignal | undefined {
  return typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(ms) : undefined;
}

/**
 * Insere um resultado pelo REST. Idempotente: UNIQUE(client_id) faz o banco
 * recusar repetições com 409, que contam como sucesso ("já estava lá").
 * Deliberadamente sem upsert: ele exigiria política de UPDATE para o papel
 * anônimo, o que deixaria qualquer visitante sobrescrever resultados alheios.
 */
export async function inserirResultadoSupabase(record: ResultRecord, comDetalhes = true): Promise<EnvioRemoto> {
  if (!remoteEnabled()) return { ok: false, motivo: "registro central desativado" };
  try {
    const linha = linhaDoResultado(record);
    const { duracao_segundos, detalhes, ...resto } = linha;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${RESULTS_TABLE}`, {
      method: "POST",
      headers: { ...CABECALHOS, Prefer: "return=minimal" },
      // created_at fica de fora de propósito: o servidor carimba com now().
      // As colunas novas (detalhes.sql) saem quando o banco responde PGRST204.
      body: JSON.stringify(comDetalhes ? { ...resto, duracao_segundos, detalhes } : resto),
      signal: prazo(15_000),
    });
    if (res.ok || res.status === 409) {
      // Mesmo aviso do backend Postgres: a revisão item a item passou do tamanho da coluna.
      return comDetalhes && detalhesCortados(record, linha)
        ? { ok: true, status: res.status, motivo: MOTIVO_SEM_DETALHES }
        : { ok: true, status: res.status };
    }
    const body = await res.text().catch(() => "");
    if (comDetalhes && body.includes("PGRST204")) {
      const semDetalhes = await inserirResultadoSupabase(record, false);
      if (semDetalhes.ok) {
        return { ...semDetalhes, motivo: "gravado sem a revisão item a item: o banco ainda não tem as colunas novas (rode supabase/detalhes.sql)" };
      }
      return semDetalhes;
    }
    return { ok: false, status: res.status, motivo: motivoDaFalha(res.status, body) };
  } catch {
    return { ok: false, motivo: motivoDaFalha(undefined, "") };
  }
}

/** Chama uma função admin_listar_* com a senha; lança ErroRegistro (texto curado) quando falha. */
async function rpcProtegida(nome: string, senha: string, tabelaAusente: string): Promise<unknown[]> {
  if (!remoteEnabled()) throw new ErroRegistro("registro central desativado");
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, {
      method: "POST",
      headers: CABECALHOS,
      body: JSON.stringify({ p_senha: senha }),
      signal: prazo(20_000),
    });
  } catch {
    throw new ErroRegistro("não foi possível falar com o banco central (sem conexão ou projeto Supabase pausado)");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // A função SQL lança exatamente 'senha incorreta'; um substring mais curto
    // ("senha") casaria também com o PGRST202 de função-não-encontrada, cuja
    // mensagem ecoa o parâmetro "p_senha".
    if (body.includes("senha incorreta")) throw new ErroRegistro("senha incorreta");
    if (res.status === 404 || body.includes("PGRST202")) throw new ErroRegistro(tabelaAusente);
    throw new ErroRegistro(`falha ao consultar o banco central (HTTP ${res.status})`);
  }
  let rows: unknown;
  try {
    rows = await res.json();
  } catch {
    throw new ErroRegistro("a resposta do banco central veio incompleta; tente novamente");
  }
  if (!Array.isArray(rows)) throw new ErroRegistro("resposta inesperada do banco central");
  return rows;
}

export async function listarResultadosSupabase(senha: string): Promise<ResultRecord[]> {
  const rows = await rpcProtegida(ADMIN_RPC, senha, "a tabela de resultados não existe no banco: rode supabase/setup.sql");
  return rows.map((r) => resultadoDaLinha(r as LinhaResultadoBruta));
}

/** Grava a visita pelo REST. Melhor-esforço: nunca lança. */
export async function inserirVisitaSupabase(v: Visita, prazoMs = 5000): Promise<boolean> {
  if (!remoteEnabled()) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${VISITS_TABLE}`, {
      method: "POST",
      headers: { ...CABECALHOS, Prefer: "return=minimal" },
      body: JSON.stringify(linhaDaVisita(v)),
      signal: prazo(prazoMs),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listarVisitasSupabase(senha: string): Promise<VisitaRegistro[]> {
  const rows = await rpcProtegida(
    ADMIN_VISITS_RPC,
    senha,
    "a tabela de acessos ainda não existe no banco: rode supabase/visitas.sql no SQL Editor do projeto",
  );
  return rows.map((r) => visitaDaLinha(r as LinhaVisitaBruta));
}

export function criarBackendSupabase(): RegistroBackend {
  return {
    nome: "supabase",
    inserirResultado: (r) => inserirResultadoSupabase(r),
    listarResultados: listarResultadosSupabase,
    inserirVisita: (v) => inserirVisitaSupabase(v),
    listarVisitas: listarVisitasSupabase,
    sondar: (): Promise<Sonda> => sondarGravacao(),
    importar: async () => {
      throw new ErroRegistro("importação disponível só com DATABASE_URL (Postgres/Neon)");
    },
  };
}
