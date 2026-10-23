// Configuração do registro central.
//
// O navegador fala só com as rotas /api/* do próprio site; quem fala com o
// banco é o servidor (lib/registro). Há dois backends:
//   - Postgres/Neon: ativo quando a variável de servidor DATABASE_URL existe
//     (a Vercel a cria ao conectar o Neon). O schema é criado sozinho.
//   - Supabase (fallback, projeto dedicado): PostgREST + RLS. A publishable key
//     é pública por design; a segurança vem do RLS: anon só INSERE — não lê,
//     não atualiza, não apaga. A leitura acontece pelas funções
//     admin_listar_*, que validam a senha do painel contra um hash bcrypt.
//
// As variáveis NEXT_PUBLIC_* (Vercel) têm precedência sobre os valores fixos,
// então dá para apontar para outro projeto Supabase sem alterar código.

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

/**
 * O registro central está ligado? Sempre, a menos que
 * NEXT_PUBLIC_REGISTRO_CENTRAL=off (o servidor escolhe o banco sozinho).
 */
export function remoteEnabled(): boolean {
  return process.env.NEXT_PUBLIC_REGISTRO_CENTRAL !== "off";
}
