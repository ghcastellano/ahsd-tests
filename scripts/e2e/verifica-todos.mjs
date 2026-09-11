import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const B = process.env.BASE_URL ?? "http://localhost:3111";
const esperados = JSON.parse(readFileSync("scripts/e2e/esperados.json", "utf8"));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "").replace(".", ","));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
let pass = 0, fail = 0; const falhas = [];
for (const inst of esperados) {
  for (const [nome, p] of Object.entries(inst.padroes)) {
    const page = await (await browser.newContext()).newPage();
    try {
      await page.goto(`${B}/teste/${inst.id}`); await page.waitForTimeout(500);
      const itens = page.locator("ol > li");
      const nItens = await itens.count();
      if (nItens !== inst.n) throw new Error(`UI tem ${nItens} itens, esperado ${inst.n}`);
      for (let i = 0; i < inst.n; i++) await itens.nth(i).locator("button").nth(p.indices[i]).click();
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.getByRole("button", { name: /Ver resultado/i }).click(); await page.waitForTimeout(700);
      const txt = await page.locator("body").innerText();
      // Três formas de mostrar o número principal: soma "T / M", média "T média · escala…",
      // ou sem número (MDQ): "Positivo"/"Negativo".
      const reTotal = p.semNumero
        ? new RegExp(p.positivo ? "\\bPositivo\\b" : "\\bNegativo\\b")
        : p.media
          ? new RegExp(`(^|\\s)${esc(fmt(p.total))}0?\\s+média`)
          : new RegExp(`(^|\\s)${esc(fmt(p.total))}0?\\s*/\\s*${esc(fmt(p.max))}0?(\\s|$)`);
      const okTotal = reTotal.test(txt);
      const okFaixa = txt.includes(p.faixa);
      if (okTotal && okFaixa) pass++; else { fail++; falhas.push(`${inst.acronym} [${nome}]: esperado ${fmt(p.total)}/${fmt(p.max)} "${p.faixa}" — total ${okTotal ? "ok" : "NÃO achado"}, faixa ${okFaixa ? "ok" : "NÃO achada"}`); }
    } catch (e) { fail++; falhas.push(`${inst.acronym} [${nome}]: ${e.message.split("\n")[0]}`); }
    await page.close();
  }
  process.stdout.write(".");
}
console.log(`\n${pass} passaram, ${fail} falharam de ${pass + fail} (24 instrumentos × 3 padrões)`);
if (falhas.length) console.log(falhas.join("\n"));
await browser.close(); process.exit(fail ? 1 : 0);
