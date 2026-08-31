import type { Instrument, InterpretationBand, Question, Responses, Subscale } from "../types";
import { LIKERT_1_5 } from "./options";
import { scoreProfile } from "./profile-score";

// Itens originais em PT-BR, organizados a partir da distinção entre busca de
// excelência e preocupações perfeccionistas. Não reproduz MPS, H&F-MPS ou APS-R.

const subscales: Subscale[] = [
  {
    key: "padroes",
    name: "Padrões elevados",
    description: "Busca de qualidade, organização e metas desafiadoras — uma força possível.",
  },
  {
    key: "erros",
    name: "Preocupação com erros",
    description: "Peso emocional atribuído a falhas, correções e resultados imperfeitos.",
  },
  {
    key: "autocritica",
    name: "Dúvida e autocrítica",
    description: "Incerteza persistente sobre a própria entrega e julgamento interno rígido.",
  },
  {
    key: "discrepancia",
    name: "Discrepância e pressão",
    description: "Sensação de nunca alcançar o padrão esperado, mesmo com bons resultados.",
  },
];

const raw: Array<[string, string, boolean?]> = [
  ["padroes", "Gosto de definir metas desafiadoras que dão direção ao meu esforço."],
  ["padroes", "Tenho prazer em aperfeiçoar um trabalho quando isso melhora o resultado."],
  ["padroes", "Consigo priorizar qualidade sem perder de vista prazo e finalidade."],
  ["padroes", "Organizo etapas e critérios antes de começar tarefas importantes."],
  ["padroes", "Mantenho critérios de qualidade mesmo quando ninguém vai revisar meu trabalho."],

  ["erros", "Um erro pequeno pode fazer o trabalho inteiro parecer fracassado."],
  ["erros", "Evito mostrar algo enquanto ainda existe qualquer imperfeição visível."],
  ["erros", "Consigo tratar erros como informação para a próxima tentativa.", true],
  ["erros", "Depois de entregar um trabalho, continuo revendo mentalmente possíveis falhas."],
  ["erros", "Receber uma correção costuma abalar minha confiança além daquela tarefa."],

  ["autocritica", "Mesmo após conferir várias vezes, duvido se fiz o suficiente."],
  ["autocritica", "Minha fala interna é mais dura comigo do que seria com outra pessoa."],
  ["autocritica", "Consigo encerrar uma tarefa quando ela atende ao objetivo combinado.", true],
  ["autocritica", "Tenho dificuldade de decidir porque procuro uma opção sem risco de erro."],
  ["autocritica", "Desconto meus progressos quando ainda não alcancei o resultado ideal."],

  ["discrepancia", "A distância entre o que faço e o que considero ideal quase sempre parece grande."],
  ["discrepancia", "Bons resultados trazem alívio breve e logo viram uma nova obrigação."],
  ["discrepancia", "Sinto que meu valor depende de manter um desempenho excepcional."],
  ["discrepancia", "Consigo sentir satisfação por um resultado bom, mesmo que não seja perfeito.", true],
  ["discrepancia", "Expectativas próprias ou alheias fazem minhas metas parecerem difíceis de sustentar."],
];

const questions: Question[] = raw.map(([subscale, text, reverse], index) => ({
  id: `q${index + 1}`,
  text,
  subscale,
  reverse,
}));

const bands: InterpretationBand[] = [
  {
    min: 1,
    max: 2.49,
    label: "Baixa carga rígida",
    severity: "none",
    description: "Pouca presença de preocupações perfeccionistas rígidas no autorrelato.",
  },
  {
    min: 2.5,
    max: 3.49,
    label: "Carga moderada",
    severity: "mild",
    description: "Há tensão perfeccionista em algumas situações; observe custos e contextos.",
  },
  {
    min: 3.5,
    max: 4.19,
    label: "Carga elevada",
    severity: "moderate",
    description: "Preocupação com erros, autocrítica ou discrepância podem consumir recursos importantes.",
  },
  {
    min: 4.2,
    max: 5,
    label: "Carga muito elevada",
    severity: "high",
    description: "Os custos do perfeccionismo rígido aparecem intensamente e merecem aprofundamento.",
  },
];

const riskKeys = ["erros", "autocritica", "discrepancia"];

export const perfeccionismoAutocritica: Instrument = {
  id: "perfeccionismo-autocritica",
  acronym: "PERF-AHSD",
  name: "Perfeccionismo e Autocrítica",
  originalName: "Módulo autoral de perfil — não reproduz escalas MPS",
  category: "altas-habilidades",
  summary: "Distingue padrões elevados de preocupação com erros, autocrítica e pressão por desempenho.",
  audience: "Adolescentes e adultos",
  estMinutes: 5,
  intro:
    "Buscar excelência pode apoiar o desenvolvimento de talentos; já a preocupação rígida com erros, a autocrítica e a sensação de nunca atingir o esperado podem gerar sofrimento ou bloqueio. Por isso, o resultado separa padrões elevados dos custos perfeccionistas.",
  instructions:
    "Indique o quanto cada afirmação descreve sua maneira habitual de lidar com metas, erros, prazos e avaliação.",
  scaleType: "likert",
  defaultOptions: LIKERT_1_5,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Carga perfeccionista rígida (média 1–5)",
  references: [
    { label: "Frost RO et al. The dimensions of perfectionism. Cognitive Therapy and Research, 1990." },
    { label: "Hewitt PL, Flett GL. Perfectionism and psychopathology. Journal of Abnormal Psychology, 1991." },
    {
      label: "Dixon FA, Lapsley DK, Hanchon TA. An empirical typology of perfectionism in gifted adolescents. 2004.",
      url: "https://doi.org/10.1177/001698620404800203",
    },
  ],
  score: (responses: Responses) =>
    scoreProfile({
      questions,
      responses,
      defaultOptions: LIKERT_1_5,
      subscales,
      bands,
      primarySubscaleKeys: riskKeys,
      notes: (results) => {
        const standards = results.find((result) => result.key === "padroes");
        const risk = results.filter((result) => riskKeys.includes(result.key))[0];
        return [
          standards ? `Padrões elevados: média ${standards.mean}/5 — leia esta dimensão como estilo de busca de qualidade, não como problema por si só.` : "",
          risk ? `Maior custo associado: ${risk.name} (média ${risk.mean}).` : "",
          "A pontuação principal usa apenas preocupação com erros, autocrítica e discrepância; padrões elevados aparecem separadamente.",
        ].filter(Boolean);
      },
    }),
};
