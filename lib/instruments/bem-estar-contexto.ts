import type { Instrument, InterpretationBand, Question, Responses, Subscale } from "../types";
import { LIKERT_1_5 } from "./options";
import { scoreProfile } from "./profile-score";

// Itens originais em PT-BR. Este módulo contextual não reproduz WHOQOL,
// Satisfaction With Life Scale ou qualquer instrumento clínico de qualidade de vida.

const subscales: Subscale[] = [
  { key: "autenticidade", name: "Autenticidade", description: "Espaço para pensar, sentir e agir sem esconder partes importantes de si." },
  { key: "pertencimento", name: "Pertencimento e suporte", description: "Vínculos em que há compreensão, reciprocidade e segurança." },
  { key: "desafio", name: "Desafio e engajamento", description: "Oportunidades compatíveis com o nível de curiosidade e capacidade percebida." },
  { key: "sentido", name: "Sentido e contribuição", description: "Coerência entre valores, talentos, escolhas e impacto desejado." },
  { key: "sustentabilidade", name: "Ritmo sustentável", description: "Limites, recuperação e uso de energia sem custo excessivo." },
];

const raw: Array<[string, string, boolean?]> = [
  ["autenticidade", "Posso demonstrar curiosidade, intensidade e interesses profundos sem precisar me diminuir."],
  ["autenticidade", "Minhas escolhas atuais combinam com aspectos importantes de quem sou."],
  ["autenticidade", "Sinto que preciso esconder capacidades ou interesses para ser aceito(a).", true],
  ["autenticidade", "Consigo comunicar minhas necessidades de forma clara e respeitosa."],

  ["pertencimento", "Tenho ao menos uma relação em que me sinto compreendido(a) em profundidade."],
  ["pertencimento", "Encontro pessoas ou grupos com quem posso trocar ideias no nível que preciso."],
  ["pertencimento", "Sinto-me sozinho(a) mesmo quando estou acompanhado(a).", true],
  ["pertencimento", "Posso pedir ajuda sem sentir que isso invalida minha autonomia ou capacidade."],

  ["desafio", "Minhas atividades atuais oferecem desafios suficientes para manter meu interesse."],
  ["desafio", "Tenho oportunidades reais de aprofundar assuntos ou habilidades importantes para mim."],
  ["desafio", "Passo tempo demais em tarefas repetitivas ou pouco significativas para mim.", true],
  ["desafio", "Consigo transformar curiosidade em projetos, prática ou aprendizagem contínua."],

  ["sentido", "Percebo conexão entre meus talentos e algo que considero valioso."],
  ["sentido", "Minhas atividades contribuem, mesmo em pequena escala, para pessoas ou causas importantes para mim."],
  ["sentido", "Tenho dificuldade de encontrar propósito no que faço atualmente.", true],
  ["sentido", "Consigo escolher prioridades mesmo tendo muitos interesses e possibilidades."],

  ["sustentabilidade", "Reconheço sinais de sobrecarga antes de ultrapassar meus limites."],
  ["sustentabilidade", "Reservo tempo suficiente para descanso, relações e atividades restauradoras."],
  ["sustentabilidade", "Meu ritmo de estudo, trabalho ou criação é difícil de sustentar.", true],
  ["sustentabilidade", "Consigo alternar períodos de intensidade com recuperação adequada."],
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
    label: "Recursos fragilizados",
    severity: "high",
    description: "Várias necessidades contextuais parecem pouco atendidas neste momento.",
  },
  {
    min: 2.5,
    max: 3.49,
    label: "Recursos oscilantes",
    severity: "moderate",
    description: "Há apoios presentes e lacunas relevantes; observe as dimensões mais baixas.",
  },
  {
    min: 3.5,
    max: 4.19,
    label: "Recursos presentes",
    severity: "low",
    description: "O contexto oferece recursos consistentes, ainda que algumas áreas possam pedir ajuste.",
  },
  {
    min: 4.2,
    max: 5,
    label: "Recursos fortes",
    severity: "none",
    description: "O autorrelato indica bom alinhamento entre necessidades, vínculos, desafio e ritmo.",
  },
];

export const bemEstarContexto: Instrument = {
  id: "bem-estar-contexto-ahsd",
  acronym: "BE-AHSD",
  name: "Bem-estar e Contexto em AH/SD",
  originalName: "Módulo autoral de contexto — não é uma escala clínica de qualidade de vida",
  category: "altas-habilidades",
  summary: "Mapeia autenticidade, pertencimento, desafio, sentido e sustentabilidade da rotina.",
  audience: "Adolescentes e adultos",
  estMinutes: 5,
  intro:
    "O bem-estar não decorre automaticamente da capacidade. Relações, desafio adequado, autenticidade, sentido e um ritmo sustentável podem favorecer ou limitar a expressão de talentos. Este módulo aponta recursos e lacunas contextuais para conversa e planejamento.",
  instructions:
    "Responda considerando as últimas quatro semanas e os ambientes em que você passa mais tempo.",
  scaleType: "likert",
  defaultOptions: LIKERT_1_5,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Recursos de bem-estar percebidos (média 1–5)",
  references: [
    {
      label: "Poirier J, Brault-Labbé A, Brassard A. Living With the Gift of Giftedness. Gifted Child Quarterly, 2025.",
      url: "https://pubmed.ncbi.nlm.nih.gov/40919079/",
    },
    { label: "Wirthwein L, Rost DH. Giftedness and subjective well-being: a study with adults. 2011." },
    {
      label: "Vötter B, Schnell T. Generativity, meaningfulness and self-control among gifted adults. 2019.",
      url: "https://doi.org/10.3389/fpsyg.2019.01972",
    },
  ],
  score: (responses: Responses) =>
    scoreProfile({
      questions,
      responses,
      defaultOptions: LIKERT_1_5,
      subscales,
      bands,
      sortSubscales: false,
      notes: (results) => {
        const lowest = [...results].sort((a, b) => (a.mean ?? 0) - (b.mean ?? 0)).slice(0, 2);
        return [
          `Áreas com maior espaço para apoio: ${lowest
            .map((result) => `${result.name} (${result.mean})`)
            .join(" e ")}.`,
          "Use as dimensões como perguntas para reflexão e planejamento; elas não avaliam inteligência nem substituem uma medida validada de qualidade de vida.",
        ];
      },
    }),
};
