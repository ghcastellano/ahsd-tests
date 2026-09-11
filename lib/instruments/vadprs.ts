import type { Instrument, Question, QuestionOption, Responses, Subscale } from "../types";

// VADPRS — NICHQ Vanderbilt ADHD Diagnostic Parent Rating Scale (Wolraich et
// al., 2003). Domínio público (NICHQ / American Academy of Pediatrics). 47
// itens de sintomas (18 de TDAH, 8 de oposição-desafio, 14 de conduta, 7 de
// ansiedade-depressão) + 8 itens de desempenho. É o padrão americano para
// rastreio de TDAH em crianças de 6 a 12 anos, e a única escala pediátrica
// aqui que rastreia as comorbidades junto. Tradução autoral a partir do
// original em inglês.

const FREQ: QuestionOption[] = [
  { label: "Nunca", value: 0 },
  { label: "Ocasionalmente", value: 1 },
  { label: "Frequentemente", value: 2 },
  { label: "Muito frequentemente", value: 3 },
];
const DESEMPENHO: QuestionOption[] = [
  { label: "Excelente", value: 1 },
  { label: "Acima da média", value: 2 },
  { label: "Na média", value: 3 },
  { label: "Um pouco problemático", value: 4 },
  { label: "Problemático", value: 5 },
];

const desatencao = [
  "Não presta atenção a detalhes ou comete erros por descuido, por exemplo, nos deveres de casa",
  "Tem dificuldade de manter a atenção no que precisa ser feito",
  "Parece não ouvir quando falam diretamente com ele(a)",
  "Não segue instruções até o fim e não termina atividades (não por recusa nem por não entender)",
  "Tem dificuldade para organizar tarefas e atividades",
  "Evita, não gosta ou não quer começar tarefas que exigem esforço mental prolongado",
  "Perde coisas necessárias para tarefas ou atividades (brinquedos, deveres, lápis ou livros)",
  "Distrai-se facilmente com barulhos ou outros estímulos",
  "É esquecido(a) nas atividades do dia a dia",
];
const hiperatividade = [
  "Mexe as mãos ou os pés ou se remexe na cadeira",
  "Sai do lugar quando se espera que fique sentado(a)",
  "Corre de um lado para outro ou sobe demais nas coisas quando se espera que fique sentado(a)",
  "Tem dificuldade para brincar ou iniciar brincadeiras tranquilas",
  "Está sempre 'a mil' ou age como se estivesse 'com um motor ligado'",
  "Fala demais",
  "Responde antes de as perguntas terem sido terminadas",
  "Tem dificuldade de esperar a sua vez",
  "Interrompe ou se intromete nas conversas e/ou atividades dos outros",
];
const oposicao = [
  "Discute com adultos",
  "Perde a paciência",
  "Desafia ativamente ou se recusa a seguir pedidos ou regras dos adultos",
  "Irrita as pessoas de propósito",
  "Culpa os outros pelos próprios erros ou mau comportamento",
  "É suscetível ou se irrita facilmente com os outros",
  "Está com raiva ou ressentido(a)",
  "É vingativo(a) e quer 'dar o troco'",
];
const conduta = [
  "Intimida, ameaça ou amedronta os outros",
  "Começa brigas físicas",
  "Mente para escapar de encrenca ou para fugir de obrigações (engana os outros)",
  "Falta à escola (mata aula) sem permissão",
  "É fisicamente cruel com pessoas",
  "Roubou coisas de valor",
  "Destrói de propósito a propriedade dos outros",
  "Usou uma arma que pode causar ferimento grave (taco, faca, tijolo, arma de fogo)",
  "É fisicamente cruel com animais",
  "Provocou incêndio de propósito para causar dano",
  "Invadiu a casa, o comércio ou o carro de alguém",
  "Ficou fora de casa à noite sem permissão",
  "Fugiu de casa e passou a noite fora",
  "Forçou alguém a uma atividade sexual",
];
const ansiedade = [
  "É medroso(a), ansioso(a) ou preocupado(a)",
  "Tem medo de tentar coisas novas por receio de errar",
  "Sente-se sem valor ou inferior",
  "Culpa a si mesmo(a) pelos problemas, sente-se culpado(a)",
  "Sente-se sozinho(a), rejeitado(a) ou não amado(a); reclama que 'ninguém gosta dele(a)'",
  "Está triste, infeliz ou deprimido(a)",
  "É retraído(a) ou fica facilmente constrangido(a)",
];
const desempenho = [
  "Desempenho escolar geral",
  "Leitura",
  "Escrita",
  "Matemática",
  "Relacionamento com os pais",
  "Relacionamento com irmãos",
  "Relacionamento com colegas",
  "Participação em atividades organizadas (por exemplo, times)",
];

