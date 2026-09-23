import { describe, expect, it } from "vitest";
import { FAMILIAS_AVANCADAS, gerarBancoAvancado, type ItemAvancado } from "./banco-avancado";
import { assinaturaItem, dominioDe, rodada } from "./exames";
import { conferirMemoria } from "../simulador/memoria";
import { gerarMemoriaSB5 } from "./memoria-sb5";
import { blocos, blocoFechado, type ResultadoBloco } from "../simulador";
import { pontosPorMinuto } from "../simulador/velocidade";
import { advancedMatrixItems } from "../battery/advanced-matrices";

const bancos = (seed: number) => (["quantitativo", "espacial", "logica"] as const).flatMap((a) => gerarBancoAvancado(seed, a));

/** Oráculos por enumeração/conservação, separados da construção dos distratores. */
function confere(q: ItemAvancado, alternativa: string): boolean {
  const [a, b] = q.dados;
  const v = Number(alternativa);
  switch (q.familia) {
    case "taxas": return Math.abs(v / (10 * a) + v / (15 * a) - 1) < 1e-10;
    case "mistura": return v >= 0 && v <= 4 * a && Math.abs(v * 10 + (4 * a - v) * 50 - 4 * a * b) < 1e-10;
    case "combinacoes": {
      let n = 0;
      for (let i = 0; i < a + b; i++) for (let j = i + 1; j < a + b; j++) for (let k = j + 1; k < a + b; k++) if ([i, j, k].filter((x) => x < a).length === 2) n++;
      return v === n;
    }
    case "media": {
      const valores = [...Array(a).fill(b), b + a + 2, b + a + 2];
      return Math.abs(valores.reduce((n, x) => n + (x - v), 0)) < 1e-10;
    }
    case "restos": return Number.isInteger(v) && v >= 0 && v <= 76 && v % 7 === a && v % 11 === b;
    case "desconto": {
      const aumentado = 100 * a + a * b;
      return Math.abs(v + aumentado * b / 100 - aumentado) < 1e-10;
    }
    case "sistema": return v + (a + b - v) === a + b && 2 * v + 3 * (a + b - v) === 2 * a + 3 * b;
    case "probabilidade": {
      let total = 0, favoraveis = 0;
      for (let i = 0; i < a + b; i++) for (let j = 0; j < a + b; j++) if (i !== j) { total++; if (i < a && j < a) favoraveis++; }
      const [num, den = 1] = alternativa.split("/").map(Number);
      return num * total === den * favoraveis;
    }
    case "cubo-faces": case "cubo-arestas": {
      let n = 0;
      for (let x = 0; x < a; x++) for (let y = 0; y < a; y++) for (let z = 0; z < a; z++) {
        const pintadas = [x, y, z].filter((c) => c === 0 || c === a - 1).length;
        if (pintadas === (q.familia === "cubo-faces" ? 1 : 2)) n++;
      }
      return v === n;
    }
    case "rotacao": {
      const [x, y] = alternativa.replace(/[()]/g, "").split(",").map(Number);
      // Desfaz a reflexão e depois a rotação para recuperar o ponto original.
      return -y === a && -x === b;
    }
    case "percurso": {
      const desloc = [[0, a], [b, 0], [0, -a - 2]].reduce(([x, y], [dx, dy]) => [x + dx, y + dy], [0, 0]);
      return alternativa === `${desloc[0]} m a leste e ${-desloc[1]} m ao sul`;
    }
    case "condicional": {
      const modelos = [false, true].flatMap((p) => [false, true].map((q) => ({ p, q }))).filter(({ p, q }) => (!p || q) && !q);
      return modelos.every(({ p }) => !p) && alternativa === `O sensor ${a} não está ativo`;
    }
    case "exclusiva": {
      const modelos = [false, true].filter((q) => Number(true) + Number(q) === 1);
      return modelos.every((q) => !q) && alternativa === `B não contém ${b} peças`;
    }
    case "negacao": return alternativa === `Pelo menos um cartão tem número menor ou igual a ${a}`;
    case "ordem": return alternativa === "C";
    default: throw new Error(q.familia);
  }
}

