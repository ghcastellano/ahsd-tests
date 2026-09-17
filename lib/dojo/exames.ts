import type { DominioDojo, ExameDojo, ItemDojo, ItemTexto } from "./tipos";
import { mulberry32 } from "../battery/rng";
import { advancedMatrixItems } from "../battery/advanced-matrices";
import { figureSeriesItems } from "../battery/figure-series";
import { classificationItems } from "../battery/classification";
import { numericSeriesItems } from "../battery/numeric-series";
import { itemsForSeed, optionsFor, describeRules } from "../matrix/engine";
import { bancoVerbal } from "../simulador/verbal";
import { gerarItensMemoria } from "../simulador/memoria";
import { ARITMETICA, ABSURDOS, CONHECIMENTO, ESPACIAL } from "./bancos-texto";
import { gerarCondicoes } from "./condicoes";
import type { Item } from "../battery/types";

// ---------------------------------------------------------------------------
// Utilidades de sorteio
// ---------------------------------------------------------------------------

function amostra<T>(lista: T[], n: number, rand: () => number): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, Math.min(n, a.length));
}

/** Embaralha as alternativas de um item de texto (evita viés de posição). */
export function embaralharTexto(it: ItemTexto, rand: () => number): ItemTexto {
  const idx = it.opcoes.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { ...it, opcoes: idx.map((i) => it.opcoes[i]), resposta: idx.indexOf(it.resposta) };
}

const figural = (dominio: string, itens: Item[]): ItemDojo[] => itens.map((item) => ({ tipo: "figural", dominio, item }));
const texto = (dominio: string, itens: ItemTexto[], rand: () => number): ItemDojo[] => itens.map((item) => ({ tipo: "texto", dominio, item: embaralharTexto(item, rand) }));

// ---------------------------------------------------------------------------
// Domínios (cada um imita um subteste real e explica por que é difícil)
// ---------------------------------------------------------------------------

const matrizesBase: DominioDojo = {
  id: "matrizes",
  nome: "Matrizes progressivas",
  subtesteReal: "Raven APM / testes de admissão da Mensa / WAIS-IV Raciocínio Matricial",
  porQueDificil: "Cada matriz esconde de 1 a 3 regras em atributos diferentes (forma, preenchimento, rotação, tamanho, quantidade) ao mesmo tempo. O erro típico é fechar a primeira regra que aparece e parar. O item só está resolvido quando TODAS as regras batem na célula escolhida.",
  dica: "Leia a matriz por atributo, não por célula: primeiro só a forma (varia por linha? por coluna? quadrado latino?), depois só o preenchimento, e assim por diante. Elimine alternativas que violam qualquer regra já descoberta.",
  gerar: (seed, n) => {
    const rand = mulberry32(seed * 13 + 1);
    const its = itemsForSeed(seed).filter((it) => it.tier !== "facil");
    return amostra(its, n, rand).map((item) => {
      const { options, answerIndex } = optionsFor(item, seed);
      return { tipo: "matriz", dominio: "matrizes", item, options, answerIndex, regras: describeRules(item) };
    });
  },
};

const matrizesAvancadas: DominioDojo = {
  id: "matrizes-avancadas",
  nome: "Matrizes avançadas (regras múltiplas)",
  subtesteReal: "Raven APM Set II, itens finais / nível Mensa e além",
  porQueDificil: "Distribuição de três em dois atributos, operações lógicas (união, interseção, exclusiva) entre elementos e componentes sem pista visual de separação. A carga é de memória de trabalho: você precisa manter três células e o valor AUSENTE na cabeça ao mesmo tempo.",
  dica: "Nomeie a regra antes de olhar as alternativas (\"é XOR: fica o que aparece em só uma das duas\"). Distratores aqui satisfazem parte das regras de propósito — a resposta é a única que satisfaz todas.",
  gerar: (seed, n) => {
    const rand = mulberry32(seed * 17 + 2);
    return figural("matrizes-avancadas", amostra(advancedMatrixItems(seed).filter((i) => i.difficulty !== "media"), n, rand));
  },
};

