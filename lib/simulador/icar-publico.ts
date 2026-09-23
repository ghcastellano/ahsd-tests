/**
 * ICAR Sample Test, Condon & Revelle (2014), Appendix A, páginas 2–4 do suplemento da editora.
 * Itens de domínio público; não são itens Wechsler, Stanford-Binet, Cattell ou TNS.
 * Texto e figuras conferidos no PDF da editora em 12/09/2026.
 * Chave independente: psychTools::iqitems, primeiros 12 itens, ordem abaixo.
 * A tradução e as explicações são editoriais; não constituem adaptação validada.
 */
export const FONTES_ICAR = {
  itens: "https://ars.els-cdn.com/content/image/1-s2.0-S0160289614000051-mmc1.pdf",
  chave: "https://personality-project.org/r/psych/help/iqitems.html",
  projeto: "https://www.icar-project.org/",
  estudo: "https://personality-project.org/revelle/publications/condon.icar.14.pdf",
  acesso: "12/09/2026",
};

export interface ItemPublicado {
  id: string;
  dominio: "Raciocínio verbal e quantitativo" | "Séries de letras" | "Matrizes";
  imagem?: string;
  original: string;
  enunciado: string;
  opcoesOriginais: readonly string[];
  opcoes: readonly string[];
  /** Índice zero-based; ordem das alternativas preservada da fonte. */
  resposta: number;
  explicacao: string;
}

