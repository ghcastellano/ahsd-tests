import { buildMatrixBank, type MatrixSlot } from "./advanced-matrices";
import type { Difficulty, Item, TestDef } from "./types";

interface VideoItemSpec {
  num: number;
  answer: number; // 1-indexed (conforme gabarito oficial)
  difficulty: Difficulty;
  explanation: string;
}

function buildVideoItems(folder: "g38" | "g36", specs: VideoItemSpec[]): Item[] {
  return specs.map((s) => {
    const pad = String(s.num).padStart(2, "0");
    return {
      id: `${folder}-q${pad}`,
      difficulty: s.difficulty,
      kind: `${folder}-real`,
      imageMatrix: `/exames/${folder}/q${pad}-m.png`,
      imageOptions: [1, 2, 3, 4, 5, 6].map((k) => `/exames/${folder}/q${pad}-${k}.png`),
      answerIndex: s.answer - 1,
      explanation: `Questão ${s.num} (gabarito oficial: alternativa ${s.answer}) — ${s.explanation}`,
    };
  });
}

// Itens exatos extraídos do vídeo 1 (G-38) com gabarito oficial conferido.
const G38_SPECS: VideoItemSpec[] = [
  { num: 2, answer: 4, difficulty: "media", explanation: "Na 1ª linha ambos os quadros têm 1 ponto; na 2ª linha o quadro da esquerda tem 2 pontos na diagonal, logo o da direita também tem 2 pontos (alternativa 4)." },
  { num: 3, answer: 1, difficulty: "media", explanation: "Identidade por linha: a 1ª linha repete o quadrado; a 2ª linha repete o triângulo com base interna (alternativa 1)." },
  { num: 4, answer: 4, difficulty: "media", explanation: "Na 1ª linha o círculo simples ganha mais dois círculos concêntricos; na 2ª linha o trapézio simples ganha dois trapézios concêntricos internos (alternativa 4)." },
  { num: 5, answer: 6, difficulty: "media", explanation: "A figura da direita duplica os raios da figura da esquerda em todas as direções: a cruz simples (+) gera a estrela de 8 pontas (alternativa 6)." },
  { num: 6, answer: 3, difficulty: "media", explanation: "Na 1ª linha 3 círculos em linha formam uma cruz de 4 círculos; na 2ª linha 3 losangos em linha formam uma cruz de 4 losangos (alternativa 3)." },
  { num: 7, answer: 2, difficulty: "media", explanation: "Identidade por linha: a 1ª linha repete o quadrado com X; a 2ª linha repete o losango dividido em 4 partes (alternativa 2)." },
  { num: 8, answer: 3, difficulty: "media", explanation: "Analogia horizontal: o bloco de 4 faixas da esquerda passa para o bloco menor de 3 faixas na direita (alternativa 3)." },
  { num: 9, answer: 3, difficulty: "media", explanation: "A figura da esquerda é completada/espelhada para formar o círculo completo: o semicírculo hachurado da 2ª linha forma o círculo hachurado completo (alternativa 3)." },
  { num: 10, answer: 3, difficulty: "media", explanation: "Progressão de redução por linha: a cada coluna o bloco perde um degrau à direita até restar apenas a base horizontal (alternativa 3)." },
  { num: 11, answer: 1, difficulty: "media", explanation: "Na 1ª linha os quadrados concêntricos reduzem-se a 1 quadrado pequeno; na 2ª linha os ovais concêntricos reduzem-se a 1 oval pequeno (alternativa 1)." },
  { num: 12, answer: 6, difficulty: "media", explanation: "Progressão de quantidade (+1x/+2x/+3x): na 1ª linha há 3, 6 e 9 círculos; na 2ª linha há 1, 2 e, portanto, 3 círculos agrupados (alternativa 6)." },
  { num: 14, answer: 3, difficulty: "media", explanation: "Reflexão horizontal (espelho vertical): o 'E' vira '3'; o hexágono com metade esquerda sombreada espelha para metade direita sombreada (alternativa 3)." },
  { num: 15, answer: 1, difficulty: "dificil", explanation: "Cada coluna da 1ª linha ganha um traço de base/fechamento na 2ª linha: o triângulo aberto fecha na base formando o quadrado (alternativa 1)." },
  { num: 16, answer: 1, difficulty: "dificil", explanation: "Na 1ª linha o 'T' simples torna-se composto; na 2ª linha as barras duplas/triplas convergem para o conjunto composto com barra superior (alternativa 1)." },
  { num: 19, answer: 1, difficulty: "dificil", explanation: "Subtração/simplificação de elementos internos por coluna até a forma retangular aberta da 2ª linha (alternativa 1)." },
  { num: 20, answer: 5, difficulty: "dificil", explanation: "Redução progressiva de ramos nos eixos verticais da esquerda para a direita: na 2ª linha restam apenas as pontas horizontais centrais (alternativa 5)." },
  { num: 21, answer: 2, difficulty: "dificil", explanation: "Transformação simétrica dos braços laterais para o eixo central: os dois ramos dobrados convergem para a haste vertical central (alternativa 2)." },
  { num: 22, answer: 5, difficulty: "dificil", explanation: "Na 1ª linha os elementos se deslocam/abrem para a direita; na 2ª linha o triângulo apontando para a direita reflete/inverte para a esquerda (alternativa 5)." },
  { num: 24, answer: 6, difficulty: "dificil", explanation: "Simplificação progressiva de traços retos e hastes até restar apenas o círculo fechado (alternativa 6)." },
  { num: 25, answer: 3, difficulty: "dificil", explanation: "Redução da moldura externa mantendo apenas os dois traços centrais em ampulheta (alternativa 3)." },
  { num: 27, answer: 6, difficulty: "dificil", explanation: "Conversão entre linhas curvas e retas em pares: o '3' vira 'E', logo o segundo círculo/quadrado completa com o quadrado correspondente (alternativa 6)." },
  { num: 28, answer: 2, difficulty: "dificil", explanation: "Rotação e compressão das barras paralelas em 90° formando a figura em laço horizontal (alternativa 2)." },
  { num: 30, answer: 4, difficulty: "dificil", explanation: "Na 1ª linha a diagonal corta e desaparece restando o triângulo; na 2ª linha o arco fecha o semicírculo esquerdo (alternativa 4)." },
  { num: 31, answer: 3, difficulty: "extrema", explanation: "Progressão do número de pétalas por linha: 4, 6, 8 na 1ª linha; na 2ª linha a redução simétrica fecha com a flor de 3 pétalas invertida (alternativa 3)." },
  { num: 32, answer: 6, difficulty: "extrema", explanation: "Progressão de complexidade e preenchimento da figura inscrita na 2ª linha, fechando com a moldura triangular completa (alternativa 6)." },
  { num: 33, answer: 5, difficulty: "extrema", explanation: "Cada figura da 1ª linha ganha um traço curvo/inclinado correspondente na 2ª linha; o 'K' e o 'C' levam à forma composta da alternativa 5." },
  { num: 34, answer: 4, difficulty: "extrema", explanation: "As faixas horizontais internas da 1ª linha se reorganizam nas cúpulas fechadas com 3 traços da 2ª linha (alternativa 4)." },
  { num: 35, answer: 2, difficulty: "extrema", explanation: "Supressão progressiva de pontas da estrela/asterisco da esquerda para a direita até o feixe inferior de 3 pontas (alternativa 2)." },
  { num: 36, answer: 2, difficulty: "extrema", explanation: "Os hexágonos concêntricos perdem lados externos na passagem para a 2ª linha, restando o contorno aberto da alternativa 2." },
  { num: 37, answer: 4, difficulty: "extrema", explanation: "Rotação e alternância dos setores sombreados no disco octogonal, completando o padrão simétrico da alternativa 4." },
  { num: 38, answer: 2, difficulty: "extrema", explanation: "Na 1ª linha as 3 barras abrem em '<' e duplicam em ângulo; na 2ª linha o padrão combinado fecha com os dois traços angulados duplos (alternativa 2)." },
];

