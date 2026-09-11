import type { Instrument, Question, QuestionOption, Responses, Subscale } from "../types";
import { scoreSubscales } from "../scoring";

// SUPPS-P — UPPS-P Impulsive Behavior Scale, versão curta (Cyders, Littlefield,
// Coffey & Karyadi, 2014): 20 itens, 5 facetas de 4 itens. Validação brasileira:
// Sediyama et al. (2017). Diferente da BIS-11, separa a impulsividade em
// caminhos distintos — agir sob emoção negativa (urgência negativa) não é o
// mesmo que buscar sensações. No TDAH, urgência e falta de perseverança são as
// facetas que mais se destacam. Uso livre em pesquisa. Tradução autoral a
// partir do original em inglês.

// A escala original pontua 1 = concordo totalmente … 4 = discordo totalmente.
// Itens que descrevem controle (perseverança, premeditação) já ficam altos ao
// discordar; os 12 itens que descrevem impulsividade são invertidos para que
// maior = mais impulsivo em todas as facetas.
const OPCOES: QuestionOption[] = [
  { label: "Concordo totalmente", value: 1 },
  { label: "Concordo em parte", value: 2 },
  { label: "Discordo em parte", value: 3 },
  { label: "Discordo totalmente", value: 4 },
];

type Faceta = "urgencia-negativa" | "falta-perseveranca" | "falta-premeditacao" | "busca-sensacoes" | "urgencia-positiva";
// [texto, faceta, invertido]
const raw: [string, Faceta, boolean][] = [
  ["Em geral, gosto de levar as coisas até o fim.", "falta-perseveranca", false],
  ["Meu jeito de pensar costuma ser cuidadoso e com propósito.", "falta-premeditacao", false],
  ["Quando estou de ótimo humor, tendo a me meter em situações que podem me causar problemas.", "urgencia-positiva", true],
  ["Tarefas inacabadas me incomodam de verdade.", "falta-perseveranca", false],
  ["Gosto de parar e pensar bem antes de fazer as coisas.", "falta-premeditacao", false],
  ["Quando me sinto mal, muitas vezes faço coisas de que me arrependo depois, só para me sentir melhor na hora.", "urgencia-negativa", true],
  ["Depois que começo alguma coisa, detesto parar.", "falta-perseveranca", false],
  ["Às vezes, quando me sinto mal, não consigo parar o que estou fazendo, mesmo que isso esteja me fazendo sentir pior.", "urgencia-negativa", true],
  ["Gosto bastante de correr riscos.", "busca-sensacoes", true],
  ["Tendo a perder o controle quando estou de ótimo humor.", "urgencia-positiva", true],
  ["Termino o que começo.", "falta-perseveranca", false],
  ["Costumo valorizar e seguir uma abordagem racional e 'sensata' das coisas.", "falta-premeditacao", false],
  ["Quando estou chateado(a), muitas vezes ajo sem pensar.", "urgencia-negativa", true],
  ["Gosto de experiências e sensações novas e empolgantes, mesmo que sejam um pouco assustadoras ou fora do convencional.", "busca-sensacoes", true],
  ["Quando me sinto rejeitado(a), muitas vezes digo coisas de que me arrependo depois.", "urgencia-negativa", true],
  ["Eu gostaria de aprender a pilotar um avião.", "busca-sensacoes", true],
  ["As pessoas ficam chocadas ou preocupadas com as coisas que faço quando estou muito empolgado(a).", "urgencia-positiva", true],
  ["Normalmente penso com cuidado antes de fazer qualquer coisa.", "falta-premeditacao", false],
  ["Eu curtiria a sensação de descer esquiando bem rápido uma montanha alta.", "busca-sensacoes", true],
  ["Quando estou muito empolgado(a), tendo a não pensar nas consequências do que faço.", "urgencia-positiva", true],
];

const questions: Question[] = raw.map(([text, subscale, reverse], i) => ({
  id: `q${i + 1}`,
  text,
  subscale,
  ...(reverse ? { reverse: true } : {}),
}));

const subscales: Subscale[] = [
  { key: "urgencia-negativa", name: "Urgência negativa", description: "Agir precipitadamente sob emoção negativa." },
  { key: "urgencia-positiva", name: "Urgência positiva", description: "Agir precipitadamente sob emoção positiva intensa." },
  { key: "falta-premeditacao", name: "Falta de premeditação", description: "Agir sem pensar nas consequências." },
  { key: "falta-perseveranca", name: "Falta de perseverança", description: "Dificuldade de manter o foco em tarefas chatas ou longas." },
  { key: "busca-sensacoes", name: "Busca de sensações", description: "Gosto por experiências novas e arriscadas." },
];

