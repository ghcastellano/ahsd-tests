import { chromium } from "playwright";
import { entrar } from "./login.mjs";
import { readFileSync } from "node:fs";
const B = process.env.BASE_URL ?? "http://localhost:3111";
const esperado = JSON.parse(readFileSync(new URL("./simulador-esperado.json", import.meta.url), "utf8"));
// Fora do localhost, respeita o proxy do ambiente (HTTPS_PROXY), se houver.
const proxy = process.env.HTTPS_PROXY && !/localhost|127\.0\.0\.1/.test(B) ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome", proxy });
const log = []; const ok = (c, m) => log.push(`${c ? "PASS  " : "FALHOU"}  ${m}`);

async function jogarBloco(p, bloco, perfeito) {
  // verbal
  await p.locator("text=Compreensão verbal").first().waitFor({ timeout: 10000 });
  const itens = p.locator("ol > li");
  for (let i = 0; i < bloco.verbal.length; i++) {
    const idx = perfeito ? bloco.verbal[i].resposta : (bloco.verbal[i].resposta + 1) % 4;
    await itens.nth(i).locator("button").nth(idx).click();
  }
  await p.getByRole("button", { name: /Seguir para a memória/i }).click();
  // memória
  for (const m of bloco.memoria) {
    const input = p.locator("#mem");
    for (let j = 0; j < 11 && await input.count() === 0; j++) { await p.clock.fastForward(1100); await p.waitForTimeout(10); }
    await input.waitFor({ timeout: 20000 });
    await input.fill(perfeito ? m.resposta : "0");
    await p.getByRole("button", { name: /^Confirmar$/ }).click();
    await p.waitForTimeout(150);
  }
  // velocidade
  await p.locator("text=Velocidade de processamento").first().waitFor({ timeout: 10000 });
  for (let t = 0; t < bloco.velocidade.length; t++) {
    if ((await p.locator("text=Velocidade de processamento").count()) === 0) break;
    const presente = bloco.velocidade[t];
    const disse = perfeito ? presente : !presente;
    await p.getByRole("button", { name: disse ? /^SIM/ : /^NÃO/ }).click();
    await p.waitForTimeout(20);
  }
  await p.clock.fastForward(121000); // encerra a janela de 120 s após os 80 trials do roteiro
  // raciocínio
  await p.locator("text=Raciocínio fluido").first().waitFor({ timeout: 10000 });
  const mats = p.locator("ol > li");
  for (let i = 0; i < bloco.raciocinio.length; i++) {
    const idx = perfeito ? bloco.raciocinio[i].resposta : (bloco.raciocinio[i].resposta + 1) % 6;
    await mats.nth(i).locator("button").nth(idx).click();
  }
  await p.getByRole("button", { name: /Fechar o bloco|Ver o resultado/i }).click();
  await p.waitForTimeout(500);
}

// ---- jogada perfeita, três blocos ----
let p = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
await p.clock.install();
await entrar(p, B);
await p.goto(`${B}/treino/simulador?seed=12345`); await p.waitForTimeout(600);
await p.getByRole("button", { name: /Começar pelo Bloco 1/i }).click();
for (let b = 0; b < 3; b++) {
  await jogarBloco(p, esperado[b], true);
  if (b < 2) {
    const t = await p.locator("body").innerText();
    ok(/Bloco fechado ✓/.test(t), `bloco ${b + 1} fechado após jogada perfeita`);
    await p.getByRole("button", { name: /Seguir para o Bloco/i }).click();
  }
}
await p.waitForTimeout(800);
let t = await p.locator("body").innerText();
ok(/3\s+de 3/.test(t), "resultado: 3 de 3 blocos fechados");
ok(/Bloco 3 fechado \(avançado\)/.test(t), "faixa: Bloco 3 fechado (avançado)");
ok(/Compreensão verbal[\s\S]*24\/24 · 100%/.test(t), "verbal 24/24");
ok(/Raciocínio fluido[\s\S]*12\/12 · 100%/.test(t), "raciocínio 12/12");
ok(/Pontos \(acertos − erros\): 240/.test(t), "velocidade 240 pontos (80×3, todos certos)");
ok(/O que fazer agora:/.test(t), "linha 'O que fazer agora' presente");
ok((await p.evaluate(() => window.scrollY)) < 60, "resultado no topo");
ok(/Não constitui QI|não estima QI/.test(t), "aviso: não converte em QI");
await p.close();

// ---- jogada fraca no bloco 1, para e vê o resultado ----
p = await (await browser.newContext()).newPage();
await p.clock.install();
await entrar(p, B);
await p.goto(`${B}/treino/simulador?seed=12345`); await p.waitForTimeout(600);
await p.getByRole("button", { name: /Começar pelo Bloco 1/i }).click();
await jogarBloco(p, esperado[0], false);
t = await p.locator("body").innerText();
ok(/Bloco não fechado/.test(t), "bloco 1 não fecha com respostas erradas");
await p.getByRole("button", { name: /Parar aqui e ver o resultado/i }).click(); await p.waitForTimeout(600);
t = await p.locator("body").innerText();
ok(/0\s+de 3/.test(t) && /Nenhum bloco fechado/.test(t), "resultado: 0 de 3, 'Nenhum bloco fechado'");
await p.close();

console.log(log.join("\n")); const pass = log.filter((l) => l.startsWith("PASS")).length;
console.log(`\n${pass}/${log.length} verificações`); await browser.close(); process.exit(pass === log.length ? 0 : 1);
