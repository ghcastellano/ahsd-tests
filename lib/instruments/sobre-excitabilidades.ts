import type { Instrument, Question, Responses, Subscale } from "../types";
import { LIKERT_1_5 } from "./options";
import { scoreSubscales } from "../scoring";

// Original PT-BR items authored for this platform, grounded in Dabrowski's theory
// of Positive Disintegration and the five overexcitabilities (as operationalised by
// the OEQ tradition — Piechowski, Falk, Silverman). Profile-based: report five
// subscale means, no cutoff.

const subscales: Subscale[] = [
  { key: "intelectual", name: "Intelectual", description: "Curiosidade intensa, sede de compreender, prazer em raciocinar." },
  { key: "imaginativa", name: "Imaginativa", description: "Imagens mentais vívidas, fantasia, invenção, percepção poética." },
  { key: "emocional", name: "Emocional", description: "Intensidade e profundidade dos sentimentos, empatia, vínculos fortes." },
  { key: "sensorial", name: "Sensorial", description: "Prazer e sensibilidade acentuados aos estímulos dos sentidos." },
  { key: "psicomotora", name: "Psicomotora", description: "Excesso de energia física, movimento, fala rápida, inquietação." },
];

const raw: [string, string][] = [
  ["intelectual", "Adoro resolver problemas e desenvolver novos conceitos e teorias."],
  ["imaginativa", "Crio imagens mentais tão vívidas que quase parecem reais."],
  ["emocional", "Sinto as emoções de forma muito intensa e profunda."],
  ["sensorial", "Sinto grande prazer com sons, cores, texturas, sabores e aromas."],
  ["psicomotora", "Tenho excesso de energia física e dificuldade de ficar parado(a)."],

  ["intelectual", "Faço perguntas até chegar ao fundo de um assunto."],
  ["imaginativa", "Costumo sonhar acordado(a) e imaginar mundos ou situações possíveis."],
  ["emocional", "Preocupo-me profundamente com o bem-estar das outras pessoas."],
  ["sensorial", "Aprecio profundamente a beleza da natureza, da música ou da arte."],
  ["psicomotora", "Falo rápido, sobretudo quando estou empolgado(a)."],

  ["intelectual", "Passo horas analisando ideias e buscando entender como as coisas funcionam."],
  ["imaginativa", "Misturo com facilidade fantasia e realidade nos meus pensamentos."],
  ["emocional", "Tenho forte empatia e sinto o que os outros sentem."],
  ["sensorial", "Às vezes me sinto sobrecarregado(a) por estímulos sensoriais intensos."],
  ["psicomotora", "Gosto de atividades intensas e de movimento vigoroso."],

  ["intelectual", "Gosto de debates e de examinar argumentos sob vários ângulos."],
  ["imaginativa", "Tenho ideias inventivas e busco novidade e variedade."],
  ["emocional", "Formo vínculos afetivos fortes e duradouros."],
  ["sensorial", "Percebo detalhes sensoriais que a maioria das pessoas não nota."],
  ["psicomotora", "Fico inquieto(a) quando preciso permanecer sentado(a) por muito tempo."],

  ["intelectual", "Tenho sede de aprender e de compreender o mundo."],
  ["imaginativa", "Percebo o mundo de forma poética ou dramática."],
  ["emocional", "Minhas emoções às vezes se manifestam no corpo (coração acelerado, nó na garganta…)."],
  ["sensorial", "Busco conforto e prazer nos sentidos (uma boa comida, um tecido macio, uma música…)."],
  ["psicomotora", "Descarrego tensão ou empolgação por meio de ação e movimento."],

  ["intelectual", "Minha mente está quase sempre ativa, pensando ou planejando algo."],
  ["imaginativa", "Uso metáforas e imagens para entender e explicar as coisas."],
  ["emocional", "Lembro-me vividamente de como me senti em momentos marcantes."],
  ["sensorial", "Certos sons, luzes ou texturas me incomodam muito mais do que aos outros."],
  ["psicomotora", "Sou competitivo(a) e gosto de me manter em atividade."],

  ["intelectual", "Sinto prazer genuíno em raciocínio abstrato e complexo."],
  ["imaginativa", "Tenho sonhos noturnos intensos e memoráveis."],
  ["emocional", "Tenho um mundo interior emocional rico e complexo."],
  ["sensorial", "A estética das coisas ao meu redor afeta bastante o meu humor."],
  ["psicomotora", "Sinto satisfação em um esforço físico que me cansa."],
];

