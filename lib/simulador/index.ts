// Simulador de escalas de inteligência — três blocos crescentes, cada um com
// os quatro domínios que as escalas completas medem e que um teste só de
// matrizes não cobre: compreensão verbal (cristalizada), memória
// operacional, velocidade de processamento e raciocínio fluido.
//
// Nomes são referências de formato. Itens e cortes não têm normas populacionais.

import { advancedMatrixItems } from "../battery/advanced-matrices";
import type { Item } from "../battery/types";
import { itensVerbais, type ItemVerbal, type Nivel } from "./verbal";
import { CONFIG } from "./velocidade";
import type { MetricasVelocidade } from "./velocidade";

export type Dominio = "verbal" | "memoria" | "velocidade" | "raciocinio";

export interface Bloco {
  nivel: Nivel;
  nome: string;
  escala: string;
  /** Rótulo numérico legado; não exibir como nível ou estimativa de QI. */
  qiAlvo: number;
  dp: number;
  descricao: string;
  verbal: ItemVerbal[];
  raciocinio: Item[];
  segundosVelocidade: number;
  segundosRaciocinio: number;
}

export const NOMES_DOMINIO: Record<Dominio, string> = {
  verbal: "Compreensão verbal (inteligência cristalizada)",
  memoria: "Memória operacional",
  velocidade: "Velocidade de processamento",
  raciocinio: "Raciocínio fluido (matrizes)",
};

export function blocos(seed = 0): Bloco[] {
  const matrizes = advancedMatrixItems(seed);
  // Seleção por ESTRUTURA (kind), não por posição no banco: bloco 1 = operação
  // lógica exclusiva (XOR) + dois componentes; bloco 2 = XOR + distribuição de dois;
  // bloco 3 = lógica sobre D2 + três componentes (os tipos de teto).
  const porKind = (pred: (k: string) => boolean, n: number) => matrizes.filter((i) => pred(i.kind ?? "")).slice(0, n);
  const xor = porKind((k) => k === "logic-xor", 4);
  const bloco1 = [xor[0], xor[1], ...porKind((k) => k === "dual", 2)];
  const bloco2 = [xor[2], xor[3], ...porKind((k) => k === "d2", 2)];
  const bloco3 = [...porKind((k) => k.startsWith("logicD2"), 2), ...porKind((k) => k === "triad", 2)];
  return [
    {
      nivel: 1, nome: "Bloco 1 — Wechsler", escala: "DP 15", qiAlvo: 130, dp: 15,
      descricao: "Treino de formatos Wechsler: vocabulário pouco comum, 7–8 dígitos, matrizes com operação lógica exclusiva e com dois componentes.",
      verbal: itensVerbais(1, seed), raciocinio: bloco1, segundosVelocidade: CONFIG[1].segundos, segundosRaciocinio: 4 * 60,
    },
    {
      nivel: 2, nome: "Bloco 2 — Stanford-Binet", escala: "SB5: DP 15; SB-IV: DP 16", qiAlvo: 132, dp: 16,
      descricao: "Vocabulário raro, 8–9 dígitos, distratores parecidos, matrizes com operação exclusiva (XOR) e distribuição de dois.",
      verbal: itensVerbais(2, seed), raciocinio: bloco2, segundosVelocidade: CONFIG[2].segundos, segundosRaciocinio: 5 * 60,
    },
    {
      nivel: 3, nome: "Bloco 3 — Cattell", escala: "DP 24 (escala Cattell III B)", qiAlvo: 148, dp: 24,
      descricao: "O topo: abstração verbal, 9 dígitos e 7–8 na inversa, distratores parecidos e matrizes de carga extrema (duas regras em componentes diferentes; quatro regras em eixos distintos).",
      verbal: itensVerbais(3, seed), raciocinio: bloco3, segundosVelocidade: CONFIG[3].segundos, segundosRaciocinio: 6 * 60,
    },
  ];
}

export interface Contagem { acertos: number; total: number }