// Todos os 36 itens exatos extraídos do vídeo 2 (G-36) com Answer Key oficial conferido.
const G36_SPECS: VideoItemSpec[] = [
  { num: 1, answer: 2, difficulty: "media", explanation: "Identidade: todas as células apresentam o mesmo triângulo equilátero de contorno contínuo (alternativa 2)." },
  { num: 2, answer: 6, difficulty: "media", explanation: "Identidade por linha: a 1ª linha repete o triângulo; a 2ª linha repete a estrela de seis pontas (alternativa 6)." },
  { num: 3, answer: 2, difficulty: "media", explanation: "Identidade por linha: a 1ª linha repete o 'L' em bloco; a 2ª linha repete o triângulo retângulo (alternativa 2)." },
  { num: 4, answer: 4, difficulty: "media", explanation: "Reflexão horizontal (espelho vertical): o '⊢' espelha para '⊣'; o círculo com metade direita preta espelha para metade esquerda preta (alternativa 4)." },
  { num: 5, answer: 5, difficulty: "media", explanation: "Progressão de quantidade (+1 coluna): 1, 2 e 3 círculos na 1ª linha; 1, 2 e 3 pares verticais ('8', '88', '888') na 2ª linha (alternativa 5)." },
  { num: 6, answer: 2, difficulty: "media", explanation: "Sobreposição cruzada (×2 perpendicular): uma barra inclinada gera o 'X' simples; a barra dupla/preenchida gera o 'X' espesso correspondente (alternativa 2)." },
  { num: 7, answer: 3, difficulty: "media", explanation: "Duplicação de pontas por sobreposição rotacionada: a estrela de 4 pontas gera a de 8 pontas; a estrela de 3 pontas gera a de 6 pontas (alternativa 3)." },
  { num: 8, answer: 4, difficulty: "media", explanation: "Extrusão 2D → 3D: o 'L' plano ganha profundidade em bloco; o semicírculo plano ganha profundidade em tigela 3D (alternativa 4)." },
  { num: 9, answer: 2, difficulty: "media", explanation: "Subtração na linha: na 1ª linha, 2 círculos menos 1 círculo deixam apenas a barra; na 2ª linha, 1 círculo menos 1 semicírculo deixa apenas a barra (alternativa 2)." },
  { num: 10, answer: 3, difficulty: "media", explanation: "Progressão vertical de segmentos e pontos nas colunas da matriz, completando a sequência na alternativa 3." },
  { num: 11, answer: 4, difficulty: "media", explanation: "Correspondência de extremidades e hastes entre as duas linhas da matriz, fechando com o 'T' invertido de haste simples (alternativa 4)." },
  { num: 12, answer: 6, difficulty: "media", explanation: "Extrusão 2D → 3D: o quadrado vira cubo; o triângulo equilátero vira pirâmide triangular em perspectiva (alternativa 6)." },
  { num: 13, answer: 3, difficulty: "dificil", explanation: "Incremento de lados (+1 segmento por célula): 1, 2 e 3 segmentos na 1ª linha; 4, 5 e 6 lados (hexágono) na 2ª linha (alternativa 3)." },
  { num: 14, answer: 2, difficulty: "dificil", explanation: "Simplificação progressiva de traços internos: na 1ª linha a roda perde os raios até o círculo simples; na 2ª linha o quadrado perde os traços até o quadrado simples (alternativa 2)." },
  { num: 15, answer: 3, difficulty: "dificil", explanation: "Interseção/sobreposição de componentes entre colunas: os elementos da 1ª e 2ª colunas combinam-se na 3ª coluna (alternativa 3)." },
  { num: 16, answer: 4, difficulty: "dificil", explanation: "Subtração de diagonais e bordas por linha: o quadrado com X perde traços na 1ª linha; na 2ª linha resta a figura em ampulheta (alternativa 4)." },
  { num: 17, answer: 6, difficulty: "dificil", explanation: "Contagem de segmentos paralelos/perpendiculares: 1, 2 e 2 barras na 1ª linha; na 2ª linha completa com as 3 barras verticais (alternativa 6)." },
  { num: 18, answer: 5, difficulty: "dificil", explanation: "Simplificação dos núcleos internos das cápsulas ovais mantendo o contorno fechado com detalhe central (alternativa 5)." },
  { num: 19, answer: 4, difficulty: "dificil", explanation: "Subtração de barras transversais da 1ª para a 3ª coluna, restando a dupla barra horizontal (alternativa 4)." },
  { num: 20, answer: 5, difficulty: "dificil", explanation: "Combinação simétrica dos arcos laterais e vértices da 1ª e 2ª colunas (alternativa 5)." },
  { num: 21, answer: 2, difficulty: "dificil", explanation: "Rotação e fechamento dos traços curvos e angulares por coluna (alternativa 2)." },
  { num: 22, answer: 4, difficulty: "dificil", explanation: "Transformação de segmentos retos em arcos correspondentes por linha, completando o 'D' espelhado na alternativa 4." },
  { num: 23, answer: 4, difficulty: "dificil", explanation: "Inversão vertical e abertura dos contornos entre a 1ª e a 2ª linha (alternativa 4)." },
  { num: 24, answer: 2, difficulty: "dificil", explanation: "Composição de anéis e vértices concêntricos a partir dos dois primeiros quadros da linha (alternativa 2)." },
  { num: 25, answer: 4, difficulty: "dificil", explanation: "Rotação em 90° e remoção sequencial dos braços perpendiculares (alternativa 4)." },
  { num: 26, answer: 6, difficulty: "dificil", explanation: "Redução de pontas/lados em progressão decrescente até o triângulo menor da alternativa 6." },
  { num: 27, answer: 6, difficulty: "extrema", explanation: "Rotação de 90° e redução da grade de quadrículos em cada linha (alternativa 6)." },
  { num: 28, answer: 3, difficulty: "extrema", explanation: "Na 1ª linha as linhas internas diminuem; na 2ª linha os arcos duplicam em contorno concêntrico (alternativa 3)." },
  { num: 29, answer: 2, difficulty: "extrema", explanation: "Desdobramento de espirais em curvas simples abertas para a direita (alternativa 2)." },
  { num: 30, answer: 1, difficulty: "extrema", explanation: "Sequência de redução dos algarismos/curvas: '2, 6, 9' na 1ª linha; '5, c' fecha com o círculo fechado '○' (alternativa 1)." },
  { num: 31, answer: 1, difficulty: "extrema", explanation: "Rotação dos ponteiros/ângulos retos entre os quadros das duas linhas (alternativa 1)." },
  { num: 32, answer: 6, difficulty: "extrema", explanation: "Combinação dos arcos e eixos da 2ª linha formando o feixe simétrico vertical da alternativa 6." },
  { num: 33, answer: 2, difficulty: "extrema", explanation: "Duplicação de traços verticais da 1ª para a 2ª linha: '|' → '||', 'T' → 'TT', logo '=' → '≡' (alternativa 2)." },
  { num: 34, answer: 1, difficulty: "extrema", explanation: "Simplificação de interseções e curvas mantendo apenas a dobra angular esquerda (alternativa 1)." },
  { num: 35, answer: 5, difficulty: "extrema", explanation: "Correspondência entre curvas contínuas e polígonos fechados: o último par fecha com a ampulheta preenchida ao centro (alternativa 5)." },
  { num: 36, answer: 1, difficulty: "extrema", explanation: "Operação lógica (XOR/cancelamento de pontos e traços) entre as duas primeiras colunas da 2ª linha, restando o traço com seta/ponto da alternativa 1." },
];

