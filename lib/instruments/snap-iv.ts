import type { Instrument, Question, QuestionOption, Responses } from "../types";

// SNAP-IV (18 itens de TDAH), tradução validada pelo GEDA/UFRJ e pelo Serviço
// de Psiquiatria da Infância e Adolescência da UFRGS (Mattos et al., 2006),
// tal como publicada pela ABDA (tdah.org.br/diagnostico-criancas). Instrumento
// de domínio público (Swanson, MTA Cooperative Group), respondido por pais ou
// professores sobre uma criança/adolescente.

const OPCOES: QuestionOption[] = [
  { label: "Nem um pouco", value: 0 },
  { label: "Só um pouco", value: 1 },
  { label: "Bastante", value: 2 },
  { label: "Demais", value: 3 },
];

const desatencao = [
  "Não consegue prestar muita atenção a detalhes ou comete erros por descuido nos trabalhos da escola ou tarefas",
  "Tem dificuldade de manter a atenção em tarefas ou atividades de lazer",
  "Parece não estar ouvindo quando se fala diretamente com ele(a)",
  "Não segue instruções até o fim e não termina deveres de escola, tarefas ou obrigações",
  "Tem dificuldade para organizar tarefas e atividades",
  "Evita, não gosta ou se envolve contra a vontade em tarefas que exigem esforço mental prolongado",
  "Perde coisas necessárias para atividades (p. ex.: brinquedos, deveres da escola, lápis ou livros)",
  "Distrai-se com estímulos externos",
  "É esquecido(a) em atividades do dia a dia",
];

const hiperatividade = [
  "Mexe com as mãos ou os pés ou se remexe na cadeira",
  "Sai do lugar na sala de aula ou em outras situações em que se espera que fique sentado(a)",
  "Corre de um lado para outro ou sobe demais nas coisas em situações em que isto é inapropriado",
  "Tem dificuldade em brincar ou envolver-se em atividades de lazer de forma calma",
  "Não para ou frequentemente está \"a mil por hora\"",
  "Fala em excesso",
  "Responde as perguntas de forma precipitada antes de elas terem sido terminadas",
  "Tem dificuldade de esperar sua vez",
  "Interrompe os outros ou se intromete (por exemplo: intromete-se nas conversas, jogos etc.)",
];

const questions: Question[] = [
  ...desatencao.map((text, i) => ({ id: `d${i + 1}`, text, subscale: "desatencao" })),
  ...hiperatividade.map((text, i) => ({ id: `h${i + 1}`, text, subscale: "hiperatividade" })),
];

/** Sintoma presente = "Bastante" ou "Demais". */
const PRESENTE = 2;
const LIMIAR = 6;

const bands = [
  { min: 0, max: 5, label: "Dentro do esperado", severity: "none" as const, description: "Menos de 6 sintomas marcados como 'bastante' ou 'demais' em cada domínio. Não há mais sintomas do que o esperado para a idade." },
  { min: 6, max: 9, label: "Mais sintomas que o esperado", severity: "high" as const, description: "6 ou mais sintomas em um domínio: há mais sintomas de desatenção e/ou hiperatividade-impulsividade do que o esperado numa criança ou adolescente. Atende só ao critério A — o diagnóstico exige avaliação médica especializada." },
];

// Pontos de corte do MTA por média de item (Swanson et al., 2001) — só como
// referência complementar; a regra principal é a contagem da ABDA.
const CORTE_MTA = {
  pais: { desatencao: 1.78, hiperatividade: 1.44 },
  professores: { desatencao: 2.56, hiperatividade: 1.78 },
};

