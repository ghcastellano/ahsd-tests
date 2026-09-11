import { it } from "vitest";
import { writeFileSync } from "node:fs";
import { itemsForSeed, optionsFor } from "../../lib/matrix/engine";
import { tests as TESTS } from "../../lib/battery";

// Gera scripts/e2e/variacao-esperado.json: para duas sementes, o índice da
// alternativa correta de cada item do /teste-qi e de cada treino da bateria.
// O roteiro verifica-variacao.mjs abre cada prova com ?seed=, confere que as
// provas das duas sementes são diferentes e que jogar perfeito dá nota máxima.
it("gera variacao-esperado.json", () => {
  const SEEDS = [11, 4242];
  const out: Record<string, Record<string, number[]>> = {};
  for (const seed of SEEDS) {
    const its = itemsForSeed(seed);
    out[String(seed)] = { "teste-qi": its.map((it) => optionsFor(it, seed).answerIndex) };
    for (const t of TESTS) out[String(seed)][t.id] = t.items(seed).map((i) => i.answerIndex);
  }
  writeFileSync(new URL("./variacao-esperado.json", import.meta.url), JSON.stringify(out));
});
