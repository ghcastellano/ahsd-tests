-- =============================================================================
-- Revisão item a item e duração no registro central.
--
-- Cole ESTE BLOCO INTEIRO no SQL Editor do projeto e clique RUN:
--   https://supabase.com/dashboard/project/bejkvhocfcwfniomomdl/sql/new
--
-- Acrescenta à tabela de resultados:
--   duracao_segundos  tempo total do início ao término (todos os testes)
--   detalhes          revisão item a item — o que foi marcado, o que era certo,
--                     a regra e o tempo por item — SÓ para os treinos
--                     (treino-*). Os instrumentos clínicos continuam sem
--                     respostas individuais.
-- A função admin_listar_resultados devolve `select *`, então as colunas novas
-- aparecem no painel sem outra mudança. Idempotente: pode rodar de novo.
-- =============================================================================

alter table public.resultados
  add column if not exists duracao_segundos integer
    check (duracao_segundos >= 0 and duracao_segundos <= 86400),
  add column if not exists detalhes jsonb
    check (pg_column_size(detalhes) <= 262144);

-- Conferência: deve listar as duas colunas.
select column_name, data_type
  from information_schema.columns
 where table_schema = 'public' and table_name = 'resultados'
   and column_name in ('duracao_segundos', 'detalhes');
