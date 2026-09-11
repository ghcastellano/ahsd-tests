import type { Instrument, Question, QuestionOption, Responses } from "../types";

// ASRS-18 na tradução brasileira de Mattos et al. (2006), tal como publicada
// pela ABDA (tdah.org.br/diagnostico-adultos). Os 18 itens são os mesmos da
// ASRS v1.1 da OMS, mas a ABDA os organiza por domínio DSM (9 de desatenção,
// 9 de hiperatividade-impulsividade) e usa uma regra de contagem de sintomas —
// não o rastreador de 6 itens com caixas sombreadas. Por isso este instrumento
// coexiste com o "asrs-18": mesmas perguntas, leitura diferente.

const OPCOES: QuestionOption[] = [
  { label: "Nunca", value: 0 },
  { label: "Raramente", value: 1 },
  { label: "Algumas vezes", value: 2 },
  { label: "Frequentemente", value: 3 },
  { label: "Muito frequentemente", value: 4 },
];

const desatencao = [
  "Com que frequência você comete erros por falta de atenção quando tem de trabalhar num projeto chato ou difícil?",
  "Com que frequência você tem dificuldade para manter a atenção quando está fazendo um trabalho chato ou repetitivo?",
  "Com que frequência você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando elas estão falando diretamente com você?",
  "Com que frequência você deixa um projeto pela metade depois de já ter feito as partes mais difíceis?",
  "Com que frequência você tem dificuldade para fazer um trabalho que exige organização?",
  "Quando você precisa fazer algo que exige muita concentração, com que frequência você evita ou adia o início?",
  "Com que frequência você coloca as coisas fora do lugar ou tem dificuldade de encontrar as coisas em casa ou no trabalho?",
  "Com que frequência você se distrai com atividades ou barulho à sua volta?",
  "Com que frequência você tem dificuldade para lembrar de compromissos ou obrigações?",
];

const hiperatividade = [
  "Com que frequência você fica se mexendo na cadeira ou balançando as mãos ou os pés quando precisa ficar sentado(a) por muito tempo?",
  "Com que frequência você se levanta da cadeira em reuniões ou em outras situações onde deveria ficar sentado(a)?",
  "Com que frequência você se sente inquieto(a) ou agitado(a)?",
  "Com que frequência você tem dificuldade para sossegar e relaxar quando tem tempo livre para você?",
  "Com que frequência você se sente ativo(a) demais e necessitando fazer coisas, como se estivesse \"com um motor ligado\"?",
  "Com que frequência você se pega falando demais em situações sociais?",
  "Quando você está conversando, com que frequência você se pega terminando as frases das pessoas antes delas?",
  "Com que frequência você tem dificuldade para esperar nas situações onde cada um tem a sua vez?",
  "Com que frequência você interrompe os outros quando eles estão ocupados?",
];

const questions: Question[] = [
  ...desatencao.map((text, i) => ({ id: `a${i + 1}`, text, subscale: "desatencao" })),
  ...hiperatividade.map((text, i) => ({ id: `b${i + 1}`, text, subscale: "hiperatividade" })),
];

/** Sintoma presente = "Frequentemente" ou "Muito frequentemente" (regra da ABDA). */
const PRESENTE = 3;
const LIMIAR_ABDA = 4;
const LIMIAR_DSM5 = 5;

const bands = [
  { min: 0, max: 3, label: "Abaixo do limiar", severity: "none" as const, description: "Menos de 4 sintomas frequentes em cada domínio. Pela regra da ABDA, o padrão atual não sugere TDAH — o que não exclui o diagnóstico se houver prejuízo claro." },
  { min: 4, max: 4, label: "Limiar da ABDA atingido", severity: "moderate" as const, description: "Pelo menos 4 sintomas frequentes em um domínio: pela leitura da ABDA, 'existe chance de ser portador de TDAH'. O DSM-5 exige 5 no adulto — o resultado fica na zona de atenção." },
  { min: 5, max: 9, label: "Limiar do DSM-5 atingido", severity: "high" as const, description: "5 ou mais sintomas frequentes em um domínio: atende ao critério A do DSM-5 para adultos. Recomenda-se avaliação clínica, que precisa confirmar início na infância, prejuízo em 2+ contextos e excluir outras causas." },
];

/**
 * Os 6 itens do rastreador da OMS estão dentro destes 18; calculamos a leitura
 * da OMS como conferência cruzada. Mapa (OMS → ABDA): A1 = a4, A2 = a5,
 * A3 = a9, A4 = a6, A5 = b1, A6 = b5. Regra: A1–A3 marcam com ≥2, A4–A6 com ≥3.
 */
