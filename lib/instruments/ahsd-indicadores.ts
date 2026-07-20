import type { Instrument, Question, Responses, Subscale } from "../types";
import { LIKERT_1_5 } from "./options";
import { scoreSubscales } from "../scoring";

// Original PT-BR items authored for this platform, grounded in the indicator
// domains of the Brazilian AH/SD literature (Delou; MEC/Virgolim; Fleith & Alencar)
// and Renzulli's three-ring model. Screening is profile/strength-based — there is
// no pass/fail cutoff.

const subscales: Subscale[] = [
  { key: "intelectual", name: "Intelectual / Aprendizagem", description: "Rapidez de aprendizagem, raciocínio, memória e curiosidade." },
  { key: "criatividade", name: "Pensamento criador (Criatividade)", description: "Originalidade, fluência de ideias e imaginação." },
  { key: "motivacao", name: "Comprometimento com a tarefa", description: "Persistência, envolvimento profundo e altos padrões." },
  { key: "lideranca", name: "Liderança / Social", description: "Influência, comunicação, responsabilidade e senso de justiça." },
  { key: "artistica", name: "Talento artístico", description: "Habilidade e expressão em artes visuais, música, teatro, escrita." },
  { key: "psicomotora", name: "Capacidade psicomotora", description: "Energia física, coordenação e desempenho motor." },
];

const raw: [string, string][] = [
  ["intelectual", "Aprendo conceitos novos com muita rapidez, às vezes antes de uma explicação completa."],
  ["intelectual", "Tenho um vocabulário amplo e gosto de usar as palavras com precisão."],
  ["intelectual", "Faço perguntas profundas e questiono o 'porquê' das coisas com frequência."],
  ["intelectual", "Relaciono ideias de áreas diferentes e enxergo conexões que outros não percebem."],
  ["intelectual", "Guardo com facilidade grande quantidade de informação sobre assuntos que me interessam."],
  ["intelectual", "Sinto tédio ou impaciência com tarefas repetitivas e pouco desafiadoras."],
  ["intelectual", "Raciocino bem de forma abstrata e gosto de resolver problemas complexos."],

  ["criatividade", "Tenho muitas ideias e soluções originais para um mesmo problema."],
  ["criatividade", "Costumo dar usos inesperados a objetos ou conceitos comuns."],
  ["criatividade", "Minha imaginação é vívida; crio cenários, histórias ou invenções na mente."],
  ["criatividade", "Questiono regras e convenções quando não fazem sentido para mim."],
  ["criatividade", "Tenho um senso de humor criativo, com trocadilhos e associações inusitadas."],
  ["criatividade", "Prefiro caminhos próprios e não convencionais para resolver as coisas."],

  ["motivacao", "Quando um assunto me fascina, mergulho nele por horas e perco a noção do tempo."],
  ["motivacao", "Tenho padrões elevados e busco fazer as coisas com excelência."],
  ["motivacao", "Persisto em problemas difíceis mesmo sem recompensa externa."],
  ["motivacao", "Minha motivação vem mais de dentro do que de elogios ou notas."],
  ["motivacao", "Sou autocrítico(a) e reviso meu trabalho até ficar satisfeito(a)."],
  ["motivacao", "Dedico-me intensamente a interesses específicos por longos períodos."],

  ["lideranca", "As pessoas costumam me procurar para organizar atividades ou resolver impasses."],
  ["lideranca", "Percebo as habilidades dos outros e articulo o grupo em torno delas."],
  ["lideranca", "Tenho forte senso de justiça e me incomodo com situações injustas."],
  ["lideranca", "Comunico minhas ideias com clareza e consigo influenciar as pessoas."],
  ["lideranca", "Assumo responsabilidades e as pessoas confiam em mim para conduzir tarefas."],
  ["lideranca", "Às vezes me sinto 'fora de sintonia' com pessoas da minha idade."],

  ["artistica", "Tenho facilidade e prazer em uma ou mais artes (música, desenho, teatro, escrita, dança…)."],
  ["artistica", "Percebo detalhes estéticos (cores, sons, ritmos, formas) que passam despercebidos."],
  ["artistica", "Expresso ideias e emoções com originalidade por meio de alguma linguagem artística."],
  ["artistica", "Consigo improvisar ou criar com desenvoltura na minha área artística."],
  ["artistica", "As pessoas comentam sobre o meu talento em alguma forma de arte."],

  ["psicomotora", "Tenho energia física elevada e gosto de atividades vigorosas."],
  ["psicomotora", "Aprendo movimentos e habilidades físicas com facilidade e precisão."],
  ["psicomotora", "Destaco-me em esportes ou atividades que exigem coordenação e agilidade."],
  ["psicomotora", "Tenho bom controle corporal e destreza manual."],
];

