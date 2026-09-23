// Revisão de erros no resultado: em /teste-qi, num treino da bateria e no
// simulador, errar de propósito e conferir que a questão aparece com a
// alternativa marcada (vermelha) e a correta (verde).
// Uso: BASE_URL=http://localhost:3111 node scripts/e2e/verifica-revisao.mjs
import { readFileSync } from "node:fs";
import { chromium } from "playwright";
import { entrar } from "./login.mjs";
const B = process.env.BASE_URL ?? "http://localhost:3111";
const variacao = JSON.parse(readFileSync(new URL("./variacao-esperado.json", import.meta.url), "utf8"));
const sim = JSON.parse(readFileSync(new URL("./simulador-esperado.json", import.meta.url), "utf8"));
const log = []; const ok = (c, m) => log.push(`${c ? "PASS  " : "FALHOU"}  ${m}`);
const proxy = process.env.HTTPS_PROXY && !/localhost|127\.0\.0\.1/.test(B) ? { server: process.env.HTTPS_PROXY, bypass: "localhost,127.0.0.1" } : undefined;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", proxy });

// Joga um teste de múltipla escolha errando os itens em `errar` (índices):
// marca (correta+1) % 6 neles e a correta nos demais.
async function jogar(p, rota, seed, respostas, errar) {
  await p.goto(`${B}${rota}?seed=${seed}`);
  await p.getByRole("button", { name: /^Iniciar/ }).click();
  for (let i = 0; i < respostas.length; i++) {
    await p.getByText(new RegExp(`Item ${i + 1} de ${respostas.length}`)).waitFor();
    const n = respostas[i];
    const alvo = errar.includes(i) ? (n + 1) % (rota === "/treino/classificacao" ? 5 : 6) : n;
    await p.getByRole("button", { name: new RegExp(`^(Alternativa|Figura) ${alvo + 1}$`) }).click();
    if (i < respostas.length - 1) await p.getByRole("button", { name: /Próximo/ }).click();
  }
  await p.getByRole("button", { name: /^Finalizar/ }).click();
  await p.getByText("Acertos", { exact: true }).waitFor();
}

async function conferirRevisao(p, nome, errados, total, idErrado) {
  ok(await p.getByText("Revisão dos itens").count() + await p.getByText("Revisão das regras").count() >= 1, `${nome}: seção de revisão presente`);
  const det = p.locator(`[data-revisao="${idErrado}"]`).first();
  await det.waitFor({ state: "attached" });
  // abre o <details> (o próprio ou o pai)
  const summary = det.locator("xpath=ancestor-or-self::details[1]/summary").first();
  await summary.click();
  const escolhida = det.locator('[data-papel="escolhida"]');
  const correta = det.locator('[data-papel="correta"]');
  ok(await escolhida.count() === 1, `${nome}: item errado mostra a alternativa marcada (vermelha)`);
  ok(await correta.count() === 1, `${nome}: item errado mostra a alternativa correta (verde)`);
  ok((await escolhida.first().innerText()).includes("sua resposta") && (await correta.first().innerText()).includes("correta"), `${nome}: rótulos "sua resposta" e "correta"`);
  // Classificação: o conjunto de 5 figuras é a própria pergunta; nos demais, matriz/série + 6 alternativas.
  ok(await det.locator("svg").count() >= (nome === "classificacao" ? 5 : 6), `${nome}: a questão (figuras) aparece na revisão`);
  ok(await p.getByText(new RegExp(`Você marcou a alternativa \\d+; a correta é a \\d+`)).count() >= 1, `${nome}: frase "Você marcou … a correta é …"`);
}

const p = await browser.newPage();
await entrar(p, B);
p.on("dialog", (d) => d.accept());

// /teste-qi: erra os itens 3 e 7
{
  const seed = Object.keys(variacao)[0];
  const resp = variacao[seed]["teste-qi"];
  await jogar(p, "/teste-qi", seed, resp, [2, 6]);
  ok((await p.getByText(/^\d+\s*\/ 30$/).count()) >= 0 && (await p.locator("p.text-4xl").first().innerText()).replace(/\s+/g, "") === "28/30", "teste-qi: 28/30 com dois erros propositais");
  ok(await p.locator("details[data-revisao]").count() === 2, "teste-qi: revisão lista só os 2 erros por padrão");
  await conferirRevisao(p, "teste-qi", 2, 30, "m3");
  await p.getByRole("button", { name: /Ver todos os 30/ }).click();
  ok(await p.locator("details[data-revisao]").count() === 30, "teste-qi: 'Ver todos' lista os 30");
  ok(await p.locator("details[data-revisao] li").first().count() === 1, "teste-qi: regras do item descritas");
}

