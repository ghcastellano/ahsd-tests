import type { Instrument, Question, QuestionOption, Responses, Subscale } from "../types";
import { bandFor, scoreSubscales, sumScore } from "../scoring";

// BIS-11 (Patton, Stanford & Barratt, 1995): 30 itens, três fatores de segunda
// ordem — impulsividade atencional, motora e por não planejamento. Onze itens
// são invertidos. Validação brasileira: Malloy-Diniz et al. (2010). Faixas de
// interpretação do total: Stanford et al. (2009). Tradução autoral para o
// português brasileiro a partir do original em inglês.

const OPCOES: QuestionOption[] = [
  { label: "Raramente / nunca", value: 1 },
  { label: "De vez em quando", value: 2 },
  { label: "Frequentemente", value: 3 },
  { label: "Quase sempre / sempre", value: 4 },
];

// [texto, fator, invertido]
type Fator = "atencional" | "motora" | "nao-planejamento";
const raw: [string, Fator, boolean][] = [
  ["Planejo minhas tarefas com cuidado.", "nao-planejamento", true],
  ["Faço as coisas sem pensar.", "motora", false],
  ["Decido as coisas rapidamente.", "motora", false],
  ["Sou despreocupado(a), 'deixo a vida me levar'.", "motora", false],
  ["Não presto atenção.", "atencional", false],
  ["Tenho pensamentos acelerados.", "atencional", false],
  ["Planejo viagens com bastante antecedência.", "nao-planejamento", true],
  ["Tenho autocontrole.", "nao-planejamento", true],
  ["Concentro-me com facilidade.", "atencional", true],
  ["Poupo dinheiro regularmente.", "nao-planejamento", true],
  ["Fico me remexendo em peças de teatro ou palestras.", "atencional", false],
  ["Penso nas coisas com cuidado.", "nao-planejamento", true],
  ["Planejo minha segurança no trabalho.", "nao-planejamento", true],
  ["Digo as coisas sem pensar.", "nao-planejamento", false],
  ["Gosto de pensar em problemas complexos.", "nao-planejamento", true],
  ["Troco de emprego.", "motora", false],
  ["Ajo por impulso.", "motora", false],
  ["Fico entediado(a) com facilidade quando estou resolvendo problemas que exigem raciocínio.", "nao-planejamento", false],
  ["Ajo no calor do momento.", "motora", false],
  ["Sou uma pessoa de raciocínio constante.", "atencional", true],
  ["Troco de casa (mudo de residência).", "motora", false],
  ["Compro coisas por impulso.", "motora", false],
  ["Só consigo pensar em uma coisa de cada vez.", "motora", false],
  ["Troco de passatempos (hobbies).", "atencional", false],
  ["Gasto ou fio mais do que ganho.", "motora", false],
  ["Enquanto estou pensando, com frequência me vêm pensamentos que não têm a ver com o assunto.", "atencional", false],
  ["Tenho mais interesse no presente do que no futuro.", "nao-planejamento", false],
  ["Fico inquieto(a) no teatro ou em palestras.", "atencional", false],
  ["Gosto de quebra-cabeças e enigmas.", "nao-planejamento", true],
  ["Sou orientado(a) para o futuro.", "motora", true],
];

const questions: Question[] = raw.map(([text, subscale, reverse], i) => ({
  id: `q${i + 1}`,
  text,
  subscale,
  ...(reverse ? { reverse: true } : {}),
}));

const subscales: Subscale[] = [
  { key: "atencional", name: "Impulsividade atencional", description: "Atenção e instabilidade cognitiva (8 itens)." },
  { key: "motora", name: "Impulsividade motora", description: "Agir sem pensar e falta de perseverança (11 itens)." },
  { key: "nao-planejamento", name: "Impulsividade por não planejamento", description: "Autocontrole e complexidade cognitiva (11 itens)." },
];