export const snapIv: Instrument = {
  id: "snap-iv",
  acronym: "SNAP-IV",
  name: "SNAP-IV — sintomas de TDAH em crianças e adolescentes (pais/professores)",
  originalName: "Swanson, Nolan and Pelham Rating Scale — versão MTA (Swanson et al., 2001); tradução GEDA-UFRJ / UFRGS (Mattos et al., 2006)",
  category: "tdah",
  summary: "Os 18 sintomas de TDAH do DSM, para pais ou professores avaliarem uma criança ou adolescente. Tradução validada no Brasil, publicada pela ABDA.",
  audience: "Pais ou professores, sobre crianças e adolescentes (até 18 anos)",
  estMinutes: 5,
  intro:
    "O SNAP-IV foi construído a partir dos sintomas de TDAH do DSM-IV e é o questionário que a ABDA publica para crianças e adolescentes. Pode ser preenchido por pais e também levado para o professor responder na escola — as duas perspectivas juntas valem mais do que uma só. Pela regra da ABDA, 6 ou mais itens marcados como 'bastante' ou 'demais' nos itens 1 a 9 indicam mais sintomas de desatenção do que o esperado; o mesmo nos itens 10 a 18 indica mais sintomas de hiperatividade e impulsividade.",
  instructions:
    "Para cada item, escolha a coluna que melhor descreve a criança ou o(a) adolescente (o(a) aluno(a), na versão para professores).",
  scaleType: "custom",
  defaultOptions: OPCOES,
  questions,
  subscales: [
    { key: "desatencao", name: "Desatenção (itens 1–9)" },
    { key: "hiperatividade", name: "Hiperatividade-impulsividade (itens 10–18)" },
  ],
  interpretationBands: bands,
  primaryMetricLabel: "Sintomas presentes no domínio mais alto (0–9)",
  references: [
    { label: "Mattos P, Serra-Pinheiro MA, Rohde LA, Pinto D. Apresentação de uma versão em português para uso no Brasil do instrumento MTA-SNAP-IV de avaliação de sintomas de TDAH e TOD. Rev Psiquiatr RS. 2006;28(3):290-297." },
    { label: "Swanson JM, et al. Clinical relevance of the primary findings of the MTA. J Am Acad Child Adolesc Psychiatry. 2001;40(2):168-179." },
    { label: "ABDA — Associação Brasileira do Déficit de Atenção. Diagnóstico em crianças.", url: "https://tdah.org.br/diagnostico-criancas/" },
  ],
  score: (r: Responses) => {
    const itens = (chave: string) => questions.filter((q) => q.subscale === chave);
    const conta = (chave: string) => itens(chave).filter((q) => (r[q.id] ?? 0) >= PRESENTE).length;
    const media = (chave: string) => {
      const qs = itens(chave);
      const soma = qs.reduce((a, q) => a + (r[q.id] ?? 0), 0);
      return Math.round((soma / qs.length) * 100) / 100;
    };
    const des = conta("desatencao");
    const hip = conta("hiperatividade");
    const mDes = media("desatencao");
    const mHip = media("hiperatividade");
    const topo = Math.max(des, hip);
    const band = bands.find((b) => topo >= b.min && topo <= b.max) ?? bands[0];

    const dominios: string[] = [];
    if (des >= LIMIAR) dominios.push("desatenção");
    if (hip >= LIMIAR) dominios.push("hiperatividade-impulsividade");

    const notes = [
      `Desatenção: ${des} de 9 sintomas presentes (média ${mDes}) · Hiperatividade-impulsividade: ${hip} de 9 (média ${mHip}).`,
      dominios.length
        ? `Regra da ABDA (≥6 por domínio) atingida em: ${dominios.join(" e ")}.`
        : "Regra da ABDA (≥6 sintomas 'bastante/demais' por domínio) não atingida.",
      `Referência complementar (MTA, média por item): acima do corte para PAIS quando desatenção ≥ ${CORTE_MTA.pais.desatencao} ou hiperatividade ≥ ${CORTE_MTA.pais.hiperatividade}; para PROFESSORES, ≥ ${CORTE_MTA.professores.desatencao} e ≥ ${CORTE_MTA.professores.hiperatividade}.`,
      "O SNAP-IV avalia só o critério A (sintomas). O diagnóstico exige também início precoce, prejuízo em pelo menos 2 contextos, prejuízo evidente e exclusão de outra causa — e só um profissional médico pode fazê-lo.",
    ];

    return {
      totalScore: topo,
      maxScore: 9,
      band,
      positive: topo >= LIMIAR,
      positiveLabel: "Mais sintomas do que o esperado (≥6 em um domínio)",
      subscales: [
        { key: "desatencao", name: "Desatenção (itens 1–9)", raw: des, max: 9 },
        { key: "hiperatividade", name: "Hiperatividade-impulsividade (itens 10–18)", raw: hip, max: 9 },
      ],
      notes,
    };
  },
};
