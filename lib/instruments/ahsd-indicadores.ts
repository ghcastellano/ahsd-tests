import type { Instrument, Question, QuestionOption, Responses, Subscale } from "../types";

// ---------------------------------------------------------------------------
// Indicadores de Altas Habilidades/Superdotação — autorrelato para adultos
//
// Instrumento AUTORAL, redesenhado para seguir as convenções dos instrumentos
// validados. Três decisões de desenho vêm direto da evidência:
//
// 1. NADA DE ÂNCORA DE CONCORDÂNCIA. Nenhuma escala validada de superdotação
//    (TIAH/S, GRS, HOPE, SRBCSS, ITP, Delou) usa "concordo/discordo" — todas
//    usam FREQUÊNCIA ou COMPARAÇÃO NORMATIVA. A única exceção é a EICAS-AH/SD,
//    que também é a que menos discrimina. Aqui usamos os dois formatos certos:
//    comparação normativa para itens de capacidade e frequência comportamental
//    (janela de 12 meses) para itens de conduta.
//
// 2. ITENS COMPORTAMENTAIS COM BARRA ALTA, não adjetivos de traço. Na validação
//    da EICAS, o grupo CONTROLE marcou ~80% do máximo nos itens socioemocionais
//    ("sou curioso", "me importo com os outros"): base rate altíssima, quase
//    zero discriminação (d = 0,42), contra d = 0,82 nos itens cognitivos, que
//    têm referente objetivo. Por isso cada item aqui exige um comportamento
//    específico, custoso e verificável.
//
// 3. RESULTADO POR DOMÍNIO, NUNCA ESCORE ÚNICO. Um perfil de dupla
//    excepcionalidade produz média achatada com picos reais — o "índice geral"
//    é justamente o desenho que mais deixa passar 2e. O destaque do resultado
//    é QUANTOS domínios atingiram o limiar, e o detalhamento é por área.
//
// Cobertura: as cinco áreas da Política Nacional (MEC/SEESP, 2008) —
// intelectual, acadêmica, liderança, psicomotricidade e artes — mais
// criatividade e envolvimento com a tarefa (atributos transversais do modelo
// de Renzulli adotado pelo MEC) e intensidade emocional/sensibilidade, que a
// Lei nº 15.436/2026 passou a nomear explicitamente na definição de AH/SD.
// ---------------------------------------------------------------------------

/** Sentinela: resposta excluída do cálculo (não conta como valor baixo). */
const NAO_SEI = -1;

/**
 * Comparação normativa (itens de capacidade). Formato de TIAH/S, GRS e HOPE.
 * A meta-análise de autoavaliação de inteligência (2024) mostra que escalas
 * relativas produzem correlação mais alta com medidas objetivas do que
 * escalas absolutas.
 */
const NORMATIVA: QuestionOption[] = [
  { label: "Bem abaixo da maioria", value: 1 },
  { label: "Um pouco abaixo", value: 2 },
  { label: "Como a maioria", value: 3 },
  { label: "Acima da maioria", value: 4 },
  { label: "Muito acima da maioria", value: 5 },
  { label: "Nunca tive oportunidade de descobrir", value: NAO_SEI },
];

/**
 * Frequência comportamental com janela de 12 meses (itens de conduta).
 * Termos de frequência têm estabilidade temporal superior à de termos de
 * intensidade, e no máximo 4–5 âncoras verbais são distinguíveis com
 * confiabilidade — por isso a escala é curta e totalmente rotulada.
 */
const FREQUENCIA: QuestionOption[] = [
  { label: "Nenhuma vez", value: 1 },
  { label: "1 ou 2 vezes", value: 2 },
  { label: "Algumas vezes", value: 3 },
  { label: "Muitas vezes", value: 4 },
  { label: "Foi a regra, não a exceção", value: 5 },
  { label: "Não se aplica ao meu contexto", value: NAO_SEI },
];

const subscales: Subscale[] = [
  { key: "intelectual", name: "Capacidade intelectual geral", description: "Raciocínio, rapidez de aprendizagem e transferência de conhecimento." },
  { key: "academica", name: "Aptidão acadêmica específica", description: "Domínio profundo e desempenho superior em uma área definida." },
  { key: "criatividade", name: "Criatividade / pensamento produtivo", description: "Originalidade, fluência de ideias e produção de algo novo." },
  { key: "envolvimento", name: "Envolvimento com a tarefa", description: "Persistência e imersão profunda em temas de interesse (Renzulli; Lei 15.436/2026)." },
  { key: "lideranca", name: "Liderança", description: "Influência, articulação de grupos e responsabilidade assumida." },
  { key: "artistica", name: "Talento artístico", description: "Produção e desempenho em artes visuais, música, teatro ou escrita." },
  { key: "psicomotora", name: "Capacidade psicomotora", description: "Aprendizagem motora, coordenação e desempenho físico." },
  { key: "emocional", name: "Intensidade emocional e sensibilidade", description: "Alta sensibilidade e intensidade — nomeadas na definição legal de AH/SD." },
];

