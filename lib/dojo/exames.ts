import { visualKey } from "../battery/visual-key";
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
import { gerarBancoAvancado } from "./banco-avancado";
import { gerarMemoriaSB5 } from "./memoria-sb5";
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
  subtesteReal: "Raciocínio matricial: referência de formato, sem confirmação do instrumento usado pela Mensa Brasil",
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
  subtesteReal: "Taxonomia de matrizes: operações e distribuição; itens autorais",
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
  porQueDificil: "Nos instrumentos de velocidade, a janela varia conforme edição e subteste. A dificuldade não é a regra em si, mas reconhecê-la de imediato e não travar.",
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
  gerar: (seed, n) => { const rand = mulberry32(seed * 37 + 6); return texto("aritmetica", amostra([...ARITMETICA, ...gerarBancoAvancado(seed, "quantitativo")], n, rand), rand); },
};

const absurdos: DominioDojo = {
  id: "absurdos",
  nome: "Absurdos verbais",
  subtesteReal: "SB5 Raciocínio Fluido — Absurdos Verbais",
  porQueDificil: "A frase parece normal; o absurdo é uma contradição lógica ou uma inversão de meio e fim, não um erro factual. Exige ler como um lógico, não como um leitor.",
  dica: "Pergunte: o que esta frase PRESSUPÕE? Se a ação anula o próprio objetivo, ou se duas partes não podem ser verdadeiras juntas, achou.",
  gerar: (seed, n) => { const rand = mulberry32(seed * 41 + 7); return texto("absurdos", amostra([...ABSURDOS, ...gerarBancoAvancado(seed, "logica")], n, rand), rand); },
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
  gerar: (seed, n) => { const rand = mulberry32(seed * 47 + 9); return texto("espacial", amostra([...ESPACIAL, ...gerarBancoAvancado(seed, "espacial")], n, rand), rand); },
};

const memoria = (nivel: 1 | 2 | 3, id: string): DominioDojo => ({
  id,
  nome: "Memória operacional (dígitos e letras)",
  subtesteReal: "WAIS-IV Dígitos (ordem direta, inversa e sequenciamento) / SB5 Memória Operacional",
  porQueDificil: "A ordem inversa e o sequenciamento exigem guardar E transformar a sequência ao mesmo tempo. A amplitude depende do protocolo e das normas por idade; este treino não converte extensão da sequência em percentil.",
  dica: "Agrupe em blocos de 2–3 (\"47-92-6\", não \"4-7-9-2-6\"). Na inversa, visualize os dígitos escritos numa linha e leia de trás para a frente. No sequenciamento, separe primeiro números de letras.",
  gerar: (seed, n) => Array.from({ length: Math.ceil(n / 6) }, (_, i) => gerarItensMemoria(nivel, seed + nivel * 1000 + i * 97).map((q) => ({ ...q, id: `${q.id}-${i}` }))).flat().slice(0, n).map((item) => ({ tipo: "memoria", dominio: id, item })),
});

const matrizesTeto: DominioDojo = {
  ...matrizesAvancadas, id: "matrizes-teto", nome: "Desafio de matrizes: múltiplas regras",
  subtesteReal: "Treino autoral de composição de regras; dificuldade sem calibração clínica",
  gerar: (seed, n) => {
    const banco = Array.from({ length: Math.ceil(n / 5) }, (_, k) => advancedMatrixItems(seed + k * 307).filter((i) => i.difficulty === "extrema").map((i) => ({ ...i, id: `${i.id}-t${k}` }))).flat();
    return figural("matrizes-teto", amostra(banco, n, mulberry32(seed * 71 + 6)));
  },
};
const memoriaSB5: DominioDojo = {
  id: "memoria-sb5", nome: "Memória: últimas palavras e posições",
  subtesteReal: "SB5: formatos de memória verbal e espacial; adaptação autoral visual",
  porQueDificil: "Nas frases, processe a sentença inteira e guarde apenas a última palavra; na grade, retenha a ordem das posições. A exposição visual não equivale à aplicação clínica oral ou com blocos.",
  dica: "Leia a frase inteira em voz alta antes que desapareça. Recupere as palavras finais na ordem. Na grade, memorize o percurso; os números só aparecem na resposta.",
  gerar: (seed, n) => amostra(gerarMemoriaSB5(seed, Math.max(n, 12)), n, mulberry32(seed * 101 + 7)).map((item) => ({ tipo: "memoria", dominio: "memoria-sb5", item })),
};

