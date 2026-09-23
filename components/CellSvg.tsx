"use client";

import type { Cell, Fill, Mark } from "@/lib/battery/types";

// Renderiza uma célula da bateria. Suporta três composições:
//  - marcas sobrepostas no mesmo espaço (itens de operação lógica);
//  - forma externa + elemento interno (itens de dois componentes);
//  - repetição do conjunto de marcas (atributo quantitativo).

const INK = "#1e293b";

function fillOf(fill: Fill | undefined, uid: string): string {
  if (fill === "solid") return INK;
  if (fill === "half") return `url(#half-${uid})`;
  return "none";
}

function markPath(mark: Mark, cx: number, cy: number, s: number, fill: string, uid: string) {
  const common = { fill, stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const };
  switch (mark) {
    case "circle":
      return <circle cx={cx} cy={cy} r={s} {...common} />;
    case "dot":
      return <circle cx={cx} cy={cy} r={s * 0.3} fill={INK} />;
    case "square":
      return <rect x={cx - s} y={cy - s} width={2 * s} height={2 * s} {...common} />;
    case "triangle":
      return (
        <polygon
          points={`${cx},${cy - s} ${cx - s * 0.7},${cy + s * 0.8} ${cx + s * 0.7},${cy + s * 0.8}`}
          {...common}
        />
      );
    case "diamond":
      return (
        <polygon points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`} {...common} />
      );
    case "cross": {
      const w = s * 0.34;
      return (
        <polygon
          points={[
            `${cx - w},${cy - s}`, `${cx + w},${cy - s}`, `${cx + w},${cy - w}`,
            `${cx + s},${cy - w}`, `${cx + s},${cy + w}`, `${cx + w},${cy + w}`,
            `${cx + w},${cy + s}`, `${cx - w},${cy + s}`, `${cx - w},${cy + w}`,
            `${cx - s},${cy + w}`, `${cx - s},${cy - w}`, `${cx - w},${cy - w}`,
          ].join(" ")}
          {...common}
        />
      );
    }
    case "star": {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? s : s * 0.45;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
      }
      return <polygon points={pts.join(" ")} {...common} />;
    }
    case "hbar":
      return <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} stroke={INK} strokeWidth={4} strokeLinecap="round" />;
    case "vbar":
      return <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} stroke={INK} strokeWidth={4} strokeLinecap="round" />;
    case "slash":
      return (
        <line x1={cx - s * 0.8} y1={cy + s * 0.8} x2={cx + s * 0.8} y2={cy - s * 0.8} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      );
    case "backslash":
      return (
        <line x1={cx - s * 0.8} y1={cy - s * 0.8} x2={cx + s * 0.8} y2={cy + s * 0.8} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      );
  }
  void uid;
  return null;
}

const POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[33, 33], [67, 67]],
  3: [[50, 28], [30, 70], [70, 70]],
  4: [[32, 32], [68, 32], [32, 68], [68, 68]],
};

export default function CellSvg({
  cell,
  uid,
  size = 88,
}: {
  cell: Cell;
  uid: string;
  size?: number;
}) {
  const count = cell.count ?? 1;
  const scale = [0.72, 1, 1.28][(cell.size ?? 2) - 1];
  const base = (count > 1 ? 15 : 24) * scale;
  const positions = POSITIONS[Math.min(4, Math.max(1, count))];
  const innerFill = fillOf(cell.innerFill, uid);
  const rot = cell.rotation ?? 0;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={`half-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="50%" stopColor={INK} />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
        <linearGradient id={`outer-half-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="50%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Componente externo (contêiner), quando houver */}
      {cell.outer && (
        <g>{markPath(cell.outer, 50, 50, 40, cell.outerFill === "solid" ? "#cbd5e1" : cell.outerFill === "half" ? `url(#outer-half-${uid})` : "none", uid)}</g>
      )}

      {/* Marcas: sobrepostas no mesmo ponto, repetidas conforme `count` */}
      {positions.map(([cx, cy], idx) => (
        <g
          key={idx}
          transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined}
        >
          {cell.marks.map((m, j) => (
            <g key={j}>{markPath(m, cx, cy, base, innerFill, uid)}</g>
          ))}
        </g>
      ))}

      {/* Célula vazia: nas regras de distribuição de dois, a AUSÊNCIA é um valor
          da regra, então ela é desenhada como realmente vazia. Nada de marcador
          cinza — ele seria confundido com o elemento "dot" do vocabulário. */}
    </svg>
  );
}
