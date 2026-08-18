// Configuração do registro central (Supabase).
//
// O registro central fica DESATIVADO até que estes valores sejam preenchidos.
// Para ativar:
//   1. Crie um projeto no Supabase e rode o script `supabase/setup.sql` no SQL Editor.
//   2. Defina as variáveis no Vercel (Settings → Environment Variables):
//        NEXT_PUBLIC_SUPABASE_URL      = https://SEU-PROJETO.supabase.co
//        NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_... (ou a anon key)
//      (ou preencha os fallbacks abaixo diretamente) e faça um novo deploy.
//
// A anon/publishable key é pública por design; a segurança dos dados é garantida
// pelas políticas de RLS criadas no setup.sql (inserção anônima permitida,
// leitura somente via função com senha do painel).

export const SUPABASE_URL: string =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_KEY: string =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function remoteEnabled(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_KEY.length > 0;
}
