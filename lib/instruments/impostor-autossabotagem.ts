import type { Instrument, InterpretationBand, Question, Responses, Subscale } from "../types";
import { LIKERT_1_5 } from "./options";
import { scoreProfile } from "./profile-score";

// Itens originais em PT-BR. O módulo mapeia experiências associadas ao
// fenômeno do impostor e à autossabotagem sem reproduzir escalas proprietárias.

const subscales: Subscale[] = [
  {
    key: "desqualificacao",
    name: "Desqualificação das conquistas",
    description: "Dificuldade de reconhecer competência, esforço e resultados próprios.",
  },
  {
    key: "exposicao",
    name: "Medo de exposição",
    description: "Receio de ser avaliado(a), errar ou parecer menos capaz do que esperam.",
  },
  {
    key: "atribuicao",
    name: "Atribuição externa",
    description: "Tendência a explicar conquistas por sorte, ajuda ou circunstâncias.",
  },
  {
    key: "autossabotagem",
    name: "Evitação e autossabotagem",
    description: "Adiamento, recuo ou redução do esforço diante de desafios importantes.",
  },
];

const raw: Array<[string, string, boolean?]> = [
  ["desqualificacao", "Mesmo quando tenho um bom resultado, penso primeiro no que faltou ou poderia ter sido melhor."],
  ["desqualificacao", "Tenho dificuldade de aceitar elogios sem explicar por que a conquista não foi tão importante."],
  ["desqualificacao", "Consigo reconhecer minhas conquistas como resultado de capacidade e dedicação.", true],
  ["desqualificacao", "Uma falha costuma pesar mais na minha autoavaliação do que vários acertos."],

  ["exposicao", "Temo que as pessoas descubram que não sou tão capaz quanto imaginam."],
  ["exposicao", "Antes de uma avaliação, sinto que preciso provar novamente todo o meu valor."],
  ["exposicao", "Consigo admitir que não sei algo sem sentir que minha competência inteira está em jogo.", true],
  ["exposicao", "Comparo meus bastidores com o melhor desempenho visível das outras pessoas."],

  ["atribuicao", "Costumo atribuir meus bons resultados mais à sorte ou ao momento do que à minha participação."],
  ["atribuicao", "Quando recebo ajuda, sinto que a conquista deixa de ser realmente minha."],
  ["atribuicao", "Reconheço de forma equilibrada o papel do meu esforço, das minhas capacidades e das circunstâncias.", true],
  ["atribuicao", "Depois de ter sucesso, duvido que conseguiria repetir o resultado."],

  ["autossabotagem", "Adio tarefas importantes quando existe a possibilidade de meu desempenho ser julgado."],
  ["autossabotagem", "Às vezes reduzo meu esforço para ter uma explicação pronta caso o resultado seja ruim."],
  ["autossabotagem", "Evito oportunidades para as quais fui reconhecido(a) como capaz por medo de não corresponder."],
  ["autossabotagem", "Consigo concluir projetos importantes mesmo quando me sinto inseguro(a) sobre o resultado.", true],
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
    label: "Pouco presente",
    severity: "none",
    description: "Poucos sinais dessas experiências no autorrelato atual.",
  },
  {
    min: 2.5,
    max: 3.49,
    label: "Presença moderada",
    severity: "mild",
    description: "Alguns padrões aparecem e podem variar conforme contexto, desafio e exposição.",
  },
  {
    min: 3.5,
    max: 4.19,
    label: "Presença elevada",
    severity: "moderate",
    description: "Os padrões estão presentes com frequência e podem limitar reconhecimento e ação.",
  },
  {
    min: 4.2,
    max: 5,
    label: "Presença muito elevada",
    severity: "high",
    description: "Os padrões aparecem de forma intensa e merecem exploração contextual cuidadosa.",
  },
];

export const impostorAutossabotagem: Instrument = {
  id: "impostor-autossabotagem",
  acronym: "IMP-AHSD",
  name: "Impostor e Autossabotagem",
  originalName: "Módulo autoral de perfil — não é a Clance Impostor Phenomenon Scale",
  category: "altas-habilidades",
  summary: "Mapeia desqualificação de conquistas, medo de exposição, atribuição externa e evitação.",
  audience: "Adolescentes a partir de 16 anos e adultos",
  estMinutes: 4,
  intro:
    "Pessoas de alto desempenho podem duvidar das próprias conquistas, temer que a competência esperada não se sustente ou evitar desafios para proteger a autoimagem. Este módulo autoral organiza essas experiências em quatro dimensões. Ele não mede capacidade e não confirma uma 'síndrome'.",
  instructions:
    "Indique o quanto cada afirmação descreve seu padrão habitual, especialmente em situações de estudo, trabalho, criação ou avaliação.",
  scaleType: "likert",
  defaultOptions: LIKERT_1_5,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Presença geral dos padrões (média 1–5)",
  references: [
    { label: "Clance PR, Imes SA. The imposter phenomenon in high achieving women. Psychotherapy, 1978." },
    { label: "Jones EE, Berglas S. Control of attributions about the self through self-handicapping strategies. 1978." },
    {
      label: "Xu C et al. Imposterism and perfectionism. Personality and Individual Differences, 2026.",
      url: "https://pubmed.ncbi.nlm.nih.gov/42445834/",
    },
  ],
  score: (responses: Responses) =>
    scoreProfile({
      questions,
      responses,
      defaultOptions: LIKERT_1_5,
      subscales,
      bands,
      notes: (results) => {
        const top = results[0];
        return [
          top ? `Dimensão mais presente: ${top.name} (média ${top.mean}).` : "",
          "O fenômeno do impostor não é um diagnóstico. Compare o perfil com situações reais, apoios disponíveis e histórico de desempenho.",
        ].filter(Boolean);
      },
    }),
};
