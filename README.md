# Rastreio AH/SD e Neurodivergências

Plataforma web de **triagem (rastreio)** de Altas Habilidades/Superdotação (AH/SD)
e de condições que frequentemente coocorrem (dupla excepcionalidade), com
**questionários completos, correção automática, pontuação e detalhamento** dos
resultados — para autoavaliação e para aplicação por profissionais e familiares.

Construída do zero, com lógica de pontuação verificada por testes automatizados.
Os resultados são calculados no navegador; ao concluir um teste, um registro do
**resultado agregado** (data/hora, identificação opcional, pontuações, faixas e
subescalas — sem as respostas de cada questão) é salvo no dispositivo e, quando o
registro central estiver ativado, também no banco da plataforma.

> ⚠️ **Não é diagnóstico.** Todos os instrumentos são de rastreio e orientação
> inicial. A identificação formal de AH/SD ou de qualquer condição exige
> avaliação multidimensional por profissionais qualificados.

## Instrumentos incluídos

| Sigla | Instrumento | Área | Itens | Pontuação |
|-------|-------------|------|------:|-----------|
| AH/SD | Indicadores de Altas Habilidades/Superdotação *(autoral)* | Altas Habilidades | 34 | Perfil por área (média 1–5) |
| SE/OE | Sobre-excitabilidades de Dabrowski *(autoral)* | Altas Habilidades | 35 | Perfil das 5 dimensões |
| PERF-AHSD | Perfeccionismo e Autocrítica *(autoral)* | Altas Habilidades | 20 | Padrões elevados + 3 dimensões de custo |
| IMP-AHSD | Impostor e Autossabotagem *(autoral)* | Altas Habilidades | 16 | Perfil de 4 dimensões |
| SENSORIAL | Sensibilidade e Processamento Sensorial *(autoral)* | Altas Habilidades | 24 | Perfil de 6 dimensões |
| 5F-AHSD | Personalidade — Cinco Grandes Fatores *(autoral)* | Altas Habilidades | 30 | Perfil dimensional, sem corte |
| BE-AHSD | Bem-estar e Contexto em AH/SD *(autoral)* | Altas Habilidades | 20 | Recursos em 5 dimensões |
| ASRS v1.1 | Autorrelato de TDAH no adulto (OMS) | TDAH | 18 | Marcas da Parte A (≥4 = positivo) |
| ASRS-18 (ABDA) | Tradução brasileira de Mattos et al. 2006, regra da ABDA | TDAH | 18 | Sintomas frequentes por domínio (≥4 ABDA / ≥5 DSM-5) |
| WURS-25 | Infância retrospectiva (Ward 1993) | TDAH | 25 | Total 0–100 (cortes 36 e 46) |
| BIS-11 | Impulsividade de Barratt (Patton 1995; Malloy-Diniz 2010) | TDAH | 30 | Total 30–120 (52–71 típica, ≥72 alta) |
| SNAP-IV | Pais/professores, crianças e adolescentes (Mattos 2006, ABDA) | TDAH | 18 | Sintomas 'bastante/demais' por domínio (≥6) |
| SWAN | Forças e fraquezas, espectro -3..+3 (Swanson) | TDAH | 18 | Média do domínio mais baixo |
| CFQ | Falhas cognitivas cotidianas (Broadbent 1982) | TDAH | 25 | Total 0–100 (faixas por DP populacional) |
| BSCS | Autocontrole breve (Tangney 2004) | TDAH | 13 | Total 13–65, 9 invertidos (baixo = positivo) |
| AQ-50 | Quociente do Espectro Autista | Autismo | 50 | 0–50 (corte 32; 26 sensível) |
| RAADS-R | Escala de Ritvo revisada (adultos) | Autismo | 80 | 0–240 (corte 65; 17 itens reversos) |
| PHQ-9 | Saúde do Paciente – Depressão | Humor | 9 | 0–27 (5/10/15/20) |
| GAD-7 | Ansiedade Generalizada | Ansiedade | 7 | 0–21 (corte 10) |
| MDQ | Transtornos do Humor (bipolar) | Humor | 15 | Algoritmo de 3 critérios |
| HCL-32 | Checklist de Hipomania | Humor | 32 | 0–32 (corte 14) |
| PCL-5 | Checklist de TEPT (DSM-5) | Trauma | 20 | 0–80 (corte provisório 33) |
| ACE | Experiências Adversas na Infância | Trauma | 10 | 0–10 (dose-resposta; 4+) |
| DERS | Dificuldades de Regulação Emocional | Reg. emocional | 36 | 36–180 (6 subescalas; 11 itens reversos; referência normativa) |

