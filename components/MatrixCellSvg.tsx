"use client";

import type { CellSpec } from "@/lib/matrix/engine";

// ---------- Renderização SVG de uma célula ----------

const INK = "#1e293b";

function shapeElement(spec: CellSpec, cx: number, cy: number, s: number, uid: string) {
  const fill =
    spec.fill === "solid" ? INK : spec.fill === "half" ? `url(#half-${uid})` : "transparent";
  const common = {
    fill,
    stroke: INK,
    strokeWidth: 3,
    transform: spec.rotation ? `rotate(${spec.rotation} ${cx} ${cy})` : undefined,
  } as const;

  switch (spec.shape) {
    case "circle":
      return <circle cx={cx} cy={cy} r={s} {...common} />;
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
      const w = s * 0.38;
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
  }
}

const POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[32, 32], [68, 68]],
  3: [[50, 28], [30, 70], [70, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
};

export default function MatrixCellSvg({ spec, uid, size = 92 }: { spec: CellSpec; uid: string; size?: number }) {
  // O tamanho desenhado depende SÓ de `size` (antes, contagem 1 era desenhada
  // ~2× maior que contagem 2–4, e o tamanho virava um atributo-fantasma que
  // contradizia o gabarito). Cabe nas 4 posições (30/70 ± 16).
  const s = [9, 12.5, 16][spec.size - 1];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={`half-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="50%" stopColor={INK} />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {POSITIONS[spec.count].map(([cx, cy], i) => (
        <g key={i}>{shapeElement(spec, cx, cy, s, uid)}</g>
      ))}
    </svg>
  );
}
