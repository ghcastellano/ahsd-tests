import { describe, it, expect } from "vitest";
import { EXAMES, exame, rodada, embaralharTexto } from "./exames";
import { mulberry32 } from "../battery/rng";
import { carregar, dominioMaisFraco, planoDoDia, registrar, sequencia, vazio } from "./progresso";

describe("exames do dojo", () => {
  it("quatro exames com domínios, estrutura, cortes e dicas", () => {
    expect(EXAMES.map((e) => e.id)).toEqual(["mensa", "wechsler", "stanford-binet", "cattell"]);
    for (const e of EXAMES) {
      expect(e.dominios.length).toBeGreaterThanOrEqual(4);
      expect(e.estrutura.length).toBeGreaterThanOrEqual(3);
      expect(e.dicas.length).toBeGreaterThanOrEqual(3);
      expect(e.porQueDificil.length).toBeGreaterThanOrEqual(3);
      expect(e.corte).toMatch(/Percentil 98/);
      for (const d of e.dominios) {
        expect(d.porQueDificil.length).toBeGreaterThan(40);
        expect(d.dica.length).toBeGreaterThan(40);
      }
    }
  });
  it("afirma corretamente os desvios-padrão (SB5 = 15; SB-IV = 16; Cattell = 24)", () => {
    expect(exame("stanford-binet")!.oQueE).toMatch(/desvio-padrão 15/);
    expect(exame("stanford-binet")!.oQueE).toMatch(/SB-IV.*16/);
    expect(exame("cattell")!.oQueE).toMatch(/24/);
    expect(exame("wechsler")!.oQueE).toMatch(/Não é o teste da Mensa/);
  });
  it("cada domínio gera itens válidos e reproduzíveis por semente", () => {
    for (const e of EXAMES) {
      for (const d of e.dominios) {
        const a = d.gerar(7, 4);
        const b = d.gerar(7, 4);
        expect(a.length, `${e.id}/${d.id}`).toBeGreaterThanOrEqual(3);
        expect(JSON.stringify(a)).toBe(JSON.stringify(b));
        expect(JSON.stringify(d.gerar(8, 4))).not.toBe(JSON.stringify(a));
        for (const it of a) {
          expect(it.dominio).toBe(d.id);
          if (it.tipo === "texto") {
            expect(it.item.opcoes[it.item.resposta]).toBeDefined();
            expect(it.item.explicacao.length).toBeGreaterThan(20);
          }
          if (it.tipo === "figural") expect(it.item.explanation.length).toBeGreaterThan(20);
          if (it.tipo === "matriz") { expect(it.regras.length).toBeGreaterThan(0); expect(it.options[it.answerIndex]).toBeDefined(); }
          if (it.tipo === "condicao") expect(it.item.opcoes[it.item.resposta]).toBeDefined();
          if (it.tipo === "memoria") expect(it.item.sequencia.length).toBeGreaterThan(3);
        }
      }
    }
  });
  it("rodada intercala domínios e devolve n itens", () => {
    for (const e of EXAMES) {
      const r = rodada(e.id, 3, 10);
      expect(r).toHaveLength(10);
      expect(new Set(r.map((i) => i.dominio)).size).toBeGreaterThanOrEqual(Math.min(3, e.dominios.length));
      expect(JSON.stringify(rodada(e.id, 3, 10))).toBe(JSON.stringify(r));
    }
    const so = rodada("cattell", 1, 6, "condicoes");
    expect(so).toHaveLength(6);
    expect(so.every((i) => i.dominio === "condicoes")).toBe(true);
    expect(rodada("inexistente", 1, 5)).toEqual([]);
  });
  it("embaralharTexto preserva a resposta correta", () => {
    const it = { id: "x", enunciado: "?", opcoes: ["a", "b", "c", "d"], resposta: 2, explicacao: "…" };
    const rand = mulberry32(5);
    const e = embaralharTexto(it, rand);
    expect(e.opcoes[e.resposta]).toBe("c");
    expect([...e.opcoes].sort()).toEqual(["a", "b", "c", "d"]);
  });
  it("itens de texto de uma rodada não têm a resposta sempre na mesma posição", () => {
    const posicoes = new Set<number>();
    for (const seed of [1, 2, 3, 4, 5, 6]) for (const it of rodada("wechsler", seed, 10)) if (it.tipo === "texto") posicoes.add(it.item.resposta);
    expect(posicoes.size).toBeGreaterThanOrEqual(3);
  });
});

describe("progresso do dojo", () => {
  it("registra tentativas, acertos, erros e dias; sequência de dias seguidos", () => {
    let p = vazio();
    p = registrar(p, [{ dominio: "matrizes", acertou: true, regra: "A forma…" }, { dominio: "matrizes", acertou: false, regra: "XOR: fica…" }], "2026-09-14");
    p = registrar(p, [{ dominio: "condicoes", acertou: false, regra: "dentro do círculo" }], "2026-09-15");
    p = registrar(p, [{ dominio: "matrizes", acertou: true, regra: "…" }], "2026-09-16");
    expect(p.dominios.matrizes).toEqual({ tentativas: 3, acertos: 2 });
    expect(p.erros).toHaveLength(2);
    expect(p.dias).toEqual(["2026-09-14", "2026-09-15", "2026-09-16"]);
    expect(sequencia(p.dias, "2026-09-16")).toBe(3);
    expect(sequencia(p.dias, "2026-09-17")).toBe(3); // ainda não praticou hoje: conta até ontem
    expect(sequencia(p.dias, "2026-09-19")).toBe(0);
    expect(sequencia([], "2026-09-16")).toBe(0);
  });
  it("plano do dia aponta o domínio mais fraco e as regras erradas", () => {
    const ex = exame("cattell")!;
    let p = vazio();
    expect(dominioMaisFraco(p, ex)).toBeNull();
    expect(planoDoDia(p, ex, "2026-09-16")).toHaveLength(3);
    for (let i = 0; i < 4; i++) p = registrar(p, [{ dominio: "condicoes", acertou: i === 0, regra: "dentro do círculo e fora do quadrado" }, { dominio: "series-figuras", acertou: true, regra: "gira 45°" }], "2026-09-16");
    const fraco = dominioMaisFraco(p, ex)!;
    expect(fraco.id).toBe("condicoes");
    const plano = planoDoDia(p, ex, "2026-09-16");
    expect(plano[0]).toMatch(/Condições/);
    expect(plano[1]).toMatch(/dentro do círculo/);
  });
  it("carregar sem window devolve vazio", () => {
    expect(carregar()).toEqual(vazio());
  });
});
