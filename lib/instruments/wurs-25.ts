import type { Instrument, Question, QuestionOption, Responses } from "../types";
import { bandFor, sumScore } from "../scoring";

// WURS-25 (Ward, Wender & Reimherr, 1993): os 25 itens da Wender Utah Rating
// Scale que melhor discriminaram adultos com TDAH de controles. Retrospectivo:
// o adulto avalia como era NA INFÂNCIA. Serve ao critério B do diagnóstico
// (início precoce), que a ASRS não cobre. Tradução autoral para o português
// brasileiro a partir do original em inglês.

const OPCOES: QuestionOption[] = [
  { label: "Nem um pouco", value: 0 },
  { label: "Um pouco", value: 1 },
  { label: "Moderadamente", value: 2 },
  { label: "Bastante", value: 3 },
  { label: "Muitíssimo", value: 4 },
];

const itens = [
  "Problemas de concentração; distraía-me com facilidade",
  "Ansioso(a), preocupado(a)",
  "Nervoso(a), inquieto(a)",
  "Desatento(a), sonhando acordado(a)",
  "Esquentado(a), pavio curto",
  "Explosões de raiva, ataques de birra",
  "Dificuldade de persistir; não levava as coisas até o fim, não terminava o que começava",
  "Teimoso(a), cabeça-dura",
  "Triste, para baixo, deprimido(a), infeliz",
  "Desobediente com os pais, rebelde, respondão(ona)",
  "Baixa opinião sobre mim mesmo(a)",
  "Irritável",
  "De humor instável, com altos e baixos",
  "Com raiva",
  "Agia sem pensar, impulsivo(a)",
  "Tendência a ser imaturo(a)",
  "Sentimentos de culpa, arrependimento",
  "Perdia o controle de mim mesmo(a)",
  "Tendência a ser ou agir de forma irracional",
  "Impopular entre as outras crianças; não mantinha amizades por muito tempo; não me dava bem com as outras crianças",
  "Dificuldade de enxergar as coisas do ponto de vista dos outros",
  "Problemas com autoridades, problemas na escola, idas à diretoria",
  "No geral, um(a) aluno(a) fraco(a), lento(a) para aprender",
  "Dificuldade com matemática ou números",
  "Não rendia de acordo com o meu potencial",
];

const questions: Question[] = itens.map((text, i) => ({ id: `q${i + 1}`, text }));

const bands = [
  { min: 0, max: 35, label: "Abaixo do corte", severity: "none" as const, description: "Pontuação abaixo de 36: o relato da infância não é sugestivo de TDAH. No estudo original, 96% dos adultos com TDAH pontuaram 36 ou mais." },
  { min: 36, max: 45, label: "Sugestivo (corte de 36)", severity: "moderate" as const, description: "36 a 45: sugestivo de sintomas de TDAH na infância (corte de maior sensibilidade). Vale confirmar com relato de terceiros — pais, boletins escolares." },
  { min: 46, max: 100, label: "Fortemente sugestivo (corte de 46)", severity: "high" as const, description: "46 ou mais: corte de maior especificidade (no estudo original, identificou 86% dos adultos com TDAH e excluiu 99% dos controles). Sustenta o critério de início na infância — combine com um rastreio de sintomas atuais." },
];

export const wurs25: Instrument = {
  id: "wurs-25",
  acronym: "WURS-25",
  name: "Escala de Avaliação de Wender Utah — 25 itens (infância, retrospectiva)",
  originalName: "Wender Utah Rating Scale, 25-item version (Ward, Wender & Reimherr, 1993)",
  category: "tdah",
  summary: "Como você era na infância: os 25 itens que melhor separam adultos com TDAH de controles. Cobre o critério de início precoce, que a ASRS não avalia.",
  audience: "Adultos, recordando a própria infância (6 a 12 anos)",
  estMinutes: 5,
  intro:
    "O diagnóstico de TDAH no adulto exige que os sintomas tenham começado na infância. A WURS-25 pede que você avalie, em retrospectiva, como era quando criança. Os 25 itens foram selecionados dos 61 originais por serem os que melhor separaram adultos com TDAH de pessoas sem o transtorno e de pessoas com depressão. Há dois cortes clássicos: 36 (mais sensível) e 46 (mais específico). Alguns itens tocam humor e conduta — por isso o instrumento não distingue sozinho TDAH de outras condições da infância.",
  instructions:
    "Quando criança, eu era (ou tinha)... Para cada afirmação, indique o quanto ela descrevia você na infância.",
  scaleType: "likert",
  defaultOptions: OPCOES,
  questions,
  interpretationBands: bands,
  primaryMetricLabel: "Pontuação total (0–100)",
  references: [
    { label: "Ward MF, Wender PH, Reimherr FW. The Wender Utah Rating Scale: an aid in the retrospective diagnosis of childhood attention deficit hyperactivity disorder. Am J Psychiatry. 1993;150(6):885-890." },
    { label: "Stein MA, et al. Psychometric characteristics of the Wender Utah Rating Scale (WURS): reliability and factor structure for men and women. Psychopharmacol Bull. 1995;31(2):425-433." },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, OPCOES);
    const band = bandFor(total, bands);
    const altos = questions.filter((q) => (r[q.id] ?? 0) >= 3).length;
    return {
      totalScore: total,
      maxScore: 100,
      band,
      positive: total >= 36,
      positiveLabel: "Acima do corte de 36 (relato de infância sugestivo de TDAH)",
      notes: [
        `${altos} de 25 itens marcados como 'bastante' ou 'muitíssimo'.`,
        "Relato retrospectivo: a memória da infância é influenciada pelo estado atual. Sempre que possível, confira com quem conviveu com você na época (pais, irmãos, professores) ou com boletins e registros escolares.",
        "A WURS-25 complementa um rastreio de sintomas atuais (ASRS): TDAH no adulto exige as duas coisas — sintomas hoje e início na infância.",
      ],
    };
  },
};