const questions: Question[] = [
  ...desatencao.map((text, i) => ({ id: `d${i + 1}`, text, subscale: "desatencao" })),
  ...hiperatividade.map((text, i) => ({ id: `h${i + 1}`, text, subscale: "hiperatividade" })),
  ...oposicao.map((text, i) => ({ id: `o${i + 1}`, text, subscale: "oposicao" })),
  ...conduta.map((text, i) => ({ id: `c${i + 1}`, text, subscale: "conduta" })),
  ...ansiedade.map((text, i) => ({ id: `a${i + 1}`, text, subscale: "ansiedade" })),
  ...desempenho.map((text, i) => ({ id: `p${i + 1}`, text, subscale: "desempenho", options: DESEMPENHO })),
];

const subscales: Subscale[] = [
  { key: "desatencao", name: "Desatenção (itens 1–9)", description: "Positivo com ≥6 itens 'frequentemente/muito frequentemente'." },
  { key: "hiperatividade", name: "Hiperatividade-impulsividade (itens 10–18)", description: "Positivo com ≥6 itens." },
  { key: "oposicao", name: "Oposição-desafio (itens 19–26)", description: "Rastreio de comorbidade: positivo com ≥4 itens." },
  { key: "conduta", name: "Conduta (itens 27–40)", description: "Rastreio de comorbidade: positivo com ≥3 itens." },
  { key: "ansiedade", name: "Ansiedade-depressão (itens 41–47)", description: "Rastreio de comorbidade: positivo com ≥3 itens." },
  { key: "desempenho", name: "Desempenho (itens 48–55)", description: "Prejuízo = pelo menos 1 item 'um pouco problemático' ou 'problemático'." },
];

const bands = [
  { min: 0, max: 5, label: "Rastreio de TDAH negativo", severity: "none" as const, description: "Menos de 6 sintomas frequentes em cada domínio de TDAH. Veja ainda as comorbidades e o desempenho no detalhamento." },
  { min: 6, max: 9, label: "Rastreio de TDAH positivo", severity: "high" as const, description: "6 ou mais sintomas frequentes em um domínio de TDAH — com prejuízo no desempenho, o rastreio da Vanderbilt é positivo. Leve o resultado a um pediatra ou psiquiatra infantil; a escala do professor complementa." },
];

