# Rastreio AH/SD e Neurodivergências

Plataforma web de **triagem (rastreio)** de Altas Habilidades/Superdotação (AH/SD)
e de condições que frequentemente coocorrem (dupla excepcionalidade), com
**questionários completos, correção automática, pontuação e detalhamento** dos
resultados — para autoavaliação e para aplicação por profissionais e familiares.

Construída do zero, com lógica de pontuação verificada por testes automatizados e
resultados calculados inteiramente no navegador (nenhuma resposta é enviada a
servidores).

> ⚠️ **Não é diagnóstico.** Todos os instrumentos são de rastreio e orientação
> inicial. A identificação formal de AH/SD ou de qualquer condição exige
> avaliação multidimensional por profissionais qualificados.

## Instrumentos incluídos

| Sigla | Instrumento | Área | Itens | Pontuação |
|-------|-------------|------|------:|-----------|
| AH/SD | Indicadores de Altas Habilidades/Superdotação *(autoral)* | Altas Habilidades | 34 | Perfil por área (média 1–5) |
| SE/OE | Sobre-excitabilidades de Dabrowski *(autoral)* | Altas Habilidades | 35 | Perfil das 5 dimensões |
| ASRS v1.1 | Autorrelato de TDAH no adulto (OMS) | TDAH | 18 | Marcas da Parte A (≥4 = positivo) |
| AQ-50 | Quociente do Espectro Autista | Autismo | 50 | 0–50 (corte 32; 26 sensível) |
| PHQ-9 | Saúde do Paciente – Depressão | Humor | 9 | 0–27 (5/10/15/20) |
| GAD-7 | Ansiedade Generalizada | Ansiedade | 7 | 0–21 (corte 10) |
| MDQ | Transtornos do Humor (bipolar) | Humor | 15 | Algoritmo de 3 critérios |
| HCL-32 | Checklist de Hipomania | Humor | 32 | 0–32 (corte 14) |
| PCL-5 | Checklist de TEPT (DSM-5) | Trauma | 20 | 0–80 (corte provisório 33) |
| ACE | Experiências Adversas na Infância | Trauma | 10 | 0–10 (dose-resposta; 4+) |

**Módulos de AH/SD (autorais):** itens originais fundamentados na literatura
brasileira de AH/SD (Delou; MEC/Virgolim; Fleith & Alencar), no modelo dos três
anéis de Renzulli e na teoria das sobre-excitabilidades de Dabrowski/Piechowski.
A leitura é **por perfil de forças** — não há nota de aprovação.

**Rastreios clínicos:** instrumentos validados e de uso livre para fins clínicos
e de pesquisa, apresentados em versão em português com as referências originais
citadas em cada teste.

## Histórico e painel de acompanhamento

Ao concluir um teste, um registro do **resultado agregado** (data/hora, instrumento,
identificação opcional, pontuações, faixas e subescalas — **sem as respostas
individuais**) é salvo:

- **Neste dispositivo** (localStorage) — sempre.
- **No registro central** (Supabase) — quando ativado (ver abaixo).

O painel fica em **`/painel-ahsd`** (URL discreta, fora da navegação e com
`noindex`): lista os registros com data e hora, detalhamento por subescala,
exportação CSV e, para o registro central, acesso protegido por senha.

### Ativando o registro central (opcional, ~3 minutos)

1. Crie um projeto gratuito em [supabase.com](https://supabase.com) (região São Paulo).
2. Abra o **SQL Editor** do projeto e rode o conteúdo de [`supabase/setup.sql`](supabase/setup.sql)
   — **troque a senha do painel** na linha indicada.
3. No Vercel (Settings → Environment Variables), defina:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://SEU-PROJETO.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = a *publishable/anon key* do projeto
4. Faça um novo deploy. Pronto: todos os dispositivos passam a registrar no banco
   central, e o painel `/painel-ahsd` mostra tudo mediante a senha.

Segurança: a chave pública (anon) só permite **inserir** resultados; a leitura é
bloqueada por RLS e só acontece por uma função do banco protegida pela senha do
painel.

## Guia educativo

A página **`/superdotacao`** explica, com referências, como rastreios online se
relacionam com testes de QI (WAIS, WISC, Raven), o que é exigido para um laudo de
AH/SD no Brasil (SATEPSI/CFP), os modelos de Renzulli e Gagné e os caminhos para
adultos (avaliação formal, ConBraSD, Mensa Brasil).

## Arquitetura

Cada instrumento é **orientado a dados**: uma definição declarativa (perguntas +
opções) e uma **função de pontuação pura** (`score(responses) => result`). Um
único motor de quiz renderiza qualquer instrumento e a página de resultados
mostra pontuação, faixa de interpretação, subescalas, observações e referências.

```
app/                 # Next.js App Router (home, /teste/[id], /sobre)
components/           # QuizRunner + ResultView (client)
lib/
  types.ts           # tipos do domínio
  scoring.ts         # helpers de pontuação (soma, reverso, faixas, subescalas)
  instruments/       # uma definição por instrumento + registry (index.ts)
  scoring.test.ts    # 31 testes unitários de pontuação (Vitest)
```

### Pontuação verificada

A lógica de pontuação de todos os instrumentos é coberta por testes automatizados
(cortes, itens reversos, algoritmos, marcas de rastreio, médias de perfil):

```bash
npm test          # roda os 31 testes de pontuação
```

## Desenvolvimento

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # build de produção
npm test          # testes de pontuação
```

Stack: **Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Vitest**.

## Deploy (Vercel)

O projeto é detectado automaticamente pela Vercel como app Next.js — não é
necessária configuração adicional.

1. Acesse https://vercel.com e faça login com a conta desejada.
2. **Add New → Project** e importe o repositório `ghcastellano/ahsd-tests`.
3. Framework preset: **Next.js** (detectado automaticamente). Build: `next build`.
   Sem variáveis de ambiente obrigatórias.
4. Defina o domínio do projeto (ex.: `ahsdtests.vercel.app`) em
   **Settings → Domains**.
5. Cada push para o branch conectado dispara um novo deploy.

## Aviso legal

Ferramenta educativa e de triagem. Não substitui avaliação, diagnóstico ou
tratamento profissional. Em caso de crise ou pensamentos de morte, procure ajuda
imediata — **CVV: 188** (24h, gratuito) — cvv.org.br.
