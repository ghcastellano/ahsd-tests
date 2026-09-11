// Simulador de escalas de inteligência — três blocos crescentes, cada um com
// os quatro domínios que as escalas completas medem e que um teste só de
// matrizes não cobre: compreensão verbal (cristalizada), memória
// operacional, velocidade de processamento e raciocínio fluido.
//
// Os rótulos dos blocos (Wechsler 130 / Stanford-Binet 133 / Cattell 149) são
// o MESMO ponto — percentil 98, o 2% superior — expresso nas três escalas
// (desvio-padrão 15, 16 e 24). Aqui eles nomeiam a dificuldade-alvo de cada
// bloco, do mais acessível ao mais difícil. NÃO são pontuações: este
// simulador não é normatizado e não converte desempenho em QI.

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
  /** Ponto de referência na escala (percentil 98). */
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
  const escolher = (dif: Item["difficulty"], n: number) => matrizes.filter((i) => i.difficulty === dif).slice(0, n);
  // Banco: 9 média, 4 XOR difíceis, 9 de dois componentes (difícil), 5 de
  // distribuição de dois (difícil), 4 extrema. O bloco 1 pega os de dois
  // componentes; o 2, os de distribuição de dois; o 3, os extremos.
  return [
    {
      nivel: 1, nome: "Bloco 1 — Wechsler", escala: "Wechsler (DP 15)", qiAlvo: 130, dp: 15,
      descricao: "Entrada do percentil 98 no formato Wechsler: vocabulário pouco comum, 7–8 dígitos, matrizes de dois componentes.",
      verbal: itensVerbais(1, seed), raciocinio: matrizes.filter((i) => i.difficulty === "dificil").slice(4, 8), segundosVelocidade: CONFIG[1].segundos, segundosRaciocinio: 4 * 60,
    },
    {
      nivel: 2, nome: "Bloco 2 — Stanford-Binet", escala: "Stanford-Binet (DP 16)", qiAlvo: 133, dp: 16,
      descricao: "Vocabulário raro, 8–9 dígitos, distratores parecidos e matrizes de distribuição de dois — a regra de maior carga.",
      verbal: itensVerbais(2, seed), raciocinio: matrizes.filter((i) => i.difficulty === "dificil").slice(13, 17), segundosVelocidade: CONFIG[2].segundos, segundosRaciocinio: 5 * 60,
    },
    {
      nivel: 3, nome: "Bloco 3 — Cattell", escala: "Cattell (DP 24)", qiAlvo: 149, dp: 24,
      descricao: "O topo: abstração verbal, 9 dígitos e 7–8 na inversa, nove candidatos por fileira e matrizes de carga extrema.",
      verbal: itensVerbais(3, seed), raciocinio: escolher("extrema", 4), segundosVelocidade: CONFIG[3].segundos, segundosRaciocinio: 6 * 60,
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

/**
 * Cortes por bloco. Sobem com o nível porque cada bloco já é mais difícil e a
 * meta é o 2% superior: exige-se mais precisão E mais pontos de velocidade.
 * Sem norma para este formato — são convenções declaradas.
 */
export const CORTES: Record<Nivel, { precisao: number; velocidade: number }> = {
  1: { precisao: 0.7, velocidade: 18 },
  2: { precisao: 0.75, velocidade: 22 },
  3: { precisao: 0.8, velocidade: 26 },
};

export function blocoFechado(b: ResultadoBloco): boolean {
  const pct = (c: Contagem) => (c.total ? c.acertos / c.total : 0);
  const precisao = (pct(b.verbal) + pct(b.memoria) + pct(b.raciocinio)) / 3;
  const corte = CORTES[b.nivel];
  return precisao >= corte.precisao && b.velocidade.pontos >= corte.velocidade;
}

export interface Faixa { label: string; severity: "info" | "none" | "low" | "moderate" | "high"; description: string }

export const FAIXAS: Faixa[] = [
  { label: "Nenhum bloco fechado", severity: "info", description: "O bloco 1 já é a entrada do 2% superior — não fechar é o esperado para a maioria das pessoas, e a primeira tentativa costuma ser prejudicada pela falta de familiaridade com o formato. Veja o domínio mais fraco e refaça." },
  { label: "Bloco 1 fechado (nível Wechsler ~130)", severity: "low", description: "Você fechou a entrada do percentil 98 no formato Wechsler: ≥70% de precisão com vocabulário pouco comum, 7–8 dígitos e matrizes de dois componentes, mais 18 pontos de velocidade. O bloco 2 sobe a exigência." },
  { label: "Bloco 2 fechado (nível Stanford-Binet ~133)", severity: "moderate", description: "Dois blocos fechados: precisão e ritmo sustentados com vocabulário raro, sequências longas e matrizes de dois componentes." },
  { label: "Bloco 3 fechado (nível Cattell ~149)", severity: "high", description: "Os três blocos fechados, incluindo o de carga extrema. Lembre: os rótulos são dificuldades-alvo, não pontuações — nenhum simulador converte isso em QI." },
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