export interface ResultadoBloco {
  nivel: Nivel;
  verbal: Contagem;
  memoria: Contagem;
  velocidade: MetricasVelocidade;
  raciocinio: Contagem;
}

/** Cortes convencionais do jogo. Não estabelecem percentis nem equivalência clínica. */
export const CORTES: Record<Nivel, { precisao: number; velocidade: number }> = {
  // Metas internas de treino, sem calibração em amostra normativa.
  1: { precisao: 0.7, velocidade: 22 },
  2: { precisao: 0.75, velocidade: 24 },
  3: { precisao: 0.8, velocidade: 26 },
};

/** Mínimo por domínio de acerto: sem isso, 8/8 verbal + 4/4 matrizes fechariam um bloco com memória em 33%. */
export const MINIMO_POR_DOMINIO = 0.5;

export function blocoFechado(b: ResultadoBloco): boolean {
  const pct = (c: Contagem) => (c.total ? c.acertos / c.total : 0);
  const precisao = (pct(b.verbal) + pct(b.memoria) + pct(b.raciocinio)) / 3;
  const corte = CORTES[b.nivel];
  const minimo = [b.verbal, b.memoria, b.raciocinio].every((c) => pct(c) >= MINIMO_POR_DOMINIO);
  return minimo && precisao >= corte.precisao && b.velocidade.pontos >= corte.velocidade;
}

export interface Faixa { label: string; severity: "info" | "none" | "low" | "moderate" | "high"; description: string }

export const FAIXAS: Faixa[] = [
  { label: "Nenhum bloco fechado", severity: "info", description: "Os cortes internos não foram atingidos em sequência. Reveja os erros e as condições da tarefa; o resultado não estima QI nem percentil." },
  { label: "Bloco 1 fechado (entrada)", severity: "info", description: "Meta interna atingida: média de precisão ≥70%, mínimo de 50% por domínio e 22 pontos de velocidade. Sem equivalência clínica." },
  { label: "Bloco 2 fechado (intermediário)", severity: "info", description: "Dois blocos fechados em sequência pelos critérios internos do treino. Não é um percentil populacional." },
  { label: "Bloco 3 fechado (avançado)", severity: "info", description: "Três blocos fechados, incluindo matrizes de múltiplas regras. Não constitui QI nem habilitação para sociedades." },
];

export interface ResultadoSimulador {
  blocoAlcancado: number;
  faixa: Faixa;
  porDominio: Record<Dominio, { acertos: number; total: number; pct: number }>;
  velocidadePontos: number;
  blocos: { nivel: Nivel; fechado: boolean }[];
}

export function pontuarSimulador(resultados: ResultadoBloco[]): ResultadoSimulador {
  const ordenados = [...resultados].sort((a, b) => a.nivel - b.nivel);
  let alcancado = 0;
  for (const b of ordenados) {
    if (b.nivel !== alcancado + 1) break; // blocos precisam ser consecutivos
    if (!blocoFechado(b)) break;
    alcancado = b.nivel;
  }
  const soma = (k: "verbal" | "memoria" | "raciocinio") => ordenados.reduce((acc, b) => ({ acertos: acc.acertos + b[k].acertos, total: acc.total + b[k].total }), { acertos: 0, total: 0 });
  const vel = ordenados.reduce((acc, b) => ({ acertos: acc.acertos + b.velocidade.acertos, total: acc.total + b.velocidade.respondidos }), { acertos: 0, total: 0 });
  const comPct = (c: Contagem) => ({ ...c, pct: c.total ? Math.round((c.acertos / c.total) * 100) : 0 });
  return {
    blocoAlcancado: alcancado,
    faixa: FAIXAS[alcancado],
    porDominio: { verbal: comPct(soma("verbal")), memoria: comPct(soma("memoria")), velocidade: comPct(vel), raciocinio: comPct(soma("raciocinio")) },
    velocidadePontos: ordenados.reduce((a, b) => a + b.velocidade.pontos, 0),
    blocos: ordenados.map((b) => ({ nivel: b.nivel, fechado: blocoFechado(b) })),
  };
}
