import { it } from "vitest";
import { writeFileSync } from "node:fs";
import { blocos } from "../../lib/simulador";
import { gerarItensMemoria } from "../../lib/simulador/memoria";
import { gerarTrials } from "../../lib/simulador/velocidade";

// Gera scripts/e2e/simulador-esperado.json para a semente 12345: respostas
// verbais, sequências de memória (com a resposta), presença nos trials de
// velocidade e índice correto das matrizes, bloco a bloco. O roteiro
// verifica-simulador.mjs abre /treino/simulador?seed=12345 e joga perfeito.
it("gera simulador-esperado.json", () => {
  const SEED = 12345;
  const out = blocos().map((b, idx) => ({
    nivel: b.nivel,
    verbal: b.verbal.map((q) => ({ id: q.id, resposta: q.resposta })),
    memoria: gerarItensMemoria(b.nivel, SEED + idx).map((m) => ({ formato: m.formato, sequencia: m.sequencia, resposta: m.resposta })),
    velocidade: gerarTrials(b.nivel, SEED + idx * 3, 80).map((t) => t.presente),
    raciocinio: b.raciocinio.map((i) => ({ id: i.id, resposta: i.answerIndex })),
  }));
  writeFileSync(new URL("./simulador-esperado.json", import.meta.url), JSON.stringify(out));
});
