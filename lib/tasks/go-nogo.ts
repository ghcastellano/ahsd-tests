// Go/NoGo — tarefa de controle inibitório. Lógica PURA (sem DOM): geração da
// sequência de estímulos e cálculo das métricas. O componente só coleta as
// respostas e chama `pontuar`.
//
// Por que estas métricas: nas meta-análises de tarefas de inibição em TDAH,
// os dois marcadores mais consistentes são (1) ERROS DE COMISSÃO — responder
// ao estímulo que pedia para NÃO responder (falha do freio) — e (2) a
// VARIABILIDADE do tempo de reação (desvio-padrão / coeficiente de variação),
// mais até que a média do TR (Kofler et al., 2013; Wright et al., 2014;
// Lipszyc & Schachar, 2010). Omissões refletem lapsos de atenção sustentada.
//
// NÃO há norma: os parâmetros (500 ms de estímulo, 1 s entre estímulos, 25%
// de NoGo) mudam os números, e não existe tabela normativa para esta
// implementação. As faixas são convencionais e o resultado diz isso.

import { mulberry32 } from "../battery/rng";

export type Tipo = "go" | "nogo";

export interface Estimulo {
  tipo: Tipo;
  /** Letra mostrada. NoGo é sempre "X". */
  letra: string;
}

export interface Resposta {
  tipo: Tipo;
  /** Tempo de reação em ms a partir do início do estímulo; null = não respondeu. */
  rt: number | null;
}

export const DURACAO_ESTIMULO_MS = 500;
export const INTERVALO_MS = 1000;
export const PROPORCAO_NOGO = 0.25;
export const N_TREINO = 12;
export const N_PRINCIPAL = 120;
/** Respostas mais rápidas que isto são antecipação, não reação. */
export const RT_MINIMO_MS = 150;

const LETRAS_GO = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "P", "R", "S", "T"];

/**
 * Sequência com proporção fixa de NoGo, embaralhada com semente, e com a
 * restrição de nunca ter três NoGo seguidos (senão a pessoa "aprende a
 * segurar" e a tarefa deixa de medir inibição).
 */
export function gerarSequencia(n: number, seed: number): Estimulo[] {
  const rnd = mulberry32(seed);
  const nNogo = Math.round(n * PROPORCAO_NOGO);
  const tipos: Tipo[] = [...Array(nNogo).fill("nogo"), ...Array(n - nNogo).fill("go")];
  // Fisher-Yates
  for (let i = tipos.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [tipos[i], tipos[j]] = [tipos[j], tipos[i]];
  }
  // Quebra trincas de NoGo trocando com o próximo Go disponível.
  for (let i = 2; i < tipos.length; i++) {
    if (tipos[i] === "nogo" && tipos[i - 1] === "nogo" && tipos[i - 2] === "nogo") {
      const k = tipos.findIndex((t, idx) => idx > i && t === "go");
      if (k !== -1) [tipos[i], tipos[k]] = [tipos[k], tipos[i]];
    }
  }
  return tipos.map((tipo) => ({
    tipo,
    letra: tipo === "nogo" ? "X" : LETRAS_GO[Math.floor(rnd() * LETRAS_GO.length)],
  }));
}

export interface Metricas {
  nGo: number;
  nNogo: number;
  acertosGo: number;
  omissoes: number;
  comissoes: number;
  antecipacoes: number;
  /** % de NoGo em que a pessoa respondeu (0–100). */
  taxaComissao: number;
  /** % de Go sem resposta (0–100). */
  taxaOmissao: number;
  /** Média do TR dos acertos em Go (ms), excluindo antecipações. */
  rtMedio: number;
  rtDesvio: number;
  /** Coeficiente de variação = desvio / média. */
  rtCv: number;
  /** d' (sensibilidade) — separa detecção de viés de resposta. */
  dPrime: number;
}

