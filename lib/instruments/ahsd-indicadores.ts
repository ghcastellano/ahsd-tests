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
//    é justamente o desenho que mais deixa passar 2e.
//
// 4. AGREGAÇÃO DISJUNTIVA E CONTÍNUA. O destaque é a média do MELHOR domínio,
//    não a média geral nem a contagem de domínios no limiar. Duas razões: a
//    definição legal brasileira é disjuntiva (potencial elevado em UMA ou mais
//    áreas já caracteriza AH/SD), e dicotomizar uma medida contínua num ponto
//    de corte descarta variância e poder estatístico à toa (Cohen, 1983;
//    MacCallum et al., 2002) — com corte em 4,0, um domínio de 3,9 e um de 1,2
//    ficariam indistinguíveis. A contagem de domínios no limiar continua no
//    resultado, como leitura de AMPLITUDE ao lado da de NÍVEL.
//
// 5. COBERTURA MÍNIMA POR DOMÍNIO. "Não sei / não se aplica" sai do cálculo,
//    mas um domínio precisa de pelo menos metade dos itens respondidos (e no
//    mínimo dois) para receber média: sinalizar uma área inteira a partir de um
//    único item é ruído, não medida.
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
  ["intelectual", "n", "Comparados aos da maioria das pessoas, o seu vocabulário e a sua precisão no uso das palavras são…"],
  ["intelectual", "n", "Sua capacidade de reter muito detalhe sobre um assunto que lhe interessa, comparada à da maioria, é…"],
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
  ["criatividade", "f", "Nos últimos 12 meses, quantas vezes você contrariou uma regra ou convenção estabelecida por ter um argumento melhor — e sustentou o argumento até o fim?"],

  // --- Envolvimento com a tarefa ---
  ["envolvimento", "f", "Nos últimos 12 meses, quantas vezes você passou mais de quatro horas seguidas absorvido em um assunto, perdendo a noção do tempo?"],
  ["envolvimento", "f", "Nos últimos 12 meses, quantas vezes você manteve um mesmo interesse por meses, aprofundando-o muito além do necessário para qualquer finalidade prática?"],
  ["envolvimento", "f", "Nos últimos 12 meses, quantas vezes você refez um trabalho já aceito pelos outros porque o seu próprio padrão não estava satisfeito?"],
  ["envolvimento", "f", "Nos últimos 12 meses, quantas vezes você abriu mão de lazer ou descanso para continuar um projeto que ninguém cobrava de você?"],
  ["envolvimento", "f", "Nos últimos 12 meses, quantas vezes você aprendeu uma habilidade difícil por conta própria só para conseguir avançar em um interesse seu?"],
  ["envolvimento", "n", "Sua capacidade de sustentar atenção e esforço em algo difícil por longos períodos, comparada à da maioria, é…"],

  // --- Liderança ---
  ["lideranca", "f", "Nos últimos 12 meses, quantas vezes um grupo adotou um rumo porque você o articulou ou o convenceu?"],
  ["lideranca", "f", "Nos últimos 12 meses, quantas vezes pessoas procuraram você para mediar um conflito ou destravar um impasse?"],
  ["lideranca", "n", "Sua capacidade de perceber a melhor função de cada pessoa em um grupo, comparada à da maioria, é…"],
  ["lideranca", "f", "Nos últimos 12 meses, quantas vezes você assumiu a responsabilidade por algo que ninguém queria assumir e levou até o fim?"],
  // Item normativo de propósito: os quatro anteriores dependem de haver grupo,
  // conflito ou oportunidade — quem passou o ano isolado pontuaria baixo por
  // circunstância, não por capacidade.
  ["lideranca", "n", "Sua capacidade de fazer um grupo dividido chegar a uma decisão, comparada à da maioria das pessoas, é…"],

  // --- Talento artístico ---
  ["artistica", "n", "Em sua melhor linguagem artística (música, desenho, escrita, teatro, dança…), seu desempenho comparado ao da maioria das pessoas é…"],
  ["artistica", "f", "Nos últimos 12 meses, quantas vezes você produziu uma obra própria (não cópia nem exercício) em alguma linguagem artística?"],
  ["artistica", "f", "Nos últimos 12 meses, quantas vezes alguém de fora do seu círculo próximo elogiou espontaneamente, comentou ou quis sua produção artística?"],
  ["artistica", "f", "Nos últimos 12 meses, quantas vezes você improvisou ou criou no momento, sem preparo, em alguma linguagem artística?"],
  ["artistica", "n", "Sua percepção de detalhes estéticos — cor, som, ritmo, forma, proporção — comparada à da maioria, é…"],

  // --- Capacidade psicomotora ---
  ["psicomotora", "n", "Sua rapidez para aprender um movimento ou habilidade física nova, comparada à da maioria, é…"],
  ["psicomotora", "n", "Seu desempenho em atividades que exigem coordenação, precisão ou agilidade, comparado ao da maioria, é…"],
  ["psicomotora", "f", "Nos últimos 12 meses, quantas vezes você foi escolhido, convidado ou destacado por sua habilidade física ou destreza?"],

  // --- Intensidade emocional e sensibilidade ---
  ["emocional", "f", "Nos últimos 12 meses, quantas vezes uma questão abstrata (uma injustiça distante, uma ideia, uma obra) provocou em você uma reação emocional forte e duradoura?"],
  ["emocional", "f", "Nos últimos 12 meses, quantas vezes você percebeu algo no ambiente (um som, uma tensão entre pessoas, um detalhe) que ninguém mais havia notado — e depois se confirmou?"],
  ["emocional", "f", "Nos últimos 12 meses, quantas vezes você precisou se afastar de um ambiente por excesso de estímulo (barulho, luz, muita gente) enquanto os outros seguiam bem?"],
  ["emocional", "f", "Nos últimos 12 meses, quantas vezes você se sentiu fora de sintonia com pessoas da sua idade por causa da profundidade ou do tipo dos seus interesses?"],
  ["emocional", "n", "Sua sensibilidade a estímulos do ambiente — som, luz, textura, clima emocional de um grupo — comparada à da maioria, é…"],
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