const seriesFiguras: DominioDojo = {
  id: "series-figuras",
  nome: "Séries de figuras",
  subtesteReal: "Cattell Culture Fair — subteste 1 (Séries)",
  porQueDificil: "É um teste de velocidade: cerca de 14 segundos por item. A dificuldade não é a regra em si, mas reconhecê-la de imediato e não travar.",
  dica: "Olhe só o que MUDA de uma figura para a seguinte (gira? cresce? soma um?). Se em 10 segundos não viu, pule e volte: cada item vale o mesmo.",
  gerar: (seed, n) => figural("series-figuras", amostra(figureSeriesItems(seed), n, mulberry32(seed * 19 + 3))),
};

const classificacao: DominioDojo = {
  id: "classificacao",
  nome: "Classificação (qual não pertence)",
  subtesteReal: "Cattell Culture Fair — subteste 2 (Classificação)",
  porQueDificil: "A propriedade compartilhada raramente é a mais visível. Quatro figuras podem diferir em tudo e ter em comum algo abstrato: simetria, presença de curva, quantidade.",
  dica: "Procure o que as QUATRO têm em comum antes de procurar a diferente. Liste atributos candidatos: forma, linhas retas/curvas, preenchimento, quantidade, simetria.",
  gerar: (seed, n) => figural("classificacao", amostra(classificationItems(seed), n, mulberry32(seed * 23 + 4))),
};

const condicoes: DominioDojo = {
  id: "condicoes",
  nome: "Condições (topologia)",
  subtesteReal: "Cattell Culture Fair — subteste 4 (Condições)",
  porQueDificil: "Exige raciocinar sobre regiões, não sobre formas: existe um ponto que está dentro de X e fora de Y? A intuição visual engana quando as figuras se sobrepõem parcialmente.",
  dica: "Traduza a condição em uma região: \"dentro do círculo e fora do quadrado\" = a parte do círculo que não está coberta pelo quadrado. Depois pergunte, figura a figura, se essa região existe.",
  gerar: (seed, n) => gerarCondicoes(seed, n).map((item) => ({ tipo: "condicao", dominio: "condicoes", item })),
};

const seriesNumericas: DominioDojo = {
  id: "series-numericas",
  nome: "Séries numéricas",
  subtesteReal: "SB5 Raciocínio Quantitativo / testes de aptidão",
  porQueDificil: "As séries difíceis intercalam duas sequências, usam diferenças de segunda ordem ou recursões (cada termo depende dos dois anteriores). A regra óbvia costuma ser a errada.",
  dica: "Calcule as diferenças entre vizinhos. Sem padrão? Teste posições ímpares e pares como séries separadas. Ainda nada? Teste razão (divisão) e soma dos dois anteriores.",
  gerar: (seed, n) => figural("series-numericas", amostra(numericSeriesItems(seed).filter((i) => i.difficulty !== "media"), n, mulberry32(seed * 29 + 5))),
};

const verbal = (nivel: 1 | 2 | 3, id: string, nome: string): DominioDojo => ({
  id,
  nome,
  subtesteReal: "WAIS-IV Vocabulário e Semelhanças / SB5 Conhecimento e Raciocínio Fluido Verbal",
  porQueDificil: "Vocabulário mede inteligência cristalizada: exposição acumulada a palavras raras. Semelhanças e analogias exigem achar a categoria superordenada ou a relação abstrata, e não uma associação superficial.",
  dica: "Nas semelhanças, responda com a categoria mais alta que ainda seja verdadeira (\"ambos são representações\", não \"ambos têm números\"). Nas analogias, verbalize a relação do primeiro par antes de olhar as opções.",
  gerar: (seed, n) => {
    const rand = mulberry32(seed * 31 + nivel * 7);
    return texto(id, amostra(bancoVerbal(nivel), n, rand).map((q) => ({ id: q.id, enunciado: q.enunciado, opcoes: q.opcoes, resposta: q.resposta, explicacao: q.explicacao })), rand);
  },
});

