import type { Instrument, Question, Responses } from "../types";
import { PCL_0_4 } from "./options";
import { bandFor, sumScore, scoreSubscales } from "../scoring";

const items = [
  ["Memórias repetidas, perturbadoras e indesejadas da experiência estressante?", "B"],
  ["Sonhos repetidos e perturbadores relacionados à experiência estressante?", "B"],
  ["Sentir ou agir de repente como se a experiência estressante estivesse acontecendo de novo?", "B"],
  ["Sentir-se muito perturbado(a) quando algo lembrava a experiência estressante?", "B"],
  ["Ter reações físicas intensas quando algo lembrava a experiência (coração acelerado, falta de ar, suor)?", "B"],
  ["Evitar memórias, pensamentos ou sentimentos relacionados à experiência estressante?", "C"],
  ["Evitar lembranças externas (pessoas, lugares, conversas, atividades, objetos ou situações)?", "C"],
  ["Dificuldade para lembrar partes importantes da experiência estressante?", "D"],
  ["Ter crenças negativas fortes sobre si, sobre os outros ou sobre o mundo?", "D"],
  ["Culpar a si mesmo(a) ou a outra pessoa pela experiência ou pelo que aconteceu depois?", "D"],
  ["Ter sentimentos negativos intensos, como medo, horror, raiva, culpa ou vergonha?", "D"],
  ["Perda de interesse em atividades de que você gostava?", "D"],
  ["Sentir-se distante ou afastado(a) das outras pessoas?", "D"],
  ["Dificuldade de sentir emoções positivas (felicidade, afeto pelas pessoas próximas)?", "D"],
  ["Comportamento irritável, explosões de raiva ou agir de forma agressiva?", "E"],
  ["Assumir riscos demais ou fazer coisas que poderiam lhe causar dano?", "E"],
  ["Estar 'superalerta', vigilante ou em guarda?", "E"],
  ["Sentir-se sobressaltado(a) ou assustar-se facilmente?", "E"],
  ["Dificuldade de concentração?", "E"],
  ["Dificuldade para pegar no sono ou permanecer dormindo?", "E"],
] as const;

const questions: Question[] = items.map(([text, sub], i) => ({ id: `q${i + 1}`, text, subscale: sub }));

const subscales = [
  { key: "B", name: "Critério B — Revivência (intrusão)", description: "Itens 1–5." },
  { key: "C", name: "Critério C — Evitação", description: "Itens 6–7." },
  { key: "D", name: "Critério D — Alterações negativas em cognição e humor", description: "Itens 8–14." },
  { key: "E", name: "Critério E — Alterações em excitação e reatividade", description: "Itens 15–20." },
];

const bands = [
  { min: 0, max: 32, label: "Abaixo do limiar", severity: "none" as const, description: "Abaixo do ponto de corte provisório para TEPT." },
  { min: 33, max: 80, label: "TEPT provável", severity: "high" as const, description: "Igual ou acima do corte provisório (33) para TEPT provável. Recomenda-se avaliação clínica especializada. O corte pode ser ajustado (31–38) conforme a finalidade." },
];

export const pcl5: Instrument = {
  id: "pcl-5",
  acronym: "PCL-5",
  name: "Lista de Verificação de TEPT para o DSM-5",
  originalName: "PTSD Checklist for DSM-5 (Weathers et al., 2013)",
  category: "trauma",
  summary: "Medida de sintomas de Transtorno de Estresse Pós-Traumático segundo o DSM-5. 20 itens.",
  audience: "Adultos que vivenciaram evento(s) estressante(s)/traumático(s)",
  estMinutes: 6,
  intro:
    "A PCL-5 avalia os 20 sintomas de TEPT do DSM-5 no último mês, organizados em quatro critérios (B, C, D, E). É uma medida de sintomas e rastreio, não um diagnóstico. Pense em uma experiência estressante específica ao responder.",
  instructions:
    "No último mês, o quanto você foi incomodado(a) por cada um destes problemas, em relação a uma experiência estressante que tenha vivido?",
  scaleType: "likert",
  defaultOptions: PCL_0_4,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Gravidade total (0–80)",
  references: [
    { label: "Weathers FW, et al. The PTSD Checklist for DSM-5 (PCL-5). National Center for PTSD, 2013 (domínio público)." },
    { label: "Bovin MJ, et al. Psychometric properties of the PCL-5. Psychol Assess. 2016." },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, PCL_0_4);
    const band = bandFor(total, bands);
    // Clusters are reported as raw sums (0..max), not per-item means: drop `mean`
    // so the results UI renders "raw/max" instead of a 1–5 mean scale.
    const subs = scoreSubscales(questions, r, PCL_0_4, subscales).map((s) => ({
      ...s,
      mean: undefined,
    }));
    // DSM-5 symptom-cluster method: item >=2 counts as endorsed.
    const endorsed = (keys: string[]) =>
      questions.filter((q) => keys.includes(q.subscale ?? "") && (r[q.id] ?? 0) >= 2).length;
    const b = endorsed(["B"]);
    const c = endorsed(["C"]);
    const d = endorsed(["D"]);
    const e = endorsed(["E"]);
    const dsmProfile = b >= 1 && c >= 1 && d >= 2 && e >= 2;
    const notes = [
      `Método por sintomas do DSM-5 (item ≥ "Moderadamente"): B=${b} (≥1), C=${c} (≥1), D=${d} (≥2), E=${e} (≥2).`,
      dsmProfile
        ? "O padrão de sintomas satisfaz provisoriamente os critérios de sintomas do DSM-5."
        : "O padrão de sintomas não satisfaz plenamente os critérios de sintomas do DSM-5.",
    ];
    return {
      totalScore: total,
      maxScore: 80,
      band,
      positive: total >= 33,
      positiveLabel: "Estresse pós-traumático (TEPT) provável (33 ou mais)",
      negativeLabel: "Abaixo do corte de 33 para estresse pós-traumático (TEPT)",
      subscales: subs,
      notes,
    };
  },
};