describe("banco autoral ampliado", () => {
  it("16 famílias, 192 instâncias distintas por banco; chave única conferida em 32 sementes", () => {
    for (let seed = 0; seed < 32; seed++) {
      const qs = bancos(seed);
      expect(qs).toHaveLength(192);
      expect(new Set(qs.map((q) => q.familia)).size).toBe(FAMILIAS_AVANCADAS.length);
      expect(new Set(qs.map((q) => q.enunciado)).size).toBe(qs.length);
      expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);
      for (const q of qs) {
        expect(q.opcoes).toHaveLength(4);
        expect(new Set(q.opcoes).size).toBe(4);
        const aprovadas = q.opcoes.map((op, i) => confere(q, op) ? i : -1).filter((i) => i >= 0);
        expect(aprovadas, q.id).toEqual([q.resposta]);
      }
    }
  });
  it("semente fixa reproduz dados; novas sementes mudam enunciados, não apenas alternativas", () => {
    expect(bancos(81)).toEqual(bancos(81));
    const a = new Set(bancos(81).map((q) => q.enunciado));
    expect(bancos(82).filter((q) => !a.has(q.enunciado)).length).toBeGreaterThan(100);
  });
  it("a prioridade de inéditos funciona mesmo com a mesma semente, sem duplicatas na rodada", () => {
    const a = rodada("stanford-binet", 17, 10, "aritmetica");
    const b = rodada("stanford-binet", 17, 10, "aritmetica", a.map(assinaturaItem));
    expect(b).toHaveLength(10);
    const vistos = new Set(a.map(assinaturaItem));
    expect(b.filter((q) => vistos.has(assinaturaItem(q)))).toHaveLength(0);
    expect(new Set(b.map(assinaturaItem)).size).toBe(10);
  });
  it("desafio exclusivo tem dez itens extremos; os blocos amostram mais modelos", () => {
    const ids = new Set<string>();
    for (let s = 0; s < 20; s++) {
      const r = dominioDe("stanford-binet", "matrizes-teto")!.gerar(s, 10);
      expect(r).toHaveLength(10);
      expect(r.every((q) => q.tipo === "figural" && q.item.difficulty === "extrema")).toBe(true);
      for (const i of blocos(s)[0].raciocinio) ids.add(i.id);
    }
    expect(ids.size).toBeGreaterThan(8);
  });
  it("resolve os 500 itens extremos por regras inferidas das células visíveis", () => {
    const iguais = (a: string[], b: string[]) => [...a].sort().join("|") === [...b].sort().join("|");
    for (let seed = 0; seed < 100; seed++) for (const q of advancedMatrixItems(seed).filter((q) => q.difficulty === "extrema")) {
      const g = q.grid!;
      const contorno = new Set(g[0].map((c) => c.outer));
      for (const c of g[2].slice(0, 2)) contorno.delete(c.outer);
      expect(contorno.size).toBe(1);
      const externo = [...contorno][0];
      let aceita: (c: NonNullable<typeof q.options>[number]) => boolean;
      if (q.kind === "triad") {
        const fills = new Set(g[0].map((c) => c.outerFill));
        for (const c of g[2].slice(0, 2)) fills.delete(c.outerFill);
        expect(fills.size).toBe(1);
        const fill = [...fills][0];
        const count = (g[2][0].count ?? 1) + (g[2][1].count ?? 1);
        aceita = (c) => c.outer === externo && c.outerFill === fill && c.count === count && iguais(c.marks, g[0][2].marks);
      } else {
        // Inferir AND/OR/XOR dos exemplos completos, sem ler o rótulo da chave.
        const operadores = [(x: boolean, y: boolean) => x && y, (x: boolean, y: boolean) => x || y, (x: boolean, y: boolean) => x !== y];
        const aplicar = (r: number, op: typeof operadores[number]) => [...new Set([...g[r][0].marks, ...g[r][1].marks])].filter((m) => op(g[r][0].marks.includes(m), g[r][1].marks.includes(m)));
        const validos = operadores.filter((op) => [0, 1].every((r) => iguais(aplicar(r, op), g[r][2].marks)));
        expect(validos).toHaveLength(1);
        aceita = (c) => c.outer === externo && iguais(c.marks, aplicar(2, validos[0]));
      }
      expect(q.options!.map((c, i) => aceita(c) ? i : -1).filter((i) => i >= 0)).toEqual([q.answerIndex]);
    }
  });
});

describe("novos protocolos de memória e tempo", () => {
  it("palavras finais e trajetos têm respostas verificadas, com variação real", () => {
    for (let seed = 0; seed < 50; seed++) {
      const qs = gerarMemoriaSB5(seed, 10);
      expect(qs).toEqual(gerarMemoriaSB5(seed, 10));
      for (const q of qs) {
        const esperada = q.formato === "ultima-palavra" ? q.estimulos!.map((s) => s.split(" ").at(-1)).join(" ") : q.sequencia.join("");
        expect(conferirMemoria(q, esperada.toLowerCase())).toBe(true);
        expect(conferirMemoria(q, "resposta incorreta")).toBe(false);
        if (q.formato === "posicoes") expect(q.sequencia.every((x) => /^[1-9]$/.test(x))).toBe(true);
        expect(q.intervaloMs).toBe(q.formato === "ultima-palavra" ? 4000 : 1000);
      }
    }
  });
  it("metas de velocidade usam duração; registros legados continuam com 60 s", () => {
    const r: ResultadoBloco = { nivel: 1, verbal: { acertos: 8, total: 8 }, memoria: { acertos: 6, total: 6 }, raciocinio: { acertos: 4, total: 4 }, velocidade: { acertos: 30, erros: 8, pontos: 22, respondidos: 38, rtMedio: 700 } };
    expect(blocoFechado(r)).toBe(true);
    const longo = { ...r, velocidade: { ...r.velocidade, duracaoSegundos: 120 } };
    expect(pontosPorMinuto(longo.velocidade)).toBe(11);
    expect(blocoFechado(longo)).toBe(false);
    expect(blocoFechado({ ...longo, velocidade: { ...longo.velocidade, pontos: 44 } })).toBe(true);
  });
});
