import { describe, expect, it } from "vitest";
import type { Cell } from "../battery/types";
import { chaveSimbolo, gerarTrials } from "./velocidade";

describe("procura de símbolos — gabarito visual", () => {
  it("não penaliza simetrias, aliases de barras ou preenchimento invisível", () => {
    const pares: [Cell, Cell][] = [
      [{ marks: ["circle"], rotation: 0 }, { marks: ["circle"], rotation: 90 }],
      [{ marks: ["square"] }, { marks: ["square"], rotation: 180 }],
      [{ marks: ["cross"] }, { marks: ["cross"], rotation: 270 }],
      [{ marks: ["hbar"], rotation: 90 }, { marks: ["vbar"] }],
      [{ marks: ["vbar"], rotation: 90 }, { marks: ["hbar"] }],
      [{ marks: ["slash"], rotation: 90 }, { marks: ["backslash"] }],
      [{ marks: ["backslash"], rotation: 90 }, { marks: ["slash"] }],
      [{ marks: ["hbar"], innerFill: "solid" }, { marks: ["hbar"], innerFill: "none" }],
    ];
    for (const [a, b] of pares) expect(chaveSimbolo(a)).toBe(chaveSimbolo(b));
    expect(chaveSimbolo({ marks: ["circle"], innerFill: "solid" })).not.toBe(chaveSimbolo({ marks: ["circle"], innerFill: "none" }));
    expect(chaveSimbolo({ marks: ["triangle"] })).not.toBe(chaveSimbolo({ marks: ["triangle"], rotation: 90 }));
    // Diagonais têm comprimento diferente das barras no CellSvg.
    expect(chaveSimbolo({ marks: ["slash"], rotation: 45 })).not.toBe(chaveSimbolo({ marks: ["hbar"] }));
  });
  it("confere 18.000 tentativas e preserva positivos e negativos", () => {
    for (const nivel of [1, 2, 3] as const) {
      let presentes = 0;
      for (let seed = 0; seed < 100; seed++) {
        for (const t of gerarTrials(nivel, seed, 60)) {
          const visivel = t.candidatos.some((c) => t.alvos.some((a) => chaveSimbolo(c) === chaveSimbolo(a)));
          expect(t.presente).toBe(visivel);
          presentes += Number(t.presente);
        }
      }
      expect(presentes).toBeGreaterThan(2500);
      expect(presentes).toBeLessThan(3500);
    }
  });
});
