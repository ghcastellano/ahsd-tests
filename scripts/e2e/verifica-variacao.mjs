// Verifica no navegador que /teste-qi e os quatro treinos da bateria variam
// com a semente (?seed=) e que jogar perfeito dá nota máxima em cada semente.
// Uso: npx vitest run scripts/e2e/dump-variacao.test.ts && BASE_URL=... node scripts/e2e/verifica-variacao.mjs
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { entrar } from "./login.mjs";
const B = process.env.BASE_URL ?? "http://localhost:3111";
const esperado = JSON.parse(readFileSync(new URL("./variacao-esperado.json", import.meta.url), "utf8"));
// Fora do localhost, respeita o proxy do ambiente (HTTPS_PROXY), se houver.
const proxy = process.env.HTTPS_PROXY && !/localhost|127\.0\.0\.1/.test(B) ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", proxy });
const log = []; const ok = (c, m) => log.push(`${c ? "PASS  " : "FALHOU"}  ${m}`);
const rota = (id) => (id === "teste-qi" ? "/teste-qi" : `/treino/${id}`);

async function jogar(seed, id, respostas) {
  const p = await browser.newPage();
  await entrar(p, B);
  p.on("dialog", (d) => d.accept());
  await p.goto(`${B}${rota(id)}?seed=${seed}`);
  await p.getByRole("button", { name: /^Iniciar/ }).click();
  const marcas = [];
  for (let i = 0; i < respostas.length; i++) {
    await p.getByText(new RegExp(`Item ${i + 1} de ${respostas.length}`)).waitFor();
    marcas.push(await p.evaluate(() => {
      // Exclui só as alternativas: na classificação, o enunciado são as figuras-botão ("Figura N").
      const svgs = [...document.querySelectorAll("svg")].filter((s) => !s.closest('button[aria-label^="Alternativa"]')).map((s) => s.outerHTML);
      const linhas = document.body.innerText.split("\n").filter((l) => l.includes(", ?"));
      return svgs.join("|") + "#" + linhas.join("|");
    }));
    const alt = p.getByRole("button", { name: new RegExp(`^(Alternativa|Figura) ${respostas[i] + 1}$`) });
    await alt.click();
    if (i < respostas.length - 1) await p.getByRole("button", { name: /Próximo/ }).click();
  }
  await p.getByRole("button", { name: /^Finalizar/ }).click();
  await p.getByText("Acertos", { exact: true }).waitFor();
  const nota = await p.evaluate(() => {
    const lbl = [...document.querySelectorAll("p")].find((e) => e.textContent.trim() === "Acertos");
    return lbl?.nextElementSibling?.textContent?.replace(/\s+/g, "") ?? "";
  });
  await p.close();
  return { marcas, nota };
}

const seeds = Object.keys(esperado);
const provas = Object.keys(esperado[seeds[0]]);
for (const id of provas) {
  const r = {};
  for (const seed of seeds) {
    r[seed] = await jogar(seed, id, esperado[seed][id]);
    const n = esperado[seed][id].length;
    ok(r[seed].nota === `${n}/${n}`, `${id} seed ${seed}: jogada perfeita dá ${r[seed].nota} (esperado ${n}/${n})`);
  }
  const [a, b] = seeds.map((s) => r[s].marcas);
  const dif = a.filter((m, i) => m !== b[i]).length;
  ok(dif >= Math.ceil(a.length / 2), `${id}: ${dif} de ${a.length} itens diferentes entre as sementes ${seeds.join(" e ")}`);
  const semMarca = a.filter((m) => m === "#").length;
  ok(semMarca === 0, `${id}: todos os itens têm conteúdo capturado (${a.length - semMarca}/${a.length})`);
}
await browser.close();
console.log(log.join("\n"));
const falhas = log.filter((l) => l.startsWith("FALHOU")).length;
console.log(`\n${log.length - falhas}/${log.length} verificações`);
process.exit(falhas ? 1 : 0);
