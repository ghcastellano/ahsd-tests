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
| UPPS-P (curta) | Impulsividade em 5 facetas (Cyders 2014; Sediyama 2017) | TDAH | 20 | Média 1–4 por faceta, 12 invertidos |
| VADPRS | Vanderbilt para pais (Wolraich 2003; NICHQ) | TDAH | 55 | ≥6 sintomas por domínio + prejuízo; comorbidades ≥4/≥3/≥3 |
| Go/NoGo (tarefa) | Controle inibitório objetivo (`/treino/go-nogo`) | TDAH | 120 estímulos | % de comissão, omissões, TR médio, desvio e CV, d′ — faixas convencionais |
| Simulador de escalas (`/treino/simulador`) | Wechsler 130 → Stanford-Binet IV 132 → Cattell 148 (o mesmo percentil 98 em DP 15/16/24): compreensão verbal, memória operacional, velocidade, raciocínio | Treino | 3 blocos | Blocos fechados em sequência (precisão ≥70/75/80% com ≥50% por domínio + velocidade ≥22/24/26 pts); sem conversão para QI |
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

**Status visível da gravação.** Cada tela de resultado mostra se o registro
entrou no banco central ("✓ Gravado no registro central") ou o motivo da falha
(chave/RLS, tabela ausente, sem conexão) com o botão "Tentar de novo"
(`components/RegistroCentralStatus.tsx`). O painel testa a gravação ao abrir
via `GET /api/registro-central`: a sonda envia uma linha propositalmente
inválida e lê a resposta — 23514 (restrição de valores) significa que a
política RLS deixou passar e a gravação real funciona; 42501/401 significa
bloqueada. Nada é gravado pela sonda.

### Registro de acessos (IP)

Cada página aberta dispara `POST /api/visita` (componente `VisitaLogger` no
layout). A rota, no servidor, lê o IP e a localização aproximada dos cabeçalhos
que a Vercel carimba (`x-real-ip`, `x-vercel-ip-country/-region/-city`), o
navegador e o idioma, e grava na tabela `visitas` — o cliente só informa caminho
e página de origem, e um IP enviado no corpo é ignorado. Mesma regra de
segurança do registro central: a chave pública só insere; a leitura acontece
pela função `admin_listar_visitas`, protegida pela senha do painel, que lista
até 5.000 acessos com filtro por IP e exportação CSV.

Para ativar num projeto que ainda não tem a tabela, rode
[`supabase/visitas.sql`](supabase/visitas.sql) no SQL Editor (o `setup.sql`
já inclui o mesmo bloco para instalações novas). Endereço IP é dado pessoal
(LGPD): a finalidade registrada é segurança e auditoria de uso, a página
"Sobre" informa a coleta e o script traz o comando de limpeza para apagar
acessos com mais de 180 dias.

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
supabase/setup.sql   # schema + RLS do registro central (resultados + visitas)
supabase/visitas.sql # só a tabela de acessos, para projetos já existentes
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
| ASRS v1.1 (OMS) | Parte A, caixas sombreadas: itens 1–3 marcam com ≥"às vezes", 4–6 com ≥"frequentemente"; positivo ≥4 marcas. Parte B (complementar) com as caixas do checklist (9, 12, 16, 18 a partir de "às vezes"). Negativo NÃO exclui (sensibilidade 68,7%) | Kessler et al. 2005; checklist WHO/Harvard 2003 | padrão |
| ASRS-18 (ABDA) | ≥4 sintomas "frequentemente/muito frequentemente" por domínio (orientação da ABDA, sem corte validado em estudo); mostra também ≥5 (leitura numérica do DSM-5) e a leitura da OMS | Mattos et al. 2006 (adaptação transcultural); ABDA | padrão (regra da ABDA) |
| WURS-25 | soma 0–100; cortes 36 (sens. 96%) e 46 (sens. 86%, espec. 99%) | Ward, Wender & Reimherr 1993 | padrão |
| BIS-11 | soma 30–120 com 11 itens invertidos; <52 · 52–71 típica · ≥72 alta (faixas americanas); 3 fatores (8/11/11), lidos como indicativos — nas normas brasileiras só 2 fatores tiveram consistência aceitável | Patton et al. 1995; Stanford et al. 2009; Malloy-Diniz 2010 e 2015 | padrão |
| SNAP-IV | ≥6 itens "bastante/demais" por domínio (ABDA; 5 para 17+); comparação automática de cada domínio com os cortes por média (percentil 95 americano) para pais e para professores | Mattos et al. 2006; Costa et al. 2019 (validação BR); Bussing et al. 2008 | padrão |
| SWAN | média por domínio, −3..+3 (sinal ESPELHADO em relação ao formulário original, e o resultado avisa); destaque = domínio mais baixo | Swanson et al. 2012; Lakes et al. 2012 | convencional (sem corte validado no Brasil) |
| CFQ | soma 0–100; faixas por DP de uma referência aproximada (≈40 ± 13; as médias variam entre amostras) | Broadbent et al. 1982; de Paula et al. 2018 (versão BR validada); Bridger et al. 2013 | convencional (sem corte diagnóstico) |
| BSCS | soma 13–65 com 9 invertidos; positivo = baixo (≤31, −1 DP) | Tangney, Baumeister & Boone 2004 | convencional |
| UPPS-P (curta) | média 1–4 por faceta (maior = mais impulsivo); 12 itens invertidos; faixas 2 / 3 | Cyders et al. 2014; Sediyama et al. 2017 | convencional (dimensional, sem corte) |
| VADPRS | ≥6 de 9 sintomas "frequentemente/muito" por domínio E ≥1 item de desempenho problemático; TOD ≥4, conduta ≥3, ansiedade-depressão ≥3 | Wolraich et al. 2003; NICHQ | padrão |
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

