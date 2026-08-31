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