const questions: Question[] = raw.map(([subscale, text], i) => ({ id: `q${i + 1}`, text, subscale }));

// Single informational band — overexcitabilities are read as a profile, not a total.
const bands = [
  { min: 1, max: 5, label: "Perfil de sobre-excitabilidades", severity: "info" as const, description: "As sobre-excitabilidades descrevem formas de vivenciar o mundo com mais intensidade. Não há 'nota de corte': o que importa é o seu perfil entre as cinco dimensões. Médias mais altas (≈3,5+) indicam dimensões mais marcantes em você." },
];

export const sobreExcitabilidades: Instrument = {
  id: "sobre-excitabilidades",
  acronym: "SE / OE",
  name: "Sobre-excitabilidades (Dabrowski)",
  originalName: "Instrumento original inspirado na teoria das overexcitabilities de Dabrowski/Piechowski",
  category: "altas-habilidades",
  summary: "Perfil das cinco sobre-excitabilidades (intelectual, imaginativa, emocional, sensorial, psicomotora).",
  audience: "Adolescentes e adultos",
  estMinutes: 8,
  intro:
    "A teoria de Dabrowski descreve cinco 'sobre-excitabilidades' — formas de responder ao mundo com intensidade acima da média. Elas são frequentemente observadas em pessoas com altas habilidades, sobretudo as dimensões intelectual, imaginativa e emocional. Este questionário gera um PERFIL das cinco dimensões, sem pontuação de aprovação.",
  instructions:
    "Para cada afirmação, indique o quanto ela descreve você. Não há respostas certas ou erradas.",
  scaleType: "likert",
  defaultOptions: LIKERT_1_5,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Perfil das 5 dimensões (média 1–5)",
  references: [
    { label: "Dabrowski K. Positive Disintegration. 1964." },
    { label: "Piechowski MM. Developmental potential. In: New Voices in Counseling the Gifted. 1979." },
    { label: "Falk RF, Lind S, Miller NB, Piechowski MM, Silverman LK. The Overexcitability Questionnaire-Two (OEQ-II). 1999." },
  ],
  score: (r: Responses) => {
    const subs = scoreSubscales(questions, r, LIKERT_1_5, subscales);
    const sorted = [...subs].sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0));
    const overallMean =
      questions.filter((q) => r[q.id] !== undefined).reduce((acc, q) => acc + (r[q.id] ?? 0), 0) /
      Math.max(1, questions.filter((q) => r[q.id] !== undefined).length);

    const dominant = sorted.filter((s) => (s.mean ?? 0) >= 3.5);
    const notes: string[] = [];
    if (sorted[0]) {
      notes.push(`Dimensão mais marcante: ${sorted[0].name} (média ${sorted[0].mean}).`);
    }
    if (dominant.length > 1) {
      notes.push(`Dimensões elevadas (≥3,5): ${dominant.map((s) => s.name).join(", ")}.`);
    }
    notes.push(
      "Perfis com sobre-excitabilidades intelectual, imaginativa e emocional elevadas são comuns em altas habilidades — mas isso é um padrão frequentemente observado, nunca um diagnóstico.",
    );

    return {
      totalScore: Math.round(overallMean * 100) / 100,
      maxScore: 5,
      band: bands[0],
      metricIsMean: true,
      subscales: sorted,
      notes,
    };
  },
};
