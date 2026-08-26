-- =============================================================================
-- MIGRAÇÃO para o projeto dedicado (bejkvhocfcwfniomomdl)
--
-- Cole ESTE BLOCO INTEIRO no SQL Editor do projeto novo e clique RUN:
--   https://supabase.com/dashboard/project/bejkvhocfcwfniomomdl/sql/new
--
-- O schema (tabelas + função) já foi criado. Este script faz o que faltou:
--   1. define a senha do painel
--   2. traz os 3 registros do banco anterior
--
-- Observação técnica: no Supabase as funções do pgcrypto (crypt/gen_salt)
-- vivem no schema `extensions`, por isso são chamadas com o prefixo.
-- =============================================================================

-- 1. Senha do painel (a mesma que você já usa).
--    Para trocar depois, rode só este UPDATE com a nova senha.
update public.admin_config
   set senha_hash = extensions.crypt('l-eYnghPHg3yLidtBsEv8Nq_', extensions.gen_salt('bf'))
 where id = 1;

-- 2. Registros migrados do banco anterior (idempotente: rodar de novo não duplica).
insert into public.resultados
  (client_id, created_at, instrument_id, acronym, instrument_name, respondent,
   total_score, max_score, band_label, severity, positive, metric_is_mean)
values
  ('resgate-chat-ahsd', '2026-08-23T12:00:00-03:00', 'ahsd-indicadores', 'AH/SD',
   'Indicadores de Altas Habilidades/Superdotação', 'Gustavo (resgatado do chat, data aprox.)',
   4.88, 5, 'Indicadores fortes e consistentes', 'high', null, true),
  ('resgate-chat-oe', '2026-08-23T12:00:00-03:00', 'sobre-excitabilidades', 'SE / OE',
   'Sobre-excitabilidades (Dabrowski)', 'Gustavo (resgatado do chat, data aprox.)',
   4.7, 5, 'Perfil de sobre-excitabilidades', 'info', null, true),
  ('teste-claude-1', '2026-08-23T01:27:00-03:00', 'gad-7', 'GAD-7',
   'Teste de ativação', 'Claude Setup',
   14, 21, 'Moderado', 'moderate', true, false)
on conflict (client_id) do nothing;

-- 3. Conferência: deve retornar 3 linhas e a senha deve validar (t).
select (select count(*) from public.resultados) as registros_migrados,
       exists (select 1 from public.admin_config
                where senha_hash = extensions.crypt('l-eYnghPHg3yLidtBsEv8Nq_', senha_hash))
         as senha_ok;
