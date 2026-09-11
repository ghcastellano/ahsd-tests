import { it } from "vitest";
import { writeFileSync } from "node:fs";
import { instruments } from "../../lib/instruments";
import { optionsFor } from "../../lib/scoring";
import type { Responses } from "../../lib/types";

// Gera scripts/e2e/esperados.json: para cada instrumento, o índice da
// alternativa a clicar em cada questão (três padrões) e o resultado que a
// função pura calcula. O roteiro verifica-todos.mjs responde no navegador
// e confere que a tela mostra o mesmo número e a mesma faixa.
//
// Uso: npx vitest run scripts/e2e && BASE_URL=http://localhost:3111 node scripts/e2e/verifica-todos.mjs
it("gera esperados.json", () => {
  const out = instruments.map((inst) => {
    const padroes: Record<string, { indices: number[]; total: number; max: number; faixa: string; positivo?: boolean; media?: boolean; semNumero?: boolean }> = {};
    const semSentinela = (vals: number[]) => vals;
    const escolhas: Record<string, (vals: number[]) => number> = {
      minimo: (vals) => vals.indexOf(Math.min(...semSentinela(vals))),
      maximo: (vals) => vals.indexOf(Math.max(...vals)),
      meio: (vals) => { const v = semSentinela(vals); return vals.indexOf(v[Math.floor(v.length / 2)]); },
    };
    for (const [nome, fn] of Object.entries(escolhas)) {
      const r: Responses = {}; const indices: number[] = [];
      for (const q of inst.questions) {
        const opts = optionsFor(q, inst.defaultOptions); const idx = fn(opts.map((o) => o.value));
        indices.push(idx); r[q.id] = opts[idx].value;
      }
      const res = inst.score(r);
      padroes[nome] = { indices, total: res.totalScore, max: res.maxScore, faixa: res.band.label, positivo: res.positive, media: res.metricIsMean, semNumero: res.hideScore };
    }
    return { id: inst.id, acronym: inst.acronym, n: inst.questions.length, padroes };
  });
  writeFileSync(new URL("./esperados.json", import.meta.url), JSON.stringify(out));
});
