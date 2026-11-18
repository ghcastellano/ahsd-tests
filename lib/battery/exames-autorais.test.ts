import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CellSvg from "../../components/CellSvg";
import { g36Test, g38Test, ravenTest } from "./exames-autorais";
import { visualKey } from "./visual-key";
import type { Cell } from "./types";

const desenho = (c: Cell) => renderToStaticMarkup(createElement(CellSvg, { cell: c, uid: "t" }));
const SEEDS = [0, 1, 2, 3, 5, 8, 13, 21];

describe("bancos autorais /g38, /g36 e /raven", () => {
  const bancos = [
    { def: g38Test, count: 38 },
    { def: g36Test, count: 36 },
    { def: ravenTest, count: 36 },
  ];

  for (const { def, count } of bancos) {
    it(`${def.id}: gera ${count} itens sem repetir o mesmo tipo em sequência e com referência oficial`, () => {
      expect(def.reference?.purchaseUrl).toMatch(/^https:\/\//);
      for (const seed of SEEDS) {
        const items = def.items(seed);
        expect(items).toHaveLength(count);
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (i > 0) {
            expect(it.kind, `${def.id} seed ${seed} item ${i + 1} repete ${it.kind}`).not.toBe(items[i - 1].kind);
          }
          expect(it.explanation.trim().length).toBeGreaterThan(20);
          expect(it.options).toHaveLength(6);
          expect(it.answerIndex).toBeGreaterThanOrEqual(0);
          expect(it.answerIndex).toBeLessThan(6);

          // Prova de gabarito: options[answerIndex] tem a mesma chave visual da célula (2,2)
          const gabarito = visualKey(it.grid![2][2]);
          expect(visualKey(it.options![it.answerIndex])).toBe(gabarito);

          // Garantia de zero opções visualmente idênticas (chave visual + SVG real)
          const keys = new Set(it.options!.map(visualKey));
          const svgs = new Set(it.options!.map(desenho));
          expect(keys.size, `${def.id} seed ${seed} ${it.id}: chaves duplicadas`).toBe(6);
          expect(svgs.size, `${def.id} seed ${seed} ${it.id}: SVGs duplicados`).toBe(6);
        }
      }
    });
  }
});
