import { mulberry32 } from "../battery/rng";

// "Condições" (topologia) — o 4º subteste do Cattell Culture Fair: em qual das
// cinco figuras é possível colocar um ponto que obedeça a uma condição
// ("dentro do círculo e do quadrado, mas fora do triângulo")? Os itens são
// gerados por sorteio de posições e CONFERIDOS por amostragem de pontos, então
// a resposta é única por construção.

export type Forma = "circulo" | "quadrado" | "triangulo";
export type Relacao = "dentro" | "fora";

export interface Figura {
  circulo: { cx: number; cy: number; r: number };
  quadrado: { x: number; y: number; lado: number };
  triangulo: { cx: number; cy: number; lado: number }; // equilátero, vértice para cima
}

export type Condicao = Record<Forma, Relacao>;

export interface ItemCondicao {
  id: string;
  condicao: Condicao;
  enunciado: string;
  opcoes: Figura[];
  resposta: number;
  /** Ponto que satisfaz a condição na figura correta (para mostrar na explicação). */
  ponto: { x: number; y: number };
  explicacao: string;
  motivos: string[]; // por que cada opção errada falha
}

const NOME: Record<Forma, string> = { circulo: "do círculo", quadrado: "do quadrado", triangulo: "do triângulo" };
const FORMAS: Forma[] = ["circulo", "quadrado", "triangulo"];

/**
 * Distância com sinal até a borda da forma: positiva dentro, negativa fora.
 * É o que permite exigir MARGEM: um ponto "dentro" a 0,3 px do traço não
 * conta como dentro para quem olha a figura.
 */
export function distanciaComSinal(f: Figura, forma: Forma, x: number, y: number): number {
  if (forma === "circulo") {
    const { cx, cy, r } = f.circulo;
    return r - Math.hypot(x - cx, y - cy);
  }
  if (forma === "quadrado") {
    const { x: qx, y: qy, lado } = f.quadrado;
    return Math.min(x - qx, qx + lado - x, y - qy, qy + lado - y);
  }
  const { cx, cy, lado } = f.triangulo;
  const h = (lado * Math.sqrt(3)) / 2;
  // vértices: topo (cx, cy - 2h/3), base (cx ± lado/2, cy + h/3); arestas no sentido horário
  const v: [number, number][] = [[cx, cy - (2 * h) / 3], [cx + lado / 2, cy + h / 3], [cx - lado / 2, cy + h / 3]];
  let min = Infinity;
  for (let i = 0; i < 3; i++) {
    const [ax, ay] = v[i], [bx, by] = v[(i + 1) % 3];
    const len = Math.hypot(bx - ax, by - ay);
    // distância com sinal à reta da aresta (positiva do lado de dentro)
    const d = ((bx - ax) * (y - ay) - (by - ay) * (x - ax)) / len;
    min = Math.min(min, d);
  }
  return min;
}

export function dentroDe(f: Figura, forma: Forma, x: number, y: number): boolean {
  return distanciaComSinal(f, forma, x, y) >= 0;
}

/** Margem mínima (px do viewBox 100) para um ponto contar como claramente dentro/fora. */
export const MARGEM = 2.5;

export function satisfaz(f: Figura, c: Condicao, x: number, y: number, margem = 0): boolean {
  return FORMAS.every((forma) => {
    const d = distanciaComSinal(f, forma, x, y);
    return c[forma] === "dentro" ? d >= margem : d <= -margem;
  });
}

/**
 * Melhor ponto que satisfaz a condição com a margem pedida (o de maior folga),
 * numa grade de 1 em 1; null se não existe.
 */
export function pontoQueSatisfaz(f: Figura, c: Condicao, margem = MARGEM): { x: number; y: number } | null {
  let melhor: { x: number; y: number; folga: number } | null = null;
  // grade de 2 em 2: regiões mais finas que isso são invisíveis no desenho
  for (let y = 1; y < 100; y += 2) {
    for (let x = 1; x < 100; x += 2) {
      if (!satisfaz(f, c, x, y, margem)) continue;
      if (margem <= 0) return { x, y }; // só interessa saber se existe
      const folga = Math.min(...FORMAS.map((forma) => {
        const d = distanciaComSinal(f, forma, x, y);
        return c[forma] === "dentro" ? d : -d;
      }));
      if (!melhor || folga > melhor.folga) melhor = { x, y, folga };
    }
  }
  return melhor ? { x: melhor.x, y: melhor.y } : null;
}

export function descreverCondicao(c: Condicao): string {
  const dentro = FORMAS.filter((f) => c[f] === "dentro").map((f) => NOME[f]);
  const fora = FORMAS.filter((f) => c[f] === "fora").map((f) => NOME[f]);
  const partes: string[] = [];
  if (dentro.length) partes.push(`dentro ${dentro.join(" e ")}`);
  if (fora.length) partes.push(`fora ${fora.join(" e ")}`);
  return partes.join(" e ");
}

