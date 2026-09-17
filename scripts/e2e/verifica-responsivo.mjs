// Varredura responsiva: abre as telas principais (incluindo estados internos)
// em 3 larguras — celular 390, iPad 820, web 1280 — e aponta (a) rolagem
// horizontal da página, (b) elementos que estouram a largura da janela fora
// de contêineres roláveis, (c) texto cortado (overflow escondido com
// scrollWidth maior). Grava screenshots em SHOTS_DIR para inspeção.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const B = process.env.BASE_URL ?? "http://localhost:3111";
const DIR = process.env.SHOTS_DIR ?? "/tmp/claude-0/-home-user-ahsd-tests/127777f9-3544-5baf-b866-2da183b5c0de/scratchpad/shots";
mkdirSync(DIR, { recursive: true });
const LARGURAS = [[390, 844, "celular"], [820, 1180, "ipad"], [1280, 800, "web"]];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const log = []; const ok = (c, m) => log.push(`${c ? "PASS  " : "FALHOU"}  ${m}`);

async function medir(p) {
  return p.evaluate(() => {
    const W = window.innerWidth;
    const rolagem = document.documentElement.scrollWidth > W + 1;
    const estouram = [];
    const cortados = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const cs = getComputedStyle(el);
      if (r.right > W + 1 && !el.closest(".overflow-x-auto, [style*='overflow-x: auto'], table")) {
        estouram.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")} right=${Math.round(r.right)}`);
      }
      if ((cs.overflow === "hidden" || cs.overflowX === "hidden") && el.scrollWidth > el.clientWidth + 2 && cs.textOverflow !== "ellipsis" && !el.querySelector("svg")) {
        cortados.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ").slice(0, 2).join(".")}`);
      }
    }
    return { rolagem, estouram: [...new Set(estouram)].slice(0, 5), cortados: [...new Set(cortados)].slice(0, 5) };
  });
}

