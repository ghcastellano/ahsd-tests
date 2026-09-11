import { describe, it, expect } from "vitest";
import { ITENS_VERBAIS, itensVerbais, bancoVerbal, POR_FORMATO } from "./verbal";
import { AMPLITUDES, conferirMemoria, gerarItensMemoria, normalizar } from "./memoria";
import { CONFIG, gerarTrials, pontuarVelocidade } from "./velocidade";
import { blocos, blocoFechado, pontuarSimulador, CORTES, type ResultadoBloco } from "./index";

describe("simulador — verbal", () => {
  it("banco de 60 (20 por nível: 8 vocabulário, 6 semelhanças, 6 analogias), ids únicos, chaves válidas", () => {
    expect(ITENS_VERBAIS).toHaveLength(60);
    expect(new Set(ITENS_VERBAIS.map((i) => i.id)).size).toBe(60);
    for (const n of [1, 2, 3] as const) {
      const banco = bancoVerbal(n);
      expect(banco).toHaveLength(20);
      expect(banco.filter((i) => i.formato === "vocabulario")).toHaveLength(8);
      expect(banco.filter((i) => i.formato === "semelhancas")).toHaveLength(6);
      expect(banco.filter((i) => i.formato === "analogia")).toHaveLength(6);
      expect(itensVerbais(n)).toHaveLength(8);
    }
    for (const i of ITENS_VERBAIS) {
      expect(i.resposta).toBeGreaterThanOrEqual(0);
      expect(i.resposta).toBeLessThan(i.opcoes.length);
      expect(new Set(i.opcoes).size).toBe(i.opcoes.length);
      expect(i.explicacao.length).toBeGreaterThan(5);
    }
  });
  it("cada tentativa amostra 3 vocabulário + 2 semelhanças + 3 analogias; sementes diferentes trazem itens diferentes", () => {
    for (const n of [1, 2, 3] as const) {
      const a = itensVerbais(n, 11), b = itensVerbais(n, 11), c = itensVerbais(n, 12);
      expect(a.map((i) => i.id)).toEqual(b.map((i) => i.id));
      expect(a.map((i) => i.id)).not.toEqual(c.map((i) => i.id));
      expect(new Set(a.map((i) => i.id)).size).toBe(8);
      for (const fmt of Object.keys(POR_FORMATO) as (keyof typeof POR_FORMATO)[]) {
        expect(a.filter((i) => i.formato === fmt)).toHaveLength(POR_FORMATO[fmt]);
      }
    }
    // dez sementes cobrem bem mais que 8 itens do nível 1
    const vistos = new Set<string>();
    for (let s = 1; s <= 10; s++) for (const i of itensVerbais(1, s)) vistos.add(i.id);
    expect(vistos.size).toBeGreaterThan(14);
  });
  it("blocos variam com a semente: verbal e matrizes diferentes, mesma estrutura", () => {
    const a = blocos(1), b = blocos(2);
    expect(a[0].verbal.map((i) => i.id)).not.toEqual(b[0].verbal.map((i) => i.id));
    expect(JSON.stringify(a[0].raciocinio)).not.toBe(JSON.stringify(b[0].raciocinio));
    expect(b[0].raciocinio.map((i) => i.difficulty)).toEqual(a[0].raciocinio.map((i) => i.difficulty));
  });
});

describe("simulador — memória operacional", () => {
  it("amplitudes crescem com o nível e as sequências são determinísticas", () => {
    for (const n of [1, 2, 3] as const) {
      const itens = gerarItensMemoria(n, 42);
      expect(itens).toEqual(gerarItensMemoria(n, 42));
      const [dir, inv, ln] = AMPLITUDES[n];
      expect(itens.filter((i) => i.formato === "direta").map((i) => i.sequencia.length)).toEqual(dir);
      expect(itens.filter((i) => i.formato === "inversa").map((i) => i.sequencia.length)).toEqual(inv);
      expect(itens.filter((i) => i.formato === "letras-numeros").map((i) => i.sequencia.length)).toEqual(ln);
    }
    expect(Math.max(...AMPLITUDES[3][0])).toBeGreaterThan(Math.max(...AMPLITUDES[1][0]));
  });
  it("sem dígitos repetidos na sequência nem escadas (1-2-3)", () => {
    for (const n of [1, 2, 3] as const) for (const seed of [1, 2, 3, 4, 5]) {
      for (const it of gerarItensMemoria(n, seed)) {
        if (it.formato === "letras-numeros") continue;
        const s = it.sequencia.map(Number);
        expect(new Set(s).size).toBe(s.length);
        for (let k = 2; k < s.length; k++) expect(s[k] - s[k - 1] === s[k - 1] - s[k - 2] && Math.abs(s[k] - s[k - 1]) === 1).toBe(false);
      }
    }
  });
  it("confere a resposta: direta, inversa e letras-números (números crescentes, depois letras)", () => {
    const itens = gerarItensMemoria(1, 7);
    const d = itens.find((i) => i.formato === "direta")!;
    expect(conferirMemoria(d, d.sequencia.join(" "))).toBe(true);
    expect(conferirMemoria(d, [...d.sequencia].reverse().join(""))).toBe(d.sequencia.join("") === [...d.sequencia].reverse().join(""));
    const inv = itens.find((i) => i.formato === "inversa")!;
    expect(conferirMemoria(inv, [...inv.sequencia].reverse().join("-"))).toBe(true);
    const ln = itens.find((i) => i.formato === "letras-numeros")!;
    const nums = ln.sequencia.filter((x) => /\d/.test(x)).map(Number).sort((a, b) => a - b).join("");
    const letras = ln.sequencia.filter((x) => /[A-Z]/.test(x)).sort().join("");
    expect(conferirMemoria(ln, `${nums} ${letras.toLowerCase()}`)).toBe(true);
    expect(normalizar(" 3, 1 - b ")).toBe("31B");
  });
});

