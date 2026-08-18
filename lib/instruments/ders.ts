import type { Instrument, Question, Responses, Subscale } from "../types";
import { DERS_1_5 } from "./options";
import { bandFor, scoreSubscales, sumScore } from "../scoring";

// DERS (Gratz & Roemer, 2004). 36 itens, 6 subescalas; 11 itens reversos.
// Total 36–180 (maior = mais dificuldade). Sem corte clínico oficial —
// interpretação por comparação normativa e por perfil de subescalas.

const REVERSE = new Set([1, 2, 6, 7, 8, 10, 17, 20, 22, 24, 34]);

const SUBSCALE_ITEMS: Record<string, number[]> = {
  "nao-aceitacao": [11, 12, 21, 23, 25, 29],
  metas: [13, 18, 20, 26, 33],
  impulso: [3, 14, 19, 24, 27, 32],
  consciencia: [2, 6, 8, 10, 17, 34],
  estrategias: [15, 16, 22, 28, 30, 31, 35, 36],
  clareza: [1, 4, 5, 7, 9],
};

function subscaleOf(n: number): string {
  for (const [key, list] of Object.entries(SUBSCALE_ITEMS)) {
    if (list.includes(n)) return key;
  }
  return "clareza";
}

const items = [
  "Tenho clareza sobre o que estou sentindo.",
  "Presto atenção em como me sinto.",
  "Vivo minhas emoções como avassaladoras e fora de controle.",
  "Não tenho ideia de como estou me sentindo.",
  "Tenho dificuldade de entender o que estou sentindo.",
  "Sou atento(a) aos meus sentimentos.",
  "Sei exatamente como estou me sentindo.",
  "Eu me importo com o que estou sentindo.",
  "Fico confuso(a) sobre como me sinto.",
  "Quando estou chateado(a), reconheço minhas emoções.",
  "Quando estou chateado(a), fico com raiva de mim mesmo(a) por me sentir assim.",
  "Quando estou chateado(a), fico envergonhado(a) por me sentir assim.",
  "Quando estou chateado(a), tenho dificuldade de realizar tarefas.",
  "Quando estou chateado(a), fico fora de controle.",
  "Quando estou chateado(a), acredito que vou continuar assim por muito tempo.",
  "Quando estou chateado(a), acredito que vou acabar me sentindo muito deprimido(a).",
  "Quando estou chateado(a), acredito que meus sentimentos são válidos e importantes.",
  "Quando estou chateado(a), tenho dificuldade de me concentrar em outras coisas.",
  "Quando estou chateado(a), sinto-me fora de controle.",
  "Quando estou chateado(a), ainda consigo fazer as coisas que preciso.",
  "Quando estou chateado(a), sinto vergonha de mim por me sentir assim.",
  "Quando estou chateado(a), sei que consigo encontrar uma forma de me sentir melhor.",
  "Quando estou chateado(a), sinto-me fraco(a).",
  "Quando estou chateado(a), sinto que consigo manter o controle dos meus comportamentos.",
  "Quando estou chateado(a), sinto culpa por me sentir assim.",
  "Quando estou chateado(a), tenho dificuldade de me concentrar.",
  "Quando estou chateado(a), tenho dificuldade de controlar meus comportamentos.",
  "Quando estou chateado(a), acredito que não há nada que eu possa fazer para me sentir melhor.",
  "Quando estou chateado(a), fico irritado(a) comigo mesmo(a) por me sentir assim.",
  "Quando estou chateado(a), começo a me sentir muito mal a meu próprio respeito.",
  "Quando estou chateado(a), acredito que me afundar nisso é tudo o que posso fazer.",
  "Quando estou chateado(a), perco o controle dos meus comportamentos.",
  "Quando estou chateado(a), tenho dificuldade de pensar em qualquer outra coisa.",
  "Quando estou chateado(a), tiro um tempo para descobrir o que realmente estou sentindo.",
  "Quando estou chateado(a), demoro muito para me sentir melhor.",
  "Quando estou chateado(a), minhas emoções parecem avassaladoras.",
];