/** Itens respondidos que um domínio precisa ter para receber média. */
function minimoDeItens(totalDeItens: number): number {
  return Math.max(2, Math.ceil(totalDeItens / 2));
}

// Faixas sobre a média do MELHOR domínio (não sobre a média geral: a definição
// legal é disjuntiva, e a média geral achata perfis com picos reais).
const bands = [
  { min: 0, max: 2.99, label: "Nenhum domínio próximo do limiar", severity: "none" as const, description: "Nenhuma área chegou perto do limiar de triagem. Lembre-se de que autorrelato de capacidade correlaciona apenas ~0,30 com medidas objetivas — este resultado não descarta AH/SD, sobretudo se você respondeu com critério rigoroso." },
  { min: 3.0, max: 3.99, label: "Próximo do limiar em pelo menos um domínio", severity: "low" as const, description: "Sua melhor área ficou logo abaixo do limiar. Vale observar consistência ao longo do tempo: um rastreio é uma fotografia, e comportamentos de alta habilidade dependem de oportunidade para aparecer." },
  { min: 4.0, max: 4.49, label: "Pelo menos um domínio no limiar", severity: "moderate" as const, description: "Sua melhor área atingiu o limiar de triagem. Na política brasileira, potencial elevado em UMA área isolada já caracteriza AH/SD — este é o perfil que justifica procurar avaliação multidimensional." },
  { min: 4.5, max: 5, label: "Domínio bem acima do limiar", severity: "high" as const, description: "Sua melhor área ficou bem acima do limiar. Justifica avaliação especializada. Atenção: pontuações muito altas em autorrelato também podem refletir critério de julgamento generoso — a avaliação formal é o que diferencia." },
];