// Telas e como chegar nelas
const TELAS = [
  { nome: "home", ir: async (p) => p.goto(`${B}/`) },
  { nome: "treino", ir: async (p) => p.goto(`${B}/treino`) },
  { nome: "regras", ir: async (p) => p.goto(`${B}/treino/regras`) },
  { nome: "sobre", ir: async (p) => p.goto(`${B}/sobre`) },
  { nome: "superdotacao", ir: async (p) => p.goto(`${B}/superdotacao`) },
  { nome: "teste-qi-intro", ir: async (p) => p.goto(`${B}/teste-qi?seed=3`) },
  { nome: "teste-qi-item", ir: async (p) => { await p.goto(`${B}/teste-qi?seed=3`); await p.getByRole("button", { name: /^Iniciar/ }).click(); await p.getByText(/Item 1 de 30/).waitFor(); } },
  { nome: "bateria-matrizes-item", ir: async (p) => { await p.goto(`${B}/treino/matrizes-avancadas?seed=3`); await p.getByRole("button", { name: /^Iniciar/ }).click(); await p.getByText(/Item 1 de 36/).waitFor(); } },
  { nome: "bateria-classificacao-item", ir: async (p) => { await p.goto(`${B}/treino/classificacao?seed=3`); await p.getByRole("button", { name: /^Iniciar/ }).click(); await p.getByText(/Item 1 de 14/).waitFor(); } },
  { nome: "bateria-numericas-item", ir: async (p) => { await p.goto(`${B}/treino/series-numericas?seed=3`); await p.getByRole("button", { name: /^Iniciar/ }).click(); await p.getByText(/Item 1 de 20/).waitFor(); } },
  { nome: "simulador-intro", ir: async (p) => p.goto(`${B}/treino/simulador?seed=12345`) },
  { nome: "simulador-verbal", ir: async (p) => { await p.goto(`${B}/treino/simulador?seed=12345`); await p.getByRole("button", { name: /Começar pelo Bloco 1/ }).click(); await p.getByText("Compreensão verbal").first().waitFor(); } },
  { nome: "dojo-escolha", ir: async (p) => p.goto(`${B}/treino/dojo?seed=5`) },
  { nome: "dojo-exame", ir: async (p) => { await p.goto(`${B}/treino/dojo?seed=5&exame=cattell`); await p.locator('[data-dojo="exame"]').waitFor(); } },
  { nome: "dojo-condicoes", ir: async (p) => { await p.goto(`${B}/treino/dojo?seed=5&exame=cattell`); await p.locator('[data-dojo="exame"]').waitFor(); await p.locator("[data-dominio='condicoes']").getByRole("button", { name: "Treinar só este" }).click(); await p.locator('[data-dojo="treino"]').waitFor(); } },
  { nome: "dojo-condicoes-feedback", ir: async (p) => { await p.goto(`${B}/treino/dojo?seed=5&exame=cattell`); await p.locator('[data-dojo="exame"]').waitFor(); await p.locator("[data-dominio='condicoes']").getByRole("button", { name: "Treinar só este" }).click(); await p.locator('[data-dojo="treino"]').waitFor(); await p.getByRole("button", { name: "Alternativa 2" }).click(); await p.locator("[data-feedback]").waitFor(); } },
  { nome: "dojo-matriz-wais", ir: async (p) => { await p.goto(`${B}/treino/dojo?seed=5&exame=wechsler`); await p.locator('[data-dojo="exame"]').waitFor(); await p.locator("[data-dominio='matrizes']").getByRole("button", { name: "Treinar só este" }).click(); await p.locator('[data-dojo="treino"]').waitFor(); await p.getByRole("button", { name: "Alternativa 1" }).click(); await p.locator("[data-feedback]").waitFor(); } },
  { nome: "dojo-texto", ir: async (p) => { await p.goto(`${B}/treino/dojo?seed=5&exame=wechsler`); await p.locator('[data-dojo="exame"]').waitFor(); await p.locator("[data-dominio='aritmetica']").getByRole("button", { name: "Treinar só este" }).click(); await p.locator('[data-dojo="treino"]').waitFor(); } },
  { nome: "go-nogo", ir: async (p) => p.goto(`${B}/treino/go-nogo`) },
  { nome: "instrumento-phq9", ir: async (p) => p.goto(`${B}/teste/phq-9`) },
  { nome: "instrumento-asrs", ir: async (p) => p.goto(`${B}/teste/asrs-abda`) },
  { nome: "painel", ir: async (p) => p.goto(`${B}/painel-ahsd`) },
  { nome: "resultado-invalido", ir: async (p) => p.goto(`${B}/resultado`) },
];

for (const [w, h, rotulo] of LARGURAS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: w < 500, hasTouch: w < 900 });
  const p = await ctx.newPage();
  const erros = [];
  p.on("pageerror", (e) => erros.push(e.message.slice(0, 120)));
  for (const t of TELAS) {
    try {
      await t.ir(p);
      await p.waitForTimeout(300);
      const m = await medir(p);
      await p.screenshot({ path: `${DIR}/${rotulo}-${t.nome}.png`, fullPage: true });
      ok(!m.rolagem, `${rotulo} ${t.nome}: sem rolagem horizontal`);
      ok(m.estouram.length === 0, `${rotulo} ${t.nome}: nada estoura a largura${m.estouram.length ? " — " + m.estouram.join("; ") : ""}`);
      ok(m.cortados.length === 0, `${rotulo} ${t.nome}: sem texto cortado${m.cortados.length ? " — " + m.cortados.join("; ") : ""}`);
    } catch (e) {
      ok(false, `${rotulo} ${t.nome}: erro ao abrir — ${String(e.message).split("\n")[0].slice(0, 100)}`);
    }
  }
  ok(erros.length === 0, `${rotulo}: sem erros de JavaScript${erros.length ? " — " + erros[0] : ""}`);
  await ctx.close();
}
await browser.close();
console.log(log.filter((l) => l.startsWith("FALHOU")).join("\n"));
const falhas = log.filter((l) => l.startsWith("FALHOU")).length;
console.log(`\n${log.length - falhas}/${log.length} verificações`);
process.exit(falhas ? 1 : 0);
