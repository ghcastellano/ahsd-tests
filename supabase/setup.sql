-- =============================================================================
-- Schema do registro central de resultados (Supabase) — projeto dedicado.
--
-- Este é o schema canônico, já aplicado no projeto do AHSD. Use este arquivo
-- para recriar o registro central do zero em um projeto novo:
--   1. SQL Editor do projeto → cole este script → Run
--   2. defina a senha do painel (comando ao final)
--   3. no Vercel, defina e faça redeploy:
--        NEXT_PUBLIC_SUPABASE_URL      = https://SEU-PROJETO.supabase.co
--        NEXT_PUBLIC_SUPABASE_ANON_KEY = a publishable/anon key do projeto
--
-- Segurança: a chave pública só INSERE (RLS). A leitura acontece apenas pela
-- função abaixo, que valida a senha do painel contra um hash bcrypt. A função
-- é pública (protegida só pela senha), então use uma senha longa — não há
-- bloqueio de tentativas além do custo do bcrypt.
--
-- Nota: no Supabase o pgcrypto vive no schema `extensions`; por isso o
-- search_path da função o inclui, e os comandos avulsos usam o prefixo
-- `extensions.` (crypt / gen_salt).
-- =============================================================================

create extension if not exists pgcrypto;

-- Resultados agregados (sem respostas individuais).
-- created_at é carimbado pelo servidor — o cliente não envia.
create table if not exists public.resultados (
  id uuid primary key default gen_random_uuid(),
  client_id text unique check (char_length(client_id) <= 64),
  created_at timestamptz not null default now(),
  instrument_id text not null check (char_length(instrument_id) <= 60),
  acronym text not null check (char_length(acronym) <= 30),
  instrument_name text not null check (char_length(instrument_name) <= 160),
  respondent text check (char_length(respondent) <= 80),
  total_score numeric not null check (total_score >= -1000 and total_score <= 1000),
  max_score numeric not null check (max_score >= 0 and max_score <= 1000),
  band_label text not null check (char_length(band_label) <= 120),
  severity text not null check (char_length(severity) <= 20),
  positive boolean,
  metric_is_mean boolean not null default false,
  subscales jsonb check (pg_column_size(subscales) <= 16384),
  -- tempo total (s) e revisão item a item (só treinos) — ver detalhes.sql
  duracao_segundos integer check (duracao_segundos >= 0 and duracao_segundos <= 86400),
  detalhes jsonb check (pg_column_size(detalhes) <= 262144)
);

alter table public.resultados enable row level security;

-- Qualquer visitante pode INSERIR um resultado (registro anônimo)...
drop policy if exists "insercao_anonima" on public.resultados;
create policy "insercao_anonima"
  on public.resultados for insert
  to anon
  with check (true);

-- ...mas ninguém lê a tabela diretamente: não há policy de SELECT para anon.
-- (UNIQUE(client_id) torna a sincronização idempotente — nunca duplica.)

-- Configuração do painel (senha com hash bcrypt; tabela bloqueada por RLS).
create table if not exists public.admin_config (
  id int primary key default 1,
  senha_hash text not null
);
alter table public.admin_config enable row level security;

-- Semeia uma senha inicial SOMENTE se ainda não existir.
insert into public.admin_config (id, senha_hash)
  values (1, extensions.crypt('TROQUE-ESTA-SENHA', extensions.gen_salt('bf')))
  on conflict (id) do nothing;

-- Leitura protegida por senha (SECURITY DEFINER ignora o RLS apenas
-- dentro da função, depois de validar a senha).
create or replace function public.admin_listar_resultados(p_senha text)
returns setof public.resultados
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
    select * from resultados order by created_at desc limit 2000;
end;
$$;

grant execute on function public.admin_listar_resultados(text) to anon;

-- -----------------------------------------------------------------------------
-- Registro de acessos (IP de quem abre o site). Detalhes e limpeza: visitas.sql
-- -----------------------------------------------------------------------------
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
-- DEFINA A SENHA DO PAINEL (obrigatório — escolha uma senha longa e única):
--
--   update public.admin_config
--      set senha_hash = extensions.crypt('sua-senha-aqui', extensions.gen_salt('bf'))
--    where id = 1;
-- =============================================================================
