import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CellSvg from "../../components/CellSvg";
import { tests } from "./index";
import { rotacaoEfetiva, visualKey } from "./visual-key";
import type { Cell, Item } from "./types";

// Duas alternativas que se DESENHAM iguais são um bug de item, mesmo que os
// objetos difiram (ex.: círculo girado 45° é o mesmo círculo; barra "preenchida"
// é a mesma barra). Dois crivos: a chave visual (que entende simetria de giro)
// e a renderização real do CellSvg (marcação SVG idêntica = desenho idêntico).
const desenho = (c: Cell) => renderToStaticMarkup(createElement(CellSvg, { cell: c, uid: "t" }));

function figurasDe(it: Item): Cell[] {
  return it.options ?? it.set ?? [];
}

const SEEDS = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 12345, 999999];

describe("visualKey", () => {
  it("ignora giros invisíveis e preenchimento em marcas que não o desenham", () => {
    expect(visualKey({ marks: ["circle"], rotation: 45 })).toBe(visualKey({ marks: ["circle"] }));
    expect(visualKey({ marks: ["dot"], rotation: 30 })).toBe(visualKey({ marks: ["dot"] }));
    expect(visualKey({ marks: ["cross"], rotation: 90 })).toBe(visualKey({ marks: ["cross"] }));
    expect(visualKey({ marks: ["cross"], rotation: 45 })).not.toBe(visualKey({ marks: ["cross"] }));
    expect(visualKey({ marks: ["square"], rotation: 45 })).not.toBe(visualKey({ marks: ["square"] }));
    expect(visualKey({ marks: ["triangle"], rotation: 90 })).not.toBe(visualKey({ marks: ["triangle"] }));
    expect(visualKey({ marks: ["hbar"], innerFill: "solid" })).toBe(visualKey({ marks: ["hbar"] }));
    expect(visualKey({ marks: ["square"], innerFill: "none" })).toBe(visualKey({ marks: ["square"] }));
    expect(visualKey({ marks: ["square"], innerFill: "solid" })).not.toBe(visualKey({ marks: ["square"] }));
    expect(visualKey({ marks: ["star"], count: 5 })).toBe(visualKey({ marks: ["star"], count: 4 }));
    expect(visualKey({ marks: ["star"], count: 3 })).not.toBe(visualKey({ marks: ["star"], count: 4 }));
    expect(rotacaoEfetiva(["star"], 72)).toBe(0);
    expect(rotacaoEfetiva(["star"], 45)).toBe(45);
    expect(rotacaoEfetiva(["circle", "triangle"], 45)).toBe(45);
  });
});

describe("figuras visualmente distintas (bateria de treino)", () => {
  for (const t of tests) {
    if (t.id === "series-numericas") continue;
    it(`${t.id}: nenhuma alternativa repete o desenho de outra, em ${SEEDS.length} sementes`, () => {
      const problemas: string[] = [];
      for (const seed of SEEDS) {
        for (const item of t.items(seed)) {
          const figs = figurasDe(item);
          if (item.options) expect(item.options, `${t.id} seed ${seed} ${item.id}: precisa de 6 alternativas`).toHaveLength(6);
          const porChave = new Map<string, number>();
          const porDesenho = new Map<string, number>();
          figs.forEach((c, i) => {
            const k = visualKey(c);
            const d = desenho(c);
            if (porChave.has(k)) problemas.push(`seed ${seed} ${item.id}: figuras ${porChave.get(k)! + 1} e ${i + 1} iguais (${JSON.stringify(c)})`);
            else if (porDesenho.has(d)) problemas.push(`seed ${seed} ${item.id}: figuras ${porDesenho.get(d)! + 1} e ${i + 1} com o mesmo SVG (${JSON.stringify(c)})`);
            porChave.set(k, i);
            porDesenho.set(d, i);
          });
        }
      }
      expect(problemas, problemas.slice(0, 8).join("\n")).toEqual([]);
    });
  }
});
