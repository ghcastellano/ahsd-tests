import { describe, it, expect } from "vitest";
import { gerarSequencia, pontuar, faixaComissao, faixaVariabilidade, N_PRINCIPAL, PROPORCAO_NOGO, RT_MINIMO_MS, type Resposta } from "./go-nogo";

describe("Go/NoGo — sequência", () => {
  it("tem a proporção de NoGo pedida, é determinística e nunca traz três NoGo seguidos", () => {
    const a = gerarSequencia(N_PRINCIPAL, 42);
    const b = gerarSequencia(N_PRINCIPAL, 42);
    expect(a).toEqual(b);
    expect(a.filter((e) => e.tipo === "nogo")).toHaveLength(Math.round(N_PRINCIPAL * PROPORCAO_NOGO));
    for (let i = 2; i < a.length; i++) {
      expect(a[i].tipo === "nogo" && a[i - 1].tipo === "nogo" && a[i - 2].tipo === "nogo").toBe(false);
    }
    expect(a.every((e) => (e.tipo === "nogo") === (e.letra === "X"))).toBe(true);
    expect(gerarSequencia(N_PRINCIPAL, 7)).not.toEqual(a);
  });
});

describe("Go/NoGo — métricas", () => {
  const seq = gerarSequencia(40, 1);
  it("desempenho perfeito: 0 comissões, 0 omissões, CV 0", () => {
    const r: Resposta[] = seq.map((e) => ({ tipo: e.tipo, rt: e.tipo === "go" ? 400 : null }));
    const m = pontuar(r);
    expect(m.comissoes).toBe(0);
    expect(m.omissoes).toBe(0);
    expect(m.taxaComissao).toBe(0);
    expect(m.rtMedio).toBe(400);
    expect(m.rtDesvio).toBe(0);
    expect(m.rtCv).toBe(0);
    expect(m.dPrime).toBeGreaterThan(2);
    expect(faixaComissao(m.taxaComissao).label).toBe("Freio dentro do esperado");
  });
  it("responder a tudo: 100% de comissão, d' ≈ 0", () => {
    const r: Resposta[] = seq.map((e) => ({ tipo: e.tipo, rt: 350 }));
    const m = pontuar(r);
    expect(m.taxaComissao).toBe(100);
    expect(m.omissoes).toBe(0);
    expect(Math.abs(m.dPrime)).toBeLessThan(0.5);
    expect(faixaComissao(m.taxaComissao).severity).toBe("high");
  });
  it("não responder a nada: 100% de omissão, 0 comissão", () => {
    const m = pontuar(seq.map((e) => ({ tipo: e.tipo, rt: null })));
    expect(m.taxaOmissao).toBe(100);
    expect(m.comissoes).toBe(0);
    expect(m.rtMedio).toBe(0);
  });
  it("antecipações (< 150 ms) não contam como acerto nem entram no TR", () => {
    const r: Resposta[] = seq.map((e, i) => ({ tipo: e.tipo, rt: e.tipo === "go" ? (i % 2 ? 100 : 400) : null }));
    const m = pontuar(r);
    expect(m.antecipacoes).toBeGreaterThan(0);
    expect(m.rtMedio).toBe(400);
    expect(m.acertosGo + m.antecipacoes + m.omissoes).toBe(m.nGo);
  });
  it("variabilidade: TR alternando 300/700 dá CV alto", () => {
    let k = 0;
    const r: Resposta[] = seq.map((e) => ({ tipo: e.tipo, rt: e.tipo === "go" ? (k++ % 2 ? 300 : 700) : null }));
    const m = pontuar(r);
    expect(m.rtMedio).toBe(500);
    expect(m.rtCv).toBeGreaterThan(0.3);
    expect(faixaVariabilidade(m.rtCv).label).toBe("Ritmo irregular");
    expect(faixaVariabilidade(0.1).label).toBe("Ritmo estável");
  });
  it("limiares das faixas de comissão", () => {
    expect(faixaComissao(9.99).severity).toBe("none");
    expect(faixaComissao(10).severity).toBe("low");
    expect(faixaComissao(25).severity).toBe("moderate");
    expect(faixaComissao(40).severity).toBe("high");
    expect(RT_MINIMO_MS).toBe(150);
  });
});
