"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Registra cada página aberta: envia caminho e origem ao servidor, que lê o
 * IP dos cabeçalhos e grava no banco central. Melhor-esforço e silencioso —
 * uma falha aqui nunca afeta o site.
 */
export default function VisitaLogger() {
  const pathname = usePathname();
  // Numa navegação interna (Link) o document.referrer não muda; guardamos a
  // página anterior para a "origem" refletir de onde a pessoa veio.
  const anterior = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname) return;
    const origem = anterior.current
      ? `${window.location.origin}${anterior.current}`
      : document.referrer || null;
    anterior.current = pathname;
    const corpo = JSON.stringify({ caminho: pathname, referer: origem });
    try {
      void fetch("/api/visita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: corpo,
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      // ignore
    }
  }, [pathname]);
  return null;
}
