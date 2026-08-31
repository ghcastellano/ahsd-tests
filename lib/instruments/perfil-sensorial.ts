import type { Instrument, InterpretationBand, Question, Responses, Subscale } from "../types";
import { LIKERT_1_5 } from "./options";
import { scoreProfile } from "./profile-score";

// Itens originais em PT-BR. Este perfil não reproduz o HSPS nem o Adolescent/
// Adult Sensory Profile e não classifica transtorno de processamento sensorial.

const subscales: Subscale[] = [
  { key: "auditiva", name: "Auditiva", description: "Percepção e impacto de sons, vozes e ruído de fundo." },
  { key: "visual", name: "Visual", description: "Impacto de luz, movimento, contraste e excesso de informação visual." },
  { key: "tatil", name: "Tátil e corporal", description: "Contato, tecidos, temperatura e sensações na pele ou no corpo." },
  { key: "quimica", name: "Olfativa e gustativa", description: "Percepção de cheiros, sabores e características de alimentos." },
  { key: "interocepcao", name: "Interocepção", description: "Percepção de fome, sede, tensão, cansaço e outras pistas internas." },
  { key: "recuperacao", name: "Sobrecarga e recuperação", description: "Custo de ambientes intensos e necessidade de reduzir estímulos." },
];

const raw: Array<[string, string, boolean?]> = [
  ["auditiva", "Percebo sons baixos ou distantes que outras pessoas parecem não notar."],
  ["auditiva", "Tenho dificuldade de manter o foco quando várias conversas acontecem ao mesmo tempo."],
  ["auditiva", "Ruídos repetitivos ou imprevisíveis podem consumir rapidamente minha energia."],
  ["auditiva", "Consigo ignorar facilmente sons irrelevantes ao meu redor.", true],

  ["visual", "Luz forte, piscante ou muito branca pode me cansar ou incomodar."],
  ["visual", "Percebo detalhes visuais, mudanças ou padrões com rapidez."],
  ["visual", "Ambientes visualmente carregados dificultam encontrar o que procuro."],
  ["visual", "Movimento e excesso de informação visual raramente afetam minha concentração.", true],

  ["tatil", "Etiquetas, costuras ou certos tecidos podem permanecer muito presentes na minha atenção."],
  ["tatil", "Contato físico inesperado pode ser mais intenso para mim do que para outras pessoas."],
  ["tatil", "Percebo pequenas mudanças de temperatura ou desconforto corporal rapidamente."],
  ["tatil", "Adapto-me sem dificuldade a diferentes texturas, roupas e superfícies.", true],

  ["quimica", "Cheiros sutis ou misturados chamam minha atenção com facilidade."],
  ["quimica", "Sabores, consistências ou temperaturas específicas influenciam muito minhas escolhas alimentares."],
  ["quimica", "Perfumes ou odores fortes podem causar desconforto ou vontade de sair do ambiente."],
  ["quimica", "Quase nunca noto cheiros ou sabores antes das outras pessoas.", true],

  ["interocepcao", "Percebo cedo sinais de fome, sede, tensão ou cansaço no meu corpo."],
  ["interocepcao", "Mudanças internas pequenas podem ocupar bastante minha atenção."],
  ["interocepcao", "Consigo identificar com clareza de que meu corpo precisa em diferentes momentos."],
  ["interocepcao", "Às vezes só percebo uma necessidade corporal quando ela já está muito intensa.", true],

  ["recuperacao", "Depois de um ambiente intenso, preciso de silêncio ou isolamento para recuperar energia."],
  ["recuperacao", "Muitos estímulos simultâneos podem me deixar irritado(a), confuso(a) ou exausto(a)."],
  ["recuperacao", "Planejo pausas, rotas ou recursos para reduzir sobrecarga sensorial."],
  ["recuperacao", "Passo de um ambiente muito estimulante para outra tarefa sem precisar me recompor.", true],
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
    label: "Sensibilidade pouco presente",
    severity: "none",
    description: "Pouco impacto sensorial relatado nesta aplicação.",
  },
  {
    min: 2.5,
    max: 3.49,
    label: "Sensibilidade moderada",
    severity: "low",
    description: "Algumas modalidades ou contextos têm impacto perceptível.",
  },
  {
    min: 3.5,
    max: 4.19,
    label: "Sensibilidade elevada",
    severity: "moderate",
    description: "A sensibilidade aparece de forma consistente; observe as dimensões mais altas.",
  },
  {
    min: 4.2,
    max: 5,
    label: "Sensibilidade muito elevada",
    severity: "high",
    description: "Estímulos e recuperação têm impacto intenso no cotidiano relatado.",
  },
];

export const perfilSensorial: Instrument = {
  id: "perfil-sensorial",
  acronym: "SENSORIAL",
  name: "Sensibilidade e Processamento Sensorial",
  originalName: "Módulo autoral de perfil — não reproduz HSPS ou AASP",
  category: "altas-habilidades",
  summary: "Aprofunda seis dimensões sensoriais, incluindo interocepção, sobrecarga e recuperação.",
  audience: "Adolescentes e adultos",
  estMinutes: 6,
  intro:
    "Diferenças na percepção e no impacto de estímulos podem influenciar foco, energia, conforto e participação. Elas também aparecem em diferentes perfis neurodivergentes, mas não identificam AH/SD, autismo, TDAH ou qualquer transtorno isoladamente. O objetivo é localizar necessidades e recursos por modalidade.",
  instructions:
    "Responda pensando em diferentes ambientes e no seu padrão habitual, não apenas em um dia excepcionalmente cansativo.",
  scaleType: "likert",
  defaultOptions: LIKERT_1_5,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Sensibilidade geral percebida (média 1–5)",
  references: [
    { label: "Aron EN, Aron A. Sensory-processing sensitivity and its relation to introversion and emotionality. 1997." },
    { label: "Dunn W. The impact of sensory processing abilities on daily life. 1997." },
    {
      label: "Gillioz C, Nicolet-dit-Félix M, Fiori M. Emotional intelligence and emotional hypersensitivity in gifted individuals. 2023.",
      url: "https://doi.org/10.3390/jintelligence11020020",
    },
  ],
  score: (responses: Responses) =>
    scoreProfile({
      questions,
      responses,
      defaultOptions: LIKERT_1_5,
      subscales,
      bands,
      notes: (results) => [
        `Dimensões mais marcantes: ${results
          .slice(0, 2)
          .map((result) => `${result.name} (${result.mean})`)
          .join(" e ")}.`,
        "Uma média alta descreve impacto percebido, não déficit. Contexto, sono, estresse e condições clínicas também podem alterar a experiência sensorial.",
      ],
    }),
};
