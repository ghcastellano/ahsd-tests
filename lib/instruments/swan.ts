import type { Instrument, Question, QuestionOption, Responses, Subscale } from "../types";

// SWAN (Swanson et al.): os mesmos 18 comportamentos do DSM, mas formulados
// como FORÇAS ("presta atenção a detalhes") e avaliados numa escala bipolar
// de -3 (muito abaixo da média) a +3 (muito acima). Ao contrário do SNAP-IV,
// que só pontua déficit, o SWAN produz uma distribuição normal: mostra onde a
// pessoa está no espectro inteiro, sem viés de patologização. Instrumento de
// domínio público. Não há ponto de corte validado no Brasil; as faixas abaixo
// são convencionais.

const OPCOES: QuestionOption[] = [
  { label: "Muito abaixo da média", value: -3 },
  { label: "Abaixo da média", value: -2 },
  { label: "Um pouco abaixo da média", value: -1 },
  { label: "Na média", value: 0 },
  { label: "Um pouco acima da média", value: 1 },
  { label: "Acima da média", value: 2 },
  { label: "Muito acima da média", value: 3 },
];

const atencao = [
  "Presta atenção a detalhes e evita erros por descuido",
  "Sustenta a atenção em tarefas ou brincadeiras",
  "Escuta quando alguém fala diretamente com ele(a)",
  "Segue instruções até o fim e termina deveres, tarefas ou obrigações",
  "Organiza tarefas e atividades",
  "Envolve-se em tarefas que exigem esforço mental prolongado",
  "Guarda e não perde as coisas necessárias para as atividades",
  "Ignora estímulos externos (distrações)",
  "Lembra-se das atividades do dia a dia",
];

const controle = [
  "Fica quieto(a) com as mãos e os pés e sem se remexer na cadeira",
  "Permanece sentado(a) quando a situação exige",
  "Controla a atividade motora (não corre nem sobe nas coisas quando é inapropriado)",
  "Brinca ou se envolve em atividades de lazer de forma calma",
  "Acalma-se e descansa (controla a atividade constante)",
  "Controla a quantidade de fala (não fala em excesso)",
  "Pensa antes de responder (não responde antes de a pergunta terminar)",
  "Espera a sua vez",
  "Entra em conversas e jogos sem interromper nem se intrometer",
];

const questions: Question[] = [
  ...atencao.map((text, i) => ({ id: `a${i + 1}`, text, subscale: "atencao" })),
  ...controle.map((text, i) => ({ id: `c${i + 1}`, text, subscale: "controle" })),
];

const subscales: Subscale[] = [
  { key: "atencao", name: "Atenção (itens 1–9)", description: "Forças de atenção — o espelho dos sintomas de desatenção." },
  { key: "controle", name: "Controle da atividade e da impulsividade (itens 10–18)", description: "O espelho dos sintomas de hiperatividade-impulsividade." },
];

// Faixas sobre a média do domínio MAIS BAIXO (o que importa para rastreio).
const bands = [
  { min: -3, max: -1.5, label: "Bem abaixo da média", severity: "high" as const, description: "Média igual ou abaixo de -1,5 em um domínio: dificuldade acentuada, compatível com o padrão de TDAH. Faixa convencional, sem norma brasileira." },
  { min: -1.49, max: -0.5, label: "Abaixo da média", severity: "moderate" as const, description: "Entre -1,5 e -0,5: fraquezas perceptíveis neste domínio. Vale observar prejuízo no dia a dia e considerar um rastreio de sintomas." },
  { min: -0.49, max: 0.49, label: "Na média", severity: "none" as const, description: "Perto de zero: dentro do esperado para a idade." },
  { min: 0.5, max: 3, label: "Acima da média", severity: "info" as const, description: "Média igual ou acima de +0,5 no domínio mais baixo: forças em atenção e autocontrole acima do esperado." },
];

export const swan: Instrument = {
  id: "swan",
  acronym: "SWAN",
  name: "SWAN — forças e fraquezas em atenção e comportamento (espectro)",
  originalName: "Strengths and Weaknesses of ADHD symptoms and Normal behavior rating scale (Swanson et al., 2012)",
  category: "tdah",
  summary: "Os 18 comportamentos do DSM avaliados como forças, de -3 a +3. Mostra onde a pessoa está no espectro inteiro — sem viés de patologização.",
  audience: "Pais ou professores, sobre crianças e adolescentes; usado também como autorrelato em pesquisa com adultos",
  estMinutes: 3,
  intro:
    "O SWAN inverte a lógica dos questionários de sintomas. Em vez de perguntar 'quanto ele se distrai?', pergunta 'quão bem ele ignora distrações, comparado à média das pessoas da mesma idade?'. O resultado é uma distribuição normal: quem está acima da média aparece, e quem está abaixo aparece com a mesma escala — sem o efeito de chão dos questionários que só contam déficits. Por isso é o instrumento preferido em pesquisa quando o objetivo é ver TDAH como extremo de um contínuo, e não como categoria. Não existe corte validado no Brasil: as faixas são convencionais.",
  instructions:
    "Para cada comportamento, compare a pessoa avaliada com a média das pessoas da mesma idade: ela está abaixo, na média ou acima? Valores positivos indicam forças; negativos, fraquezas.",
  scaleType: "custom",
  defaultOptions: OPCOES,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Média do domínio mais baixo (-3 a +3; maior = melhor)",
  references: [
    { label: "Swanson JM, et al. Categorical and dimensional definitions and evaluations of symptoms of ADHD: history of the SNAP and the SWAN rating scales. Int J Educ Psychol Assess. 2012;10(1):51-70." },
    { label: "Lakes KD, Swanson JM, Riggs M. The reliability and validity of the English and Spanish Strengths and Weaknesses of ADHD and Normal behavior rating scales in a preschool sample. J Atten Disord. 2012;16(5):415-422." },
  ],
  score: (r: Responses) => {
    const soma = (chave: string) =>
      questions.filter((q) => q.subscale === chave).reduce((a, q) => a + (r[q.id] ?? 0), 0);
    const sAt = soma("atencao");
    const sCo = soma("controle");
    const mAt = Math.round((sAt / 9) * 100) / 100;
    const mCo = Math.round((sCo / 9) * 100) / 100;
    const menor = Math.min(mAt, mCo);
    const band = bands.find((b) => menor >= b.min && menor <= b.max) ?? bands[2];
    const geral = Math.round(((mAt + mCo) / 2) * 100) / 100;
    return {
      totalScore: menor,
      maxScore: 3,
      band,
      metricIsMean: true,
      positive: menor <= -1.5,
      positiveLabel: "Domínio bem abaixo da média (≤ -1,5)",
      subscales: [
        { key: "atencao", name: "Atenção (itens 1–9)", raw: sAt, max: 27, mean: mAt },
        { key: "controle", name: "Controle da atividade e da impulsividade (itens 10–18)", raw: sCo, max: 27, mean: mCo },
      ],
      notes: [
        `Média geral: ${geral} · Atenção: ${mAt} · Controle: ${mCo} (escala de -3 a +3; zero = média das pessoas da mesma idade).`,
        "Leitura dimensional: o SWAN não diz 'tem' ou 'não tem' — diz onde a pessoa está no espectro. Um domínio bem abaixo da média com prejuízo no dia a dia justifica um rastreio de sintomas (SNAP-IV ou ASRS) e avaliação.",
        "As faixas são convencionais (não há ponto de corte validado no Brasil). Preencher por pais E professores, e comparar, é o uso recomendado.",
      ],
    };
  },
};
