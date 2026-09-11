import type { Instrument, Question, QuestionOption, Responses } from "../types";
import { bandFor, sumScore } from "../scoring";

// CFQ — Cognitive Failures Questionnaire (Broadbent, Cooper, FitzGerald &
// Parkes, 1982): 25 lapsos cotidianos de atenção, memória e ação nos últimos
// 6 meses. Não é um teste de TDAH, mas é uma das medidas mais usadas em
// pesquisa de TDAH adulto, porque captura exatamente o que o transtorno
// produz no dia a dia: esquecer por que entrou no cômodo, reler a mesma
// linha, perder objetos. Instrumento de uso livre em pesquisa. Tradução
// autoral para o português brasileiro a partir do original em inglês.

const OPCOES: QuestionOption[] = [
  { label: "Nunca", value: 0 },
  { label: "Muito raramente", value: 1 },
  { label: "De vez em quando", value: 2 },
  { label: "Com bastante frequência", value: 3 },
  { label: "Muito frequentemente", value: 4 },
];

const itens = [
  "Você lê alguma coisa e percebe que não estava pensando no que lia, e precisa ler de novo?",
  "Você esquece por que foi de um cômodo da casa para outro?",
  "Você deixa de notar placas de sinalização na rua?",
  "Você confunde direita e esquerda quando dá indicações de caminho?",
  "Você esbarra nas pessoas?",
  "Você esquece se apagou a luz, desligou o fogão ou trancou a porta?",
  "Você não presta atenção no nome das pessoas quando é apresentado(a) a elas?",
  "Você diz alguma coisa e percebe depois que ela poderia ser tomada como ofensa?",
  "Você não escuta quando falam com você porque está fazendo outra coisa?",
  "Você perde a paciência e se arrepende depois?",
  "Você deixa mensagens ou cartas importantes sem responder por dias?",
  "Você esquece para que lado virar numa rua que conhece bem, mas usa pouco?",
  "Você não enxerga o que procura no supermercado (mesmo estando ali)?",
  "Você se pega de repente em dúvida se usou uma palavra corretamente?",
  "Você tem dificuldade para tomar decisões?",
  "Você esquece compromissos?",
  "Você esquece onde deixou alguma coisa, como um livro ou o celular?",
  "Você joga fora sem querer o que queria guardar e guarda o que queria jogar fora?",
  "Você sonha acordado(a) quando deveria estar prestando atenção em algo?",
  "Você esquece o nome das pessoas?",
  "Você começa a fazer uma coisa em casa e se distrai fazendo outra, sem querer?",
  "Você não consegue lembrar de algo que está 'na ponta da língua'?",
  "Você esquece o que foi comprar na loja?",
  "Você deixa cair as coisas?",
  "Você fica sem saber o que dizer?",
];

const questions: Question[] = itens.map((text, i) => ({ id: `q${i + 1}`, text }));

// Faixas CONVENCIONAIS. As médias do CFQ variam bastante entre amostras
// (≈30 a ≈45); tomamos ≈40 (DP ≈13) como referência aproximada de adultos da
// população geral. Não há ponto de corte diagnóstico: o CFQ mede um contínuo.
const bands = [
  { min: 0, max: 26, label: "Poucos lapsos", severity: "none" as const, description: "Abaixo de 1 desvio-padrão da média populacional: menos falhas cotidianas do que a maioria das pessoas." },
  { min: 27, max: 53, label: "Faixa típica", severity: "low" as const, description: "Em torno da média aproximada de adultos da população geral (≈40; varia entre amostras). Lapsos ocasionais fazem parte da vida de todo mundo." },
  { min: 54, max: 66, label: "Lapsos frequentes", severity: "moderate" as const, description: "Acima de 1 desvio-padrão da referência: falhas de atenção e memória mais frequentes do que o esperado. Na validação brasileira, o CFQ correlaciona r ≈ 0,70 com a desatenção da ASRS — mas lapsos frequentes também vêm de privação de sono, ansiedade, depressão e sobrecarga. Limiar convencional." },
  { min: 67, max: 100, label: "Lapsos muito frequentes", severity: "high" as const, description: "Acima de 2 desvios-padrão da referência: lapsos muito acima do esperado. Vale um rastreio de sintomas (ASRS) e avaliação, sobretudo se o padrão vem desde sempre. Limiar convencional." },
];

export const cfq: Instrument = {
  id: "cfq",
  acronym: "CFQ",
  name: "Questionário de Falhas Cognitivas",
  originalName: "Cognitive Failures Questionnaire (Broadbent, Cooper, FitzGerald & Parkes, 1982)",
  category: "tdah",
  summary: "25 lapsos cotidianos de atenção, memória e ação — o retrato do TDAH no dia a dia, sem o vocabulário do diagnóstico.",
  audience: "Adultos e adolescentes",
  estMinutes: 6,
  intro:
    "O CFQ não pergunta sobre 'sintomas': pergunta sobre coisas que acontecem com todo mundo — reler a mesma linha, esquecer por que entrou no cômodo, perder o celular. O que ele mede é a frequência. É uma das medidas mais usadas em pesquisa de TDAH adulto, porque as falhas que ele lista são o que o transtorno produz na vida real; mas lapsos frequentes também aparecem em privação de sono, ansiedade, depressão e sobrecarga. As faixas vêm das normas populacionais (média por volta de 40) e não constituem diagnóstico.",
  instructions:
    "As perguntas são sobre pequenos erros que todo mundo comete de vez em quando, mas que algumas pessoas cometem mais que outras. Indique com que frequência cada um aconteceu com você nos últimos 6 meses.",
  scaleType: "likert",
  defaultOptions: OPCOES,
  questions,
  interpretationBands: bands,
  primaryMetricLabel: "Pontuação total (0–100)",
  references: [
    { label: "Broadbent DE, Cooper PF, FitzGerald P, Parkes KR. The Cognitive Failures Questionnaire (CFQ) and its correlates. Br J Clin Psychol. 1982;21(1):1-16." },
    { label: "de Paula JJ, Costa DS, Miranda DM, Romano-Silva MA. Brazilian version of the Cognitive Failures Questionnaire (CFQ): cross-cultural adaptation and evidence of validity and reliability. Braz J Psychiatry. 2018;40(3):312-315." },
    { label: "Bridger RS, Johnsen SÅK, Brasher K. Psychometric properties of the Cognitive Failures Questionnaire. Ergonomics. 2013;56(10):1515-1524 (fidedignidade teste-reteste)." },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, OPCOES);
    const band = bandFor(total, bands);
    const frequentes = questions.filter((q) => (r[q.id] ?? 0) >= 3).length;
    return {
      totalScore: total,
      maxScore: 100,
      band,
      positive: total >= 54,
      positiveLabel: "Lapsos mais frequentes do que a maioria das pessoas (54 ou mais)",
      negativeLabel: "Lapsos dentro da faixa comum (abaixo de 54)",
      notes: [
        `${frequentes} de 25 falhas marcadas como 'com bastante frequência' ou 'muito frequentemente'.`,
        "O CFQ mede um contínuo, sem ponto de corte diagnóstico; as faixas são convencionais. Existe versão brasileira validada (de Paula et al., 2018; alfa 0,91) — a tradução aqui é autoral. A pergunta que diferencia TDAH de cansaço é temporal: esses lapsos vêm desde a infância e acontecem mesmo quando você está descansado(a)?",
      ],
    };
  },
};
