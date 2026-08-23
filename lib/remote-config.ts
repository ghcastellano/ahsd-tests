// Configuração do registro central (Supabase) — ATIVO.
//
// O registro central grava resultados agregados no banco Supabase abaixo.
// A publishable key é pública por design (vai ao navegador de todo visitante);
// a segurança vem do RLS: anon só INSERE; a leitura exige a senha do painel,
// validada contra hash bcrypt dentro de uma função SECURITY DEFINER.
//
// As variáveis NEXT_PUBLIC_* (Vercel) têm precedência sobre os valores fixos —
// para migrar de projeto, basta defini-las e fazer redeploy.

const FALLBACK_URL = "https://cuaocjxofaizefzcxlyc.supabase.co";
const FALLBACK_KEY = "sb_publishable_ia1xhkkK8Pb_gD0Wc8jmXA_71wecTI0";

export const SUPABASE_URL: string =
  process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;

export const SUPABASE_KEY: string =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

/** Nomes com prefixo ahsd_ — o banco é compartilhado com outro projeto. */
export const RESULTS_TABLE = "ahsd_resultados";
export const ADMIN_RPC = "ahsd_admin_listar_resultados";

export function remoteEnabled(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;
}