export const ahsdIndicadores: Instrument = {
  id: "ahsd-indicadores",
  acronym: "AH/SD",
  name: "Indicadores de Altas Habilidades/Superdotação",
  originalName:
    "Instrumento autoral, alinhado às convenções de TIAH/S (Nakano & Oliveira), GRS (Pfeiffer) e HOPE (Peters & Gentry), às áreas da Política Nacional (MEC, 2008) e à Lei nº 15.436/2026",
  category: "altas-habilidades",
  summary:
    "Rastreio por domínio, com âncoras de frequência e comparação normativa. O destaque é a sua melhor área — nunca uma média geral.",
  audience: "Adultos e adolescentes (autorrelato)",
  estMinutes: 12,
  intro:
    "Este rastreio cobre as cinco áreas da Política Nacional de AH/SD (intelectual, acadêmica, liderança, psicomotricidade e artes), mais criatividade e envolvimento com a tarefa, e ainda a intensidade emocional que a Lei nº 15.436/2026 passou a nomear na definição legal. Duas escolhas de desenho merecem sua atenção: as perguntas pedem FREQUÊNCIA de comportamentos concretos nos últimos 12 meses ou COMPARAÇÃO com a maioria das pessoas — nunca concordância com adjetivos. É assim que os instrumentos validados perguntam, porque concordar com 'sou curioso' quase todo mundo concorda. E o resultado é reportado POR ÁREA, com destaque para a SUA MELHOR ÁREA: não existe nota geral, porque uma média esconderia picos reais em poucos domínios.",
  instructions:
    "Responda com critério rigoroso — a barra de cada item é alta de propósito. Se um item não se aplica ao seu contexto ou você nunca teve como descobrir, use a última alternativa: ela é excluída do cálculo e não conta como resposta baixa.",
  scaleType: "custom",
  defaultOptions: FREQUENCIA,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Melhor domínio (média 1–5)",
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
    { label: "MacCallum RC, Zhang S, Preacher KJ, Rucker DD. On the practice of dichotomization of quantitative variables. Psychological Methods. 2002;7(1):19-40." },
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
      // Sem cobertura mínima o domínio não recebe média: uma área inteira
      // sinalizada a partir de um único item é ruído, não medida.
      const medivel = vals.length >= minimoDeItens(items.length);
      const mean = medivel ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      const rounded = Math.round(mean * 100) / 100;
      const atingiu = medivel && rounded >= LIMIAR;
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
          label: !medivel
            ? "sem respostas suficientes"
            : atingiu
              ? "no limiar de triagem"
              : "abaixo do limiar",
          severity: (!medivel ? "info" : atingiu ? "high" : "none") as
            | "info" | "high" | "none",
          description: "",
        },
        medivel,
        atingiu,
      };
    });

    const medidos = subs.filter((s) => s.medivel);
    const noLimiar = subs.filter((s) => s.atingiu);
    // Destaque = melhor domínio (agregação disjuntiva e contínua).
    const melhor = medidos.reduce<(typeof subs)[number] | null>(
      (a, s) => (a === null || s.mean > a.mean ? s : a),
      null,
    );
    const topo = melhor?.mean ?? 0;
    const band = bands.find((b) => topo >= b.min && topo <= b.max) ?? bands[0];

    const notes: string[] = [];
    if (melhor) {
      notes.push(`Melhor domínio: ${melhor.name} (média ${melhor.mean} de 5).`);
    }
    notes.push(
      noLimiar.length > 0
        ? `Amplitude: ${noLimiar.length} de ${medidos.length} domínios medidos atingiram o limiar — ${noLimiar.map((s) => `${s.name} (${s.mean})`).join("; ")}.`
        : `Amplitude: nenhum dos ${medidos.length} domínios medidos atingiu o limiar de ${LIMIAR.toFixed(1).replace(".", ",")}.`,
    );
    if (medidos.length < subscales.length) {
      const faltantes = subs.filter((s) => !s.medivel).map((s) => s.name);
      notes.push(
        `Sem respostas suficientes para medir: ${faltantes.join("; ")}. Um domínio precisa de pelo menos metade dos itens respondidos — "não sei / não se aplica" não conta como nota baixa, mas também não sustenta uma média.`,
      );
    }
    notes.push(
      "O destaque é o melhor domínio, não a média das áreas: a política brasileira caracteriza AH/SD por potencial elevado em UMA ou mais áreas, e uma média geral achataria justamente o perfil com picos que é típico da dupla excepcionalidade.",
    );
    notes.push(
      "O limiar de 4,0 é convencional, não validado: não existe instrumento brasileiro de AH/SD com norma para adultos. Ele foi calibrado para sensibilidade — prefere apontar a mais do que deixar passar.",
    );
    notes.push(
      "Atingir o limiar significa que seu padrão de respostas se parece com o que a literatura descreve como indicador de AH/SD naquela área — não que você é superdotado. Autorrelato de capacidade explica cerca de 9% da variação da medida objetiva.",
    );
    notes.push(
      "Itens de frequência dependem de oportunidade: quem passou o ano sem grupo, sem projeto ou sem contexto artístico pontua baixo por circunstância, não por capacidade. Por isso todo domínio tem também item de comparação normativa, e por isso um domínio isolado alto já conta.",
    );

    return {
      totalScore: topo,
      maxScore: 5,
      band,
      metricIsMean: true,
      positive: noLimiar.length > 0,
      subscales: subs.map(({ atingiu, medivel, ...rest }) => {
        void atingiu;
        void medivel;
        return rest;
      }),
      notes,
    };
  },
};