export const ICAR_PUBLICO: readonly ItemPublicado[] = [
  {
    id: "VR.4", dominio: "Raciocínio verbal e quantitativo",
    original: "What number is one fifth of one fourth of one ninth of 900?",
    enunciado: "Qual número é um quinto de um quarto de um nono de 900?",
    opcoesOriginais: ["2", "3", "4", "5", "6", "7"], opcoes: ["2", "3", "4", "5", "6", "7"], resposta: 3,
    explicacao: "900 ÷ 9 = 100; 100 ÷ 4 = 25; 25 ÷ 5 = 5. A alternativa 4 contém 5. Cada fração se aplica ao resultado anterior.",
  },
  {
    id: "VR.16", dominio: "Raciocínio verbal e quantitativo",
    original: "Zach is taller than Matt and Richard is shorter than Zach. Which of the following statements would be most accurate?",
    enunciado: "Zach é mais alto que Matt e Richard é mais baixo que Zach. Qual afirmação é a mais precisa?",
    opcoesOriginais: ["Richard is taller than Matt", "Richard is shorter than Matt", "Richard is as tall as Matt", "It's impossible to tell"],
    opcoes: ["Richard é mais alto que Matt", "Richard é mais baixo que Matt", "Richard tem a mesma altura que Matt", "Não é possível determinar"], resposta: 3,
    explicacao: "Sabemos apenas que os dois são mais baixos que Zach. Com Zach = 190 e Matt = 170, Richard poderia medir 160, 170 ou 180. As três relações com Matt são compatíveis com as premissas; nenhuma é determinada.",
  },
  {
    id: "VR.17", dominio: "Raciocínio verbal e quantitativo",
    original: "Joshua is 12 years old and his sister is three times as old as he. When Joshua is 23 years old, how old will his sister be?",
    enunciado: "Joshua tem 12 anos e sua irmã tem o triplo da idade dele. Quando Joshua tiver 23 anos, quantos anos terá a irmã?",
    opcoesOriginais: ["35", "39", "44", "47", "53", "57"], opcoes: ["35", "39", "44", "47", "53", "57"], resposta: 3,
    explicacao: "A irmã tem 36 anos. Passarão 23 − 12 = 11 anos para ambos: 36 + 11 = 47. A diferença de 24 anos permanece; a razão de idades não permanece.",
  },
  {
    id: "VR.19", dominio: "Raciocínio verbal e quantitativo",
    original: "If the day after tomorrow is two days before Thursday then what day is it today?",
    enunciado: "Se depois de amanhã é dois dias antes de quinta-feira, que dia é hoje?",
    opcoesOriginais: ["Friday", "Monday", "Wednesday", "Saturday", "Tuesday", "Sunday"],
    opcoes: ["Sexta-feira", "Segunda-feira", "Quarta-feira", "Sábado", "Terça-feira", "Domingo"], resposta: 5,
    explicacao: "Dois dias antes de quinta-feira é terça-feira. Se depois de amanhã será terça-feira, hoje é domingo. Conferência: domingo → segunda (amanhã) → terça (depois de amanhã).",
  },
  {
    id: "LN.7", dominio: "Séries de letras",
    original: "In the following alphanumeric series, what letter comes next? K N P S U",
    enunciado: "Na série K N P S U, qual letra vem a seguir? Use o alfabeto de 26 letras, incluindo K, W e Y.",
    opcoesOriginais: ["S", "T", "U", "V", "W", "X"], opcoes: ["S", "T", "U", "V", "W", "X"], resposta: 5,
    explicacao: "Posições 11, 14, 16, 19, 21. Os saltos alternam +3, +2, +3, +2. O próximo +3 chega a 24 = X. Esta é a regra convencional compatível com a chave publicada; uma sequência finita isolada admite outras extrapolações.",
  },
  {
    id: "LN.33", dominio: "Séries de letras",
    original: "In the following alphanumeric series, what letter comes next? V Q M J H",
    enunciado: "Na série V Q M J H, qual letra vem a seguir? Use o alfabeto de 26 letras, incluindo K, W e Y.",
    opcoesOriginais: ["E", "F", "G", "H", "I", "J"], opcoes: ["E", "F", "G", "H", "I", "J"], resposta: 2,
    explicacao: "Posições 22, 17, 13, 10, 8. As diferenças são −5, −4, −3, −2; seguindo a regra, vem −1: 7 = G. Regra compatível com a chave publicada, não uma prova de unicidade entre todas as regras imagináveis.",
  },
  {
    id: "LN.34", dominio: "Séries de letras",
    original: "In the following alphanumeric series, what letter comes next? I J L O S",
    enunciado: "Na série I J L O S, qual letra vem a seguir? Use o alfabeto de 26 letras, incluindo K, W e Y.",
    opcoesOriginais: ["T", "U", "V", "X", "Y", "Z"], opcoes: ["T", "U", "V", "X", "Y", "Z"], resposta: 3,
    explicacao: "Posições 9, 10, 12, 15, 19. As diferenças são +1, +2, +3, +4; seguindo a regra, vem +5: 24 = X. A chave publicada confirma essa interpretação.",
  },
  {
    id: "LN.58", dominio: "Séries de letras",
    original: "In the following alphanumeric series, what letter comes next? Q S N P L",
    enunciado: "Na série Q S N P L, qual letra vem a seguir? Use o alfabeto de 26 letras, incluindo K, W e Y.",
    opcoesOriginais: ["J", "H", "I", "N", "M", "L"], opcoes: ["J", "H", "I", "N", "M", "L"], resposta: 3,
    explicacao: "Posições 17, 19, 14, 16, 12. Os saltos são +2, −5, +2, −4; a alternância mantém +2 no próximo passo: 14 = N. A chave publicada é a alternativa 4. Esta é uma interpretação convencional, não unicidade matemática absoluta.",
  },

  {
    id: "MX.45", dominio: "Matrizes", imagem: "/icar/MX.45.jpg",
    original: "Please indicate which is the best answer to complete the figure below.",
    enunciado: "Indique qual alternativa melhor completa a figura abaixo.",
    opcoesOriginais: ["A", "B", "C", "D", "E", "F"], opcoes: ["A", "B", "C", "D", "E", "F"], resposta: 4,
    explicacao: "E. Na última linha, a figura grande é um losango que gira 90° no sentido horário a cada coluna: parte preta embaixo → esquerda → em cima. Os símbolos pequenos distribuem círculo, quadrado e estrela; falta estrela. Sua posição gira 90° no sentido anti-horário: esquerda → baixo → direita. C tem a estrela do lado errado; E satisfaz as três regras.",
  },
  {
    id: "MX.46", dominio: "Matrizes", imagem: "/icar/MX.46.jpg",
    original: "Please indicate which is the best answer to complete the figure below.",
    enunciado: "Indique qual alternativa melhor completa a figura abaixo.",
    opcoesOriginais: ["A", "B", "C", "D", "E", "F"], opcoes: ["A", "B", "C", "D", "E", "F"], resposta: 1,
    explicacao: "B. Na terceira coluna, o losango gira 90° no sentido horário: parte preta à direita → embaixo → à esquerda. Os símbolos pequenos são círculo → estrela → quadrado, completando a distribuição. Suas posições são baixo → direita → cima. B mostra losango horizontal, preto à esquerda e quadrado acima; D inverte a metade preta.",
  },
  {
    id: "MX.47", dominio: "Matrizes", imagem: "/icar/MX.47.jpg",
    original: "Please indicate which is the best answer to complete the figure below.",
    enunciado: "Indique qual alternativa melhor completa a figura abaixo.",
    opcoesOriginais: ["A", "B", "C", "D", "E", "F"], opcoes: ["A", "B", "C", "D", "E", "F"], resposta: 1,
    explicacao: "B. Em cada linha/coluna, as figuras maiores distribuem círculo, cruz e quadrado; falta cruz. As centrais distribuem quadrado, losango e estrela; falta quadrado. O fundo alterna preto/branco como um tabuleiro: aqui é branco, com cruz preta e quadrado central branco. B é a combinação completa.",
  },
  {
    id: "MX.55", dominio: "Matrizes", imagem: "/icar/MX.55.jpg",
    original: "Please indicate which is the best answer to complete the figure below.",
    enunciado: "Indique qual alternativa melhor completa a figura abaixo.",
    opcoesOriginais: ["A", "B", "C", "D", "E", "F"], opcoes: ["A", "B", "C", "D", "E", "F"], resposta: 3,
    explicacao: "D. Cada linha/coluna contém círculo preto, branco e meio preto; falta metade superior preta. Os símbolos distribuem losango, estrela e triângulo; falta triângulo. Na última linha, a posição do símbolo gira 90° no sentido horário: esquerda → cima → direita. A seta gira 45° no sentido horário: baixo → baixo/esquerda → esquerda. D satisfaz tudo; B coloca o triângulo em cima. Nos círculos meio preenchidos, o símbolo pequeno é preto.",
  },

];

export function pontuarIcar(escolhas: Readonly<Record<string, number>>) {
  return {
    acertos: ICAR_PUBLICO.filter((q) => escolhas[q.id] === q.resposta).length,
    respondidos: ICAR_PUBLICO.filter((q) => Number.isInteger(escolhas[q.id]) && escolhas[q.id] >= 0 && escolhas[q.id] < q.opcoes.length).length,
    total: ICAR_PUBLICO.length,
  };
}