const bands = [
  { min: 30, max: 51, label: "Abaixo da faixa típica", severity: "info" as const, description: "Menos de 52: pontuação incomum, que sugere pessoa muito controlada — ou respostas pouco sinceras (Stanford et al., 2009)." },
  { min: 52, max: 71, label: "Faixa típica", severity: "none" as const, description: "52 a 71: impulsividade dentro do esperado para a população geral." },
  { min: 72, max: 120, label: "Impulsividade alta", severity: "high" as const, description: "72 ou mais: impulsividade elevada. Não é diagnóstico de nada por si só — impulsividade alta aparece no TDAH, mas também em transtornos do humor, uso de substâncias e outros quadros." },
];

export const bis11: Instrument = {
  id: "bis-11",
  acronym: "BIS-11",
  name: "Escala de Impulsividade de Barratt — versão 11",
  originalName: "Barratt Impulsiveness Scale, version 11 (Patton, Stanford & Barratt, 1995); validação brasileira de Malloy-Diniz et al. (2010)",
  category: "tdah",
  summary: "Impulsividade em três dimensões: atencional, motora e por não planejamento. Traço frequente no TDAH, mas não exclusivo dele.",
  audience: "Adultos e adolescentes",
  estMinutes: 5,
  intro:
    "A BIS-11 é a medida de impulsividade mais citada na literatura. Ela não rastreia TDAH diretamente: mede um traço — a tendência a agir sem pensar, a dificuldade de sustentar atenção e a pouca orientação para o futuro — que é central no TDAH, mas aparece também em outros quadros. Onze itens são formulados 'ao contrário' (descrevem controle) e são invertidos na correção. O total vai de 30 a 120; a faixa típica é 52 a 71.",
  instructions:
    "As pessoas diferem no modo como pensam e agem em situações diferentes. Para cada afirmação, indique com que frequência ela se aplica a você. Não pense demais em cada item: responda de forma rápida e honesta.",
  scaleType: "likert",
  defaultOptions: OPCOES,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Pontuação total (30–120)",
  references: [
    { label: "Patton JH, Stanford MS, Barratt ES. Factor structure of the Barratt Impulsiveness Scale. J Clin Psychol. 1995;51(6):768-774." },
    { label: "Malloy-Diniz LF, et al. Tradução e adaptação cultural da Barratt Impulsiveness Scale (BIS-11) para aplicação em adultos brasileiros. J Bras Psiquiatr. 2010;59(2):99-105." },
    { label: "Malloy-Diniz LF, et al. Normative data of the Barratt Impulsiveness Scale 11 (BIS-11) for Brazilian adults. Braz J Psychiatry. 2015;37(3):245-248." },
    { label: "Stanford MS, et al. Fifty years of the Barratt Impulsiveness Scale: an update and review. Pers Individ Dif. 2009;47(5):385-395." },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, OPCOES);
    const band = bandFor(total, bands);
    const subs = scoreSubscales(questions, r, OPCOES, subscales);
    const maior = [...subs].sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0))[0];
    return {
      totalScore: total,
      maxScore: 120,
      minScore: 30,
      band,
      positive: total >= 72,
      positiveLabel: "Impulsividade alta (72 ou mais)",
      negativeLabel: "Impulsividade dentro do esperado (abaixo de 72)",
      subscales: subs,
      notes: [
        `Dimensão mais elevada: ${maior.name} (média ${String(maior.mean).replace(".", ",")} por item, de 1 a 4).`,
        "As faixas (52–71 / ≥72) são as americanas de Stanford et al. (2009). Há normas brasileiras por percentil (Malloy-Diniz et al., 2015, n = 3.053), em que só a estrutura de DOIS fatores teve consistência interna aceitável — leia as três subescalas acima como indicativas, não como medidas separadas.",
        "Impulsividade é um traço, não um diagnóstico. No TDAH costuma vir acompanhada de desatenção — se o seu perfil for alto aqui, faça também um rastreio de sintomas (ASRS) e o retrospectivo de infância (WURS-25).",
      ],
    };
  },
};