// Raven APM mantém o banco autoral em SVG (o link enviado do Scribd é protegido por paywall).
const RAVEN_SLOTS: MatrixSlot[] = [
  { kind: "d3", difficulty: "media" },
  { kind: "rot-prog", difficulty: "media" },
  { kind: "const-rc", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  { kind: "logic-or", difficulty: "media" },
  { kind: "dual", difficulty: "media" },
  { kind: "rot-prog", difficulty: "media" },
  { kind: "const-rc", difficulty: "media" },
  { kind: "logic-and", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  { kind: "dual", difficulty: "media" },
  { kind: "logic-xor", difficulty: "media" },
  { kind: "d3", difficulty: "dificil" },
  { kind: "rot-prog", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "const-rc", difficulty: "dificil" },
  { kind: "logic-and", difficulty: "dificil" },
  { kind: "d3", difficulty: "dificil" },
  { kind: "logic-or", difficulty: "dificil" },
  { kind: "rot-prog", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "d3", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "const-rc", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "rot-prog", difficulty: "dificil" },
  { kind: "logic-and", difficulty: "dificil" },
  { kind: "d3", difficulty: "dificil" },
  { kind: "logic-or", difficulty: "dificil" },
  { kind: "logicD2-xor", difficulty: "extrema" },
  { kind: "triad", difficulty: "extrema" },
  { kind: "logicD2-and", difficulty: "extrema" },
  { kind: "triad", difficulty: "extrema" },
  { kind: "logicD2-xor", difficulty: "extrema" },
  { kind: "triad", difficulty: "extrema" },
];

export const g38Test: TestDef = {
  id: "g38",
  name: "Teste Não Verbal G-38",
  short: `${G38_SPECS.length} itens · 40 min · regime de potência`,
  format: "matriz",
  modeledOn: "Teste Não Verbal de Inteligência G-38 (questões e gabarito oficial extraídos do material enviado)",
  itemCount: G38_SPECS.length,
  timeLimitSeconds: 40 * 60,
  regime: "potencia",
  intro:
    `Questões exatas do G-38 extraídas do vídeo enviado (${G38_SPECS.length} itens capturados na gravação) com o gabarito oficial e a explicação do padrão de cada item.`,
  instructions:
    "Observe a matriz lógica no quadro superior e escolha qual das 6 alternativas completa o espaço tracejado. Ao finalizar, confira o gabarito oficial e a explicação de cada questão.",
  reference: {
    title: "G-38 — Teste Não Verbal de Inteligência",
    publisher: "Vetor Editora (Giunti Psychometrics)",
    citation: "Instrumento psicológico de uso privativo de psicólogos (SATEPSI Favorável). Para avaliação formal com validade clínica e normas brasileiras, adquira o material oficial com um profissional habilitado.",
    purchaseUrl: "https://www.vetoreditora.com.br/produto/colecao-g-38-teste-nao-verbal-de-inteligencia-70740",
    purchaseLabel: "Adquirir coleção oficial G-38 na Vetor Editora",
  },
  items: () => buildVideoItems("g38", G38_SPECS),
};

export const g36Test: TestDef = {
  id: "g36",
  name: "Teste Não Verbal G-36",
  short: "36 itens · 40 min · regime de potência",
  format: "matriz",
  modeledOn: "Teste Não Verbal de Inteligência G-36 (36 questões exatas e Answer Key oficial do material enviado)",
  itemCount: 36,
  timeLimitSeconds: 40 * 60,
  regime: "potencia",
  intro:
    "Todas as 36 questões exatas do G-36 extraídas do vídeo enviado, com o gabarito oficial conferido e a explicação detalhada da regra lógica de cada item.",
  instructions:
    "Analise as figuras da matriz no quadro superior e marque a alternativa (1 a 6) que completa o espaço tracejado. Ao concluir, revise o gabarito oficial comentado.",
  reference: {
    title: "G-36 — Teste Não Verbal de Inteligência",
    publisher: "Vetor Editora (Giunti Psychometrics)",
    citation: "Instrumento psicológico de uso privativo de psicólogos (SATEPSI Favorável). Para avaliação psicológica formal, utilize o caderno e crivo oficiais.",
    purchaseUrl: "https://www.vetoreditora.com.br/produto/colecao-g-36-teste-nao-verbal-de-inteligencia-70739",
    purchaseLabel: "Adquirir coleção oficial G-36 na Vetor Editora",
  },
  items: () => buildVideoItems("g36", G36_SPECS),
};

export const ravenTest: TestDef = {
  id: "raven",
  name: "Treino estilo Raven Avançado (36 itens)",
  short: "36 itens · 40 min · regime de potência",
  format: "matriz",
  modeledOn: "Inspirado no Conjunto II (36 itens) das Matrizes Progressivas Avançadas de Raven (bateria autoral)",
  itemCount: 36,
  timeLimitSeconds: 40 * 60,
  regime: "potencia",
  intro:
    "Simulado autoral com 36 matrizes progressivas inspiradas na taxonomia do Raven APM Conjunto II, com escalada de carga cognitiva e regras variadas sem repetição consecutiva.",
  instructions:
    "Analise os atributos de forma, preenchimento, rotação, contagem e operações lógicas em linhas e colunas para escolher a peça que completa a matriz.",
  reference: {
    title: "APM-Raven — Matrizes Progressivas Avançadas de Raven",
    publisher: "Hogrefe Brasil / Pearson Clinical",
    citation: "Raven, J., Raven, J. C., & Court, J. H. Instrumento padrão-ouro para avaliação da capacidade edutiva (fator g), de uso restrito a psicólogos no Brasil (SATEPSI Favorável).",
    purchaseUrl: "https://hogrefe.com.br/matrizes-progressivas-avancadas-de.html",
    purchaseLabel: "Adquirir APM-Raven oficial na Hogrefe Brasil",
  },
  items: (seed = 0) => buildMatrixBank("rav-", RAVEN_SLOTS, 300_000, seed),
};

export const extraTests: TestDef[] = [g38Test, g36Test, ravenTest];

export function getExtraTest(id: string): TestDef | undefined {
  return extraTests.find((t) => t.id === id);
}
