// Configuração do registro central (Supabase) — projeto dedicado, ATIVO.
//
// A publishable key é pública por design (vai ao navegador de todo visitante);
// a segurança vem do RLS: anon só INSERE — não lê, não atualiza, não apaga.
// A leitura acontece apenas pela função admin_listar_resultados, que valida a
// senha do painel contra um hash bcrypt.
//
// As variáveis NEXT_PUBLIC_* (Vercel) têm precedência sobre os valores fixos,
// então dá para apontar para outro projeto sem alterar código.

const FALLBACK_URL = "https://bejkvhocfcwfniomomdl.supabase.co";
const FALLBACK_KEY = "sb_publishable_6DKeHWWx0_hncQMs7ZjgGA_XzVEvf8Z";

export const SUPABASE_URL: string =
  process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;

export const SUPABASE_KEY: string =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

export const RESULTS_TABLE = "resultados";
export const ADMIN_RPC = "admin_listar_resultados";
// Registro de acessos (IP de quem abre o site) — mesma regra: anon só insere;
// a leitura passa pela função admin_listar_visitas, protegida pela senha do painel.
export const VISITS_TABLE = "visitas";
export const ADMIN_VISITS_RPC = "admin_listar_visitas";

export function remoteEnabled(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;
}
