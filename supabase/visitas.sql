-- =============================================================================
-- Registro de acessos (IP de quem abre o site).
--
-- Cole ESTE BLOCO INTEIRO no SQL Editor do projeto e clique RUN:
--   https://supabase.com/dashboard/project/bejkvhocfcwfniomomdl/sql/new
--
-- Cada abertura de página envia (pelo servidor do site, rota /api/visita) o IP
-- de origem, país/região/cidade (cabeçalhos geográficos da Vercel), caminho,
-- página de origem (referer), navegador e idioma. O visitante não consegue
-- forjar o IP: ele é lido dos cabeçalhos que a Vercel carimba, não do corpo.
--
-- Segurança: a chave pública só INSERE (RLS). A leitura acontece apenas pela
-- função admin_listar_visitas, que valida a senha do painel (mesmo hash bcrypt
-- de admin_config usado pelos resultados).
--
-- LGPD: endereço IP é dado pessoal. Finalidade registrada aqui: segurança e
-- auditoria de uso da plataforma. Recomenda-se apagar registros antigos —
-- veja o comando de limpeza ao final.
-- =============================================================================

create table if not exists public.visitas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  ip text check (char_length(ip) <= 45),
  pais text check (char_length(pais) <= 8),
  regiao text check (char_length(regiao) <= 80),
  cidade text check (char_length(cidade) <= 120),
  caminho text check (char_length(caminho) <= 200),
  referer text check (char_length(referer) <= 300),
  user_agent text check (char_length(user_agent) <= 300),
  idioma text check (char_length(idioma) <= 40)
);

create index if not exists visitas_created_at_idx on public.visitas (created_at desc);

alter table public.visitas enable row level security;

-- Qualquer visitante (via o servidor do site) pode INSERIR um acesso...
drop policy if exists "insercao_anonima_visitas" on public.visitas;
create policy "insercao_anonima_visitas"
  on public.visitas for insert
  to anon
  with check (true);

-- ...mas ninguém lê a tabela diretamente: não há policy de SELECT para anon.

-- Leitura protegida pela senha do painel (as 5.000 mais recentes).
create or replace function public.admin_listar_visitas(p_senha text)
returns setof public.visitas
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not exists (
    select 1 from admin_config where senha_hash = crypt(p_senha, senha_hash)
  ) then
    raise exception 'senha incorreta';
  end if;
  return query
    select * from visitas order by created_at desc limit 5000;
end;
$$;

grant execute on function public.admin_listar_visitas(text) to anon;

-- =============================================================================
-- LIMPEZA (opcional, rode quando quiser): apaga acessos com mais de 180 dias.
--
--   delete from public.visitas where created_at < now() - interval '180 days';
-- =============================================================================
