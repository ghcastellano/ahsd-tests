import { describe, it, expect } from "vitest";
import { destinoSeguro, senhaConfere, tokenEsperado } from "./portao";

describe("portão de entrada", () => {
  it("confere a senha padrão e rejeita variações", () => {
    expect(senhaConfere("senha321")).toBe(true);
    expect(senhaConfere("Senha321")).toBe(false);
    expect(senhaConfere("senha3214")).toBe(false);
    expect(senhaConfere("")).toBe(false);
  });
  it("token é um hash estável de 64 hex, e não contém a senha", async () => {
    const t = await tokenEsperado();
    expect(t).toMatch(/^[0-9a-f]{64}$/);
    expect(t).toBe(await tokenEsperado());
    expect(t).not.toContain("senha");
  });
  it("só redireciona para caminhos internos", () => {
    expect(destinoSeguro("/treino/dojo?exame=mensa")).toBe("/treino/dojo?exame=mensa");
    expect(destinoSeguro("https://evil.com")).toBe("/");
    expect(destinoSeguro("//evil.com")).toBe("/");
    expect(destinoSeguro("/entrar?next=/x")).toBe("/");
    expect(destinoSeguro(null)).toBe("/");
  });
});
