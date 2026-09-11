import { describe, it, expect } from "vitest";
import { fmt, formatSubscaleValue, perItemMax, subscaleFraction } from "./subscale-format";

describe("subscale-format", () => {
  it("fmt: inteiro sem casas, decimal com até 2 casas e vírgula, sem zero final", () => {
    expect(fmt(5)).toBe("5");
    expect(fmt(2.5)).toBe("2,5");
    expect(fmt(1.8)).toBe("1,8");
    expect(fmt(4.25)).toBe("4,25");
    expect(fmt(-1.56)).toBe("-1,56");
    expect(fmt(Number.NaN)).toBe("—");
  });
  it("deriva o máximo por item do instrumento (BIS-11 = 4, SWAN = 3, AH/SD = 5)", () => {
    expect(perItemMax("bis-11", { name: "Impulsividade atencional", raw: 8, max: 32, mean: 1 })).toBe(4);
    expect(perItemMax("swan", { name: "Atenção (itens 1–9)", raw: -18, max: 27, mean: -2 })).toBe(3);
    expect(perItemMax("ahsd-indicadores", { name: "Intelectual / Aprendizagem", raw: 35, max: 35, mean: 5 })).toBe(5);
    expect(perItemMax("bis-11", { name: "não existe", raw: 1, max: 2, mean: 1 })).toBeNull();
    expect(perItemMax("instrumento-fantasma", { name: "x", raw: 1, max: 2, mean: 1 })).toBeNull();
  });
  it("rótulo: média com o máximo certo; soma quando não há média; sem denominador quando não dá para derivar", () => {
    expect(formatSubscaleValue("bis-11", { name: "Impulsividade atencional", raw: 8, max: 32, mean: 1 })).toBe("média 1/4");
    expect(formatSubscaleValue("swan", { name: "Atenção (itens 1–9)", raw: -18, max: 27, mean: -2 })).toBe("média -2/3");
    expect(formatSubscaleValue("asrs-18-abda", { name: "Parte A — Desatenção", raw: 4, max: 9 })).toBe("4/9");
    expect(formatSubscaleValue("swan", { name: "Atenção", raw: -18, max: 27, mean: -2 })).toBe("média -2");
  });
  it("fração da barra: coerente com o rótulo, deslocada em escalas com mínimo negativo, sem divisão por zero", () => {
    expect(subscaleFraction("bis-11", { name: "Impulsividade atencional", raw: 8, max: 32, mean: 1 })).toBeCloseTo(0.25, 5);
    expect(subscaleFraction("swan", { name: "Atenção (itens 1–9)", raw: -18, max: 27, mean: -2 })).toBeCloseTo((-2 + 3) / 6, 5);
    expect(subscaleFraction("asrs-18-abda", { name: "Parte A — Desatenção", raw: 4, max: 9 })).toBeCloseTo(4 / 9, 5);
    expect(subscaleFraction("asrs-18-abda", { name: "Parte A — Desatenção", raw: 0, max: 0 })).toBe(0);
  });
});