describe("simulador — velocidade", () => {
  it("trials determinísticos, com o número de candidatos do nível, e 'presente' coerente", () => {
    for (const n of [1, 2, 3] as const) {
      const t = gerarTrials(n, 9, 40);
      expect(t).toEqual(gerarTrials(n, 9, 40));
      expect(t.every((x) => x.candidatos.length === CONFIG[n].candidatos)).toBe(true);
      const igual = (a: typeof t[0]["alvos"][0], b: typeof t[0]["alvos"][0]) => a.marks.join() === b.marks.join() && (a.rotation ?? 0) === (b.rotation ?? 0) && (a.innerFill ?? "solid") === (b.innerFill ?? "solid");
      for (const x of t) expect(x.candidatos.some((c) => x.alvos.some((a) => igual(a, c)))).toBe(x.presente);
      const presentes = t.filter((x) => x.presente).length;
      expect(presentes).toBeGreaterThan(8); expect(presentes).toBeLessThan(32); // ~50%
    }
  });
  it("pontua acertos − erros, nunca negativo", () => {
    expect(pontuarVelocidade([{ presente: true, disse: true, rt: 800 }, { presente: false, disse: false, rt: 700 }]).pontos).toBe(2);
    const m = pontuarVelocidade([{ presente: true, disse: false, rt: 500 }, { presente: false, disse: true, rt: 500 }, { presente: true, disse: true, rt: 500 }]);
    expect(m.acertos).toBe(1); expect(m.erros).toBe(2); expect(m.pontos).toBe(0); expect(m.rtMedio).toBe(500);
  });
});

describe("simulador — blocos e pontuação", () => {
  const b = blocos();
  it("três blocos crescentes: 130/133/149 com DP 15/16/24 e 8 verbais + 4 matrizes cada", () => {
    expect(b.map((x) => x.qiAlvo)).toEqual([130, 133, 149]);
    expect(b.map((x) => x.dp)).toEqual([15, 16, 24]);
    for (const x of b) { expect(x.verbal).toHaveLength(8); expect(x.raciocinio).toHaveLength(4); }
    // Nenhum bloco usa matrizes de nível médio: "130" já é o 2% superior.
    expect(b[0].raciocinio.every((i) => i.difficulty === "dificil")).toBe(true);
    expect(b[1].raciocinio.every((i) => i.difficulty === "dificil")).toBe(true);
    expect(b[2].raciocinio.every((i) => i.difficulty === "extrema")).toBe(true);
    expect(new Set([...b[0].raciocinio, ...b[1].raciocinio].map((i) => i.id)).size).toBe(8);
  });
  const r = (nivel: 1 | 2 | 3, ok: boolean): ResultadoBloco => ({
    nivel,
    verbal: { acertos: ok ? 7 : 3, total: 8 },
    memoria: { acertos: ok ? 5 : 2, total: 6 },
    velocidade: { respondidos: 30, acertos: ok ? 28 : 12, erros: ok ? 2 : 18, pontos: ok ? 26 : 0, rtMedio: 900 },
    raciocinio: { acertos: ok ? 3 : 1, total: 4 },
  });
  it("cortes sobem por bloco (precisão 70/75/80%, velocidade 18/22/26)", () => {
    expect(CORTES[1]).toEqual({ precisao: 0.7, velocidade: 18 });
    expect(CORTES[3].precisao).toBeGreaterThan(CORTES[1].precisao);
    expect(CORTES[3].velocidade).toBeGreaterThan(CORTES[1].velocidade);
    expect(blocoFechado(r(1, true))).toBe(true);
    expect(blocoFechado(r(1, false))).toBe(false);
    expect(blocoFechado({ ...r(1, true), velocidade: { ...r(1, true).velocidade, pontos: 17 } })).toBe(false);
    expect(blocoFechado({ ...r(3, true), velocidade: { ...r(3, true).velocidade, pontos: 25 } })).toBe(false);
    // 7/8 + 5/6 + 3/4 = 0,82 de precisão média: fecha o 3 com ≥26 pontos.
    expect(blocoFechado(r(3, true))).toBe(true);
  });
  it("amplitude de memória do nível 1 já está acima da média adulta (≥7 na direta)", () => {
    expect(Math.min(...AMPLITUDES[1][0])).toBeGreaterThanOrEqual(7);
    expect(Math.min(...AMPLITUDES[1][1])).toBeGreaterThanOrEqual(5);
  });
  it("bloco alcançado exige blocos consecutivos; faixa e domínios agregados", () => {
    expect(pontuarSimulador([r(1, true), r(2, true), r(3, true)]).blocoAlcancado).toBe(3);
    expect(pontuarSimulador([r(1, true), r(2, false), r(3, true)]).blocoAlcancado).toBe(1);
    expect(pontuarSimulador([r(1, false)]).faixa.label).toBe("Nenhum bloco fechado");
    const res = pontuarSimulador([r(1, true), r(2, true)]);
    expect(res.faixa.label).toContain("Stanford-Binet");
    expect(res.porDominio.verbal).toEqual({ acertos: 14, total: 16, pct: 88 });
    expect(res.porDominio.velocidade.total).toBe(60);
    expect(res.velocidadePontos).toBe(52);
    expect(pontuarSimulador([]).blocoAlcancado).toBe(0);
  });
});