// bateria (matrizes avançadas): erra o item 28 (o que tinha a bola duplicada)
{
  const seed = Object.keys(variacao)[0];
  const resp = variacao[seed]["matrizes-avancadas"];
  await jogar(p, "/treino/matrizes-avancadas", seed, resp, [27]);
  ok((await p.locator("p.text-4xl").first().innerText()).replace(/\s+/g, "") === "35/36", "matrizes-avancadas: 35/36 com um erro proposital");
  await conferirRevisao(p, "matrizes-avancadas", 1, 36, "am28");
  // as 6 alternativas do item 28 são visualmente distintas (nada de bola duplicada)
  const svgs = await p.locator('[data-revisao="am28"] [aria-label^="Alternativa"] svg').evaluateAll((els) => els.map((e) => e.outerHTML.replace(/id="[^"]*"|url\(#[^)]*\)/g, "")));
  ok(new Set(svgs).size === 6 && svgs.length === 6, `matrizes-avancadas item 28: ${new Set(svgs).size} desenhos distintos em 6 alternativas`);
}

// classificação: erra o item 1 (o conjunto é a própria pergunta)
{
  const seed = Object.keys(variacao)[0];
  const resp = variacao[seed]["classificacao"];
  await jogar(p, "/treino/classificacao", seed, resp, [0]);
  await conferirRevisao(p, "classificacao", 1, 14, "cl01");
}

// simulador: bloco 1, erra o 1º item verbal e a 1ª matriz; para no fim do bloco
{
  await p.goto(`${B}/treino/simulador?seed=12345`);
  await p.getByRole("button", { name: /Começar pelo Bloco 1/ }).click();
  const b0 = sim[0];
  for (let i = 0; i < b0.verbal.length; i++) {
    const q = b0.verbal[i];
    const alvo = i === 0 ? (q.resposta + 1) % 4 : q.resposta;
    await p.locator(`#q-${q.id} button`).nth(alvo).click();
  }
  await p.getByRole("button", { name: /Seguir para a memória/ }).click();
  for (const m of b0.memoria) {
    await p.locator("#mem").waitFor({ timeout: 30000 });
    await p.locator("#mem").fill(m.resposta);
    await p.getByRole("button", { name: "Confirmar" }).click();
  }
  await p.getByText(/Velocidade de processamento|Velocidade/).first().waitFor();
  for (const presente of b0.velocidade) { await p.keyboard.press(presente ? "s" : "n"); await p.waitForTimeout(30); }
  await p.getByText(/Raciocínio/).first().waitFor();
  for (let i = 0; i < b0.raciocinio.length; i++) {
    const r = b0.raciocinio[i];
    const alvo = i === 0 ? (r.resposta + 1) % 6 : r.resposta;
    await p.locator(`li:has([id^="g${r.id}-"]) button, li:has(svg) >> nth=${i}`).first().waitFor();
    await p.locator("ol > li").nth(i).locator("button").nth(alvo).click();
  }
  await p.getByRole("button", { name: /Fechar o bloco/ }).click();
  await p.getByRole("button", { name: /Parar aqui e ver o resultado/ }).click();
  await p.getByText("Revisão dos itens").waitFor();
  ok(await p.getByText(/Compreensão verbal — 1 erro/).count() === 1, "simulador: verbal com 1 erro listado");
  ok(await p.getByText(/Raciocínio \(matrizes\) — 1 erro/).count() === 1, "simulador: raciocínio com 1 erro listado");
  const v = p.locator(`[data-revisao="${b0.verbal[0].id}"]`);
  ok((await v.innerText()).includes("Sua resposta") && (await v.innerText()).includes("Correta:"), "simulador: item verbal errado mostra sua resposta e a correta");
  await conferirRevisao(p, "simulador", 1, 4, b0.raciocinio[0].id);
}

await browser.close();
console.log(log.join("\n"));
const falhas = log.filter((l) => l.startsWith("FALHOU")).length;
console.log(`\n${log.length - falhas}/${log.length} verificações`);
process.exit(falhas ? 1 : 0);