const aritmetica: DominioDojo = {
  id: "aritmetica",
  nome: "Aritmética mental",
  subtesteReal: "WAIS-IV Aritmética / SB5 Raciocínio Quantitativo",
  porQueDificil: "No teste real, o problema é lido em voz alta, sem papel, com tempo. A carga é de memória de trabalho: guardar os dados enquanto planeja as operações. Os erros vêm de responder o número intermediário, não o pedido.",
  dica: "Antes de calcular, repita mentalmente O QUE está sendo pedido. Depois monte o caminho (duas operações, no máximo três) e só então execute.",
  gerar: (seed, n) => { const rand = mulberry32(seed * 37 + 6); return texto("aritmetica", amostra(ARITMETICA, n, rand), rand); },
};

const absurdos: DominioDojo = {
  id: "absurdos",
  nome: "Absurdos verbais",
  subtesteReal: "SB5 Raciocínio Fluido — Absurdos Verbais",
  porQueDificil: "A frase parece normal; o absurdo é uma contradição lógica ou uma inversão de meio e fim, não um erro factual. Exige ler como um lógico, não como um leitor.",
  dica: "Pergunte: o que esta frase PRESSUPÕE? Se a ação anula o próprio objetivo, ou se duas partes não podem ser verdadeiras juntas, achou.",
  gerar: (seed, n) => { const rand = mulberry32(seed * 41 + 7); return texto("absurdos", amostra(ABSURDOS, n, rand), rand); },
};

const conhecimento: DominioDojo = {
  id: "conhecimento",
  nome: "Informação (conhecimento geral)",
  subtesteReal: "WAIS-IV Informação / SB5 Conhecimento",
  porQueDificil: "Mede a base de conhecimento acumulada (inteligência cristalizada). Não tem truque: o que você não sabe, não deduz. É o domínio que mais responde a leitura ao longo dos anos.",
  dica: "Não decore listas. Leia sobre ciência, geografia e história com curiosidade e volte ao que errou: cada erro aqui é um buraco específico e fechável.",
  gerar: (seed, n) => { const rand = mulberry32(seed * 43 + 8); return texto("conhecimento", amostra(CONHECIMENTO, n, rand), rand); },
};

const espacial: DominioDojo = {
  id: "espacial",
  nome: "Visuoespacial",
  subtesteReal: "SB5 Processamento Visuoespacial (posição e direção)",
  porQueDificil: "Exige manipular mentalmente rotações, dobras e direções sem apoio visual. A intuição verbal atrapalha: 'direita' depende de para onde você está virado.",
  dica: "Imagine-se DENTRO da cena (vire o corpo, não o mapa). Para dobras e cortes, conte camadas; para relógios, lembre que o ponteiro das horas anda meio caminho a cada meia hora.",
  gerar: (seed, n) => { const rand = mulberry32(seed * 47 + 9); return texto("espacial", amostra(ESPACIAL, n, rand), rand); },
};

const memoria = (nivel: 1 | 2 | 3, id: string): DominioDojo => ({
  id,
  nome: "Memória operacional (dígitos e letras)",
  subtesteReal: "WAIS-IV Dígitos (ordem direta, inversa e sequenciamento) / SB5 Memória Operacional",
  porQueDificil: "A ordem inversa e o sequenciamento exigem guardar E transformar a sequência ao mesmo tempo. A amplitude adulta típica é 7±2 na ordem direta e 5±2 na inversa; o percentil 98 fica acima disso.",
  dica: "Agrupe em blocos de 2–3 (\"47-92-6\", não \"4-7-9-2-6\"). Na inversa, visualize os dígitos escritos numa linha e leia de trás para a frente. No sequenciamento, separe primeiro números de letras.",
  gerar: (seed, n) => gerarItensMemoria(nivel, seed + nivel * 1000).slice(0, n).map((item) => ({ tipo: "memoria", dominio: id, item })),
});

// ---------------------------------------------------------------------------
// Exames
// ---------------------------------------------------------------------------

