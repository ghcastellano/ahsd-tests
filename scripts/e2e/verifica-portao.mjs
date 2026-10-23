// Portão de senha: sem cookie tudo redireciona para /entrar (com `next`);
// senha errada é recusada; senha certa entra e volta ao destino; rotas de API
// continuam acessíveis (têm proteção própria).
import { chromium } from "playwright";
const B = process.env.BASE_URL ?? "http://localhost:3111";
const log = []; const ok = (c, m) => log.push(`${c ? "PASS  " : "FALHOU"}  ${m}`);
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome" });
const p = await browser.newPage();

for (const rota of ["/", "/treino/dojo", "/painel-ahsd", "/teste/phq-9", "/resultado"]) {
  await p.goto(`${B}${rota}`);
  ok(p.url().includes("/entrar"), `${rota} sem senha redireciona para /entrar (${new URL(p.url()).pathname}${new URL(p.url()).search})`);
}
await p.goto(`${B}/treino/dojo?exame=mensa`);
ok(new URL(p.url()).searchParams.get("next") === "/treino/dojo?exame=mensa", "o destino original vai em ?next=");
ok(await p.locator("[data-portao]").count() === 1 && await p.locator("#senha-site").count() === 1, "tela de senha: um campo e um botão");

await p.locator("#senha-site").fill("errada");
await p.getByRole("button", { name: "Entrar" }).click();
const alerta = p.locator('[role="alert"]').filter({ hasText: /./ }).first();
await alerta.waitFor();
ok((await alerta.innerText()).includes("Senha incorreta"), "senha errada: 'Senha incorreta.'");
ok(p.url().includes("/entrar"), "senha errada: continua na tela de senha");

await p.locator("#senha-site").fill("senha321");
await p.getByRole("button", { name: "Entrar" }).click();
await p.waitForURL((u) => u.pathname === "/treino/dojo");
ok(new URL(p.url()).searchParams.get("exame") === "mensa", "senha certa: volta ao destino original com a query");
await p.goto(`${B}/`);
ok(!p.url().includes("/entrar"), "cookie mantém o acesso nas próximas páginas");

const api = await fetch(`${B}/api/registro-central`);
ok(api.status === 200, `rotas de API seguem acessíveis sem o cookie (${api.status})`);
const r401 = await fetch(`${B}/api/entrar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senha: "x" }) });
ok(r401.status === 401, "POST /api/entrar com senha errada = 401");
const r200 = await fetch(`${B}/api/entrar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senha: "senha321" }) });
const sc = r200.headers.get("set-cookie") || "";
ok(r200.status === 200 && /ahsd_acesso=[0-9a-f]{64}/.test(sc) && /HttpOnly/.test(sc) && !/senha321/.test(sc), "cookie é um hash HttpOnly, sem a senha");

// sair
await p.evaluate(() => fetch("/api/sair", { method: "POST" }));
await p.goto(`${B}/`);
ok(p.url().includes("/entrar"), "/api/sair apaga o cookie e volta a pedir senha");

await browser.close();
console.log(log.join("\n"));
const falhas = log.filter((l) => l.startsWith("FALHOU")).length;
console.log(`\n${log.length - falhas}/${log.length} verificações`);
process.exit(falhas ? 1 : 0);