// Faixas convencionais sobre a média por item (1–4). Não há corte clínico:
// a escala é dimensional (Cyders et al., 2014).
const bands = [
  { min: 1, max: 1.99, label: "Impulsividade baixa", severity: "none" as const, description: "Média abaixo de 2: na maioria das facetas você tende a discordar das descrições de impulsividade." },
  { min: 2, max: 2.99, label: "Impulsividade moderada", severity: "low" as const, description: "Média entre 2 e 3: faixa onde está a maior parte das pessoas. Veja no detalhamento qual faceta puxa para cima — o padrão importa mais que o total." },
  { min: 3, max: 4, label: "Impulsividade alta", severity: "high" as const, description: "Média de 3 ou mais: você concorda com a maioria das descrições de impulsividade. Urgência (negativa ou positiva) e falta de perseverança altas são as facetas mais ligadas ao TDAH; busca de sensações alta, sozinha, não é." },
];

export const uppsP: Instrument = {
  id: "upps-p",
  acronym: "UPPS-P (curta)",
  name: "Escala de Comportamento Impulsivo UPPS-P — versão curta",
  originalName: "Short UPPS-P Impulsive Behavior Scale (Cyders, Littlefield, Coffey & Karyadi, 2014); validação brasileira de Sediyama et al. (2017)",
  category: "tdah",
  summary: "Impulsividade em cinco caminhos diferentes: urgência negativa e positiva, falta de premeditação, falta de perseverança e busca de sensações.",
  audience: "Adultos e adolescentes",
  estMinutes: 4,
  intro:
    "A UPPS-P parte de uma ideia simples: 'impulsividade' não é uma coisa só. Agir sem pensar quando se está chateado (urgência negativa) é diferente de não conseguir terminar uma tarefa chata (falta de perseverança), que é diferente de gostar de risco (busca de sensações). No TDAH, as facetas que mais se destacam são as urgências e a falta de perseverança. Não há ponto de corte clínico: o resultado é um perfil, e o que importa é qual faceta puxa para cima.",
  instructions:
    "Para cada afirmação, indique o quanto você concorda ou discorda, pensando em como você é habitualmente.",
  scaleType: "likert",
  defaultOptions: OPCOES,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Média geral por item (1–4; maior = mais impulsivo)",
  references: [
    { label: "Cyders MA, Littlefield AK, Coffey S, Karyadi KA. Examination of a short English version of the UPPS-P Impulsive Behavior Scale. Addict Behav. 2014;39(9):1372-1376." },
    { label: "Sediyama CYN, et al. Brazilian Portuguese adaptation of the short UPPS-P Impulsive Behavior Scale. Psychol Neurosci. 2017;10(3):313-321." },
    { label: "Whiteside SP, Lynam DR. The Five Factor Model and impulsivity. Pers Individ Dif. 2001;30(4):669-689." },
  ],
  score: (r: Responses) => {
    const subs = scoreSubscales(questions, r, OPCOES, subscales);
    const respondidas = questions.filter((q) => r[q.id] !== undefined).length;
    const soma = subs.reduce((a, s) => a + s.raw, 0);
    const media = respondidas ? Math.round((soma / respondidas) * 100) / 100 : 0;
    const band = bands.find((b) => media >= b.min && media <= b.max) ?? bands[0];
    const ordenadas = [...subs].sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0));
    const tdah = subs.filter((s) => ["urgencia-negativa", "urgencia-positiva", "falta-perseveranca"].includes(s.key) && (s.mean ?? 0) >= 3);
    return {
      totalScore: media,
      maxScore: 4,
      band,
      metricIsMean: true,
      positive: media >= 3,
      positiveLabel: "Impulsividade alta (média 3 ou mais)",
      negativeLabel: "Impulsividade dentro do esperado (média abaixo de 3)",
      subscales: subs,
      notes: [
        `Faceta mais alta: ${ordenadas[0].name} (média ${ordenadas[0].mean}); mais baixa: ${ordenadas[ordenadas.length - 1].name} (média ${ordenadas[ordenadas.length - 1].mean}).`,
        tdah.length
          ? `Facetas ligadas ao TDAH com média ≥ 3: ${tdah.map((s) => s.name).join(", ")}. Vale cruzar com um rastreio de sintomas (ASRS).`
          : "Nenhuma das facetas ligadas ao TDAH (urgências e falta de perseverança) está com média ≥ 3.",
        "Sem ponto de corte clínico: as faixas são convencionais. A validação brasileira (Sediyama et al., 2017) confirma a estrutura de 5 facetas, não estabelece norma.",
      ],
    };
  },
};