// ---------------------------------------------------------------------------
// Exames
// ---------------------------------------------------------------------------

export const EXAMES: ExameDojo[] = [
  {
    id: "mensa",
    nome: "Mensa Brasil (preparação)",
    sigla: "MENSA",
    oQueE: "A Mensa não é um teste: é uma sociedade que admite quem está no percentil 98 (2% superior) em um teste de inteligência supervisionado. No Brasil, a Mensa aplica testes psicométricos \"culture fair\" (independentes de língua e conhecimento), sorteados no dia, com até 60 minutos, e informa aptidão para ingresso e percentil, conforme a página de agendamento. Também aceita laudo de psicólogo com WAIS-III, WISC-IV, WASI, SON-R ou CPM (Matrizes Coloridas de Raven), sujeitos às restrições da lista oficial. Pode-se refazer após 1 ano, no máximo três vezes. Veja custos, disponibilidade e restrições no guia de exames reais.",
    estrutura: [
      "Admissão não verbal confirmada; instrumentos e proporções atuais não divulgados nas páginas oficiais consultadas. Matrizes, séries e classificação são prioridades de treino, não composição confirmada.",
      "Aplicação presencial, coletiva ou individual, com até 60 minutos conforme o instrumento. Siga as instruções do aplicador.",
      "Critério: percentil 98. Não existe uma conversão única independente da escala e das normas.",
    ],
    corte: "Percentil 98 na população normativa do teste aceito",
    porQueDificil: [
      "Neste treino, as matrizes mais exigentes combinam várias regras sem pista de separação; isso não estabelece a dificuldade da sua prova real.",
      "A prova real tem tempo definido pelo instrumento; o treino exercita gestão de tempo sem presumir a mesma relação entre itens e minutos.",
      "Os distratores do treino satisfazem parte das regras: confira todos os atributos antes de escolher.",
    ],
    dominios: [matrizesBase, matrizesAvancadas, seriesFiguras, classificacao, matrizesTeto],
    dicas: [
      "Treine o formato até ele ficar automático: a familiaridade reduz dúvidas sobre as instruções, mas não garante transferência nem um aumento de QI.",
      "Faça sessões cronometradas curtas (10 itens em 8 minutos) em vez de sessões longas sem relógio.",
      "Mantenha um caderno de erros por REGRA (não por item): 'confundi XOR com OR', 'não vi a regra de quantidade'. Reveja-o antes de cada sessão.",
      "Na semana do teste: uma sessão completa em condições reais (silêncio, cronômetro, sem pausa) e depois descanso. Sono pesa mais que a última hora de treino.",
    ],
  },
  {
    id: "wechsler",
    nome: "Wechsler (WAIS: formatos III/IV)",
    sigla: "WAIS",
    oQueE: "WAIS significa Escala Wechsler de Inteligência para Adultos. Não é o teste da Mensa. O caderno enviado é da WAIS-III brasileira; WAIS-IV é outra edição. Ambas são avaliações individuais com subtestes verbais e não verbais. As atividades do Dojo são adaptações autorais; não reproduzem a escala clínica.",
    estrutura: [
      "WAIS-III: compreensão verbal, organização perceptual, memória operacional e velocidade de processamento; QI total depende das normas por idade.",
      "Vocabulário e Semelhanças são respostas abertas na aplicação clínica. Múltipla escolha aqui treina reconhecimento e exige menos produção verbal.",
      "O caderno WAIS-III marca 120 s para Códigos e Procurar Símbolos. Aritmética tem limites diferentes por item.",
      "O simulador reúne quatro tarefas; não inclui a bateria completa, materiais manipuláveis ou avaliação profissional.",
    ],
    corte: "Percentil 98: critério da Mensa, sujeito à versão. Para a Triple Nine, ver restrições no guia.",
    porQueDificil: [
      "Os subtestes verbais são de produção livre: não basta reconhecer, é preciso formular a categoria exata (resposta de 2 pontos).",
      "Aritmética e Dígitos sobrecarregam a memória de trabalho: nada é escrito.",
      "Velocidade de processamento pune hesitação: 2 minutos de decisões binárias em sequência.",
    ],
    dominios: [verbal(2, "verbal-wais", "Semelhanças, vocabulário e analogias"), matrizesBase, aritmetica, conhecimento, memoria(3, "memoria-wais"), matrizesTeto],
    dicas: [
      "Nos verbais, treine formular a resposta de 2 pontos em voz alta: a categoria mais abstrata que ainda é verdadeira.",
      "Aritmética: pratique ouvindo problemas (peça a alguém para ler) e respondendo sem papel — é outra habilidade.",
      "Dígitos: 5 minutos por dia de sequências crescentes; pare quando errar duas seguidas e anote a amplitude.",
      "Velocidade: treine no simulador em blocos de 60 ou 120 s, priorizando ZERO erros antes de acelerar.",
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
    corte: "Percentil 98: consultar normas; SB5 usa DP 15. Critérios da Triple Nine no guia.",
    porQueDificil: [
      "A aplicação adaptativa leva você até o teto: você sempre termina em itens que não consegue.",
      "Cinco fatores em dois formatos: pontos fracos aparecem, não dá para compensar tudo com raciocínio fluido.",
      "Absurdos verbais e quantitativos exigem leitura crítica, não só velocidade.",
    ],
    dominios: [seriesFiguras, matrizesBase, absurdos, seriesNumericas, aritmetica, espacial, conhecimento, memoriaSB5, verbal(3, "verbal-sb5", "Vocabulário e relações abstratas"), matrizesTeto],
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
    oQueE: "Culture Fair/CFIT é uma família de testes figurais. Cattell III B é um teste verbal distinto, tradicionalmente associado ao desvio-padrão 24; não se deve aplicar sua conversão ao CFIT. O Dojo usa referências de formato, sem reproduzir edição ou normas. Disponibilidade, tempo e aplicação dependem do país e da versão.",
    estrutura: [
      "Séries: inferir a transformação entre figuras.",
      "Classificação: identificar elementos que compartilham um critério; a quantidade de escolhas depende da versão.",
      "Matrizes: integrar relações entre linhas e colunas.",
      "Condições: localizar relações espaciais. Cronômetros do treino não são normas do CFIT.",
    ],
    corte: "Percentil 98: depende do instrumento aceito; CFIT, CFT 20-R e Cattell III B não são intercambiáveis.",
    porQueDificil: [
      "Subtestes curtos exigem precisão e ritmo; a duração deve ser confirmada para a edição efetivamente aplicada.",
      "Os quatro subtestes pedem operações mentais diferentes; o de condições (topologia) é pouco familiar para quase todo mundo.",
      "Os itens são simples na aparência e sutis no critério: a propriedade certa raramente é a mais visível.",
    ],
    dominios: [seriesFiguras, classificacao, matrizesAvancadas, condicoes, matrizesTeto],
    dicas: [
      "Aprenda a regra sem limite; depois pratique o ritmo. Tempo e acertos devem ser registrados separadamente.",
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
export function assinaturaItem(it: ItemDojo): string {
  switch (it.tipo) {
    case "texto": return it.item.enunciado;
    case "figural": return JSON.stringify([it.item.grid?.flat().slice(0, 8).map(visualKey), it.item.sequence?.map(visualKey), it.item.set?.map(visualKey).sort(), it.item.prompt]);
    case "matriz": return JSON.stringify(it.item);
    case "condicao": return JSON.stringify([it.item.opcoes, it.item.ponto]);
    case "memoria": return `${it.item.formato}:${it.item.sequencia.join("|")}`;
  }
}

export function rodada(exameId: string, seed: number, n = 10, dominioId?: string, anteriores: string[] = []): ItemDojo[] {
  const ex = exame(exameId);
  if (!ex) return [];
  const dominios = dominioId ? ex.dominios.filter((d) => d.id === dominioId) : ex.dominios;
  if (dominios.length === 0) return [];
  const vistos = new Set(anteriores);
  const porDominio = Math.max(12, Math.ceil(n / dominios.length) * 3);
  const filas = dominios.map((d) => {
    const unicos = new Map<string, ItemDojo>();
    for (const it of d.gerar(seed, porDominio)) if (!unicos.has(assinaturaItem(it))) unicos.set(assinaturaItem(it), it);
    const lista = [...unicos.values()];
    // Prefere inéditos; banco finito pode repetir depois de esgotado.
    return [...lista.filter((it) => !vistos.has(assinaturaItem(it))), ...lista.filter((it) => vistos.has(assinaturaItem(it)))];
  });
  const out: ItemDojo[] = [];
  const usados = new Set<string>();
  for (let i = 0; out.length < n; i++) {
    let algum = false;
    for (const f of filas) {
      if (f[i]) {
        algum = true;
        const assinatura = assinaturaItem(f[i]);
        if (usados.has(assinatura)) continue;
        usados.add(assinatura);
        out.push(f[i]);
        if (out.length >= n) break;
      }
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
