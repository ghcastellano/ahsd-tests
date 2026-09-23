"use client";

import { useEffect, useRef } from "react";

/**
 * Mede o tempo gasto em cada item (em segundos) enquanto `ativo`. Ao trocar
 * de item, o tempo é acumulado no índice anterior; ao desativar, o item atual
 * é fechado. `fechar()` devolve o mapa índice → segundos (com o item atual).
 */
export function useTemposPorItem(indice: number, ativo: boolean) {
  const tempos = useRef<Record<number, number>>({});
  const marca = useRef<number | null>(null);
  const anterior = useRef<number>(indice);

  const acumular = () => {
    if (marca.current === null) return;
    const agora = Date.now();
    tempos.current[anterior.current] = (tempos.current[anterior.current] ?? 0) + (agora - marca.current) / 1000;
    marca.current = agora;
  };

  useEffect(() => {
    if (!ativo) { acumular(); marca.current = null; return; }
    acumular();
    marca.current = Date.now();
    anterior.current = indice;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, ativo]);

  const fechar = (): Record<number, number> => { acumular(); return { ...tempos.current }; };
  const segundos = (i: number) => Math.round(tempos.current[i] ?? 0);
  return { fechar, segundos };
}
