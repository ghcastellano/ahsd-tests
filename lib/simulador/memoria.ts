// Memória operacional — três formatos das escalas de inteligência: dígitos na
// ordem direta, dígitos na ordem inversa e sequência de letras e números
// (repetir os números em ordem crescente e depois as letras em ordem
// alfabética). Sequências geradas com semente, sem dígitos repetidos
// repetidos dentro da sequência e sem escadas óbvias (1-2-3).

import { mulberry32 } from "../battery/rng";
import type { Nivel } from "./verbal";

export type FormatoMemoria = "direta" | "inversa" | "letras-numeros";

export interface ItemMemoria {
  id: string;
  nivel: Nivel;
  formato: FormatoMemoria;
  /** Elementos mostrados um a um. */
  sequencia: string[];
  /** Resposta esperada, sem separadores. */
  resposta: string;
}

const LETRAS = ["B", "D", "F", "G", "H", "K", "L", "M", "P", "R", "S", "T"];

/** Amplitudes por nível: [direta, inversa, letras-números]. */
export const AMPLITUDES: Record<Nivel, [number[], number[], number[]]> = {
  // A média adulta é ~6–7 dígitos na ordem direta e ~4–5 na inversa (WAIS-IV).
  // O nível 1 já começa acima disso; o 3 chega ao teto de 9 dígitos distintos.
  1: [[7, 8], [5, 6], [4, 5]],
  2: [[8, 9], [6, 7], [5, 6]],
  3: [[9, 9], [7, 8], [7, 8]],
};

function digitos(n: number, rnd: () => number): string[] {
  const out: string[] = [];
  while (out.length < n) {
    const d = String(1 + Math.floor(rnd() * 9));
    const ult = out[out.length - 1];
    // dígitos distintos dentro da sequência: repetições viram "pedaços"
    // memorizáveis e baixam a carga real da amplitude
    if (out.includes(d)) continue;
    // evita passos de +1/-1 consecutivos (1-2-3, 9-8-7)
    if (out.length >= 2) {
      const a = Number(out[out.length - 2]), b = Number(ult), c = Number(d);
      if (b - a === c - b && Math.abs(b - a) === 1) continue;
    }
    out.push(d);
  }
  return out;
}

export function gerarItensMemoria(nivel: Nivel, seed: number): ItemMemoria[] {
  const rnd = mulberry32(seed * 7919 + nivel);
  const [dir, inv, ln] = AMPLITUDES[nivel];
  const itens: ItemMemoria[] = [];
  dir.forEach((n, i) => {
    const s = digitos(n, rnd);
    itens.push({ id: `m${nivel}-d${i}`, nivel, formato: "direta", sequencia: s, resposta: s.join("") });
  });
  inv.forEach((n, i) => {
    const s = digitos(n, rnd);
    itens.push({ id: `m${nivel}-i${i}`, nivel, formato: "inversa", sequencia: s, resposta: [...s].reverse().join("") });
  });
  ln.forEach((n, i) => {
    // metade números, metade letras (arredondando para cima nos números), intercalados aleatoriamente
    const nNum = Math.ceil(n / 2);
    const nums = digitos(nNum, rnd);
    const letras: string[] = [];
    while (letras.length < n - nNum) {
      const l = LETRAS[Math.floor(rnd() * LETRAS.length)];
      if (!letras.includes(l)) letras.push(l);
    }
    const seq = [...nums.map((x) => ({ t: "n", v: x })), ...letras.map((x) => ({ t: "l", v: x }))];
    for (let k = seq.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [seq[k], seq[j]] = [seq[j], seq[k]]; }
    const resposta = [...nums].sort((a, b) => Number(a) - Number(b)).join("") + [...letras].sort().join("");
    itens.push({ id: `m${nivel}-l${i}`, nivel, formato: "letras-numeros", sequencia: seq.map((x) => x.v), resposta });
  });
  return itens;
}

/** Normaliza a digitação: maiúsculas, sem espaços, hífens ou vírgulas. */
export function normalizar(entrada: string): string {
  return entrada.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

export function conferirMemoria(item: ItemMemoria, entrada: string): boolean {
  return normalizar(entrada) === item.resposta;
}
