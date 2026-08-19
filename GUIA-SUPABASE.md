# Ativação do registro central (Supabase) — guia de 3 minutos

O painel `/painel-ahsd` já funciona por dispositivo. Este guia ativa o **registro
central**: todos os testes, de todos os dispositivos, num painel só.

> **Atalho:** se você preferir que o Claude faça tudo, veja o "Caminho C" no fim.

## Caminho B — você cria, o Claude ativa (≈3 minutos)

### 1. Criar o projeto (1 min)

1. Acesse [supabase.com](https://supabase.com) → **Sign in** (pode entrar com GitHub).
2. **New project** → escolha a organização pessoal.
3. Preencha:
   - **Name:** `ahsd-tests`
   - **Database password:** clique em *Generate a password* (você não vai precisar dela no dia a dia)
   - **Region:** `South America (São Paulo)`
4. **Create new project** e aguarde ~2 min o provisionamento.

### 2. Rodar o script do banco (1 min)

1. No menu lateral do projeto: **SQL Editor** → **New query**.
2. Copie TODO o conteúdo do arquivo [`supabase/setup.sql`](supabase/setup.sql)
   deste repositório, cole e clique **Run**. Deve terminar sem erros ("Success").
3. Defina a sua senha do painel (troque pelo valor que quiser, longo e único) —
   cole e rode em seguida:

   ```sql
   update public.admin_config
     set senha_hash = crypt('SUA-SENHA-LONGA-E-UNICA-AQUI', gen_salt('bf'))
     where id = 1;
   ```

### 3. Pegar os dois valores públicos (30 s)

1. Menu lateral: **Project Settings → API** (ou "API Keys").
2. Copie:
   - **Project URL** — algo como `https://abcdefghijklm.supabase.co`
   - **anon / publishable key** — começa com `eyJ…` ou `sb_publishable_…`

Esses dois valores são **públicos por design** (vão para o navegador de qualquer
visitante; a segurança vem das políticas RLS criadas no passo 2). Pode colar no
chat sem medo.

### 4. Enviar para o Claude (10 s)

Mande no chat: `URL: … / KEY: …`. O Claude grava os valores no código
(`lib/remote-config.ts`), publica, testa uma inserção e a leitura com senha, e o
registro central liga sozinho — **sem tocar em nada na Vercel**.

*(Alternativa sem o Claude: defina `NEXT_PUBLIC_SUPABASE_URL` e
`NEXT_PUBLIC_SUPABASE_ANON_KEY` nas Environment Variables do projeto `ahsdtests`
na Vercel e faça redeploy.)*

## Caminho C — o Claude faz 100% via API (você só cria um token)

1. Acesse [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens).
2. **Generate new token** (nome: `claude-setup`), copie o token (`sbp_…`) e cole
   no chat.
3. O Claude usa a Management API para criar o projeto, rodar o schema, definir
   uma senha forte de painel (entregue a você no chat), buscar as chaves,
   ativar no código e verificar tudo.
4. **Depois, revogue o token** na mesma página — ele dá acesso administrativo à
   sua conta Supabase e não deve ficar ativo além do necessário.

## Caminho A — reconectar o conector

Se o conector do Supabase estiver ativo na sessão do Claude (claude.ai →
Settings → Connectors), basta pedir "suba o supabase" — o Claude cria projeto,
schema, senha e ativação sem nenhum passo manual.
