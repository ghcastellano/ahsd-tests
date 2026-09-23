import { describe, expect, it } from "vitest";
import { readExposure, saveExposure } from "./exposicao";

describe("exposição local sem confundir ausência com falha", () => {
  it("inicia vazio, preserva o limite e recupera os estímulos", () => {
    let data: string | null = null;
    const storage = { getItem: () => data, setItem: (_: string, value: string) => { data = value; } };
    expect(readExposure(storage)).toEqual(new Set());
    expect(saveExposure(storage, new Set(Array.from({ length: 2010 }, (_, i) => String(i))))).toBe(true);
    expect(readExposure(storage)?.size).toBe(2000);
    expect(readExposure(storage)?.has("0")).toBe(false);
    expect(readExposure(storage)?.has("2009")).toBe(true);
  });
  it("dados inválidos ou armazenamento bloqueado não significam itens inéditos", () => {
    for (const value of ["{", "null", "{}", '["ok", 5]']) expect(readExposure({ getItem: () => value })).toBeNull();
    expect(readExposure({ getItem: () => { throw new Error("bloqueado"); } })).toBeNull();
    expect(saveExposure({ setItem: () => { throw new Error("cota"); } }, new Set(["item"]))).toBe(false);
  });
});
