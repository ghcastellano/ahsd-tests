-- =============================================================================
-- Setup do registro central de resultados (Supabase)
-- Rode este script inteiro no SQL Editor do seu projeto Supabase.
-- Depois, defina no Vercel:
--   NEXT_PUBLIC_SUPABASE_URL      = https://SEU-PROJETO.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY = sua publishable/anon key
-- e faça um novo deploy. O painel fica em /painel-ahsd.
--
-- IMPORTANTE: troque a senha do painel na linha indicada abaixo.
-- =============================================================================

-- Tabela de resultados (sem respostas individuais; apenas resultado agregado).
create table if not exists public.resultados (
  id uuid primary key default gen_random_uuid(),
  client_id text,
  created_at timestamptz not null default now(),
  instrument_id text not null,
  acronym text not null,
  instrument_name text not null,
  respondent text,
  total_score numeric not null,
  max_score numeric not null,
  band_label text not null,
  severity text not null,
  positive boolean,
  metric_is_mean boolean not null default false,
  subscales jsonb,
  notes jsonb
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

-- Configuração do painel (guarda a senha; tabela totalmente bloqueada por RLS).
create table if not exists public.admin_config (
  id int primary key default 1,
  senha text not null
);
alter table public.admin_config enable row level security;

-- >>> TROQUE A SENHA AQUI <<<
insert into public.admin_config (id, senha)
  values (1, 'ahsd-painel-2026')
  on conflict (id) do update set senha = excluded.senha;

-- Função de leitura protegida por senha (SECURITY DEFINER ignora o RLS
-- somente dentro da função, após validar a senha).
create or replace function public.admin_listar_resultados(p_senha text)
returns setof public.resultados
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from admin_config where senha = p_senha) then
    raise exception 'senha incorreta';
  end if;
  return query
    select * from resultados order by created_at desc limit 2000;
end;
$$;

grant execute on function public.admin_listar_resultados(text) to anon;
