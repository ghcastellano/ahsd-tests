import type { Item } from "../battery/types";
import type { MatrixItem, CellSpec } from "../matrix/engine";
import type { ItemMemoria } from "../simulador/memoria";
import type { ItemCondicao } from "./condicoes";

// Dojo: treino ativo por exame. Cada item traz a explicação para depois da
// resposta — o objetivo é entender a lógica, não decorar itens (que variam).

export type ExameId = "mensa" | "wechsler" | "stanford-binet" | "cattell";

/** Item de múltipla escolha em texto (verbal, aritmética, conhecimento, espacial…). */
export interface ItemTexto {
  id: string;
  enunciado: string;
  opcoes: string[];
  resposta: number;
  explicacao: string;
}

export type ItemDojo =
  | { tipo: "figural"; dominio: string; item: Item }
  | { tipo: "matriz"; dominio: string; item: MatrixItem; options: CellSpec[]; answerIndex: number; regras: string[] }
  | { tipo: "texto"; dominio: string; item: ItemTexto }
  | { tipo: "condicao"; dominio: string; item: ItemCondicao }
  | { tipo: "memoria"; dominio: string; item: ItemMemoria };

export interface DominioDojo {
  id: string;
  nome: string;
  /** Subteste real que o domínio imita. */
  subtesteReal: string;
  porQueDificil: string;
  dica: string;
  gerar: (seed: number, n: number) => ItemDojo[];
}

export interface ExameDojo {
  id: ExameId;
  nome: string;
  sigla: string;
  oQueE: string;
  estrutura: string[];
  corte: string;
  porQueDificil: string[];
  dominios: DominioDojo[];
  dicas: string[];
}
