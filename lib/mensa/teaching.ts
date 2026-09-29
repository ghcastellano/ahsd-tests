import type { Cell } from "../battery/types";
import type { MensaItem } from "./banco";

export interface TeachingGuide {
  patternName: string;
  oneLine: string;
  mentalModel: string;
  transfer: string;
  commonTrap: string;
  checklist: string[];
  phases: { title: string; instruction: string; focus: "overview" | "example" | "target" | "answer" }[];
}

const baseChecklist = [
  "1. Descubra a direção: linha, coluna, sequência ou pares.",
  "2. Separe os atributos: forma, quantidade, preenchimento, posição e rotação.",
  "3. Teste a hipótese em pelo menos dois exemplos antes de aplicá-la à lacuna.",
  "4. Só então compare com as alternativas.",
];

function kindOf(q: MensaItem): string {
  if (q.type === "figura") return q.item.kind ?? (q.item.grid ? "matrix-generic" : q.item.sequence ? "series-generic" : q.item.set ? "class-generic" : "generic");
  if (q.type === "padrao") return `pattern-${q.family}`;
  return q.type;
}

export function teachingFor(q: MensaItem): TeachingGuide {
  const kind = kindOf(q);

  if (kind === "logic-or") return {
    patternName: "União visual (OR)",
    oneLine: "O terceiro quadro reúne tudo o que aparece no primeiro OU no segundo, sem duplicar.",
    mentalModel: "Pense em dois potes sendo despejados em um terceiro. Se um elemento aparece em qualquer um dos potes, ele entra no resultado.",
    transfer: "Use este modelo quando a terceira célula parecer uma soma visual das duas anteriores. Primeiro catalogue os elementos do A, depois do B, e junte a lista.",
    commonTrap: "Confundir OR com XOR. No OR, um elemento repetido nos dois lados continua existindo; ele não desaparece.",
    checklist: [...baseChecklist, "Atalho: pergunte 'aparece em A ou B?'. Se sim, fica."],
    phases: [
      { title: "Onde olhar", instruction: "Use uma linha completa como exemplo: célula 1 + célula 2 → célula 3.", focus: "overview" },
      { title: "Descubra a operação", instruction: "Liste mentalmente todos os elementos presentes nas duas primeiras células.", focus: "example" },
      { title: "Aplique na última linha", instruction: "Repita a união nas duas células antes da lacuna.", focus: "target" },
      { title: "Confira", instruction: "A resposta deve conter todos os elementos vistos em pelo menos um dos dois quadros.", focus: "answer" },
    ],
  };

  if (kind === "logic-and") return {
    patternName: "Interseção visual (AND)",
    oneLine: "Só sobrevivem os elementos presentes ao mesmo tempo nos dois primeiros quadros.",
    mentalModel: "Imagine dois filtros sobrepostos. Apenas aquilo que passa pelos dois filtros aparece no resultado.",
    transfer: "Quando o terceiro quadro parece mais simples do que os dois primeiros, procure primeiro o que eles têm em comum.",
    commonTrap: "Levar para o resultado um elemento que aparece em apenas um dos lados. AND exige presença dupla.",
    checklist: [...baseChecklist, "Atalho: pergunte 'está em A E em B?'. Só se a resposta for sim ele fica."],
    phases: [
      { title: "Onde olhar", instruction: "Use uma linha completa para descobrir o filtro.", focus: "overview" },
      { title: "Marque o comum", instruction: "Compare os dois primeiros quadros e retenha apenas elementos repetidos.", focus: "example" },
      { title: "Aplique na lacuna", instruction: "Na última linha, procure somente a interseção entre os dois quadros.", focus: "target" },
      { title: "Confira", instruction: "Nenhum elemento exclusivo de um dos lados pode aparecer na resposta.", focus: "answer" },
    ],
  };

  if (kind === "logic-xor") return {
    patternName: "Cancelamento visual (XOR)",
    oneLine: "O que aparece nos dois lados se cancela; o que aparece em apenas um permanece.",
    mentalModel: "Pense em pares que se anulam. Dois iguais somem. Um elemento sem par sobrevive.",
    transfer: "Use XOR quando o resultado parece uma mistura reduzida: há elementos de A e B, mas os repetidos desapareceram.",
    commonTrap: "Confundir com OR. No OR, repetidos continuam; no XOR, repetidos somem.",
    checklist: [...baseChecklist, "Atalho: IGUAL = cancela; DIFERENTE = permanece."],
    phases: [
      { title: "Onde olhar", instruction: "Encontre uma linha completa e compare as duas primeiras células.", focus: "overview" },
      { title: "Cancele os pares", instruction: "Elementos presentes nos dois quadros desaparecem. Exclusivos permanecem.", focus: "example" },
      { title: "Repita na última linha", instruction: "Faça a mesma comparação sem olhar ainda as alternativas.", focus: "target" },
      { title: "Confira", instruction: "A resposta deve conter exatamente os elementos exclusivos de um lado.", focus: "answer" },
    ],
  };

  if (kind === "d3") return {
    patternName: "Distribuição de três",
    oneLine: "Cada linha distribui três valores uma vez cada; forma e preenchimento podem seguir ordens independentes.",
    mentalModel: "Pense em um mini-Sudoku de atributos. Em vez de números 1-2-3, há três formas e três preenchimentos.",
    transfer: "Quando várias células parecem permutações dos mesmos três valores, pare de procurar movimento e procure 'qual valor está faltando'. Resolva cada atributo separadamente.",
    commonTrap: "Tentar achar uma única transformação visual para a célula inteira. Aqui forma e preenchimento podem obedecer a sequências diferentes.",
    checklist: [...baseChecklist, "Liste as três formas.", "Liste os três preenchimentos.", "Ache o ausente de cada lista e combine-os."],
    phases: [
      { title: "Separe os atributos", instruction: "Ignore a célula inteira: observe primeiro apenas as formas; depois apenas o preenchimento.", focus: "overview" },
      { title: "Ache o valor ausente", instruction: "Em uma linha completa, verifique se os três valores aparecem uma vez cada.", focus: "example" },
      { title: "Resolva a última linha", instruction: "Descubra qual forma falta e qual preenchimento falta, independentemente.", focus: "target" },
      { title: "Combine", instruction: "A alternativa correta é a única que junta os dois valores ausentes.", focus: "answer" },
    ],
  };

  if (kind === "d2") return {
    patternName: "Distribuição de dois + ausência",
    oneLine: "Dois símbolos e uma célula vazia são os três valores da regra.",
    mentalModel: "Trate o vazio como uma peça real do quebra-cabeça. O conjunto é {A, B, vazio}.",
    transfer: "Quando aparece um espaço em branco dentro de uma matriz, não presuma que seja 'nada'. Teste se a ausência está sendo distribuída como um terceiro símbolo.",
    commonTrap: "Ignorar o vazio e procurar uma operação apenas entre os símbolos visíveis.",
    checklist: [...baseChecklist, "Conte o vazio como um valor.", "Procure A, B e vazio uma vez por linha/coluna.", "Na lacuna, coloque o terceiro valor que falta."],
    phases: [
      { title: "Redefina o problema", instruction: "Considere a célula vazia como um terceiro símbolo, não como falta de informação.", focus: "overview" },
      { title: "Valide", instruction: "Em uma linha/coluna completa, confirme a presença de A, B e vazio.", focus: "example" },
      { title: "Ache o terceiro valor", instruction: "Na linha e coluna da lacuna, veja quais dois valores já estão presentes.", focus: "target" },
      { title: "Confira", instruction: "A resposta é o único valor que completa A + B + vazio.", focus: "answer" },
    ],
  };

  if (kind === "dual") return {
    patternName: "Duas camadas independentes",
    oneLine: "O contorno segue uma regra; o conteúdo interno segue outra.",
    mentalModel: "Desmonte a figura em camadas, como transparências. Resolva o exterior sem olhar o interior; depois faça o contrário.",
    transfer: "Sempre que uma célula tiver muitos atributos, evite procurar uma regra única para tudo. Pergunte se cada atributo pode estar andando sozinho.",
    commonTrap: "Tentar resolver contorno e conteúdo simultaneamente e aumentar demais a carga de memória.",
    checklist: [...baseChecklist, "Passe 1: ignore o interior e resolva o contorno.", "Passe 2: ignore o contorno e resolva elemento/quantidade.", "Passe 3: combine as duas respostas."],
    phases: [
      { title: "Quebre em camadas", instruction: "Primeiro observe somente os contornos externos.", focus: "overview" },
      { title: "Resolva o exterior", instruction: "Encontre a distribuição das formas externas sem considerar o conteúdo.", focus: "example" },
      { title: "Resolva o interior", instruction: "Agora ignore o contorno e acompanhe elemento e quantidade.", focus: "target" },
      { title: "Combine", instruction: "A resposta precisa satisfazer as duas regras ao mesmo tempo.", focus: "answer" },
    ],
  };

  if (kind.startsWith("series-")) {
    const specific = kind.replace("series-", "");
    const names: Record<string, [string,string,string,string]> = {
      "rotacao": ["Rotação constante", "A figura gira o mesmo ângulo a cada passo.", "Pense em um ponteiro avançando sempre o mesmo número de graus.", "Meça mentalmente a diferença de orientação entre vizinhos e repita."],
      "quantidade": ["Progressão de quantidade", "O número de elementos muda de forma regular.", "Conte antes de interpretar a forma.", "Anote mentalmente 1→2→3… e extrapole."],
      "tamanho": ["Ciclo de tamanho", "Pequeno, médio e grande formam um ciclo.", "Pense em um relógio de três estados.", "Procure repetição cíclica, não crescimento infinito."],
      "preenchimento": ["Ciclo de preenchimento", "Vazio, meio e cheio se alternam em ciclo.", "Ignore a forma e acompanhe somente o preenchimento.", "Trate cada preenchimento como estado 1, 2 e 3."],
      "rotacao-quantidade": ["Duas sequências paralelas", "Rotação e quantidade mudam ao mesmo tempo, cada uma com sua própria regra.", "Use dois trilhos: um para orientação e outro para quantidade.", "Resolva cada trilho separadamente e combine no fim."],
    };
    const [name, one, model, transfer] = names[specific] ?? ["Série visual", "A figura evolui segundo uma regra repetida.", "Compare vizinhos e procure a menor transformação que se repete.", "Repita a transformação no próximo termo."];
    return {
      patternName: name,
      oneLine: one,
      mentalModel: model,
      transfer,
      commonTrap: "Olhar todas as propriedades ao mesmo tempo. Comece pelo atributo que muda de forma mais regular.",
      checklist: [...baseChecklist, "Compare 1→2, depois 2→3.", "Procure a menor mudança que se repete.", "Aplique-a ao último termo."],
      phases: [
        { title: "Compare vizinhos", instruction: "Observe a mudança do primeiro para o segundo termo.", focus: "overview" },
        { title: "Confirme", instruction: "Veja se a mesma regra explica o passo seguinte.", focus: "example" },
        { title: "Projete", instruction: "Aplique a transformação ao último termo visível.", focus: "target" },
        { title: "Confira", instruction: "Escolha a alternativa que continua exatamente o mesmo padrão.", focus: "answer" },
      ],
    };
  }

  if (kind.startsWith("class-")) return {
    patternName: "Classificação por propriedade comum",
    oneLine: "Quatro figuras compartilham uma propriedade; uma viola essa regra.",
    mentalModel: "Não pergunte 'qual é diferente?'. Pergunte 'que regra explica quatro de uma vez?'.",
    transfer: "Teste propriedades simples em ordem: forma, quantidade, preenchimento, linhas curvas/retas, simetria. A boa regra deve incluir quatro e excluir apenas uma.",
    commonTrap: "Escolher a figura visualmente mais chamativa sem formular a propriedade compartilhada pelas outras quatro.",
    checklist: [...baseChecklist, "Formule a frase 'quatro têm ___'.", "Teste a frase nas cinco figuras.", "Só aceite se houver exatamente uma exceção."],
    phases: [
      { title: "Não procure o estranho ainda", instruction: "Procure primeiro uma propriedade que quatro figuras compartilhem.", focus: "overview" },
      { title: "Teste uma hipótese", instruction: "Passe pelas cinco figuras e conte quantas obedecem à regra.", focus: "example" },
      { title: "Ache a exceção", instruction: "A figura que não satisfaz a propriedade comum é a candidata.", focus: "target" },
      { title: "Confira", instruction: "Garanta que não exista uma segunda exceção escondida.", focus: "answer" },
    ],
  };

  if (kind === "pattern-composicao") return {
    patternName: "Composição de transformação + operação",
    oneLine: "Cada entrada é transformada e só depois os dois resultados são combinados.",
    mentalModel: "Pense em uma receita de duas etapas: transformar ingredientes → misturar.",
    transfer: "Se uma combinação direta não funciona, teste uma transformação simples antes de OR/AND/XOR. Este é overtraining, não o núcleo do modo principal.",
    commonTrap: "Misturar antes de transformar ou tentar descobrir todas as operações de uma vez.",
    checklist: [...baseChecklist, "Transforme A.", "Transforme B.", "Só depois combine.", "Valide em duas linhas/colunas."],
    phases: [
      { title: "Ache o eixo", instruction: "Descubra se a composição se repete por linhas ou por colunas.", focus: "overview" },
      { title: "Transforme separadamente", instruction: "Aplique a transformação de cada entrada antes de misturá-las.", focus: "example" },
      { title: "Combine", instruction: "Use a operação lógica que explica os exemplos completos.", focus: "target" },
      { title: "Confira", instruction: "Repita a mesma receita na lacuna.", focus: "answer" },
    ],
  };

  if (kind === "pattern-intercalacao") return {
    patternName: "Série intercalada",
    oneLine: "Há duas sequências escondidas: posições ímpares e pares.",
    mentalModel: "Imagine dois trilhos entrelaçados: 1-3-5-7 e 2-4-6-8.",
    transfer: "Quando uma série parece caótica, separe imediatamente ímpares e pares e teste cada trilho.",
    commonTrap: "Comparar sempre termo com o vizinho, quando o verdadeiro predecessor está duas posições atrás.",
    checklist: [...baseChecklist, "Separe ímpares.", "Separe pares.", "Descubra a transformação de cada trilho.", "Use o trilho da posição faltante."],
    phases: [
      { title: "Separe os trilhos", instruction: "Agrupe posições ímpares e pares.", focus: "overview" },
      { title: "Resolva o primeiro trilho", instruction: "Procure a transformação 1→3→5→7.", focus: "example" },
      { title: "Resolva o segundo", instruction: "Procure a transformação 2→4→6.", focus: "target" },
      { title: "Prossiga no trilho correto", instruction: "A resposta continua apenas a subsequência da posição faltante.", focus: "answer" },
    ],
  };

  if (kind === "pattern-alternancia") return {
    patternName: "Transformações alternadas",
    oneLine: "Duas operações se revezam: A, B, A, B...",
    mentalModel: "Pense em passos esquerdo-direito: uma regra em um passo, outra no próximo.",
    transfer: "Quando a mesma transformação funciona a cada dois passos, procure alternância.",
    commonTrap: "Forçar uma única transformação para todas as transições.",
    checklist: [...baseChecklist, "Compare transições 1→2 e 3→4.", "Compare 2→3 e 4→5.", "Se formarem dois grupos, alterne A/B."],
    phases: [
      { title: "Compare as transições", instruction: "Não compare só figuras; compare a mudança entre elas.", focus: "overview" },
      { title: "Agrupe A", instruction: "Veja se as transições 1, 3, 5 usam a mesma transformação.", focus: "example" },
      { title: "Agrupe B", instruction: "Confira as transições 2, 4, 6.", focus: "target" },
      { title: "Continue a alternância", instruction: "Aplique a operação que vem a seguir na sequência A-B-A-B.", focus: "answer" },
    ],
  };

  if (kind === "pattern-relacao") return {
    patternName: "Analogia repetida entre pares",
    oneLine: "Cinco pares usam a mesma transformação esquerda→direita; um par quebra a regra.",
    mentalModel: "Descubra uma função f: esquerda → direita. Depois aplique f a cada par.",
    transfer: "Use um par simples para propor a transformação e um segundo para validá-la antes de caçar o intruso.",
    commonTrap: "Comparar pares entre si pela aparência em vez de comparar a relação interna de cada par.",
    checklist: [...baseChecklist, "Escolha um par simples.", "Formule a transformação.", "Valide em outro par.", "O único que falhar é o intruso."],
    phases: [
      { title: "Escolha referência", instruction: "Use um par fácil para descobrir esquerda→direita.", focus: "overview" },
      { title: "Valide", instruction: "Teste a mesma transformação em um segundo par.", focus: "example" },
      { title: "Varra os pares", instruction: "Aplique a regra aos demais sem mudar a hipótese.", focus: "target" },
      { title: "Ache o intruso", instruction: "O único par incompatível é a resposta.", focus: "answer" },
    ],
  };

  return {
    patternName: "Padrão visual",
    oneLine: q.explanation,
    mentalModel: "Quebre o problema em direção + atributo + transformação.",
    transfer: "Use a regra mais simples que explique todos os exemplos completos antes de aplicá-la à lacuna.",
    commonTrap: "Aceitar uma hipótese depois de apenas um exemplo.",
    checklist: baseChecklist,
    phases: [
      { title: "Onde olhar", instruction: "Identifique a direção ou relação principal.", focus: "overview" },
      { title: "Formule a regra", instruction: "Explique um exemplo completo com uma frase curta.", focus: "example" },
      { title: "Valide", instruction: "Confirme em outro exemplo.", focus: "target" },
      { title: "Aplique", instruction: "Use a mesma regra para obter a resposta.", focus: "answer" },
    ],
  };
}

