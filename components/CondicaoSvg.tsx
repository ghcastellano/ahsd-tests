"use client";

import type { Figura } from "@/lib/dojo/condicoes";

// Desenha uma figura de "condições" (círculo, quadrado e triângulo) e,
// opcionalmente, o ponto que satisfaz a condição (na explicação).
const INK = "#1e293b";

export default function CondicaoSvg({ figura, ponto, size = 96, uid }: { figura: Figura; ponto?: { x: number; y: number } | null; size?: number; uid: string }) {
  const { circulo: c, quadrado: q, triangulo: t } = figura;
  const h = (t.lado * Math.sqrt(3)) / 2;
  const pts = `${t.cx},${t.cy - (2 * h) / 3} ${t.cx - t.lado / 2},${t.cy + h / 3} ${t.cx + t.lado / 2},${t.cy + h / 3}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" data-uid={uid}>
      <rect x={q.x} y={q.y} width={q.lado} height={q.lado} fill="none" stroke={INK} strokeWidth={2.5} />
      <circle cx={c.cx} cy={c.cy} r={c.r} fill="none" stroke={INK} strokeWidth={2.5} />
      <polygon points={pts} fill="none" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      {ponto && <circle cx={ponto.x} cy={ponto.y} r={3.2} fill="#059669" stroke="white" strokeWidth={1} />}
    </svg>
  );
}
