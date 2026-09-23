import { describe, it, expect } from "vitest";
import { ARITMETICA, ABSURDOS, CONHECIMENTO, ESPACIAL } from "./bancos-texto";
import { dentroDe, gerarCondicoes, pontoQueSatisfaz, satisfaz, MARGEM, distanciaComSinal } from "./condicoes";

describe("bancos de texto do dojo", () => {
  for (const [nome, banco] of Object.entries({ ARITMETICA, ABSURDOS, CONHECIMENTO, ESPACIAL })) {
    it(`${nome}: ids únicos, 4 opções distintas, resposta válida, explicação com ≥ 30 caracteres`, () => {
      const ids = new Set(banco.map((i) => i.id));
      expect(ids.size).toBe(banco.length);
      for (const i of banco) {
        expect(i.opcoes).toHaveLength(4);
        expect(new Set(i.opcoes).size).toBe(4);
        expect(i.resposta).toBeGreaterThanOrEqual(0);
        expect(i.resposta).toBeLessThan(4);
        expect(i.explicacao.length).toBeGreaterThanOrEqual(30);
        expect(i.enunciado.length).toBeGreaterThan(15);
      }
    });
  }
  it("aritmética: respostas conferidas por cálculo independente", () => {
    const esperado: Record<string, string> = {
      ar01: "30", ar02: "R$ 80", ar03: "12", ar04: "120 km/h", ar05: "24", ar06: "16", ar07: "2 h", ar08: "47",
      ar09: "R$ 117,30", ar10: "36 min", ar11: "20", ar12: "21%", ar13: "Sexta-feira", ar14: "20", ar15: "Segundo",
      ar16: "R$ 105", ar17: "12", ar18: "90",
    };
    for (const i of ARITMETICA) expect(i.opcoes[i.resposta], i.id).toBe(esperado[i.id]);
  });
  it("espacial: respostas conferidas", () => {
    const esperado: Record<string, string> = { es01: "Oeste", es02: "12", es03: "75°", es04: "4", es05: "5 km", es06: "à sua esquerda", es07: "7h40", es08: "Um triângulo menor", es09: "Oeste", es10: "27" };
    for (const i of ESPACIAL) expect(i.opcoes[i.resposta], i.id).toBe(esperado[i.id]);
  });
});

describe("condições (topologia)", () => {
  it("geometria: dentro/fora do círculo, quadrado e triângulo", () => {
    const f = { circulo: { cx: 50, cy: 50, r: 20 }, quadrado: { x: 10, y: 10, lado: 30 }, triangulo: { cx: 70, cy: 70, lado: 30 } };
    expect(dentroDe(f, "circulo", 50, 50)).toBe(true);
    expect(dentroDe(f, "circulo", 90, 50)).toBe(false);
    expect(dentroDe(f, "quadrado", 20, 20)).toBe(true);
    expect(dentroDe(f, "quadrado", 45, 20)).toBe(false);
    expect(dentroDe(f, "triangulo", 70, 72)).toBe(true);
    expect(dentroDe(f, "triangulo", 70, 40)).toBe(false);
  });
  it("cada item tem exatamente uma figura que satisfaz a condição, e o ponto indicado satisfaz", () => {
    for (const seed of [0, 1, 2, 3, 7, 42, 999]) {
      for (const it of gerarCondicoes(seed, 6)) {
        // só a certa tem ponto com folga; as erradas não têm ponto nem na borda
        const comFolga = it.opcoes.map((f) => pontoQueSatisfaz(f, it.condicao, MARGEM) !== null);
        const naBorda = it.opcoes.map((f) => pontoQueSatisfaz(f, it.condicao, 0) !== null);
        expect(comFolga.filter(Boolean)).toHaveLength(1);
        expect(naBorda.filter(Boolean)).toHaveLength(1);
        expect(comFolga[it.resposta]).toBe(true);
        expect(satisfaz(it.opcoes[it.resposta], it.condicao, it.ponto.x, it.ponto.y, MARGEM)).toBe(true);
        expect(distanciaComSinal(it.opcoes[it.resposta], "circulo", it.ponto.x, it.ponto.y)).not.toBeNaN();
        expect(it.opcoes).toHaveLength(5);
        expect(it.motivos.filter((m) => m).length).toBe(4);
        expect(it.enunciado).toMatch(/dentro|fora/);
      }
    }
  });
  it("sementes diferentes dão itens diferentes; a mesma, o mesmo", () => {
    const a = JSON.stringify(gerarCondicoes(5, 3));
    expect(JSON.stringify(gerarCondicoes(5, 3))).toBe(a);
    expect(JSON.stringify(gerarCondicoes(6, 3))).not.toBe(a);
  });
});
