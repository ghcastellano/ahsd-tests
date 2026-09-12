import { RESULTS_TABLE, SUPABASE_KEY, SUPABASE_URL, remoteEnabled } from "./remote-config";

// Sonda da gravação no registro central. Tenta inserir uma linha PROPOSITALMENTE
// inválida (total_score fora do intervalo permitido): o Postgres avalia a
// política RLS antes das restrições, então
//   - RLS bloqueando  -> 42501 (a gravação real também falharia)
//   - RLS passando    -> 23514 (violação de CHECK: nada é gravado, e a gravação
//                       real funcionaria)
// Sem efeito colateral: nenhuma linha entra no banco.

export type SituacaoGravacao = "ok" | "bloqueada" | "tabela-ausente" | "chave-invalida" | "sem-conexao" | "desconhecido";

export interface Sonda {
  gravacao: SituacaoGravacao;
  status: number | null;
  detalhe: string;
}

export function interpretarSonda(status: number | null, body: string): Sonda {
  const b = body.slice(0, 400);
  if (status === null) return { gravacao: "sem-conexao", status, detalhe: "não foi possível falar com o banco central" };
  if (body.includes("23514")) return { gravacao: "ok", status, detalhe: "a inserção passa pela política RLS (a linha de sonda foi recusada só pela restrição de valores, como esperado)" };
  if (body.includes("42501") || status === 401 || status === 403) return { gravacao: status === 401 && !body.includes("42501") ? "chave-invalida" : "bloqueada", status, detalhe: b };
  if (status === 404 || body.includes("PGRST205")) return { gravacao: "tabela-ausente", status, detalhe: b };
  return { gravacao: "desconhecido", status, detalhe: b };
}

export const TEXTO_SITUACAO: Record<SituacaoGravacao, string> = {
  ok: "OK — novos resultados estão sendo gravados",
  bloqueada: "BLOQUEADA — o banco recusa inserções do site (política RLS ou permissão da tabela). Rode de novo o bloco de políticas de supabase/setup.sql",
  "chave-invalida": "BLOQUEADA — o banco não aceita a chave pública do site (HTTP 401). Confira a publishable key do projeto",
  "tabela-ausente": "BLOQUEADA — a tabela de resultados não existe no projeto apontado. Rode supabase/setup.sql",
  "sem-conexao": "SEM CONEXÃO — o servidor não alcançou o banco central (projeto pausado?)",
  desconhecido: "INDEFINIDA — resposta inesperada do banco; veja o detalhe",
};

/** Executa a sonda (servidor). Nunca lança. */
export async function sondarGravacao(prazoMs = 8000): Promise<Sonda> {
  if (!remoteEnabled()) return { gravacao: "desconhecido", status: null, detalhe: "registro central desativado" };
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${RESULTS_TABLE}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        client_id: `sonda-${Date.now()}`,
        instrument_id: "sonda",
        acronym: "SONDA",
        instrument_name: "Sonda de gravação (linha inválida de propósito)",
        total_score: 5000, // viola o CHECK (<= 1000): nunca é gravada
        max_score: 1,
        band_label: "sonda",
        severity: "info",
      }),
      signal: AbortSignal.timeout(prazoMs),
    });
    const body = await res.text().catch(() => "");
    // 2xx aqui seria um bug (a restrição deveria recusar): reporta como indefinido.
    if (res.ok) return { gravacao: "desconhecido", status: res.status, detalhe: "a linha inválida foi aceita — restrições da tabela ausentes" };
    return interpretarSonda(res.status, body);
  } catch {
    return interpretarSonda(null, "");
  }
}
