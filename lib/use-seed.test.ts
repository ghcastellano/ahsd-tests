import { describe, it, expect } from "vitest";
import { seedFromLocation } from "./use-seed";

describe("seedFromLocation", () => {
  it("usa ?seed=N quando presente (reproduzível para os testes automatizados)", () => {
    expect(seedFromLocation("?seed=12345", 999)).toBe(12345);
    expect(seedFromLocation("?x=1&seed=7", 999)).toBe(7);
    expect(seedFromLocation("?seed=-42.2", 999)).toBe(43);
    expect(seedFromLocation("?seed=1000007", 999)).toBe(7);
  });
  it("sem parâmetro válido, deriva do relógio (varia a cada abertura)", () => {
    expect(seedFromLocation("", 1_234_567_890)).toBe(1_234_567_890 % 1_000_000);
    expect(seedFromLocation("?seed=abc", 555)).toBe(555);
  });
});
