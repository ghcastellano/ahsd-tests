-- =============================================================================
-- Setup do registro central de resultados (Supabase)
-- Rode este script inteiro no SQL Editor do seu projeto Supabase.
-- Depois, defina no Vercel:
--   NEXT_PUBLIC_SUPABASE_URL      = https://SEU-PROJETO.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY = sua publishable/anon key
-- e faça um novo deploy. O painel fica em /painel-ahsd.
--
-- SENHA DO PAINEL: o script semeia a senha inicial 'TROQUE-ESTA-SENHA'.
-- Defina a sua rodando depois (obrigatório — escolha uma senha longa):
--
--   update public.admin_config
--     set senha_hash = crypt('sua-senha-longa-e-unica-aqui', gen_salt('bf'))
--     where id = 1;
--
-- A senha é guardada com hash bcrypt e re-rodar este script NÃO sobrescreve
-- uma senha já definida. Observação de limite: a função de leitura é pública
-- (protegida só pela senha); use uma senha forte, pois não há bloqueio de
-- tentativas além do custo do bcrypt.
-- =============================================================================

create extension if not exists pgcrypto;

-- Tabela de resultados (sem respostas individuais; apenas resultado agregado).
-- created_at é sempre carimbado pelo servidor (o cliente não envia).
create table if not exists public.resultados (
  id uuid primary key default gen_random_uuid(),
  client_id text check (char_length(client_id) <= 64),
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
  subscales jsonb check (pg_column_size(subscales) <= 16384)
);

alter table public.resultados enable row level security;

-- Qualquer visitante pode INSERIR um resultado (registro anônimo)...
drop policy if exists "insercao_anonima" on public.resultados;
create policy "insercao_anonima"
  on public.resultados for insert
  to anon
  with check (true);

-- ...mas NINGUÉM lê a tabela diretamente (nenhuma policy de SELECT para anon).
-- A leitura só acontece pela função abaixo, protegida por senha.

-- Configuração do painel (senha com hash bcrypt; tabela bloqueada por RLS).
create table if not exists public.admin_config (
  id int primary key default 1,
  senha_hash text not null
);
alter table public.admin_config enable row level security;

-- Semeia a senha inicial SOMENTE se ainda não existir (re-rodar o script
-- não desfaz uma senha que você já definiu).
insert into public.admin_config (id, senha_hash)
  values (1, crypt('TROQUE-ESTA-SENHA', gen_salt('bf')))
  on conflict (id) do nothing;

-- Função de leitura protegida por senha (SECURITY DEFINER ignora o RLS
-- somente dentro da função, após validar a senha contra o hash).
create or replace function public.admin_listar_resultados(p_senha text)
returns setof public.resultados
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from admin_config
    where senha_hash = crypt(p_senha, senha_hash)
  ) then
    raise exception 'senha incorreta';
  end if;
  return query
    select * from resultados order by created_at desc limit 2000;
end;
$$;

grant execute on function public.admin_listar_resultados(text) to anon;
