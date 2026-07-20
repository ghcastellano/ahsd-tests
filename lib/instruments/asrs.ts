import type { Instrument, Question, Responses } from "../types";
import { FREQ_0_4 } from "./options";

// Part A = items 1-6 (screener). Part B = items 7-18 (supporting).
const partA = [
  "Com que frequência você tem dificuldade para finalizar os detalhes finais de um projeto, depois que as partes mais difíceis já foram feitas?",
  "Com que frequência você tem dificuldade para colocar as coisas em ordem quando precisa realizar uma tarefa que exige organização?",
  "Com que frequência você tem dificuldade para lembrar de compromissos ou obrigações?",
  "Quando você tem uma tarefa que exige muita reflexão, com que frequência você evita ou adia começá-la?",
  "Com que frequência você mexe as mãos ou os pés, ou se remexe na cadeira, quando precisa ficar sentado(a) por muito tempo?",
  "Com que frequência você se sente ativo(a) em excesso e compelido(a) a fazer coisas, como se estivesse movido(a) por um motor?",
];
const partB = [
  "Com que frequência você comete erros por falta de atenção quando precisa trabalhar em um projeto chato ou difícil?",
  "Com que frequência você tem dificuldade para manter a atenção quando está fazendo um trabalho chato ou repetitivo?",
  "Com que frequência você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando falam diretamente com você?",
  "Com que frequência você perde ou tem dificuldade para encontrar coisas em casa ou no trabalho?",
  "Com que frequência você se distrai com atividades ou barulhos ao seu redor?",
  "Com que frequência você se levanta da cadeira em reuniões ou situações em que deveria permanecer sentado(a)?",
  "Com que frequência você se sente inquieto(a) ou agitado(a)?",
  "Com que frequência você tem dificuldade para relaxar e sossegar quando tem tempo livre?",
  "Com que frequência você fala demais em situações sociais?",
  "Quando está em uma conversa, com que frequência você termina as frases das pessoas antes que elas mesmas terminem?",
  "Com que frequência você tem dificuldade para esperar a sua vez em situações que exigem revezamento?",
  "Com que frequência você interrompe os outros quando eles estão ocupados?",
];

const questions: Question[] = [
  ...partA.map((text, i) => ({ id: `q${i + 1}`, text, subscale: "A" })),
  ...partB.map((text, i) => ({ id: `q${i + 7}`, text, subscale: "B" })),
];

const bands = [
  { min: 0, max: 3, label: "Abaixo do limiar", severity: "none" as const, description: "Menos de 4 marcas na Parte A. Sintomas atuais pouco consistentes com TDAH no adulto pelo rastreio da OMS." },
  { min: 4, max: 6, label: "Rastreio positivo", severity: "high" as const, description: "4 ou mais marcas na Parte A: os sintomas são altamente consistentes com TDAH no adulto. Recomenda-se avaliação clínica especializada." },
];

/**
 * Part A shaded-box rule (WHO/Harvard):
 *  - items 1,2,3 count as a mark if answer is Às vezes(2) / Frequentemente(3) / Muito frequentemente(4)
 *  - items 4,5,6 count as a mark if answer is Frequentemente(3) / Muito frequentemente(4)
 *  - 4+ marks = screen positive
 */
function partAMarks(r: Responses): number {
  let marks = 0;
  for (const idx of [1, 2, 3]) if ((r[`q${idx}`] ?? 0) >= 2) marks++;
  for (const idx of [4, 5, 6]) if ((r[`q${idx}`] ?? 0) >= 3) marks++;
  return marks;
}

export const asrs: Instrument = {
  id: "asrs-18",
  acronym: "ASRS v1.1",
  name: "Escala de Autorrelato de TDAH no Adulto (OMS)",
  originalName: "Adult ADHD Self-Report Scale v1.1 (Kessler et al., 2005 / WHO)",
  category: "tdah",
  summary: "Rastreio de sintomas de TDAH em adultos. A Parte A (6 itens) é o rastreador validado; a Parte B complementa o quadro.",
  audience: "Adultos (18+)",
  estMinutes: 4,
  intro:
    "A ASRS v1.1 foi desenvolvida pela Organização Mundial da Saúde para rastrear sintomas de TDAH em adultos. As 6 questões da Parte A são o rastreador central: quatro ou mais marcas indicam sintomas altamente consistentes com TDAH e sugerem avaliação clínica. As 12 questões da Parte B trazem informações adicionais.",
  instructions:
    "Pensando nos últimos 6 meses, indique a frequência com que cada situação ocorreu com você.",
  scaleType: "custom",
  defaultOptions: FREQ_0_4,
  questions,
  subscales: [
    { key: "A", name: "Parte A — Rastreador", description: "6 itens centrais do rastreio da OMS." },
    { key: "B", name: "Parte B — Sintomas complementares", description: "12 itens de apoio ao quadro clínico." },
  ],
  interpretationBands: bands,
  primaryMetricLabel: "Marcas na Parte A (0–6)",
  references: [
    { label: "Kessler RC, et al. The World Health Organization Adult ADHD Self-Report Scale (ASRS). Psychol Med. 2005;35(2):245-256." },
    { label: "Escala da OMS, de uso livre para fins clínicos e de pesquisa." },
  ],
  score: (r: Responses) => {
    const marks = partAMarks(r);
    const band = bands.find((b) => marks >= b.min && marks <= b.max) ?? bands[0];
    // Supplementary: how many Part B items are in the high-frequency range (>=3, or >=2 for the "inattention" style items).
    const partBHigh = questions.filter((q) => q.subscale === "B" && (r[q.id] ?? 0) >= 3).length;
    const notes = [
      `Parte A: ${marks} de 6 marcas.`,
      `Parte B: ${partBHigh} de 12 itens na faixa de alta frequência (informação complementar, não define o rastreio).`,
    ];
    return {
      totalScore: marks,
      maxScore: 6,
      band,
      positive: marks >= 4,
      positiveLabel: "Rastreio positivo (≥4 marcas na Parte A)",
      subscales: [
        { key: "A", name: "Parte A — Rastreador", raw: marks, max: 6 },
        { key: "B", name: "Parte B — Itens em alta frequência", raw: partBHigh, max: 12 },
      ],
      notes,
    };
  },
};
