import { describe, it, expect } from "vitest";
import { destinoSeguro, senhaConfere, tokenEsperado } from "./portao";

describe("portão de entrada", () => {
  it("confere a senha padrão e rejeita variações", () => {
    expect(senhaConfere("Ps1c0#Ahsd!94xQ7mL2")).toBe(true);
    expect(senhaConfere("ps1c0#ahsd!94xq7ml2")).toBe(false);
    expect(senhaConfere("Ps1c0#Ahsd!94xQ7mL2x")).toBe(false);
    expect(senhaConfere("")).toBe(false);
  });
  it("token é um hash estável de 64 hex, e não contém a senha", async () => {
    const t = await tokenEsperado();
    expect(t).toMatch(/^[0-9a-f]{64}$/);
    expect(t).toBe(await tokenEsperado());
    expect(t).not.toContain("Ps1c0");
  });
  it("só redireciona para caminhos internos", () => {
    expect(destinoSeguro("/treino/dojo?exame=mensa")).toBe("/treino/dojo?exame=mensa");
    expect(destinoSeguro("https://evil.com")).toBe("/");
    expect(destinoSeguro("//evil.com")).toBe("/");
    expect(destinoSeguro("/entrar?next=/x")).toBe("/");
    expect(destinoSeguro(null)).toBe("/");
  });
});
