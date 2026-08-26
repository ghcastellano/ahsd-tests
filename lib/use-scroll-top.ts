"use client";

import { useEffect, useRef } from "react";

/**
 * Rola ao topo sempre que `screen` muda — DEPOIS da renderização da tela nova.
 * Não dispara na primeira renderização (senão roubaria a posição de quem
 * chegou por um link com âncora).
 *
 * Dois detalhes que fazem a diferença aqui:
 *
 * 1. Chamar `window.scrollTo` logo após `setState` não funciona: o React ainda
 *    não trocou a tela, então a rolagem acontece no documento ANTIGO (a lista
 *    de itens, bem mais alta) e o navegador preserva o deslocamento quando a
 *    tela de resultado, mais curta, entra no lugar. Por isso o efeito.
 *
 * 2. `behavior: "instant"` é obrigatório — e "auto" NÃO serve. No padrão,
 *    "auto" significa "use o valor do CSS", e o CSS global desta aplicação
 *    define `html { scroll-behavior: smooth }`. Com "auto" a rolagem vira uma
 *    animação de mais de meio segundo partindo do fim de uma prova de 34
 *    itens: quem termina o teste vê a página descendo devagar e pode achar
 *    que ficou embaixo. "instant" salta direto.
 */
export function useScrollTopOnScreenChange(screen: string | boolean): void {
  const previous = useRef<string | boolean | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (previous.current === null) {
      previous.current = screen; // primeira renderização: não mexe
      return;
    }
    if (previous.current === screen) return;
    previous.current = screen;

    // Impede o navegador de restaurar sozinho o deslocamento anterior.
    const restauracaoOriginal = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      // navegador sem suporte — segue sem isso
    }

    const aoTopo = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    aoTopo();

    // Telas de resultado com barras e listas crescem depois do primeiro quadro;
    // sem estas correções pode sobrar um resíduo de alguns pixels.
    const raf = requestAnimationFrame(aoTopo);
    const timer = setTimeout(aoTopo, 120);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
      try {
        window.history.scrollRestoration = restauracaoOriginal;
      } catch {
        // idem
      }
    };
  }, [screen]);
}