export const EXAMES: ExameDojo[] = [
  {
    id: "mensa",
    nome: "Mensa (teste de admissão)",
    sigla: "MENSA",
    oQueE: "A Mensa não é um teste: é uma sociedade que admite quem está no percentil 98 (2% superior) em um teste de inteligência supervisionado. No Brasil, a Mensa aplica testes psicométricos \"culture fair\" (independentes de língua e conhecimento), sorteados no dia, com até 60 minutos, e informa apenas aprovado/reprovado — o percentil, só a pedido. Também aceita laudo de psicólogo com WAIS-III, WISC-IV, WASI, SON-R ou Matrizes Progressivas de Raven (a lista e os prazos mudam; confirme no site oficial). Pode-se refazer após 1 ano, no máximo três vezes. Em outros países os testes variam: Mensa UK usa o Cattell III B e o Culture Fair; a americana usa o Wonderlic e o RAIT.",
    estrutura: [
      "Teste não verbal, em geral no formato de matrizes ou de séries/classificação de figuras (estilo Raven APM ou Cattell Culture Fair).",
      "Aplicação coletiva, presencial, cronometrada, sem calculadora ou consulta.",
      "Critério: percentil 98. Equivale a QI 130 nas escalas de desvio-padrão 15 (Wechsler, SB5), 132 na de DP 16 (SB-IV) e 148 na de DP 24 (Cattell).",
    ],
    corte: "Percentil 98: 130 (DP 15) · 132 (DP 16) · 148 (DP 24)",
    porQueDificil: [
      "Os itens finais combinam várias regras em atributos diferentes, sem pista de separação.",
      "O tempo é curto para o número de itens: gestão de tempo é parte do teste.",
      "Os distratores são construídos para satisfazer parte das regras — o erro por 'quase certo' é o mais comum.",
    ],
    dominios: [matrizesBase, matrizesAvancadas, seriesFiguras, classificacao],
    dicas: [
      "Treine o formato até ele ficar automático: metade do ganho em matrizes vem de familiaridade, e é um ganho real no dia.",
      "Faça sessões cronometradas curtas (10 itens em 8 minutos) em vez de sessões longas sem relógio.",
      "Mantenha um caderno de erros por REGRA (não por item): 'confundi XOR com OR', 'não vi a regra de quantidade'. Reveja-o antes de cada sessão.",
      "Na semana do teste: uma sessão completa em condições reais (silêncio, cronômetro, sem pausa) e depois descanso. Sono pesa mais que a última hora de treino.",
    ],
  },
  {
    id: "wechsler",
    nome: "Wechsler (WAIS-IV)",
    sigla: "WAIS",
    oQueE: "A Escala Wechsler de Inteligência para Adultos é a escala clínica mais usada no mundo, aplicada individualmente por psicólogo em cerca de 90 minutos. Não é o teste da Mensa — mas a Mensa Brasil aceita o laudo (WAIS-III). Produz um QI total (média 100, desvio-padrão 15) e quatro índices: Compreensão Verbal, Raciocínio Perceptual, Memória Operacional e Velocidade de Processamento.",
    estrutura: [
      "Compreensão Verbal: Semelhanças e Vocabulário (respostas abertas, pontuadas 0/1/2) e Informação (0/1).",
      "Raciocínio Perceptual: Cubos, Raciocínio Matricial, Quebra-cabeças Visuais.",
      "Memória Operacional: Dígitos (direta, inversa, sequenciamento) e Aritmética (problemas ouvidos, sem papel).",
      "Velocidade de Processamento: Procura de Símbolos e Códigos (2 minutos cada).",
    ],
    corte: "Percentil 98 = QI 130 · Triple Nine (99,9%) = 146",
    porQueDificil: [
      "Os subtestes verbais são de produção livre: não basta reconhecer, é preciso formular a categoria exata (resposta de 2 pontos).",
      "Aritmética e Dígitos sobrecarregam a memória de trabalho: nada é escrito.",
      "Velocidade de processamento pune hesitação: 2 minutos de decisões binárias em sequência.",
    ],
    dominios: [verbal(2, "verbal-wais", "Semelhanças, vocabulário e analogias"), matrizesBase, aritmetica, conhecimento, memoria(2, "memoria-wais")],
    dicas: [
      "Nos verbais, treine formular a resposta de 2 pontos em voz alta: a categoria mais abstrata que ainda é verdadeira.",
      "Aritmética: pratique ouvindo problemas (peça a alguém para ler) e respondendo sem papel — é outra habilidade.",
      "Dígitos: 5 minutos por dia de sequências crescentes; pare quando errar duas seguidas e anote a amplitude.",
      "Velocidade: treine no simulador em blocos de 60 s, priorizando ZERO erros antes de acelerar.",
    ],
  },
  {
    id: "stanford-binet",
    nome: "Stanford-Binet (SB5)",
    sigla: "SB5",
    oQueE: "A quinta edição da escala Stanford-Binet (2003) mede cinco fatores, cada um nas versões verbal e não verbal: Raciocínio Fluido, Conhecimento, Raciocínio Quantitativo, Processamento Visuoespacial e Memória Operacional. A aplicação é individual e adaptativa (começa por itens de rota e sobe até o teto). O SB5 usa desvio-padrão 15, como o Wechsler; foi a quarta edição (SB-IV) que usava 16 — por isso tabelas antigas trazem 132 ou 133 para o percentil 98.",
    estrutura: [
      "Raciocínio Fluido: matrizes e séries (não verbal); absurdos verbais e analogias (verbal).",
      "Conhecimento: absurdos em figuras (não verbal); vocabulário (verbal).",
      "Raciocínio Quantitativo: séries numéricas e problemas (nos dois formatos).",
      "Processamento Visuoespacial: tabuleiro de formas e posição/direção.",
      "Memória Operacional: memória de blocos (não verbal); última palavra de frases (verbal).",
    ],
    corte: "Percentil 98 = 130 (DP 15; na SB-IV, 132) · Triple Nine = 146 (SB5) ou 149 (SB-IV)",
    porQueDificil: [
      "A aplicação adaptativa leva você até o teto: você sempre termina em itens que não consegue.",
      "Cinco fatores em dois formatos: pontos fracos aparecem, não dá para compensar tudo com raciocínio fluido.",
      "Absurdos verbais e quantitativos exigem leitura crítica, não só velocidade.",
    ],
    dominios: [seriesFiguras, matrizesBase, absurdos, seriesNumericas, aritmetica, espacial, conhecimento, memoria(2, "memoria-sb5")],
    dicas: [
      "Alterne domínios na mesma sessão (raciocínio fluido, depois quantitativo, depois memória): a prática intercalada transfere mais que blocos longos de um só tipo.",
      "Quantitativo: treine explicar a regra em uma frase antes de responder — se não consegue verbalizar, é chute.",
      "Visuoespacial: pratique com objetos reais (dobre papel, gire uma caneca) até a imagem mental ficar estável.",
    ],
  },
  {
    id: "cattell",
    nome: "Cattell Culture Fair (CFIT, escala 3)",
    sigla: "CFIT",
    oQueE: "O Teste de Inteligência Livre de Influência Cultural, de Raymond Cattell, é um teste não verbal em quatro subtestes curtos e cronometrados, criado para medir inteligência fluida sem depender de língua ou escolaridade. A escala 3 é a de adultos e é usada por várias Mensas nacionais (a britânica, por exemplo). A escala Cattell original tem desvio-padrão 24 (por isso 'QI 148' = percentil 98 e 'QI 173' = Triple Nine); versões modernas também publicam normas em DP 16.",
    estrutura: [
      "Séries (13 itens, 3 min): qual figura continua a sequência.",
      "Classificação (14 itens, 4 min): qual figura não pertence ao grupo (na escala 3, duas figuras).",
      "Matrizes (13 itens, 3 min): qual figura completa a matriz.",
      "Condições/Topologia (10 itens, 2,5 min): em qual figura um ponto pode ficar na mesma relação com as formas.",
    ],
    corte: "Percentil 98 = 132 (DP 16 do CFIT) · na escala Cattell III B (DP 24): 148 · Triple Nine = 149 (DP 16) / 173 (DP 24)",
    porQueDificil: [
      "É o mais rápido dos quatro: cerca de 14 segundos por item. Quem delibera não termina.",
      "Os quatro subtestes pedem operações mentais diferentes; o de condições (topologia) é pouco familiar para quase todo mundo.",
      "Os itens são simples na aparência e sutis no critério: a propriedade certa raramente é a mais visível.",
    ],
    dominios: [seriesFiguras, classificacao, matrizesAvancadas, condicoes],
    dicas: [
      "Treine com cronômetro sempre: no CFIT, a velocidade É a medida.",
      "Condições: pratique a tradução 'condição → região' até ficar automática; é o subteste em que a familiaridade mais rende.",
      "Faça os quatro subtestes em sequência, como no teste, pelo menos uma vez por semana.",
    ],
  },
];