type Fmt = "n" | "f";

// [subescala, formato, texto]
const raw: [string, Fmt, string][] = [
  // --- Capacidade intelectual geral (comparação normativa) ---
  ["intelectual", "n", "Comparando-se à maioria das pessoas da sua idade: a rapidez com que você aprende um assunto complexo e inteiramente novo é…"],
  ["intelectual", "n", "Sua capacidade de perceber a estrutura de um problema antes de conhecer os detalhes, comparada à da maioria das pessoas, é…"],
  ["intelectual", "n", "Sua capacidade de aplicar em uma área algo que aprendeu em outra completamente diferente é…"],
  ["intelectual", "n", "Comparada à da maioria, sua capacidade de sustentar raciocínio abstrato longo (várias etapas encadeadas, sem apoio escrito) é…"],
  ["intelectual", "f", "Nos últimos 12 meses, quantas vezes alguém recorreu a você especificamente porque considerou que você entenderia um problema complexo mais rápido do que os outros?"],

  // --- Aptidão acadêmica específica ---
  ["academica", "n", "Em sua melhor área de conhecimento, seu domínio comparado ao da maioria das pessoas com formação semelhante é…"],
  ["academica", "f", "Nos últimos 12 meses, quantas vezes você estudou por conta própria um conteúdo de nível avançado (universitário ou técnico) sem que ninguém exigisse isso de você?"],
  ["academica", "f", "Nos últimos 12 meses, quantas vezes você corrigiu ou complementou, com fundamento, algo dito por um professor, autor ou especialista da área?"],
  ["academica", "f", "Nos últimos 12 meses, quantas vezes você leu material técnico ou científico primário (artigo, manual, documentação) por interesse próprio?"],

  // --- Criatividade / pensamento produtivo ---
  ["criatividade", "f", "Nos últimos 12 meses, quantas vezes você criou algo que passou a ser usado por outras pessoas (um método, uma ferramenta, um texto, uma obra, um projeto)?"],
  ["criatividade", "f", "Nos últimos 12 meses, quantas vezes você resolveu um problema por um caminho que ninguém ao seu redor havia considerado?"],
  ["criatividade", "f", "Nos últimos 12 meses, quantas vezes alguém reagiu à sua ideia dizendo que ela era inusitada, estranha ou fora do comum — e depois ela funcionou?"],
  ["criatividade", "n", "Sua capacidade de gerar muitas soluções diferentes para o mesmo problema, comparada à da maioria, é…"],
  ["criatividade", "f", "Nos últimos 12 meses, quantas vezes você abandonou uma solução que já funcionava para testar uma melhor, sem que precisasse?"],

  // --- Envolvimento com a tarefa ---
  ["envolvimento", "f", "Nos últimos 12 meses, quantas vezes você passou mais de quatro horas seguidas absorvido em um assunto, perdendo a noção do tempo?"],
  ["envolvimento", "f", "Nos últimos 12 meses, quantas vezes você manteve um mesmo interesse por meses, aprofundando-o muito além do necessário para qualquer finalidade prática?"],
  ["envolvimento", "f", "Nos últimos 12 meses, quantas vezes você refez um trabalho já aceito pelos outros porque o seu próprio padrão não estava satisfeito?"],
  ["envolvimento", "f", "Nos últimos 12 meses, quantas vezes você abriu mão de lazer ou descanso para continuar um projeto que ninguém cobrava de você?"],
  ["envolvimento", "f", "Nos últimos 12 meses, quantas vezes você aprendeu uma habilidade difícil por conta própria só para conseguir avançar em um interesse seu?"],

  // --- Liderança ---
  ["lideranca", "f", "Nos últimos 12 meses, quantas vezes um grupo adotou um rumo porque você o articulou ou o convenceu?"],
  ["lideranca", "f", "Nos últimos 12 meses, quantas vezes pessoas procuraram você para mediar um conflito ou destravar um impasse?"],
  ["lideranca", "n", "Sua capacidade de perceber a melhor função de cada pessoa em um grupo, comparada à da maioria, é…"],
  ["lideranca", "f", "Nos últimos 12 meses, quantas vezes você assumiu a responsabilidade por algo que ninguém queria assumir e levou até o fim?"],

  // --- Talento artístico ---
  ["artistica", "n", "Em sua melhor linguagem artística (música, desenho, escrita, teatro, dança…), seu desempenho comparado ao da maioria das pessoas é…"],
  ["artistica", "f", "Nos últimos 12 meses, quantas vezes você produziu uma obra própria (não cópia nem exercício) em alguma linguagem artística?"],
  ["artistica", "f", "Nos últimos 12 meses, quantas vezes alguém de fora do seu círculo próximo elogiou espontaneamente, comentou ou quis sua produção artística?"],
  ["artistica", "f", "Nos últimos 12 meses, quantas vezes você improvisou ou criou no momento, sem preparo, em alguma linguagem artística?"],

  // --- Capacidade psicomotora ---
  ["psicomotora", "n", "Sua rapidez para aprender um movimento ou habilidade física nova, comparada à da maioria, é…"],
  ["psicomotora", "n", "Seu desempenho em atividades que exigem coordenação, precisão ou agilidade, comparado ao da maioria, é…"],
  ["psicomotora", "f", "Nos últimos 12 meses, quantas vezes você foi escolhido, convidado ou destacado por sua habilidade física ou destreza?"],

  // --- Intensidade emocional e sensibilidade ---
  ["emocional", "f", "Nos últimos 12 meses, quantas vezes uma questão abstrata (uma injustiça distante, uma ideia, uma obra) provocou em você uma reação emocional forte e duradoura?"],
  ["emocional", "f", "Nos últimos 12 meses, quantas vezes você percebeu algo no ambiente (um som, uma tensão entre pessoas, um detalhe) que ninguém mais havia notado — e depois se confirmou?"],
  ["emocional", "f", "Nos últimos 12 meses, quantas vezes você precisou se afastar de um ambiente por excesso de estímulo (barulho, luz, muita gente) enquanto os outros seguiam bem?"],
  ["emocional", "f", "Nos últimos 12 meses, quantas vezes você se sentiu fora de sintonia com pessoas da sua idade por causa da profundidade ou do tipo dos seus interesses?"],
];