function figuraAleatoria(rand: () => number): Figura {
  const r = 14 + Math.floor(rand() * 16);
  const lado = 24 + Math.floor(rand() * 26);
  const lt = 28 + Math.floor(rand() * 26);
  return {
    circulo: { cx: r + Math.floor(rand() * (100 - 2 * r)), cy: r + Math.floor(rand() * (100 - 2 * r)), r },
    quadrado: { x: Math.floor(rand() * (100 - lado)), y: Math.floor(rand() * (100 - lado)), lado },
    triangulo: { cx: lt / 2 + Math.floor(rand() * (100 - lt)), cy: 30 + Math.floor(rand() * 40), lado: lt },
  };
}

/** Por que a condição falha nesta figura (texto curto). */
export function motivoFalha(f: Figura, c: Condicao): string {
  const dentro = FORMAS.filter((x) => c[x] === "dentro");
  const fora = FORMAS.filter((x) => c[x] === "fora");
  // 1) as regiões "dentro" nem se cruzam?
  if (dentro.length >= 2) {
    const soDentro: Condicao = { circulo: "fora", quadrado: "fora", triangulo: "fora" };
    for (const d of dentro) soDentro[d] = "dentro";
    // ignora as "fora": existe ponto dentro de todas as "dentro"?
    const ha = (() => {
      for (let y = 1; y < 100; y += 2) for (let x = 1; x < 100; x += 2) if (dentro.every((d) => dentroDe(f, d, x, y))) return true;
      return false;
    })();
    if (!ha) return `${dentro.map((d) => NOME[d].replace(/^d[oa] /, "o ")).join(" e ")} não se sobrepõem`;
  }
  if (fora.length) return `${fora.map((d) => NOME[d].replace(/^d[oa] /, "o ")).join(" e ")} cobre(m) toda a região que serviria`;
  return "a condição não é satisfeita";
}

const CONDICOES: Condicao[] = [
  { circulo: "dentro", quadrado: "dentro", triangulo: "fora" },
  { circulo: "dentro", quadrado: "fora", triangulo: "dentro" },
  { circulo: "fora", quadrado: "dentro", triangulo: "dentro" },
  { circulo: "dentro", quadrado: "dentro", triangulo: "dentro" },
  { circulo: "dentro", quadrado: "fora", triangulo: "fora" },
  { circulo: "fora", quadrado: "dentro", triangulo: "fora" },
];

/** Gera um item: 1 figura que satisfaz + 4 que não, embaralhadas. */
export function gerarCondicao(seed: number, n = 0): ItemCondicao {
  const rand = mulberry32(seed * 7 + n * 104729 + 17);
  const condicao = CONDICOES[Math.floor(rand() * CONDICOES.length)];
  let certa: Figura | null = null;
  let ponto: { x: number; y: number } | null = null;
  const erradas: Figura[] = [];
  for (let tent = 0; tent < 4000 && (!certa || erradas.length < 4); tent++) {
    const f = figuraAleatoria(rand);
    // certa: existe região com folga visível; errada: não existe ponto NEM na borda
    const p = pontoQueSatisfaz(f, condicao, MARGEM);
    if (p && !certa) { certa = f; ponto = p; }
    else if (!p && !pontoQueSatisfaz(f, condicao, 0) && erradas.length < 4) erradas.push(f);
  }
  if (!certa || !ponto || erradas.length < 4) {
    // Fallback determinístico (nunca deve acontecer com as faixas de tamanho acima).
    return gerarCondicao(seed + 1, n);
  }
  const pos = Math.floor(rand() * 5);
  const opcoes = [...erradas];
  opcoes.splice(pos, 0, certa);
  const desc = descreverCondicao(condicao);
  const motivos = opcoes.map((f, i) => (i === pos ? "" : motivoFalha(f, condicao)));
  return {
    id: `cd${n}`,
    condicao,
    enunciado: `Em qual figura é possível marcar um ponto que fique ${desc}?`,
    opcoes,
    resposta: pos,
    ponto,
    explicacao: `Só na figura ${pos + 1} existe uma região que está ${desc} (o ponto verde mostra um lugar possível). Nas outras, ` +
      opcoes.map((_, i) => (i === pos ? null : `figura ${i + 1}: ${motivos[i]}`)).filter(Boolean).join("; ") + ".",
    motivos,
  };
}

export function gerarCondicoes(seed: number, quantidade: number): ItemCondicao[] {
  return Array.from({ length: quantidade }, (_, i) => gerarCondicao(seed, i));
}