const questions: Question[] = items.map((text, i) => {
  const n = i + 1;
  return { id: `q${n}`, text, reverse: REVERSE.has(n), subscale: subscaleOf(n) };
});

const subscales: Subscale[] = [
  { key: "nao-aceitacao", name: "Não aceitação das emoções", description: "Reações negativas às próprias emoções (culpa, vergonha, raiva de si)." },
  { key: "metas", name: "Dificuldade com metas", description: "Dificuldade de agir e se concentrar quando emocionalmente ativado(a)." },
  { key: "impulso", name: "Controle de impulsos", description: "Dificuldade de manter o controle do comportamento sob emoção intensa." },
  { key: "consciencia", name: "Consciência emocional", description: "Atenção e reconhecimento das próprias emoções." },
  { key: "estrategias", name: "Acesso a estratégias", description: "Crença de que há (ou não) o que fazer para se regular." },
  { key: "clareza", name: "Clareza emocional", description: "Saber identificar qual emoção está sentindo." },
];

const bands = [
  { min: 36, max: 79, label: "Faixa típica", severity: "none" as const, description: "Próximo ou abaixo da média populacional (≈78–80 em amostras comunitárias adultas). Dificuldades pontuais são esperadas e humanas." },
  { min: 80, max: 99, label: "Acima da média", severity: "moderate" as const, description: "Dificuldades de regulação emocional acima da média populacional. Observe as subescalas mais elevadas — elas indicam onde focar." },
  { min: 100, max: 180, label: "Bem acima da média", severity: "high" as const, description: "Nível de dificuldade comum em amostras clínicas. Psicoterapia (por exemplo, abordagens focadas em regulação emocional, como a DBT) tem bom suporte de evidências." },
];

export const ders: Instrument = {
  id: "ders",
  acronym: "DERS",
  name: "Escala de Dificuldades de Regulação Emocional",
  originalName: "Difficulties in Emotion Regulation Scale (Gratz & Roemer, 2004)",
  category: "regulacao-emocional",
  summary: "Mapeia dificuldades de regulação emocional em 6 dimensões. Relevante para intensidade emocional e dupla excepcionalidade.",
  audience: "Adolescentes e adultos",
  estMinutes: 7,
  intro:
    "A DERS avalia seis facetas da regulação emocional: aceitação das emoções, capacidade de agir sob emoção, controle de impulsos, consciência, acesso a estratégias e clareza. Não existe ponto de corte oficial: a leitura é feita por comparação com a média populacional (≈78–80) e, principalmente, pelo perfil das subescalas. Em pessoas com altas habilidades, a intensidade emocional elevada não é, por si só, um transtorno.",
  instructions:
    "Indique com que frequência cada afirmação se aplica a você.",
  scaleType: "likert",
  defaultOptions: DERS_1_5,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Pontuação total (36–180)",
  references: [
    { label: "Gratz KL, Roemer L. Multidimensional assessment of emotion regulation and dysregulation: the DERS. J Psychopathol Behav Assess. 2004;26(1):41-54." },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, DERS_1_5);
    const band = bandFor(total, bands);
    const subs = scoreSubscales(questions, r, DERS_1_5, subscales).sort(
      (a, b) => (b.mean ?? 0) - (a.mean ?? 0),
    );
    const highest = subs[0];
    const notes: string[] = [];
    if (highest && (highest.mean ?? 0) >= 3) {
      notes.push(`Dimensão com maior dificuldade: ${highest.name} (média ${highest.mean}/5).`);
    }
    notes.push(
      "A DERS não tem corte diagnóstico oficial; as faixas acima são referências normativas. O perfil das subescalas é mais informativo do que o total.",
    );
    return {
      totalScore: total,
      maxScore: 180,
      band,
      subscales: subs,
      notes,
    };
  },
};
