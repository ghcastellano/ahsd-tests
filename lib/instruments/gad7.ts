import type { Instrument, Responses } from "../types";
import { FREQ_0_3 } from "./options";
import { bandFor, sumScore } from "../scoring";

const bands = [
  { min: 0, max: 4, label: "Mínimo", severity: "none" as const, description: "Ansiedade mínima." },
  { min: 5, max: 9, label: "Leve", severity: "mild" as const, description: "Ansiedade leve. Monitorar; reavaliar se persistir." },
  { min: 10, max: 14, label: "Moderado", severity: "moderate" as const, description: "Ansiedade moderada. Avaliação clínica recomendada. (≥10 é o ponto de corte usual para rastreio positivo.)" },
  { min: 15, max: 21, label: "Grave", severity: "severe" as const, description: "Ansiedade grave. Avaliação clínica e tratamento recomendados." },
];

const questions = [
  "Sentir-se nervoso(a), ansioso(a) ou muito tenso(a)",
  "Não ser capaz de impedir ou de controlar as preocupações",
  "Preocupar-se muito com diversas coisas",
  "Dificuldade para relaxar",
  "Ficar tão agitado(a) que se torna difícil permanecer sentado(a)",
  "Ficar facilmente aborrecido(a) ou irritado(a)",
  "Sentir medo como se algo terrível fosse acontecer",
].map((text, i) => ({ id: `q${i + 1}`, text }));

export const gad7: Instrument = {
  id: "gad-7",
  acronym: "GAD-7",
  name: "Transtorno de Ansiedade Generalizada — 7 itens",
  originalName: "Generalized Anxiety Disorder-7 (Spitzer et al., 2006)",
  category: "ansiedade",
  summary: "Rastreio e medida de gravidade de sintomas de ansiedade nas últimas 2 semanas.",
  audience: "Adultos e adolescentes",
  estMinutes: 2,
  intro:
    "O GAD-7 é uma escala breve e amplamente validada para rastrear o Transtorno de Ansiedade Generalizada e medir a gravidade dos sintomas ansiosos. Também é sensível a pânico, ansiedade social e TEPT.",
  instructions:
    "Nas últimas 2 semanas, com que frequência você foi incomodado(a) pelos seguintes problemas?",
  scaleType: "likert",
  defaultOptions: FREQ_0_3,
  questions,
  interpretationBands: bands,
  primaryMetricLabel: "Pontuação total (0–21)",
  references: [
    { label: "Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097." },
    { label: "Instrumento de domínio público, distribuído gratuitamente pela Pfizer.", url: "https://www.phqscreeners.com/" },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, FREQ_0_3);
    const band = bandFor(total, bands);
    const notes: string[] = [];
    if (total >= 10) notes.push("Pontuação ≥ 10: rastreio positivo para ansiedade clinicamente significativa.");
    return { totalScore: total, maxScore: 21, band, positive: total >= 10, positiveLabel: "Rastreio positivo (≥10)", notes };
  },
};