export function exame(id: string): ExameDojo | undefined {
  return EXAMES.find((e) => e.id === id);
}

/**
 * Rodada de treino: `n` itens do exame, intercalando domínios (prática
 * intercalada) — ou só de um domínio, quando escolhido.
 */
export function rodada(exameId: string, seed: number, n = 10, dominioId?: string): ItemDojo[] {
  const ex = exame(exameId);
  if (!ex) return [];
  const dominios = dominioId ? ex.dominios.filter((d) => d.id === dominioId) : ex.dominios;
  if (dominios.length === 0) return [];
  const porDominio = Math.ceil(n / dominios.length);
  const filas = dominios.map((d) => d.gerar(seed, porDominio));
  const out: ItemDojo[] = [];
  for (let i = 0; out.length < n; i++) {
    let algum = false;
    for (const f of filas) {
      if (f[i]) { out.push(f[i]); algum = true; if (out.length >= n) break; }
    }
    if (!algum) break;
  }
  // Ordem final estável por semente (mistura os domínios, mas reproduzível).
  const rand = mulberry32(seed * 53 + n);
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

export function dominioDe(exameId: string, dominioId: string): DominioDojo | undefined {
  return exame(exameId)?.dominios.find((d) => d.id === dominioId);
}

// ---------------------------------------------------------------------------
// Contexto: sociedades e testes de alto alcance (texto factual para a página)
// ---------------------------------------------------------------------------

export const ALTO_ALCANCE = {
  tripleNine: "A Triple Nine Society admite o percentil 99,9 (1 em 1.000): 146 em testes de DP 15 (WAIS, SB5), 149 em DP 16 (SB-IV), 173 em DP 24 (Cattell III B); aceita também o RAIT (146) e as Matrizes Progressivas Avançadas de Raven, entre mais de 20 testes.",
  maisDificeis: [
    "Mega Test (Ronald Hoeflin, 1985): 48 itens, metade verbal-analógica e metade quantitativa-espacial, sem limite de tempo, resolvido em casa e enviado pelo correio; teto estimado pelo autor acima de 190. Comprometido por vazamento de respostas e busca na internet.",
    "Titan Test (Hoeflin, 1990): sucessor do Mega, no mesmo formato; aposentado em 2020 pela mesma razão.",
    "Testes de Paul Cooijmans e outros autores de 'alto alcance': verbais, numéricos e espaciais, sem tempo, com normas construídas a partir de quem se candidata — amostras autosselecionadas.",
  ],
  ressalva: "Nenhum desses testes é aceito pela Mensa nem tem a validação de uma escala clínica: sem tempo, sem supervisão e com normas de amostras autosselecionadas, eles medem também persistência, acesso a recursos e colaboração. Servem como esporte intelectual, não como medida. Para chegar a percentis extremos com validade, o caminho continua sendo uma escala completa aplicada por psicólogo (WAIS, SB5) ou um teste supervisionado com teto alto (APM, CFIT).",
};