const questions: Question[] = raw.map(([subscale, text], i) => ({ id: `q${i + 1}`, text, subscale }));

const bands = [
  { min: 1, max: 2.99, label: "Indicadores pouco presentes", severity: "none" as const, description: "Poucos indicadores de AH/SD neste autorrelato. Lembre-se: nenhum teste isolado define altas habilidades." },
  { min: 3.0, max: 3.69, label: "Alguns indicadores", severity: "low" as const, description: "Alguns indicadores presentes, especialmente nas áreas de maior média. Vale observar consistência ao longo do tempo." },
  { min: 3.7, max: 4.29, label: "Indicadores consistentes", severity: "moderate" as const, description: "Vários indicadores consistentes de AH/SD. Uma avaliação multidimensional com profissional qualificado pode aprofundar o quadro." },
  { min: 4.3, max: 5, label: "Indicadores fortes e consistentes", severity: "high" as const, description: "Perfil forte de indicadores de AH/SD. Recomenda-se avaliação especializada, considerando que a superdotação pode se manifestar em uma ou mais áreas, isoladas ou combinadas." },
];

export const ahsdIndicadores: Instrument = {
  id: "ahsd-indicadores",
  acronym: "AH/SD",
  name: "Indicadores de Altas Habilidades/Superdotação",
  originalName: "Instrumento original, baseado nas áreas de Delou, MEC/Virgolim e Renzulli",
  category: "altas-habilidades",
  summary: "Autorrelato de indicadores de AH/SD em seis áreas. Resultado por perfil de forças, não por corte.",
  audience: "Adolescentes e adultos (autorrelato ou observação de terceiros)",
  estMinutes: 8,
  intro:
    "Este instrumento mapeia indicadores de altas habilidades/superdotação em seis áreas: intelectual, criatividade, comprometimento com a tarefa, liderança, arte e psicomotricidade. A leitura é por PERFIL de forças — não existe nota de aprovação. Segundo a política brasileira, a AH/SD pode se manifestar em uma ou mais áreas, isoladas ou combinadas, e a identificação formal exige avaliação multidimensional por profissionais.",
  instructions:
    "Para cada afirmação, indique o quanto ela descreve você (ou a pessoa observada). Responda com sinceridade, pensando no seu comportamento habitual.",
  scaleType: "likert",
  defaultOptions: LIKERT_1_5,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Índice geral (média 1–5)",
  references: [
    { label: "Delou CMC. Lista Base de Indicadores de Superdotação (UERJ, 1987; rev. 2015)." },
    { label: "Virgolim AMR. Altas habilidades/superdotação: encorajando potenciais. MEC/SEESP, 2007." },
    { label: "Renzulli JS. The Three-Ring Conception of Giftedness. 1978/2005." },
    { label: "Fleith DS, Alencar EMLS. Desenvolvimento de talentos e altas habilidades. Artmed, 2007." },
  ],
  score: (r: Responses) => {
    const subs = scoreSubscales(questions, r, LIKERT_1_5, subscales);
    const answered = questions.filter((q) => r[q.id] !== undefined);
    const overallMean =
      answered.length > 0
        ? answered.reduce((acc, q) => acc + (r[q.id] ?? 0), 0) / answered.length
        : 0;
    const rounded = Math.round(overallMean * 100) / 100;
    const band = bands.find((b) => rounded >= b.min && rounded <= b.max) ?? bands[0];

    // Attach a per-subscale band by mean and highlight the strongest areas.
    const subsWithBand = subs
      .map((s) => ({ ...s, band: bands.find((b) => (s.mean ?? 0) >= b.min && (s.mean ?? 0) <= b.max) }))
      .sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0));

    const top = subsWithBand.slice(0, 2).filter((s) => (s.mean ?? 0) >= 3.5);
    const notes: string[] = [];
    if (top.length) {
      notes.push(
        `Áreas de maior destaque: ${top.map((s) => `${s.name} (média ${s.mean})`).join(" e ")}.`,
      );
    }
    notes.push(
      "Este é um rastreio por perfil: forças marcantes em uma única área já são significativas. Não é um teste de QI nem um diagnóstico.",
    );

    return {
      totalScore: rounded,
      maxScore: 5,
      band,
      metricIsMean: true,
      subscales: subsWithBand,
      notes,
    };
  },
};