function sameMarks(a: Cell, b: Cell) {
  return [...a.marks].sort().join("|") === [...b.marks].sort().join("|");
}

export function diagnoseFigureChoice(q: MensaItem, chosenIndex: number | null): string[] {
  if (chosenIndex == null || q.type !== "figura") return [];
  const item = q.item;
  const options = item.options ?? item.set;
  if (!options || !options[chosenIndex] || !options[item.answerIndex]) return [];
  const chosen = options[chosenIndex];
  const correct = options[item.answerIndex];
  if (chosenIndex === item.answerIndex) return ["Sua alternativa coincide com todos os atributos exigidos pela regra."];

  const diff: string[] = [];
  if (!sameMarks(chosen, correct)) diff.push("elemento interno / forma principal");
  if ((chosen.outer ?? "") !== (correct.outer ?? "")) diff.push("contorno externo");
  if ((chosen.outerFill ?? "none") !== (correct.outerFill ?? "none")) diff.push("preenchimento do contorno");
  if ((chosen.innerFill ?? "none") !== (correct.innerFill ?? "none")) diff.push("preenchimento interno");
  if ((chosen.count ?? 1) !== (correct.count ?? 1)) diff.push("quantidade");
  if ((chosen.rotation ?? 0) !== (correct.rotation ?? 0)) diff.push("rotação");
  if ((chosen.size ?? 2) !== (correct.size ?? 2)) diff.push("tamanho");
  return diff.length
    ? [`Sua alternativa diverge da correta em: ${diff.join(", ")}.`, "Isso indica qual atributo vale revisar primeiro antes de tentar uma nova questão da mesma família."]
    : ["Sua alternativa é visualmente muito próxima da correta. Revise a regra completa e procure a diferença estrutural, não apenas a aparência geral."];
}

export function diagnosePatternChoice(q: MensaItem, chosenIndex: number | null): string[] {
  if (chosenIndex == null || q.type !== "padrao") return [];
  if (chosenIndex === q.answerIndex) return ["Você aplicou corretamente a relação estrutural deste item."];
  if (q.pairs) return ["Sua escolha apontou outro par como intruso. Refaça a transformação esquerda→direita em dois pares válidos antes de testar o candidato."];
  const chosen = q.options[chosenIndex];
  const correct = q.options[q.answerIndex];
  let xor = chosen ^ correct;
  let changed = 0;
  while (xor) { changed += xor & 1; xor >>= 1; }
  return [`Sua alternativa difere da correta em ${changed} posição(ões) do mosaico.`, "Volte à regra antes de comparar alternativas; escolher por semelhança global costuma esconder esse tipo de erro."];
}
