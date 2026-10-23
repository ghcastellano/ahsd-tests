# Registro central no Neon (Postgres serverless) — guia de 5 minutos

> **Por que trocar?** O projeto Supabase gratuito **pausa por inatividade** e o
> site fica em "SEM CONEXÃO" até alguém despertá-lo no painel do Supabase. O
> Neon (Postgres serverless) também "dorme", mas **acorda sozinho** na primeira
> consulta — e o plano gratuito basta para este site.
>
> Nada muda para quem responde os testes: o site passa a gravar no Postgres
> assim que a variável `DATABASE_URL` existir. Sem ela, continua usando o
> Supabase de sempre (fallback).
>
> **Atenção à senha do painel:** o banco novo nasce **sem senha**. Ela vem da
> variável **`PAINEL_SENHA_INICIAL`**, que precisa existir na Vercel **antes do
> Redeploy** — não há senha padrão no código (o repositório é público, e uma
> senha fixa ali seria conhecida por qualquer pessoa). Se você trocou a senha do
> painel no Supabase, use a mesma aqui; se não, escolha uma senha longa e única.

## Opção A — pela Vercel (recomendada, ~3 minutos)

1. Abra o projeto **ahsdtest** em [vercel.com](https://vercel.com) → aba **Storage**.
2. **Create Database** → em *Marketplace Database Providers* escolha **Neon** →
   plano **Free** → **Continue**.
3. Dê um nome (ex.: `ahsd-registro`), região mais próxima (ex.: *São Paulo* ou
   *US East*) e **Create**.
4. Em **Connect Project**, selecione **ahsdtest** e todos os ambientes
   (*Production*, *Preview*, *Development*) → **Connect**. A Vercel cria sozinha
   a variável de ambiente **`DATABASE_URL`** (e algumas irmãs, como
   `POSTGRES_URL`; o site usa só `DATABASE_URL`).
5. **Settings → Environment Variables → Add**: nome `PAINEL_SENHA_INICIAL`,
   valor = a senha do painel, todos os ambientes → **Save**. **Faça isto antes
   do passo 6**: a tabela de senha é criada no primeiro acesso ao banco (que
   qualquer visitante dispara), e a variável só é lida enquanto ela está vazia.
6. **Deployments** → no último deploy, menu `⋯` → **Redeploy** (as variáveis
   novas só valem num deploy novo).

## Opção B — criando o projeto no neon.tech

1. Em [neon.tech](https://neon.tech) → **New project** (plano Free), nome
   `ahsd-tests`, região mais próxima.
2. No painel do projeto → **Connect** → marque **Pooled connection** → copie a
   *connection string* (`postgresql://usuario:senha@ep-...-pooler....neon.tech/neondb?sslmode=require`).
3. Na Vercel: projeto **ahsdtest** → **Settings → Environment Variables** →
   **Add**: nome `DATABASE_URL`, valor = a string copiada, todos os ambientes →
   **Save**.
4. Ainda em **Environment Variables** → **Add**: nome `PAINEL_SENHA_INICIAL`,
   valor = a senha do painel, todos os ambientes → **Save** (**antes** do
   Redeploy, pelo mesmo motivo da Opção A).
5. **Deployments** → `⋯` → **Redeploy**.

> Só uma connection string **do Neon** funciona em `DATABASE_URL`: o site usa o
> driver HTTP serverless do Neon, e um Postgres comum (ou a URL direta de um
> projeto Supabase) não responde nesse protocolo — a sonda mostraria "SEM
> CONEXÃO". Para outro projeto Supabase, use `NEXT_PUBLIC_SUPABASE_URL` /
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ver README).

## Conferir que funcionou

1. Abra `https://ahsdtest.vercel.app/painel-ahsd`.
2. Na seção **Registro central** deve aparecer:
   - **Banco: Postgres/Neon** (ao lado da linha "Gravação de novos resultados")
   - **Gravação de novos resultados: OK — novos resultados estão sendo gravados**
3. Entre com a senha definida em `PAINEL_SENHA_INICIAL`. A lista começa vazia —
   o banco novo nasce sem registros; veja abaixo como trazer os antigos.
4. Responda um teste qualquer: a tela de resultado mostra "✓ Gravado no
   registro central" e o painel lista o registro.

O schema (tabelas `resultados`, `visitas`, `admin_config`) é criado
automaticamente na primeira requisição — não há script SQL para rodar.
`GET /api/registro-central` também mostra `"backend": "postgres"` e o detalhe
`Postgres/Neon: conexão e schema OK`.

**Se o painel responder "painel sem senha configurada: defina a variável
PAINEL_SENHA_INICIAL…"**: a variável não existia quando o banco foi acessado.
Crie-a na Vercel e faça **Redeploy** — a senha é semeada na próxima entrada no
painel (a tabela continua vazia até lá; a gravação de resultados não é afetada).

## Trazer os registros do Supabase (importação)

1. Com o site ainda apontando para o Supabase (ou pelo deploy anterior),
   exporte tudo em JSON:

   ```bash
   curl -s -X POST https://ahsdtest.vercel.app/api/exportar \
     -H "Content-Type: application/json" \
     -d '{"senha":"SUA-SENHA-DO-PAINEL"}' > exportacao.json
   ```

   (Se o Supabase estiver pausado, acorde o projeto no painel do Supabase
   antes de exportar. Guarde o arquivo: ele é o seu backup.)
2. Já com o Neon ativo, abra `/painel-ahsd`, entre com a senha e, logo abaixo
   da tabela do registro central, abra **"Importar exportação (JSON)"**.
3. Cole o conteúdo de `exportacao.json` → **Importar para o banco central**.
   O painel mostra quantos resultados e acessos entraram. Pode repetir à
   vontade — inclusive reimportar um backup do próprio Neon: o que já existe é
   ignorado (deduplicação por `client_id` nos resultados e por data+IP+caminho
   nos acessos, comparando a data em milissegundos, que é a precisão da
   exportação) e a data original é preservada.

   Pela linha de comando dá no mesmo:

   ```bash
   jq '. + {senha:"SUA-SENHA-DO-PAINEL"}' exportacao.json | \
     curl -s -X POST https://ahsdtest.vercel.app/api/importar \
       -H "Content-Type: application/json" -d @-
   ```

## Senha do painel

- A senha do banco novo é a de **`PAINEL_SENHA_INICIAL`**, gravada em
  `admin_config` como hash bcrypt na primeira entrada no painel (ou no primeiro
  acesso ao banco, se a variável já existir). Ela **só é lida enquanto a tabela
  está vazia**: mudar a variável depois não troca a senha. Sem a variável, o
  painel recusa qualquer senha com a mensagem acima — não existe senha padrão.
- A senha usada no projeto Supabase antigo aparece em
  `supabase/migrar-para-projeto-dedicado.sql`, no histórico público do git:
  **não a reaproveite** no Neon; escolha uma senha nova (e, se ainda a usa no
  Supabase, troque-a lá também, com o `update` de `supabase/setup.sql`).
- Para trocar depois, rode no **SQL Editor** do Neon (o hash pode ser gerado
  com `npx bcryptjs` ou qualquer gerador bcrypt de 10 rounds):

  ```sql
  update admin_config set senha_hash = '$2b$10$...hash...' where id = 1;
  ```

  Ou apague a linha (`delete from admin_config where id = 1;`), ajuste
  `PAINEL_SENHA_INICIAL` e faça Redeploy: a nova senha é semeada na próxima
  entrada.
- Senhas erradas repetidas (10 em 15 minutos, por IP) recebem **429** por um
  tempo. É um freio por instância da função; para um limite global, adicione
  uma regra de *rate limit* no Firewall da Vercel para `/api/painel/*`,
  `/api/exportar` e `/api/importar`.

## Voltar para o Supabase

Apague a variável `DATABASE_URL` na Vercel e faça **Redeploy**: o site volta
ao Supabase automaticamente (o painel passa a mostrar "Banco: Supabase").

## Desligar o registro central

`NEXT_PUBLIC_REGISTRO_CENTRAL=off` (+ Redeploy) desliga a gravação e a leitura
nos dois backends — inclusive o registro de acessos (IP) no servidor. O site
continua funcionando só com o histórico local de cada aparelho.

## Como funciona por dentro

- O navegador nunca fala com o banco: a gravação passa por
  `POST /api/resultados`, as listagens do painel por
  `POST /api/painel/resultados` e `POST /api/painel/visitas`, a importação por
  `POST /api/importar` — todas no servidor (`lib/registro/`).
- `DATABASE_URL` definida → backend **Postgres** (`lib/registro/postgres.ts`,
  driver `@neondatabase/serverless` em modo HTTP — só o Neon responde nesse
  protocolo). A senha do painel é conferida no servidor com bcrypt; não há RLS
  nem funções SQL.
- Sem `DATABASE_URL` → backend **Supabase** (`lib/registro/supabase.ts`), com
  a mesma API REST e as mesmas políticas de antes.
- Rotas sem senha (`/api/resultados`, `/api/registro-central`, `/api/visita`)
  nunca devolvem o texto cru de um erro do banco — só uma categoria ("sem
  conexão com o banco", "o banco recusou as credenciais de DATABASE_URL"…); o
  texto completo, já sem a connection string, fica no log da Vercel.
- Os testes do backend Postgres rodam num Postgres de verdade em memória
  (`@electric-sql/pglite`): `npx vitest run lib/registro`.