function zInv(p: number): number {
  // Aproximação de Acklam para a inversa da normal padrão (precisão ~1e-9).
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pl = 0.02425;
  let q: number, r: number;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p <= 1 - pl) {
    q = p - 0.5; r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

export function pontuar(respostas: Resposta[]): Metricas {
  const go = respostas.filter((r) => r.tipo === "go");
  const nogo = respostas.filter((r) => r.tipo === "nogo");
  const antecipacoes = respostas.filter((r) => r.rt !== null && r.rt < RT_MINIMO_MS).length;
  const acertos = go.filter((r) => r.rt !== null && r.rt >= RT_MINIMO_MS);
  const omissoes = go.filter((r) => r.rt === null).length;
  const comissoes = nogo.filter((r) => r.rt !== null).length;
  const rts = acertos.map((r) => r.rt as number);
  const media = rts.length ? rts.reduce((a, b) => a + b, 0) / rts.length : 0;
  const desvio = rts.length > 1 ? Math.sqrt(rts.reduce((a, b) => a + (b - media) ** 2, 0) / (rts.length - 1)) : 0;
  // d' com correção log-linear (Hautus, 1995) para evitar taxas de 0 ou 1.
  const hit = (acertos.length + 0.5) / (go.length + 1);
  const fa = (comissoes + 0.5) / (nogo.length + 1);
  const dPrime = go.length && nogo.length ? zInv(hit) - zInv(fa) : 0;
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {
    nGo: go.length,
    nNogo: nogo.length,
    acertosGo: acertos.length,
    omissoes,
    comissoes,
    antecipacoes,
    taxaComissao: nogo.length ? r2((comissoes / nogo.length) * 100) : 0,
    taxaOmissao: go.length ? r2((omissoes / go.length) * 100) : 0,
    rtMedio: Math.round(media),
    rtDesvio: Math.round(desvio),
    rtCv: media ? r2(desvio / media) : 0,
    dPrime: r2(dPrime),
  };
}

export interface Faixa {
  label: string;
  severity: "none" | "low" | "moderate" | "high" | "info";
  description: string;
}

/** Faixas CONVENCIONAIS sobre a taxa de comissão (o "freio"). */
export function faixaComissao(taxa: number): Faixa {
  if (taxa < 10) return { label: "Freio dentro do esperado", severity: "none", description: "Menos de 10% de respostas ao X: controle inibitório sem sinal de dificuldade nesta tarefa." };
  if (taxa < 25) return { label: "Freio um pouco abaixo do esperado", severity: "low", description: "Entre 10% e 25% de respostas ao X: falhas de inibição acima do que adultos costumam mostrar em tarefas deste ritmo. Sozinho, não significa nada; combinado com desatenção no dia a dia, vale investigar." };
  if (taxa < 40) return { label: "Freio abaixo do esperado", severity: "moderate", description: "Entre 25% e 40%: dificuldade clara de segurar a resposta. É o padrão mais associado ao TDAH em tarefas de Go/NoGo — mas também aparece com sono ruim, pressa ou distração no momento." };
  return { label: "Freio bem abaixo do esperado", severity: "high", description: "40% ou mais de respostas ao X: a pessoa respondeu a quase metade dos estímulos que pediam para não responder. Repita descansado(a); se persistir, é um dado objetivo para levar à avaliação." };
}

/** Faixas CONVENCIONAIS sobre a variabilidade do TR (coeficiente de variação). */
export function faixaVariabilidade(cv: number): Faixa {
  if (cv < 0.2) return { label: "Ritmo estável", severity: "none", description: "Tempo de reação consistente de um estímulo para outro." };
  if (cv < 0.3) return { label: "Ritmo um pouco irregular", severity: "low", description: "Alguma oscilação no tempo de reação — lapsos breves de atenção entre respostas rápidas." };
  return { label: "Ritmo irregular", severity: "moderate", description: "Tempo de reação muito variável: respostas rápidas alternadas com respostas lentas. Nas meta-análises, a variabilidade do TR é o marcador de desempenho mais consistente do TDAH — mais que a lentidão." };
}
