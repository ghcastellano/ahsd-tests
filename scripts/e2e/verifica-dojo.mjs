// Dojo: para cada exame, abre o painel, faz uma rodada de 10 itens respondendo
// a 1ª alternativa (ou "1" na memória), confere o feedback após cada item, o
// resultado e o progresso gravado no aparelho.
// Uso: BASE_URL=http://localhost:3111 node scripts/e2e/verifica-dojo.mjs
import { chromium } from "playwright";
import { entrar } from "./login.mjs";
const B = process.env.BASE_URL ?? "http://localhost:3111";
const log = []; const ok = (c, m) => log.push(`${c ? "PASS  " : "FALHOU"}  ${m}`);
const proxy = process.env.HTTPS_PROXY && !/localhost|127\.0\.0\.1/.test(B) ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", proxy });
const p = await browser.newPage();
await entrar(p, B);

// Tela de escolha
await p.goto(`${B}/treino/dojo?seed=5`);
await p.locator('[data-dojo="escolha"]').waitFor();
ok(await p.locator("[data-exame]").count() === 4, "4 exames na tela de escolha");
ok(await p.getByText("Como praticar de forma inteligente").count() === 1 && await p.getByText(/Sono é treino/).count() === 1, "princípios de prática inteligente presentes");
ok(await p.getByText(/Triple Nine Society/).count() >= 1 && await p.getByText(/Mega Test/).count() >= 1, "sociedades e testes de alto alcance explicados");
ok(await p.getByText(/Mensa.*é uma sociedade, não um teste/).count() === 1, "explica que Mensa é sociedade, não teste");

async function rodada(exameId, dominioNome) {
  await p.goto(`${B}/treino/dojo?seed=5&exame=${exameId}`);
  await p.locator('[data-dojo="exame"]').waitFor();
  const nDom = await p.locator("[data-dominio]").count();
  ok(nDom >= 4, `${exameId}: painel com ${nDom} domínios`);
  ok(await p.getByText("Plano de hoje").count() === 1, `${exameId}: plano do dia presente`);
  if (dominioNome) await p.locator("[data-dominio]").filter({ hasText: dominioNome }).getByRole("button", { name: "Treinar só este" }).click();
  else await p.getByRole("button", { name: /Treinar 10 itens/ }).click();
  const tipos = new Set();
  let feedbacks = 0;
  for (let i = 0; i < 10; i++) {
    await p.locator('[data-dojo="treino"]').waitFor();
    const mem = p.locator("#dj-mem");
    if (await p.getByText(/Digite na MESMA ordem|Digite na ordem INVERSA|Digite os NÚMEROS/).count() > 0) {
      tipos.add("memoria");
      await mem.waitFor({ timeout: 20000 });
      await mem.fill("1");
      await p.getByRole("button", { name: "Confirmar" }).click();
    } else {
      const alts = p.getByRole("button", { name: /^Alternativa \d$/ });
      const n = await alts.count();
      if (n === 5) tipos.add("cinco");
      if (await p.getByText(/completa a matriz/).count()) tipos.add("matriz");
      await alts.first().click();
    }
    const fb = p.locator("[data-feedback]");
    await fb.waitFor();
    feedbacks++;
    const texto = await fb.innerText();
    if (i === 0) ok(/Por que este tipo de item é difícil/.test(texto) && /Dica prática/.test(texto), `${exameId}: feedback traz 'por que é difícil' e 'dica'`);
    await p.getByRole("button", { name: /Próximo|Ver resultado/ }).click();
  }
  await p.locator('[data-dojo="fim"]').waitFor();
  ok(feedbacks === 10, `${exameId}: 10 itens com feedback`);
  const fim = await p.locator('[data-dojo="fim"]').innerText();
  ok(/Acertos/.test(fim) && /\/ 10/.test(fim) && /Próximo passo/.test(fim), `${exameId}: resultado com acertos/10 e próximo passo`);
  return tipos;
}

const tMensa = await rodada("mensa");
ok(tMensa.has("matriz"), "mensa: inclui matrizes do /teste-qi");
const tW = await rodada("wechsler");
ok(tW.has("memoria"), "wechsler: inclui memória operacional (dígitos)");
const tSB = await rodada("stanford-binet");
ok(tSB.size >= 1, "stanford-binet: rodada mista concluída");
const tC = await rodada("cattell", "Condições");
ok(tC.has("cinco"), "cattell/condições: itens com 5 figuras (topologia)");

// Progresso gravado no aparelho
const prog = await p.evaluate(() => JSON.parse(localStorage.getItem("ahsd:dojo:v1") || "null"));
ok(prog && prog.dias.length === 1 && Object.keys(prog.dominios).length >= 6, `progresso salvo: ${prog ? Object.keys(prog.dominios).length : 0} domínios, ${prog ? prog.dias.length : 0} dia(s)`);
ok(prog && prog.erros.length > 0, "erros registrados com a regra");
await p.goto(`${B}/treino/dojo?exame=cattell`);
await p.locator('[data-dojo="exame"]').waitFor();
ok(await p.getByText(/% de acerto/).count() >= 1, "painel mostra a taxa por domínio depois de treinar");
ok(await p.getByText(/dia\(s\) seguido\(s\)/).count() >= 1, "sequência de dias aparece");

await browser.close();
console.log(log.join("\n"));
const falhas = log.filter((l) => l.startsWith("FALHOU")).length;
console.log(`\n${log.length - falhas}/${log.length} verificações`);
process.exit(falhas ? 1 : 0);
