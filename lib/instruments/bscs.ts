import type { Instrument, Question, QuestionOption, Responses } from "../types";
import { bandFor, sumScore } from "../scoring";

// BSCS — Brief Self-Control Scale (Tangney, Baumeister & Boone, 2004): 13
// itens sobre a capacidade de regular impulsos, emoções e comportamento em
// direção a metas. Nove itens são formulados como FALTA de autocontrole e
// invertidos na correção. Uso livre em pesquisa. Tradução autoral para o
// português brasileiro a partir do original em inglês.

const OPCOES: QuestionOption[] = [
  { label: "Nada a ver comigo", value: 1 },
  { label: "Pouco a ver comigo", value: 2 },
  { label: "Mais ou menos", value: 3 },
  { label: "Bastante a ver comigo", value: 4 },
  { label: "Tudo a ver comigo", value: 5 },
];

// [texto, invertido]
const raw: [string, boolean][] = [
  ["Sou bom(boa) em resistir a tentações.", false],
  ["Tenho dificuldade de largar maus hábitos.", true],
  ["Sou preguiçoso(a).", true],
  ["Digo coisas inadequadas.", true],
  ["Faço certas coisas que são ruins para mim, se forem divertidas.", true],
  ["Recuso coisas que são ruins para mim.", false],
  ["Gostaria de ter mais autodisciplina.", true],
  ["As pessoas diriam que tenho uma autodisciplina de ferro.", false],
  ["Prazer e diversão às vezes me impedem de fazer o que tenho que fazer.", true],
  ["Tenho dificuldade de me concentrar.", true],
  ["Consigo trabalhar de forma eficaz em direção a metas de longo prazo.", false],
  ["Às vezes não consigo me impedir de fazer algo, mesmo sabendo que é errado.", true],
  ["Frequentemente ajo sem pensar em todas as alternativas.", true],
];

const questions: Question[] = raw.map(([text, reverse], i) => ({
  id: `q${i + 1}`,
  text,
  ...(reverse ? { reverse: true } : {}),
}));

// Faixas convencionais a partir das médias em amostras adultas e universitárias
// (≈ 39–42, DP ≈ 8; Tangney et al., 2004). Não há ponto de corte diagnóstico.
const bands = [
  { min: 13, max: 31, label: "Autocontrole baixo", severity: "high" as const, description: "Abaixo de 1 desvio-padrão da média: dificuldade marcada para regular impulsos e sustentar esforço em direção a metas. Frequente no TDAH — mas autocontrole baixo também acompanha impulsividade de outras origens, e a correlação com sintomas de TDAH é moderada." },
  { min: 32, max: 47, label: "Faixa típica", severity: "none" as const, description: "Em torno da média populacional (≈40)." },
  { min: 48, max: 65, label: "Autocontrole alto", severity: "info" as const, description: "Acima de 1 desvio-padrão: autodisciplina acima do esperado." },
];

export const bscs: Instrument = {
  id: "bscs",
  acronym: "BSCS",
  name: "Escala Breve de Autocontrole",
  originalName: "Brief Self-Control Scale (Tangney, Baumeister & Boone, 2004)",
  category: "tdah",
  summary: "13 itens sobre resistir a impulsos, largar hábitos e sustentar esforço rumo a metas. Traço frequente no TDAH, sem ser um rastreio dele.",
  audience: "Adultos e adolescentes",
  estMinutes: 3,
  intro:
    "A BSCS mede autocontrole como traço: a capacidade de interromper um impulso, adiar uma gratificação e manter o esforço num objetivo distante. É uma das escalas mais citadas da psicologia, e o autocontrole baixo é uma das marcas do TDAH adulto — embora não seja exclusivo dele. Nove dos 13 itens descrevem FALTA de autocontrole e são invertidos na correção. As faixas são convencionais, a partir das médias populacionais.",
  instructions:
    "Para cada afirmação, indique o quanto ela tem a ver com você, de 'nada a ver comigo' a 'tudo a ver comigo'.",
  scaleType: "likert",
  defaultOptions: OPCOES,
  questions,
  interpretationBands: bands,
  primaryMetricLabel: "Pontuação total (13–65; maior = mais autocontrole)",
  references: [
    { label: "Tangney JP, Baumeister RF, Boone AL. High self-control predicts good adjustment, less pathology, better grades, and interpersonal success. J Pers. 2004;72(2):271-324." },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, OPCOES);
    const band = bandFor(total, bands);
    return {
      totalScore: total,
      maxScore: 65,
      minScore: 13,
      band,
      positive: total <= 31,
      positiveLabel: "Autocontrole baixo (31 ou menos) — aqui o 'positivo' é a pontuação baixa",
      negativeLabel: "Autocontrole dentro ou acima do esperado (total > 31)",
      notes: [
        "Maior pontuação = mais autocontrole. Aqui, diferente dos outros rastreios, o 'positivo' é a pontuação BAIXA.",
        "Autocontrole baixo é frequente no TDAH, mas a BSCS não rastreia TDAH: combine com um rastreio de sintomas (ASRS v1.1 ou ASRS-18 da ABDA) e, se for o caso, com a impulsividade da BIS-11.",
      ],
    };
  },
};
