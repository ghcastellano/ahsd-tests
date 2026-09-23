// Tipos compartilhados da bateria de treino de raciocínio.
//
// Todos os itens são ORIGINAIS, gerados por regras determinísticas. A
// classificação editorial de complexidade se inspira em Carpenter, Just & Shell
// (1990) e Verguts & De Boeck (2002); não constitui calibração psicométrica.

export type Mark =
  | "circle"
  | "square"
  | "triangle"
  | "diamond"
  | "star"
  | "cross"
  | "hbar"
  | "vbar"
  | "slash"
  | "backslash"
  | "dot";

export type Fill = "none" | "half" | "solid";

/**
 * Célula de um item figural. Pode combinar:
 *  - `marks`: elementos sobrepostos (usado nas operações lógicas XOR/AND/OR)
 *  - `outer` + `inner`: dois componentes com regras independentes
 *  - atributos quantitativos (rotação, tamanho, repetição)
 */
export interface Cell {
  marks: Mark[];
  outer?: Mark;
  outerFill?: Fill;
  innerFill?: Fill;
  rotation?: number;
  size?: 1 | 2 | 3;
  /** Repetição do conjunto de marcas (1–4). */
  count?: number;
}

export type Difficulty = "media" | "dificil" | "extrema";

/** Item de múltipla escolha já resolvido: opções + índice correto. */
export interface Item {
  id: string;
  difficulty: Difficulty;
  /** Tipo estrutural do item (ex.: "d3", "logic", "dual", "d2", "logicD2", "triad") — para selecionar por estrutura, não por posição. */
  kind?: string;
  /** Enunciado curto (séries numéricas usam; figurais deixam vazio). */
  prompt?: string;
  /** Grade 3x3 (matrizes) — a célula (2,2) é a resposta. */
  grid?: Cell[][];
  /** Sequência linear (séries de figuras) — o último é a resposta. */
  sequence?: Cell[];
  /** Conjunto para exclusão (classificação) — todos menos um compartilham a regra. */
  set?: Cell[];
  /** Alternativas figurais. */
  options?: Cell[];
  /** Alternativas textuais (séries numéricas). */
  textOptions?: string[];
  answerIndex: number;
  /** Regra(s) aplicadas — mostradas na revisão pós-teste. */
  explanation: string;
}

export type TestFormat = "matriz" | "serie-figural" | "classificacao" | "serie-numerica";

export interface TestDef {
  id: string;
  name: string;
  short: string;
  format: TestFormat;
  /** Instrumento real que serve de referência de formato/tempo. */
  modeledOn: string;
  itemCount: number;
  timeLimitSeconds: number;
  intro: string;
  instructions: string;
  /** Regime: potência (tempo folgado, itens complexos) ou velocidade. */
  regime: "potencia" | "velocidade";
  /** Itens da tentativa. A semente varia a superfície (valores, ordem, formas) mantendo a estrutura de regras e a dificuldade. */
  items: (seed?: number) => Item[];
}