const questions: Question[] = raw.map(([subscale, fmt, text], i) => ({
  id: `q${i + 1}`,
  text,
  subscale,
  options: fmt === "n" ? NORMATIVA : FREQUENCIA,
}));

/**
 * Limiar por domínio: média ≥ 4,0 — "acima da maioria" nos itens normativos,
 * "muitas vezes" nos comportamentais. É um limiar CONVENCIONAL, não validado:
 * não existe amostra normativa brasileira de AH/SD para adultos. Foi calibrado
 * para SENSIBILIDADE, seguindo a lógica dos instrumentos de triagem — num
 * rastreio de primeira etapa os erros são assimétricos: um falso positivo custa
 * uma avaliação a mais; um falso negativo tira a pessoa do funil para sempre
 * (McBee, Peters & Miller, 2016, encontraram taxas de falso negativo acima de
 * 60% em sistemas de identificação com etapa de nomeação).
 */
const LIMIAR = 4.0;

const bands = [
  { min: 0, max: 0, label: "Nenhum domínio no limiar", severity: "none" as const, description: "Nenhuma área atingiu o limiar de triagem. Lembre-se de que autorrelato de capacidade correlaciona apenas ~0,30 com medidas objetivas — este resultado não descarta AH/SD, sobretudo se você respondeu com critério rigoroso." },
  { min: 1, max: 1, label: "1 domínio no limiar", severity: "low" as const, description: "Uma área atingiu o limiar. Na política brasileira, potencial elevado em UMA área isolada já caracteriza AH/SD — vale observar consistência ao longo do tempo e considerar avaliação." },
  { min: 2, max: 3, label: "2 a 3 domínios no limiar", severity: "moderate" as const, description: "Múltiplas áreas no limiar. Perfil que justifica avaliação multidimensional com profissional experiente em AH/SD." },
  { min: 4, max: 8, label: "4 ou mais domínios no limiar", severity: "high" as const, description: "Perfil amplo, com várias áreas acima do limiar. Justifica avaliação especializada. Atenção: perfis muito amplos em autorrelato também podem refletir critério de julgamento generoso — a avaliação formal é o que diferencia." },
];