**Módulos de AH/SD (autorais):** itens originais fundamentados na literatura
brasileira de AH/SD (Delou; MEC/Virgolim; Fleith & Alencar), no modelo dos três
anéis de Renzulli e na teoria das sobre-excitabilidades de Dabrowski/Piechowski.
Os módulos complementares acrescentam contexto de perfeccionismo, fenômeno do
impostor, sensibilidade sensorial, personalidade e bem-estar. Eles não reproduzem
escalas proprietárias ou instrumentos psicológicos privativos; a leitura é
**descritiva e por perfil** — não há nota de aprovação nem diagnóstico.

**Rastreios clínicos:** instrumentos validados e de uso livre para fins clínicos
e de pesquisa, apresentados em versão em português com as referências originais
citadas em cada teste.

## Histórico e painel de acompanhamento

Ao concluir um teste, um registro do **resultado agregado** (data/hora, instrumento,
identificação opcional, pontuações, faixas e subescalas — **sem as respostas
individuais**) é salvo:

- **Neste dispositivo** (localStorage) — sempre.
- **No registro central** (Supabase) — **ativo**, em projeto dedicado.

O painel fica em **`/painel-ahsd`** (URL discreta, fora da navegação e com
`noindex`): lista os registros com data e hora, detalhamento por subescala,
exportação CSV e, para o registro central, acesso protegido por senha.

### Receber resultados de outras pessoas — sem servidor (já ativo)

Toda tela de resultado tem o bloco **"Enviar este resultado ao avaliador"**: um
link que carrega o resultado dentro do próprio endereço (no fragmento `#`, que
**não passa por nenhum servidor**). A pessoa envia por WhatsApp/e-mail; quem
abre o link vê um cartão de confirmação e o resultado entra no painel do
aparelho de quem abriu, com deduplicação por id. O painel também aceita colar
links/códigos manualmente ("Importar resultado(s) por código"). A decodificação
valida estritamente o formato (whitelist de campos, limites de tamanho) — links
corrompidos ou forjados fora do formato são rejeitados.

### Registro central (ativo)

Todo teste concluído, em qualquer aparelho, grava automaticamente no banco
central; o painel `/painel-ahsd` lista os registros (até os 2.000 mais recentes)
mediante a senha, e também sincroniza para lá os registros locais do aparelho ao
ser aberto. O schema vive em [`supabase/setup.sql`](supabase/setup.sql).

**Segurança do desenho:**

- A chave pública (publishable/anon) só permite **INSERIR** — não lê, não
  atualiza, não apaga. Por isso a gravação usa `INSERT` simples: o modo *upsert*
  do PostgREST exigiria política de `UPDATE`, o que deixaria qualquer visitante
  sobrescrever resultados alheios.
- A idempotência vem de `UNIQUE(client_id)`: reenviar o mesmo registro devolve
  **409**, que o cliente trata como "já sincronizado".
- A leitura só acontece pela função `admin_listar_resultados`, que valida a senha
  do painel contra um hash **bcrypt**. A função é pública — a proteção é a senha,
  então use uma senha longa e única.
- `created_at` é carimbado pelo servidor: o cliente não envia data.

**Apontar para outro projeto** (sem alterar código): defina no Vercel
`NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, rode o
`setup.sql` no projeto novo, defina a senha e faça um novo deploy.

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
app/                 # Next.js App Router (home, /teste/[id], /sobre,
                     #   /superdotacao, /painel-ahsd)
components/          # QuizRunner + ResultView + AdminPanel (client)
lib/
  types.ts           # tipos do domínio
  scoring.ts         # helpers de pontuação (soma, reverso, faixas, subescalas)
  history.ts         # registro de resultados (local + central) e exportação CSV
  remote-config.ts   # ativação do registro central (variáveis NEXT_PUBLIC_*)
  instruments/       # uma definição por instrumento + registry (index.ts)
  scoring.test.ts    # testes unitários de pontuação (Vitest)
  history.test.ts    # testes do registro/CSV
supabase/setup.sql   # schema + RLS do registro central
```

### Pontuação verificada

A lógica de pontuação de todos os instrumentos é coberta por testes automatizados
(cortes, itens reversos, algoritmos, marcas de rastreio, médias de perfil):