**Revisão por comitê (set/2026).** Três revisores independentes — psicometria,
código e UX no navegador — auditaram os instrumentos de TDAH. Decisões
incorporadas: faixa negativa da ASRS reescrita como "não exclui" (sensibilidade
68,7%); Parte B com as caixas sombreadas do checklist; ASRS-ABDA sem afirmar
"atende ao critério A do DSM-5" e com a regra de 4 declarada como orientação da
ABDA; SNAP-IV comparando cada domínio ao seu corte, para pais e professores;
BIS-11 citando as normas brasileiras de 2015 e a cautela sobre as subescalas;
SWAN declarando o espelhamento do sinal; CFQ citando a versão brasileira
validada; `bandFor` devolvendo a faixa mais próxima (não a última) quando o
valor cai fora de todas; formatação numérica única nas três telas; barra do
resultado partindo do mínimo real da escala (BIS-11 = 30, BSCS = 13, DERS = 36);
e rótulo próprio do estado "negativo" nos instrumentos em que o positivo é a
pontuação baixa (BSCS, SWAN).

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
# simulador de escalas (semente fixa 12345: jogada perfeita nos 3 blocos e jogada fraca)
BASE_URL=http://localhost:3111 node scripts/e2e/verifica-simulador.mjs
# variação por semente: /teste-qi e os 4 treinos com ?seed=11 e ?seed=4242 —
# provas diferentes entre si e jogada perfeita com nota máxima em cada uma
BASE_URL=http://localhost:3111 node scripts/e2e/verifica-variacao.mjs
# dojo (treino ativo por exame): 4 exames × rodada de 10 itens com feedback, progresso e plano
BASE_URL=http://localhost:3111 node scripts/e2e/verifica-dojo.mjs
# revisão de erros no resultado (/teste-qi, bateria e simulador): erra de propósito e
# confere que a questão aparece com a alternativa marcada (vermelha) e a correta (verde)
BASE_URL=http://localhost:3111 node scripts/e2e/verifica-revisao.mjs
# registro de acessos (IP): site buildado apontando para um Supabase falso local
node scripts/e2e/supabase-falso.mjs 3222 &
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:3222 npm run build && npx next start -p 3111 &
node scripts/e2e/verifica-visitas.mjs   # 17 verificações: IP dos cabeçalhos, painel, filtro, CSV
```

### Dojo — treino ativo por exame (`/treino/dojo`)

Quatro exames — Mensa (admissão), Wechsler (WAIS-IV), Stanford-Binet 5 e
Cattell Culture Fair — cada um com a descrição factual do que é, como é
estruturado, o corte (percentil 98 e Triple Nine) e por que é difícil. Cada
exame tem de 4 a 8 domínios que imitam subtestes reais (matrizes, matrizes
avançadas, séries e classificação de figuras, condições/topologia, séries
numéricas, vocabulário/semelhanças/analogias, aritmética mental, absurdos
verbais, conhecimento, visuoespacial, memória de dígitos). Uma rodada tem 10
itens intercalados (ou só de um domínio); após cada resposta aparecem a regra,
"por que este tipo de item é difícil" e uma dica prática. O progresso por
domínio, os erros por regra e os dias de prática ficam no aparelho
(`lib/dojo/progresso.ts`) e alimentam o "plano de hoje" (domínio mais fraco,
regras erradas, sequência de dias). A tela inicial traz dez princípios de
prática inteligente e a explicação de qual teste é Mensa, o que são as outras
escalas, a Triple Nine Society e os testes de alto alcance (Mega, Titan,
Cooijmans) com a ressalva de validade. Bancos: `lib/dojo/bancos-texto.ts`;
gerador de condições verificado por amostragem de pontos:
`lib/dojo/condicoes.ts`.

### Auditoria de validade dos itens (setembro/2026)

Quatro revisores independentes (agentes) auditaram todos os bancos; tudo o
que segue foi corrigido e coberto por testes:

- **Velocidade (simulador):** o gabarito comparava a rotação bruta, mas
  círculo/quadrado/losango/cruz girados 90° se desenham iguais — ~19% dos
  trials dos blocos 2–3 tinham o gabarito invertido. Agora a igualdade é
  visual (`visualKey`) e o distrator "quase igual" é sempre visível.
- **Verbal:** 55 dos 60 itens tinham a resposta na 2ª alternativa e a tela
  não embaralhava. As alternativas são embaralhadas por semente; 6 itens
  ambíguos foram reescritos, 7 fáceis demais substituídos e 9 novos
  acrescentados (banco de 69).
- **Matrizes (/teste-qi):** em ~1/3 das sementes, quadrados latinos
  numéricos admitiam a leitura "terceira = |primeira − segunda|" com outra
  resposta (permutações agora rejeitadas); o tamanho desenhado dependia da
  quantidade (agora só de `size`); distratores dos itens difíceis eram
  cópias de células visíveis (agora n−1: violam exatamente uma regra);
  a estrela (período 72°) saiu das regras de rotação.
- **Matrizes avançadas:** "extrema" era o mesmo XOR de "difícil" com outro
  rótulo — entram dois tipos de teto (operação lógica sobre distribuição de
  dois; três componentes com quatro regras em eixos distintos); a
  distribuição de dois tinha layout fixo (agora 12 quadrados sorteados); os
  blocos do simulador escolhem por estrutura (`kind`), não por posição.
- **Classificação:** o mesmo conjunto aparecia com gabaritos opostos e havia
  segundas exclusões salientes (única curva, única linha); o pool passou a 4
  formas retas e simétricas, e um teste garante que toda partição 4-a-1
  aponta para a resposta.
- **Séries de figuras:** estrela em rotação (resposta a 9° do distrator) e
  ciclos ambíguos com 3 figuras — só o triângulo gira (com ponto de partida e
  sentido sorteados) e as regras cíclicas mostram 4 figuras.
- **Séries numéricas:** 40/40 gabaritos corretos; 8 séries extremas novas
  (banco de 48) e teste de regras alternativas.
- **Fatos:** o SB5 usa desvio-padrão 15 (16 é do SB-IV); "Cattell DP 24" é a
  escala III B; os cortes institucionais da Mensa são 130/132/148; os blocos
  do simulador passam a "entrada/intermediário/topo" com as escalas só como
  dificuldade-alvo; cortes de velocidade 22/24/26 e mínimo de 50% por
  domínio; dígitos 0–9 na memória. Fontes: mensa.org.br (FAQ de testes),
  triplenine.org (tests and scores), manuais WAIS-IV/SB5, Wikipedia (Cattell
  Culture Fair; Mega Test).

**Alternativas visualmente distintas.** `lib/battery/visual-key.ts` define a
chave visual de uma célula (um círculo girado 45° é o mesmo círculo; uma barra
"preenchida" é a mesma barra; cinco elementos se desenham como quatro). Os
geradores deduplicam alternativas por essa chave, e `lib/battery/visual.test.ts`
renderiza cada opção com o próprio `CellSvg` em 14 sementes para garantir que
nenhuma prova ofereça duas figuras iguais — foi assim que apareceu (e se
corrigiu) a "bola duplicada" dos itens de distribuição de dois.

**Revisão de erros.** Ao final de `/teste-qi`, de cada treino da bateria e do
simulador, cada item errado abre com a questão como foi apresentada, a
alternativa marcada em vermelho, a correta em verde e a descrição da regra
(`components/RevisaoItem.tsx`; no `/teste-qi`, `describeRules` do motor).

**Banco de questões e variação por tentativa.** Nenhuma prova cronometrada é
fixa. Cada abertura de `/teste-qi`, de um treino da bateria ou do simulador
sorteia uma semente (`lib/use-seed.ts`; `?seed=N` fixa uma para os testes
automatizados) e gera a prova a partir dela: as matrizes, séries de figuras e
classificações variam valores, formas e ordem das alternativas mantendo a mesma
estrutura de regras e dificuldade; as séries numéricas sorteiam 20 de um banco
de 40 (6 médias, 12 difíceis, 2 extremas); o simulador sorteia 8 itens verbais
por bloco de um banco de 20 por nível, além de sequências de memória, símbolos
e matrizes próprios da semente. Os testes unitários (`battery.test.ts`,
`engine.test.ts`, `simulador.test.ts`) garantem que sementes diferentes dão
provas diferentes com a mesma distribuição de dificuldade.