export const ahsdIndicadores: Instrument = {
  id: "ahsd-indicadores",
  acronym: "AH/SD",
  name: "Indicadores de Altas Habilidades/Superdotação",
  originalName:
    "Instrumento autoral, alinhado às convenções de TIAH/S (Nakano & Oliveira), GRS (Pfeiffer) e HOPE (Peters & Gentry), às áreas da Política Nacional (MEC, 2008) e à Lei nº 15.436/2026",
  category: "altas-habilidades",
  summary:
    "Rastreio por domínio, com âncoras de frequência e comparação normativa. Resultado por área — nunca um escore único.",
  audience: "Adultos e adolescentes (autorrelato)",
  estMinutes: 10,
  intro:
    "Este rastreio cobre as cinco áreas da Política Nacional de AH/SD (intelectual, acadêmica, liderança, psicomotricidade e artes), mais criatividade e envolvimento com a tarefa, e ainda a intensidade emocional que a Lei nº 15.436/2026 passou a nomear na definição legal. Duas escolhas de desenho merecem sua atenção: as perguntas pedem FREQUÊNCIA de comportamentos concretos nos últimos 12 meses ou COMPARAÇÃO com a maioria das pessoas — nunca concordância com adjetivos. É assim que os instrumentos validados perguntam, porque concordar com 'sou curioso' quase todo mundo concorda. E o resultado é reportado POR ÁREA: não existe nota geral.",
  instructions:
    "Responda com critério rigoroso — a barra de cada item é alta de propósito. Se um item não se aplica ao seu contexto ou você nunca teve como descobrir, use a última alternativa: ela é excluída do cálculo e não conta como resposta baixa.",
  scaleType: "custom",
  defaultOptions: FREQUENCIA,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Domínios que atingiram o limiar (de 8)",
  references: [
    { label: "Nakano TC, Oliveira KS. Triagem de Indicadores de Altas Habilidades/Superdotação: estrutura fatorial. Avaliação Psicológica. 2019;18(4):448-456." },
    { label: "Nakano TC, Primi R. TIAH/S: evidências de validade de critério. Estudos em Avaliação Educacional. 2020;31(77):472-495." },
    { label: "Zaia P, Nakano TC. EICAS-AH/SD — escala de autorrelato (evidências de estrutura e de critério). RIDEP. 2020;2(55):31-41." },
    { label: "Pfeiffer SI, Jarosewich T. Gifted Rating Scales. Pearson, 2003." },
    { label: "Peters SJ, Gentry M. HOPE Teacher Rating Scale. Gifted Child Quarterly. 2010;54(4):298-313." },
    { label: "Delou CMC. Lista Base de Indicadores de Superdotação (UERJ, 1987; rev. 2015)." },
    { label: "Brasil. Política Nacional de Educação Especial na Perspectiva da Educação Inclusiva. MEC/SEESP, 2008." },
    { label: "Brasil. Lei nº 15.436, de 17 de junho de 2026 — Política Nacional para Estudantes com AH/SD." },
    { label: "McBee MT, Peters SJ, Miller EM. The impact of the nomination stage on gifted program identification. Gifted Child Quarterly. 2016;60(4)." },
    { label: "Freund PA, Kasten N. How smart do you think you are? Psychological Bulletin. 2012 (autoavaliação × medida objetiva, r ≈ .30)." },
  ],
  score: (r: Responses) => {
    // Média por domínio, EXCLUINDO "não sei / não se aplica" (valor -1): uma
    // resposta de não-conhecimento não é um valor baixo. Convenção herdada do
    // "incapaz de julgar" do TIAH/S, que é pontuado fora da escala.
    const subs = subscales.map((s) => {
      const items = questions.filter((q) => q.subscale === s.key);
      const vals = items
        .map((q) => r[q.id])
        .filter((v): v is number => v !== undefined && v > 0);
      const mean = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      const rounded = Math.round(mean * 100) / 100;
      const atingiu = vals.length > 0 && rounded >= LIMIAR;
      return {
        key: s.key,
        name: s.name,
        description: s.description,
        raw: rounded,
        max: 5,
        mean: rounded,
        band: {
          min: 0,
          max: 5,
          label: vals.length === 0
            ? "sem resposta aplicável"
            : atingiu
              ? "no limiar de triagem"
              : "abaixo do limiar",
          severity: (vals.length === 0 ? "info" : atingiu ? "high" : "none") as
            | "info" | "high" | "none",
          description: "",
        },
        atingiu,
      };
    });

    const noLimiar = subs.filter((s) => s.atingiu);
    const band = bands.find((b) => noLimiar.length >= b.min && noLimiar.length <= b.max) ?? bands[0];

    const notes: string[] = [];
    if (noLimiar.length > 0) {
      notes.push(
        `Áreas no limiar: ${noLimiar.map((s) => `${s.name} (média ${s.mean})`).join("; ")}.`,
      );
    }
    notes.push(
      "Leitura por domínio, de propósito: um escore único achataria um perfil com picos reais em poucas áreas — que é justamente o padrão da dupla excepcionalidade.",
    );
    notes.push(
      "O limiar de 4,0 é convencional, não validado: não existe instrumento brasileiro de AH/SD com norma para adultos. Ele foi calibrado para sensibilidade — prefere apontar a mais do que deixar passar.",
    );
    notes.push(
      "Atingir o limiar significa que seu padrão de respostas se parece com o que a literatura descreve como indicador de AH/SD naquela área — não que você é superdotado. Autorrelato de capacidade explica cerca de 9% da variação da medida objetiva.",
    );

    return {
      totalScore: noLimiar.length,
      maxScore: subscales.length,
      band,
      subscales: subs.map(({ atingiu, ...rest }) => {
        void atingiu;
        return rest;
      }),
      notes,
    };
  },
};