export const vadprs: Instrument = {
  id: "vadprs",
  acronym: "VADPRS",
  name: "Escala Vanderbilt de TDAH — versão para pais",
  originalName: "NICHQ Vanderbilt ADHD Diagnostic Parent Rating Scale (Wolraich et al., 2003)",
  category: "tdah",
  summary: "O padrão americano para pais: os 18 sintomas de TDAH, mais oposição, conduta, ansiedade-depressão e desempenho escolar e social.",
  audience: "Pais ou responsáveis, sobre crianças de 6 a 12 anos",
  estMinutes: 10,
  intro:
    "A Vanderbilt é a escala que a Academia Americana de Pediatria recomenda para o rastreio de TDAH em crianças. Além dos 18 sintomas, ela rastreia as três comorbidades mais comuns (oposição-desafio, conduta e ansiedade-depressão) e pergunta sobre desempenho escolar e social — porque o diagnóstico exige prejuízo, não só sintoma. Um sintoma conta quando é marcado como 'frequentemente' ou 'muito frequentemente'. Cada item de desempenho marcado como 'um pouco problemático' ou 'problemático' indica prejuízo.",
  instructions:
    "Pense no comportamento da criança nos últimos 6 meses e marque a frequência de cada item. Nos 8 itens finais, avalie o desempenho dela em cada área.",
  scaleType: "custom",
  defaultOptions: FREQ,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Sintomas de TDAH no domínio mais alto (0–9)",
  references: [
    { label: "Wolraich ML, Lambert W, Doffing MA, Bickman L, Simmons T, Worley K. Psychometric properties of the Vanderbilt ADHD Diagnostic Parent Rating Scale in a referred population. J Pediatr Psychol. 2003;28(8):559-568." },
    { label: "NICHQ — National Institute for Children's Health Quality. Vanderbilt Assessment Scales (domínio público).", url: "https://www.nichq.org/resource/nichq-vanderbilt-assessment-scales" },
  ],
  score: (r: Responses) => {
    const conta = (chave: string, minimo: number) =>
      questions.filter((q) => q.subscale === chave && (r[q.id] ?? 0) >= minimo).length;
    const des = conta("desatencao", 2);
    const hip = conta("hiperatividade", 2);
    const opo = conta("oposicao", 2);
    const con = conta("conduta", 2);
    const ans = conta("ansiedade", 2);
    const prej = conta("desempenho", 4);
    const topo = Math.max(des, hip);
    const band = bands.find((b) => topo >= b.min && topo <= b.max) ?? bands[0];

    const tipo =
      des >= 6 && hip >= 6 ? "apresentação combinada" : des >= 6 ? "predominantemente desatenta" : hip >= 6 ? "predominantemente hiperativa-impulsiva" : null;

    const notes = [
      `Desatenção: ${des}/9 · Hiperatividade-impulsividade: ${hip}/9 · itens de desempenho com prejuízo: ${prej}/8.`,
      tipo
        ? `Sintomas compatíveis com TDAH, ${tipo}${prej > 0 ? ", com prejuízo no desempenho — rastreio positivo" : ", mas SEM prejuízo relatado no desempenho: pela regra da Vanderbilt, o rastreio exige prejuízo em pelo menos uma área"}.`
        : "Sintomas de TDAH abaixo do limiar de 6 por domínio.",
      `Comorbidades: oposição-desafio ${opo}/8 (positivo ≥4: ${opo >= 4 ? "sim" : "não"}) · conduta ${con}/14 (positivo ≥3: ${con >= 3 ? "sim" : "não"}) · ansiedade-depressão ${ans}/7 (positivo ≥3: ${ans >= 3 ? "sim" : "não"}).`,
      "A Vanderbilt cobre o critério de sintomas e o de prejuízo, mas não o de início nem o de múltiplos contextos: peça também a versão do professor, e leve as duas a um pediatra ou psiquiatra infantil.",
    ];

    return {
      totalScore: topo,
      maxScore: 9,
      band,
      positive: topo >= 6 && prej > 0,
      positiveLabel: "Rastreio positivo para TDAH (6 ou mais sintomas em um domínio + prejuízo no desempenho)",
      negativeLabel: topo >= 6 ? "Sintomas de TDAH presentes, mas sem prejuízo relatado — rastreio da Vanderbilt não fecha" : "Rastreio negativo para TDAH (menos de 6 sintomas por domínio)",
      subscales: [
        { key: "desatencao", name: "Desatenção (itens 1–9)", raw: des, max: 9 },
        { key: "hiperatividade", name: "Hiperatividade-impulsividade (itens 10–18)", raw: hip, max: 9 },
        { key: "oposicao", name: "Oposição-desafio (itens 19–26)", raw: opo, max: 8 },
        { key: "conduta", name: "Conduta (itens 27–40)", raw: con, max: 14 },
        { key: "ansiedade", name: "Ansiedade-depressão (itens 41–47)", raw: ans, max: 7 },
        { key: "desempenho", name: "Desempenho com prejuízo (itens 48–55)", raw: prej, max: 8 },
      ],
      notes,
    };
  },
};
