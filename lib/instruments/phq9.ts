import type { Instrument, Responses } from "../types";
import { FREQ_0_3 } from "./options";
import { bandFor, sumScore } from "../scoring";

const bands = [
  { min: 0, max: 4, label: "Mínimo", severity: "none" as const, description: "Sintomas depressivos mínimos ou ausentes." },
  { min: 5, max: 9, label: "Leve", severity: "mild" as const, description: "Sintomas depressivos leves. Vigilância e acompanhamento; reavaliar em algumas semanas." },
  { min: 10, max: 14, label: "Moderado", severity: "moderate" as const, description: "Sintomas moderados. Recomenda-se avaliação clínica e considerar plano de tratamento." },
  { min: 15, max: 19, label: "Moderadamente grave", severity: "high" as const, description: "Sintomas moderadamente graves. Tratamento ativo geralmente indicado." },
  { min: 20, max: 27, label: "Grave", severity: "severe" as const, description: "Sintomas graves. Avaliação clínica e início de tratamento fortemente recomendados." },
];

const questions = [
  "Pouco interesse ou pouco prazer em fazer as coisas",
  "Sentir-se para baixo, deprimido(a) ou sem esperança",
  "Dificuldade para pegar no sono, permanecer dormindo, ou dormir demais",
  "Sentir-se cansado(a) ou com pouca energia",
  "Falta de apetite ou comer demais",
  "Sentir-se mal consigo mesmo(a) — ou achar que é um fracasso ou que decepcionou a si ou a sua família",
  "Dificuldade para se concentrar nas coisas, como ler o jornal ou ver televisão",
  "Lentidão para se movimentar ou falar, a ponto de outras pessoas perceberem; ou o oposto — estar tão inquieto(a) que fica se movimentando muito mais do que de costume",
  "Pensar em se ferir de alguma forma, ou que seria melhor estar morto(a)",
].map((text, i) => ({ id: `q${i + 1}`, text }));

export const phq9: Instrument = {
  id: "phq-9",
  acronym: "PHQ-9",
  name: "Questionário de Saúde do Paciente — Depressão",
  originalName: "Patient Health Questionnaire-9 (Kroenke, Spitzer & Williams, 2001)",
  category: "humor",
  summary: "Rastreio e medida de gravidade de sintomas depressivos nas últimas 2 semanas.",
  audience: "Adultos e adolescentes",
  estMinutes: 3,
  intro:
    "O PHQ-9 é um dos instrumentos mais utilizados no mundo para rastrear e medir a gravidade de sintomas depressivos. Corresponde diretamente aos nove critérios de depressão do DSM.",
  instructions:
    "Nas últimas 2 semanas, com que frequência você foi incomodado(a) por algum dos problemas abaixo?",
  scaleType: "likert",
  defaultOptions: FREQ_0_3,
  questions,
  interpretationBands: bands,
  primaryMetricLabel: "Pontuação total (0–27)",
  references: [
    { label: "Kroenke K, Spitzer RL, Williams JBW. The PHQ-9. J Gen Intern Med. 2001;16(9):606-613." },
    { label: "Instrumento de domínio público, distribuído gratuitamente pela Pfizer.", url: "https://www.phqscreeners.com/" },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, FREQ_0_3);
    const band = bandFor(total, bands);
    const notes: string[] = [];
    if ((r["q9"] ?? 0) >= 1) {
      notes.push(
        "⚠️ A resposta ao item 9 (pensamentos de morte ou autolesão) foi positiva. Isso pede atenção imediata: procure um profissional de saúde. No Brasil, o CVV atende 24h pelo telefone 188 (ligação gratuita) e em cvv.org.br.",
      );
    }
    return { totalScore: total, maxScore: 27, band, notes };
  },
};
