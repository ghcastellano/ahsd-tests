import type { Instrument, Responses } from "../types";
import { YES_NO } from "./options";
import { bandFor, sumScore } from "../scoring";

const items = [
  "Preciso de menos sono.",
  "Sinto-me com mais energia e mais ativo(a).",
  "Sinto-me mais autoconfiante.",
  "Aproveito mais o meu trabalho.",
  "Sou mais sociável (faço mais ligações, saio mais).",
  "Tenho vontade de viajar e/ou viajo mais.",
  "Tendo a dirigir mais rápido ou a assumir mais riscos ao dirigir.",
  "Gasto mais dinheiro/dinheiro demais.",
  "Assumo mais riscos no dia a dia (no trabalho e/ou em outras atividades).",
  "Fico fisicamente mais ativo(a) (esportes etc.).",
  "Planejo mais atividades ou projetos.",
  "Tenho mais ideias, sou mais criativo(a).",
  "Sou menos tímido(a) ou inibido(a).",
  "Uso roupas e/ou maquiagem mais coloridas e extravagantes.",
  "Tenho vontade de conhecer mais pessoas, ou realmente conheço.",
  "Tenho mais interesse em sexo e/ou maior desejo sexual.",
  "Fico mais paquerador(a) e/ou sexualmente mais ativo(a).",
  "Falo mais.",
  "Penso mais rápido.",
  "Faço mais piadas ou trocadilhos quando falo.",
  "Distraio-me mais facilmente.",
  "Envolvo-me em muitas coisas novas.",
  "Meus pensamentos pulam de um assunto para outro.",
  "Faço as coisas mais rápido e/ou com mais facilidade.",
  "Fico mais impaciente e/ou me irrito mais facilmente.",
  "Posso ser cansativo(a) ou irritante para os outros.",
  "Envolvo-me em mais brigas ou discussões.",
  "Meu humor fica mais elevado, mais otimista.",
  "Tomo mais café.",
  "Fumo mais cigarros.",
  "Bebo mais álcool.",
  "Uso mais substâncias (calmantes, ansiolíticos, estimulantes…).",
];

const questions = items.map((text, i) => ({ id: `q${i + 1}`, text }));

const bands = [
  { min: 0, max: 13, label: "Rastreio negativo", severity: "none" as const, description: "Menos de 14 sintomas endossados. Baixa probabilidade de traços de hipomania por este rastreio." },
  { min: 14, max: 32, label: "Rastreio positivo", severity: "moderate" as const, description: "14 ou mais sintomas endossados. Sugere possível bipolaridade (hipomania). Recomenda-se avaliação clínica. O corte pode variar conforme a população." },
];

export const hcl32: Instrument = {
  id: "hcl-32",
  acronym: "HCL-32",
  name: "Lista de Checagem de Hipomania — 32 itens",
  originalName: "Hypomania Checklist-32 (Angst et al., 2005)",
  category: "humor",
  summary: "Rastreio de traços de hipomania, útil para detectar bipolaridade do tipo II.",
  audience: "Adultos",
  estMinutes: 5,
  intro:
    "A HCL-32 pede que você relembre um período de 'alto astral', com mais energia do que o habitual, e marque quais experiências ocorreram. É especialmente útil para identificar hipomania, que costuma passar despercebida.",
  instructions:
    "Pense em um período em que você esteve em um estado de mais energia/'para cima'. Marque Sim para cada afirmação que descreve como você era nesse período.",
  scaleType: "binary",
  defaultOptions: YES_NO,
  questions,
  interpretationBands: bands,
  primaryMetricLabel: "Sintomas endossados (0–32)",
  references: [
    { label: "Angst J, et al. The HCL-32: towards a self-assessment tool for hypomanic symptoms in outpatients. J Affect Disord. 2005;88(2):217-233." },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, YES_NO);
    const band = bandFor(total, bands);
    return {
      totalScore: total,
      maxScore: 32,
      band,
      positive: total >= 14,
      positiveLabel: "Rastreio positivo para hipomania (14 ou mais itens marcados)",
      negativeLabel: "Rastreio negativo para hipomania (menos de 14 itens marcados)",
    };
  },
};
