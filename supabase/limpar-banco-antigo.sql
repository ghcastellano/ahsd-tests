-- =============================================================================
-- LIMPEZA do banco antigo (projeto compartilhado "mariners-supply",
-- ref cuaocjxofaizefzcxlyc) — remove APENAS os objetos do AHSD.
--
-- ⚠️ RODE SOMENTE DEPOIS de confirmar que o painel /painel-ahsd está lendo
--    os registros do projeto novo. Isto apaga dados de forma irreversível.
--
-- Cole no SQL Editor do projeto ANTIGO:
--   https://supabase.com/dashboard/project/cuaocjxofaizefzcxlyc/sql/new
--
-- As demais tabelas daquele projeto (products, orders, ships, profiles…)
-- pertencem a outro aplicativo e NÃO são tocadas por este script.
-- =============================================================================

drop function if exists public.ahsd_admin_listar_resultados(text);
drop table if exists public.ahsd_resultados;
drop table if exists public.ahsd_admin_config;

-- Conferência: não deve retornar nenhuma linha.
select table_name
  from information_schema.tables
 where table_schema = 'public'
   and table_name like 'ahsd%';
