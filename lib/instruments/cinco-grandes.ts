import type { Instrument, InterpretationBand, Question, Responses, Subscale } from "../types";
import { LIKERT_1_5 } from "./options";
import { scoreProfile } from "./profile-score";

// Itens originais em PT-BR baseados no modelo lexical dos Cinco Grandes.
// Não reproduzem BFI, NEO-PI-R, IPIP-50 ou TIPI.

const subscales: Subscale[] = [
  { key: "abertura", name: "Abertura à experiência", description: "Curiosidade, imaginação, variedade e interesse por ideias." },
  { key: "conscienciosidade", name: "Conscienciosidade", description: "Organização, constância, planejamento e conclusão." },
  { key: "extroversao", name: "Extroversão", description: "Energia social, expressão e busca de interação." },
  { key: "amabilidade", name: "Amabilidade", description: "Cooperação, confiança, consideração e conciliação." },
  { key: "estabilidade", name: "Estabilidade emocional", description: "Recuperação, segurança e menor reatividade ao estresse." },
];

const raw: Array<[string, string, boolean?]> = [
  ["abertura", "Procuro ideias novas mesmo quando desafiam minha maneira habitual de pensar."],
  ["abertura", "Gosto de imaginar possibilidades e cenários que ainda não existem."],
  ["abertura", "Assuntos abstratos, artísticos ou científicos despertam minha curiosidade."],
  ["abertura", "Prefiro manter apenas métodos conhecidos, mesmo quando há espaço para experimentar.", true],
  ["abertura", "Raramente sinto vontade de explorar um tema fora da minha rotina.", true],
  ["abertura", "Tenho pouco interesse por interpretações diferentes da minha.", true],

  ["conscienciosidade", "Transformo objetivos importantes em etapas concretas."],
  ["conscienciosidade", "Costumo cumprir compromissos mesmo depois que o entusiasmo inicial passa."],
  ["conscienciosidade", "Organizo materiais, prazos ou informações para facilitar minha execução."],
  ["conscienciosidade", "Deixo tarefas importantes pela metade com frequência.", true],
  ["conscienciosidade", "Começo a agir sem pensar nas consequências ou nos recursos necessários.", true],
  ["conscienciosidade", "Perco prazos por não acompanhar o andamento do que assumi.", true],

  ["extroversao", "Interações sociais costumam aumentar minha energia."],
  ["extroversao", "Expresso minhas ideias com facilidade em grupos."],
  ["extroversao", "Tomo a iniciativa para conhecer pessoas ou iniciar conversas."],
  ["extroversao", "Depois de pouco tempo em grupo, geralmente preciso me afastar para recuperar energia.", true],
  ["extroversao", "Prefiro observar a ocupar espaço em uma conversa.", true],
  ["extroversao", "Evito ser o centro das atenções mesmo quando conheço bem o assunto.", true],

  ["amabilidade", "Procuro compreender a perspectiva de alguém antes de responder a um conflito."],
  ["amabilidade", "Coopero com facilidade quando o grupo precisa ajustar planos."],
  ["amabilidade", "Levo em conta como minhas decisões afetam outras pessoas."],
  ["amabilidade", "Desconfio das intenções das pessoas até que provem o contrário.", true],
  ["amabilidade", "Em discussões, vencer costuma importar mais do que preservar a relação.", true],
  ["amabilidade", "Tenho pouca paciência com fragilidades ou erros alheios.", true],

  ["estabilidade", "Consigo recuperar o equilíbrio depois de um contratempo."],
  ["estabilidade", "Sob pressão, ainda consigo organizar pensamento e ação."],
  ["estabilidade", "Incertezas não costumam dominar minha atenção por muito tempo."],
  ["estabilidade", "Preocupo-me por muito tempo com situações que talvez nem aconteçam.", true],
  ["estabilidade", "Pequenas frustrações podem alterar bastante meu estado emocional.", true],
  ["estabilidade", "Demoro para me acalmar depois de uma experiência estressante.", true],
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
    max: 5,
    label: "Perfil dimensional",
    severity: "info",
    description: "Não existe perfil aprovado ou ideal. Interprete cada dimensão separadamente e em contexto.",
  },
];

export const cincoGrandes: Instrument = {
  id: "cinco-grandes",
  acronym: "5F-AHSD",
  name: "Personalidade — Cinco Grandes Fatores",
  originalName: "Módulo autoral baseado no modelo Big Five — não reproduz BFI, NEO, IPIP-50 ou TIPI",
  category: "altas-habilidades",
  summary: "Perfil contextual de abertura, conscienciosidade, extroversão, amabilidade e estabilidade emocional.",
  audience: "Adolescentes e adultos",
  estMinutes: 7,
  intro:
    "Personalidade e capacidade são construtos diferentes. Este perfil ajuda a interpretar como curiosidade, organização, sociabilidade, cooperação e reatividade podem influenciar a expressão de talentos, sem presumir uma 'personalidade superdotada'.",
  instructions:
    "Responda como você tende a agir na maior parte das situações. Compare-se com seu padrão habitual, não com quem gostaria de ser.",
  scaleType: "likert",
  defaultOptions: LIKERT_1_5,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Média geral descritiva (não interpretável isoladamente)",
  references: [
    { label: "Goldberg LR. The development of markers for the Big-Five factor structure. Psychological Assessment, 1992." },
    { label: "John OP, Srivastava S. The Big Five trait taxonomy. Handbook of Personality, 1999." },
    {
      label: "Fries J, Kovacs K, Zeilinger EL, Pietschnig J. Is there a gifted personality? 2022.",
      url: "https://doi.org/10.3390/jintelligence10040092",
    },
  ],
  score: (responses: Responses) =>
    scoreProfile({
      questions,
      responses,
      defaultOptions: LIKERT_1_5,
      subscales,
      bands,
      attachSubscaleBands: false,
      sortSubscales: false,
      notes: (results) => {
        const sorted = [...results].sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0));
        return [
          `Dimensões relativamente mais altas neste perfil: ${sorted
            .slice(0, 2)
            .map((result) => `${result.name} (${result.mean})`)
            .join(" e ")}.`,
          "Diferenças entre dimensões descrevem tendências, não capacidade, mérito, diagnóstico ou adequação.",
        ];
      },
    }),
};