```bash
npm test          # roda a suíte automatizada
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

## Pontuação padrão por instrumento — fonte e regra

Cada resultado é calculado pela regra publicada na fonte citada. Onde não existe
ponto de corte oficial, as faixas são **convencionais** (derivadas de médias e
desvios-padrão populacionais) e o próprio resultado diz isso. Os módulos autorais
de AH/SD não reproduzem nenhuma escala comercial e não têm norma externa.

| Instrumento | Regra implementada | Fonte da regra | Status |
|---|---|---|---|
| PHQ-9 | 0–4 mínimo · 5–9 leve · 10–14 moderado · 15–19 mod. grave · 20–27 grave; item 9 dispara alerta | Kroenke, Spitzer & Williams 2001 | padrão |
| GAD-7 | 0–4 · 5–9 · 10–14 · 15–21; positivo ≥10 | Spitzer et al. 2006 | padrão |
| ASRS v1.1 (OMS) | Parte A, caixas sombreadas: itens 1–3 marcam com ≥"às vezes", 4–6 com ≥"frequentemente"; positivo ≥4 marcas | Kessler et al. 2005 (WHO) | padrão |
| ASRS-18 (ABDA) | ≥4 sintomas "frequentemente/muito frequentemente" por domínio (ABDA); mostra também ≥5 (DSM-5) e a leitura da OMS | Mattos et al. 2006; ABDA | padrão |
| WURS-25 | soma 0–100; cortes 36 (sens. 96%) e 46 (sens. 86%, espec. 99%) | Ward, Wender & Reimherr 1993 | padrão |
| BIS-11 | soma 30–120 com 11 itens invertidos; <52 · 52–71 típica · ≥72 alta; 3 fatores (8/11/11) | Patton et al. 1995; Stanford et al. 2009; Malloy-Diniz 2010 | padrão |
| SNAP-IV | ≥6 itens "bastante/demais" por domínio (ABDA); cortes MTA por média como referência | Mattos et al. 2006; Swanson et al. 2001 | padrão |
| SWAN | média por domínio, −3..+3; destaque = domínio mais baixo | Swanson et al. 2012 | convencional (sem corte validado no Brasil) |
| CFQ | soma 0–100; faixas por DP da média populacional (≈40 ± 13) | Broadbent et al. 1982; Bridger et al. 2013 | convencional (sem corte diagnóstico) |
| BSCS | soma 13–65 com 9 invertidos; positivo = baixo (≤31, −1 DP) | Tangney, Baumeister & Boone 2004 | convencional |
| AQ-50 | soma 0–50 por direção do item; ≥32 clínico, 26–31 intermediário | Baron-Cohen et al. 2001; Woodbury-Smith et al. 2005 | padrão |
| RAADS-R | soma 0–240 com 17 itens normativos invertidos; positivo ≥65 | Ritvo et al. 2011 | padrão |
| MDQ | positivo = ≥7 sintomas E mesmo período E problema moderado/grave | Hirschfeld et al. 2000 | padrão |
| HCL-32 | positivo ≥14 | Angst et al. 2005 | padrão |
| PCL-5 | soma 0–80; TEPT provável ≥33; leitura por cluster DSM-5 | Weathers et al. 2013 | padrão |
| ACE | soma de "sim" 0–10; ≥4 exposição elevada | Felitti et al. 1998 | padrão |
| DERS-36 | soma 36–180 com 11 invertidos; faixas em ≈ média (80) e ≈ +1 DP (100) de amostras comunitárias | Gratz & Roemer 2004 | convencional |
| AH/SD (indicadores) | média 1–5 por área e índice geral; faixas 3,0 / 3,7 / 4,3 | Delou; Virgolim/MEC; Renzulli | autoral |
| Sobre-excitabilidades | perfil por média nas 5 áreas, sem corte | Dabrowski; Piechowski | autoral |
| PERF / IMP / SENSORIAL / 5F / BE (AHSD) | perfil por média 1–5, faixas 2,5 / 3,5 / 4,2 | literatura citada em cada módulo | autoral, sem norma |

**Como isso é testado.** `lib/instruments/todos.test.ts` percorre todos os
instrumentos registrados (qualquer instrumento novo entra sozinho) e verifica:
faixas contíguas e sem sobreposição; extremos de resposta dentro de uma faixa e
≤ `maxScore`; correção sem quebrar com respostas incompletas; "positivo"
coerente com a gravidade da faixa; ids únicos; referência e rótulo presentes.
`lib/scoring.test.ts` fixa os pontos de corte de cada instrumento e as listas
de itens invertidos. Por fim, `scripts/e2e/` traz um roteiro Playwright que responde cada
instrumento no navegador em três padrões (mínimo, máximo e meio) e confere que o
número e a faixa exibidos são os que a função pura calcula:

```bash
npm run build && npx next start -p 3111 &
npx vitest run scripts/e2e && BASE_URL=http://localhost:3111 node scripts/e2e/verifica-todos.mjs
```
