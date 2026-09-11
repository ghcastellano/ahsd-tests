import type { Instrument, Question, Responses } from "../types";
import { YES_NO } from "./options";

const symptomItems = [
  "…se sentia tão bem ou tão acelerado(a) que outras pessoas acharam que você não era o(a) mesmo(a) de sempre, ou você estava tão acelerado(a) que se meteu em confusão?",
  "…estava tão irritado(a) que gritava com as pessoas ou começava brigas ou discussões?",
  "…se sentia muito mais autoconfiante do que de costume?",
  "…dormia muito menos do que o normal e não sentia falta do sono?",
  "…estava mais falante ou falava muito mais rápido do que de costume?",
  "…os pensamentos disparavam na sua cabeça ou você não conseguia desacelerar a mente?",
  "…se distraía tão facilmente com as coisas ao seu redor que tinha dificuldade de se concentrar ou manter o foco?",
  "…tinha muito mais energia do que de costume?",
  "…estava muito mais ativo(a) ou fazia muito mais coisas do que o normal?",
  "…estava muito mais sociável ou extrovertido(a), por exemplo, telefonando para amigos no meio da noite?",
  "…estava muito mais interessado(a) em sexo do que de costume?",
  "…fazia coisas incomuns para você, ou que outras pessoas poderiam achar excessivas, tolas ou arriscadas?",
  "…gastar dinheiro colocou você ou sua família em apuros?",
];

const problemOptions = [
  { label: "Nenhum problema", value: 0 },
  { label: "Problema leve", value: 1 },
  { label: "Problema moderado", value: 2 },
  { label: "Problema grave", value: 3 },
];

const questions: Question[] = [
  ...symptomItems.map((text, i) => ({ id: `q${i + 1}`, text, subscale: "sintomas" })),
  {
    id: "q14",
    text: "Se você marcou SIM para mais de uma situação acima, várias delas já aconteceram durante o mesmo período de tempo?",
    options: YES_NO,
    subscale: "criterio",
  },
  {
    id: "q15",
    text: "Que grau de problema essas situações causaram (trabalhar; problemas familiares, financeiros ou legais; discussões ou brigas)?",
    options: problemOptions,
    subscale: "criterio",
  },
];

const bands = [
  { min: 0, max: 0, label: "Rastreio negativo", severity: "none" as const, description: "Os três critérios do MDQ não foram plenamente atendidos." },
  { min: 1, max: 1, label: "Rastreio positivo", severity: "high" as const, description: "Os três critérios foram atendidos: ≥7 sintomas, ocorrendo no mesmo período e causando problema moderado/grave. Sugere-se avaliação para transtorno do espectro bipolar." },
];

export const mdq: Instrument = {
  id: "mdq",
  acronym: "MDQ",
  name: "Questionário de Transtornos do Humor",
  originalName: "Mood Disorder Questionnaire (Hirschfeld et al., 2000)",
  category: "humor",
  summary: "Rastreio para transtorno do espectro bipolar (episódios de mania/hipomania).",
  audience: "Adultos",
  estMinutes: 4,
  intro:
    "O MDQ rastreia a possibilidade de transtorno bipolar. O resultado é positivo apenas quando três critérios são atendidos em conjunto: pelo menos 7 dos 13 sintomas, ocorrendo no mesmo período, e causando problema moderado ou grave.",
  instructions:
    "As questões 1 a 13 referem-se a períodos em que você 'não era você mesmo(a)'. Responda Sim ou Não para cada uma. Em seguida, responda às duas questões finais.",
  scaleType: "custom",
  defaultOptions: YES_NO,
  questions,
  interpretationBands: bands,
  primaryMetricLabel: "Rastreio (positivo/negativo)",
  references: [
    { label: "Hirschfeld RMA, et al. Development and validation of a screening instrument for bipolar spectrum disorder: the Mood Disorder Questionnaire. Am J Psychiatry. 2000;157(11):1873-1875." },
  ],
  score: (r: Responses) => {
    const yesCount = symptomItems.reduce((acc, _t, i) => acc + ((r[`q${i + 1}`] ?? 0) === 1 ? 1 : 0), 0);
    const sameTime = (r["q14"] ?? 0) === 1;
    const problemLevel = r["q15"] ?? 0;
    const positive = yesCount >= 7 && sameTime && problemLevel >= 2;
    const band = positive ? bands[1] : bands[0];
    const c1 = yesCount >= 7;
    const c3 = problemLevel >= 2;
    const notes = [
      `Critério 1 — pelo menos 7 dos 13 sintomas: ${c1 ? "atendido" : "NÃO atendido"} (${yesCount} marcado${yesCount === 1 ? "" : "s"}).`,
      `Critério 2 — vários sintomas no mesmo período: ${sameTime ? "atendido" : "NÃO atendido"}.`,
      `Critério 3 — problema moderado ou grave: ${c3 ? "atendido" : "NÃO atendido"} (${problemOptions[problemLevel]?.label ?? "—"}).`,
      positive
        ? "Os três critérios foram atendidos ao mesmo tempo — por isso o rastreio é positivo."
        : "O rastreio do MDQ só é positivo quando os três critérios são atendidos juntos; basta um faltar para ser negativo.",
    ];
    return {
      totalScore: positive ? 1 : 0,
      maxScore: 1,
      band,
      positive,
      positiveLabel: "Rastreio positivo para transtorno bipolar (os 3 critérios atendidos)",
      negativeLabel: "Rastreio negativo para transtorno bipolar (algum dos 3 critérios não atendido)",
      hideScore: true,
      subscales: [{ key: "sintomas", name: "Sintomas endossados", raw: yesCount, max: 13 }],
      notes,
    };
  },
};