function marcasOMS(r: Responses): number {
  let m = 0;
  for (const id of ["a4", "a5", "a9"]) if ((r[id] ?? 0) >= 2) m++;
  for (const id of ["a6", "b1", "b5"]) if ((r[id] ?? 0) >= 3) m++;
  return m;
}

export const asrsAbda: Instrument = {
  id: "asrs-18-abda",
  acronym: "ASRS-18 (ABDA)",
  name: "ASRS-18 — versão brasileira da ABDA (Mattos et al., 2006)",
  originalName: "Adult Self-Report Scale v1.1 — adaptação transcultural para o português (Mattos, Segenreich, Saboya, Louzã, Dias & Romano, 2006)",
  category: "tdah",
  summary: "Os 18 sintomas de TDAH do adulto na tradução validada no Brasil, com a regra de contagem por domínio usada pela ABDA.",
  audience: "Adultos (18+)",
  estMinutes: 5,
  intro:
    "Este é o questionário publicado pela Associação Brasileira do Déficit de Atenção (ABDA) para adultos: a ASRS-18 na adaptação de Mattos e colaboradores (2006). São 9 itens de desatenção e 9 de hiperatividade-impulsividade. Pela regra da ABDA, quando pelo menos 4 itens de um domínio são marcados como 'frequentemente' ou 'muito frequentemente', 'existem chances de ser portador de TDAH'. Como conferência, calculamos também o rastreador de 6 itens da OMS (os mesmos itens, leitura diferente) e o corte de 5 sintomas do DSM-5.",
  instructions:
    "Responda pensando em como você se avaliou nos últimos seis meses.",
  scaleType: "custom",
  defaultOptions: OPCOES,
  questions,
  subscales: [
    { key: "desatencao", name: "Parte A — Desatenção", description: "9 sintomas de desatenção do DSM." },
    { key: "hiperatividade", name: "Parte B — Hiperatividade-impulsividade", description: "9 sintomas de hiperatividade e impulsividade do DSM." },
  ],
  interpretationBands: bands,
  primaryMetricLabel: "Sintomas frequentes no domínio mais alto (0–9)",
  references: [
    { label: "Mattos P, Segenreich D, Saboya E, Louzã M, Dias G, Romano M. Adaptação transcultural para o português da escala Adult Self-Report Scale (ASRS-18, versão 1.1) para avaliação do TDAH em adultos. Rev Psiquiatr Clín. 2006;33(4):188-194." },
    { label: "ABDA — Associação Brasileira do Déficit de Atenção. Diagnóstico em adultos.", url: "https://tdah.org.br/diagnostico-adultos/" },
    { label: "Kessler RC, et al. The World Health Organization Adult ADHD Self-Report Scale (ASRS). Psychol Med. 2005;35(2):245-256." },
  ],
  score: (r: Responses) => {
    const conta = (chave: string) =>
      questions.filter((q) => q.subscale === chave && (r[q.id] ?? 0) >= PRESENTE).length;
    const des = conta("desatencao");
    const hip = conta("hiperatividade");
    const topo = Math.max(des, hip);
    const band = bands.find((b) => topo >= b.min && topo <= b.max) ?? bands[0];
    const oms = marcasOMS(r);

    const dominios: string[] = [];
    if (des >= LIMIAR_ABDA) dominios.push("desatenção");
    if (hip >= LIMIAR_ABDA) dominios.push("hiperatividade-impulsividade");

    const notes = [
      `Desatenção: ${des} de 9 sintomas frequentes · Hiperatividade-impulsividade: ${hip} de 9.`,
      dominios.length
        ? `Regra da ABDA (≥4 por domínio) atingida em: ${dominios.join(" e ")}.`
        : "Regra da ABDA (≥4 sintomas frequentes por domínio) não atingida.",
      `Regra do DSM-5 para adultos (≥5 por domínio): ${topo >= LIMIAR_DSM5 ? "atingida" : "não atingida"}.`,
      `Conferência com o rastreador de 6 itens da OMS: ${oms} de 6 marcas (${oms >= 4 ? "positivo" : "negativo"}; positivo a partir de 4).`,
      "Este questionário cobre apenas o critério A (sintomas). O diagnóstico exige ainda: sintomas presentes antes dos 12 anos, prejuízo em pelo menos 2 contextos, prejuízo evidente e exclusão de outra causa.",
    ];

    return {
      totalScore: topo,
      maxScore: 9,
      band,
      positive: topo >= LIMIAR_ABDA,
      positiveLabel: "Rastreio positivo pela regra da ABDA (≥4 sintomas frequentes em um domínio)",
      subscales: [
        { key: "desatencao", name: "Parte A — Desatenção", raw: des, max: 9 },
        { key: "hiperatividade", name: "Parte B — Hiperatividade-impulsividade", raw: hip, max: 9 },
      ],
      notes,
    };
  },
};
