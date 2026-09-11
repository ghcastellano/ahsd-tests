// Velocidade de processamento — formato "procura de símbolos": dois símbolos
// alvo à esquerda, uma fileira de candidatos à direita; a pessoa decide SIM
// (algum alvo está na fileira) ou NÃO, o mais rápido que conseguir, dentro
// do tempo. Pontuação = acertos − erros (a correção padrão dos subtestes de
// velocidade, que penaliza o chute). Dificuldade sobe com o número de
// candidatos e com distratores parecidos (rotação, preenchimento).

import { mulberry32 } from "../battery/rng";
import type { Cell, Mark } from "../battery/types";
import type { Nivel } from "./verbal";

export interface TrialVelocidade {
  alvos: Cell[];
  candidatos: Cell[];
  /** true = pelo menos um alvo aparece IDÊNTICO entre os candidatos. */
  presente: boolean;
}

const MARCAS: Mark[] = ["circle", "square", "triangle", "diamond", "star", "cross", "hbar", "vbar", "slash", "backslash"];

export const CONFIG: Record<Nivel, { candidatos: number; segundos: number; distratorParecido: boolean }> = {
  1: { candidatos: 5, segundos: 60, distratorParecido: false },
  2: { candidatos: 7, segundos: 60, distratorParecido: true },
  3: { candidatos: 9, segundos: 60, distratorParecido: true },
};

function igual(a: Cell, b: Cell): boolean {
  return a.marks.join() === b.marks.join() && (a.rotation ?? 0) === (b.rotation ?? 0) && (a.innerFill ?? "solid") === (b.innerFill ?? "solid");
}

function celula(mark: Mark, rotation = 0, fill: Cell["innerFill"] = "solid"): Cell {
  return { marks: [mark], rotation, innerFill: fill };
}

export function gerarTrials(nivel: Nivel, seed: number, quantidade = 60): TrialVelocidade[] {
  const rnd = mulberry32(seed * 104729 + nivel * 31);
  const cfg = CONFIG[nivel];
  const trials: TrialVelocidade[] = [];
  for (let t = 0; t < quantidade; t++) {
    const pool = [...MARCAS];
    for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
    const rot = () => (cfg.distratorParecido ? [0, 90, 180][Math.floor(rnd() * 3)] : 0);
    const fil = (): Cell["innerFill"] => (cfg.distratorParecido ? (["solid", "none"] as const)[Math.floor(rnd() * 2)] : "solid");
    const alvos = [celula(pool[0], rot(), fil()), celula(pool[1], rot(), fil())];
    const presente = rnd() < 0.5;
    const candidatos: Cell[] = [];
    for (let i = 0; i < cfg.candidatos; i++) {
      const m = pool[2 + (i % (pool.length - 2))];
      candidatos.push(celula(m, rot(), fil()));
    }
    if (cfg.distratorParecido) {
      // distrator "quase igual": mesmo símbolo do alvo, rotação ou preenchimento diferente
      const a = alvos[Math.floor(rnd() * 2)];
      const quase: Cell = { ...a, rotation: ((a.rotation ?? 0) + 90) % 360 };
      candidatos[Math.floor(rnd() * candidatos.length)] = quase;
    }
    if (presente) {
      const a = alvos[Math.floor(rnd() * 2)];
      candidatos[Math.floor(rnd() * candidatos.length)] = { ...a };
    }
    // garante que "ausente" é de fato ausente (o quase-igual não conta)
    const realmente = candidatos.some((c) => alvos.some((a) => igual(a, c)));
    trials.push({ alvos, candidatos, presente: realmente });
  }
  return trials;
}

export interface MetricasVelocidade {
  respondidos: number;
  acertos: number;
  erros: number;
  /** acertos − erros (mínimo 0). */
  pontos: number;
  rtMedio: number;
}

export function pontuarVelocidade(respostas: { presente: boolean; disse: boolean; rt: number }[]): MetricasVelocidade {
  const acertos = respostas.filter((r) => r.presente === r.disse).length;
  const erros = respostas.length - acertos;
  const rts = respostas.map((r) => r.rt);
  return {
    respondidos: respostas.length,
    acertos,
    erros,
    pontos: Math.max(0, acertos - erros),
    rtMedio: rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0,
  };
}
