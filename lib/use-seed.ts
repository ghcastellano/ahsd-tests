"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Semente da tentativa. Lê `?seed=N` da URL (usado pelos testes automatizados
 * para obter uma prova reproduzível); sem o parâmetro, sorteia uma semente
 * nova a cada abertura — assim as questões variam e não dá para decorar.
 * Retorna `null` até o primeiro render no navegador (SSR não tem `window`).
 * A segunda posição sorteia uma semente nova (botão "Refazer").
 */
export function useSeed(): [number | null, () => void] {
  const [seed, setSeed] = useState<number | null>(null);
  useEffect(() => {
    setSeed(seedFromLocation(window.location.search, sementeAleatoria()));
  }, []);
  const nova = useCallback(() => setSeed((anterior) => {
    const s = sementeAleatoria();
    return s === anterior ? (s + 1) % 1_000_000 : s;
  }), []);
  return [seed, nova];
}

function sementeAleatoria(): number {
  return window.crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
}

export function seedFromLocation(search: string, now: number = Date.now()): number {
  const q = new URLSearchParams(search).get("seed");
  const n = q ? Number(q) : Number.NaN;
  return Number.isFinite(n) ? Math.abs(Math.floor(n)) % 1_000_000 : now % 1_000_000;
}
