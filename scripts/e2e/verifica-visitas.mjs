// Verifica o registro de acessos de ponta a ponta contra o Supabase falso:
// abrir uma página grava IP/cidade/caminho lidos dos cabeçalhos; IP no corpo
// é ignorado; o painel lista o acesso depois da senha.
// Uso: node scripts/e2e/supabase-falso.mjs & (site buildado com
//      NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:3222) node scripts/e2e/verifica-visitas.mjs
import { chromium } from "playwright";
const B = process.env.BASE_URL ?? "http://localhost:3111";
const F = process.env.FAKE_URL ?? "http://127.0.0.1:3222";
const log = []; const ok = (c, m) => log.push(`${c ? "PASS  " : "FALHOU"}  ${m}`);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ extraHTTPHeaders: {
  "x-forwarded-for": "187.10.20.30, 10.0.0.1",
  "x-vercel-ip-country": "BR", "x-vercel-ip-country-region": "SP", "x-vercel-ip-city": "S%C3%A3o%20Paulo",
} });
const p = await ctx.newPage();
const esperar = async (n) => { for (let i = 0; i < 40; i++) { const v = await (await fetch(`${F}/__visitas`)).json(); if (v.length >= n) return v; await new Promise((r) => setTimeout(r, 250)); } return (await fetch(`${F}/__visitas`)).json(); };

await fetch(`${F}/__visitas`, { method: "DELETE" }); // começa do zero
await p.goto(`${B}/teste-qi?seed=3`);
let vs = await esperar(1);
ok(vs.length === 1, `abrir /teste-qi gravou 1 acesso (${vs.length})`);
ok(vs[0]?.ip === "187.10.20.30", `IP gravado é o primeiro de x-forwarded-for (${vs[0]?.ip})`);
ok(vs[0]?.cidade === "São Paulo" && vs[0]?.regiao === "SP" && vs[0]?.pais === "BR", `local decodificado: ${vs[0]?.cidade}, ${vs[0]?.regiao}, ${vs[0]?.pais}`);
ok(vs[0]?.caminho === "/teste-qi", `caminho sem query (${vs[0]?.caminho})`);
ok(typeof vs[0]?.user_agent === "string" && /Chrome|HeadlessChrome/.test(vs[0].user_agent), "user-agent gravado");

await p.getByRole("link", { name: /Sobre/ }).first().click();
await p.waitForURL(/\/sobre/);
vs = await esperar(2);
ok(vs.length === 2 && vs[0]?.caminho === "/sobre", `navegação interna grava outro acesso (${vs.length}, ${vs[0]?.caminho})`);
ok(vs[0]?.referer === `${B}/teste-qi`, `origem sem query (${vs[0]?.referer})`);
ok(await p.getByText(/Registro de acessos\./).count() === 1, "página Sobre informa a coleta de IP");

// IP no corpo é ignorado; corpo lixo não derruba a rota.
const r1 = await fetch(`${B}/api/visita`, { method: "POST", headers: { "Content-Type": "application/json", "x-real-ip": "200.1.1.1" }, body: JSON.stringify({ ip: "6.6.6.6", caminho: "/x?y=1" }) });
vs = await esperar(3);
ok(r1.status === 200 && vs[0]?.ip === "200.1.1.1" && vs[0]?.caminho === "/x", `IP do corpo ignorado; usa x-real-ip (${vs[0]?.ip}, ${vs[0]?.caminho})`);
const r2 = await fetch(`${B}/api/visita`, { method: "POST", body: "{{{ lixo" });
ok(r2.status === 200 || r2.status === 202, `corpo malformado não quebra a rota (${r2.status})`);
const r3 = await fetch(`${B}/api/visita`);
ok(r3.status === 405, `GET em /api/visita é 405 (${r3.status})`);

// Painel: senha errada, senha certa, listagem e filtro.
await p.goto(`${B}/painel-ahsd`);
await p.getByLabel("Senha do painel").fill("errada");
await p.getByRole("button", { name: "Entrar" }).click();
await p.getByText("Senha incorreta.").waitFor();
ok(await p.getByText("Acessos ao site (IP)").count() === 0, "seção de acessos escondida antes da senha");
await p.getByLabel("Senha do painel").fill("senha-teste");
await p.getByRole("button", { name: "Entrar" }).click();
await p.getByText("Acessos ao site (IP)").waitFor();
await p.getByRole("button", { name: "Carregar acessos" }).click();
await p.getByText(/acesso\(s\)/).waitFor();
const total = await p.locator("table").last().locator("tbody tr").count();
ok(total >= 4, `painel lista os acessos (${total} linhas, inclui o próprio /painel-ahsd)`);
ok(await p.getByText("187.10.20.30").count() >= 1, "IP aparece na tabela");
ok(await p.getByText("São Paulo, SP, BR").count() >= 1, "local aparece na tabela");
await p.getByLabel("Filtrar por IP").fill("200.1.1.1");
ok(await p.locator("table").last().locator("tbody tr").count() === 1, "filtro por IP reduz a 1 linha");
ok(await p.getByText(/IP\(s\) distinto\(s\)/).count() === 1, "resumo com IPs distintos");

// ---------------- Registro central: status visível + sonda ----------------
{
  const sonda = await (await fetch(`${B}/api/registro-central`)).json();
  ok(sonda.gravacao === "ok", `sonda /api/registro-central diz "ok" (${sonda.gravacao}: ${sonda.texto})`);
  ok(await p.locator('[data-sonda="ok"]').count() === 1 || (await p.reload(), await p.getByLabel("Senha do painel").fill("senha-teste"), await p.getByRole("button", { name: "Entrar" }).click(), await p.locator('[data-sonda="ok"]').waitFor(), true), "painel mostra 'Gravação de novos resultados: OK'");

  // Um treino curto com nome que o banco falso recusa (simula RLS bloqueando).
  const resp = JSON.parse((await import("node:fs")).readFileSync(new URL("./variacao-esperado.json", import.meta.url), "utf8"));
  const seed = Object.keys(resp)[0];
  async function treino(nome) {
    await p.goto(`${B}/treino/classificacao?seed=${seed}`);
    await p.locator('input[maxlength="80"]').first().fill(nome);
    await p.getByRole("button", { name: /^Iniciar/ }).click();
    const r = resp[seed]["classificacao"];
    for (let i = 0; i < r.length; i++) {
      await p.getByText(new RegExp(`Item ${i + 1} de ${r.length}`)).waitFor();
      await p.getByRole("button", { name: new RegExp(`^Figura ${r[i] + 1}$`) }).click();
      if (i < r.length - 1) await p.getByRole("button", { name: /Próximo/ }).click();
    }
    await p.getByRole("button", { name: /^Finalizar/ }).click();
    await p.getByText("Acertos", { exact: true }).waitFor();
  }
  await treino("FALHA-RLS");
  await p.locator('[data-registro="falhou"]').waitFor();
  const msg = await p.locator('[data-registro="falhou"]').innerText();
  ok(/Não foi gravado no registro central/.test(msg) && /RLS/.test(msg), "resultado mostra a falha de gravação com o motivo (RLS)");
  ok(await p.getByRole("button", { name: "Tentar de novo" }).count() === 1, "botão 'Tentar de novo' presente");
  await treino("Gabi");
  await p.locator('[data-registro="ok"]').waitFor();
  ok((await p.locator('[data-registro="ok"]').innerText()).includes("Gravado no registro central"), "resultado mostra '✓ Gravado no registro central'");
  const gravados = await (await fetch(`${F}/__resultados`)).json();
  ok(gravados.some((r) => r.respondent === "Gabi" && r.instrument_id === "treino-classificacao"), "o banco falso recebeu o resultado da Gabi (treino-classificacao)");
  ok(!gravados.some((r) => r.total_score > 1000), "a sonda não gravou nenhuma linha");

  // Painel no mesmo aparelho: sincroniza os registros locais e AVISA o que não entrou.
  await p.goto(`${B}/painel-ahsd`);
  await p.locator("[data-sync]").waitFor();
  const sync = await p.locator("[data-sync]").innerText();
  ok(/1 não enviado\(s\)/.test(sync) && /RLS/.test(sync), `painel avisa o registro que não entrou e o motivo: "${sync.slice(0, 90)}…"`);
  ok(await p.getByRole("button", { name: /Copiar link do resultado/ }).count() >= 2, "cada registro local tem 'copiar link'");
  await p.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await p.getByRole("button", { name: /Copiar link do resultado/ }).first().click();
  const link = await p.evaluate(() => navigator.clipboard.readText());
  ok(/\/resultado#v2\./.test(link), `link copiado abre a página de resultado (${link.slice(0, 50)}…)`);

  // Login lembrado: usuário + senha num formulário, "lembrar neste aparelho", recarrega e entra sozinho.
  const p2 = await ctx.newPage();
  await p2.goto(`${B}/painel-ahsd`);
  ok(await p2.locator('form input[autocomplete="username"][type="email"]').count() === 1 && await p2.locator('form input[autocomplete="current-password"]').count() === 1, "login é um formulário com usuário (e-mail) e senha para o navegador salvar");
  await p2.getByLabel(/Usuário/).fill("avaliador@example.com");
  await p2.getByLabel("Senha do painel").fill("senha-teste");
  await p2.getByLabel(/Lembrar neste aparelho/).check();
  await p2.getByRole("button", { name: "Entrar" }).click();
  await p2.getByText(/registro\(s\) no banco central/).waitFor();
  ok(await p2.getByRole("button", { name: /Esquecer senha neste aparelho/ }).count() === 1, "após entrar com 'lembrar', aparece 'Esquecer senha neste aparelho'");
  await p2.reload();
  await p2.getByText(/registro\(s\) no banco central/).waitFor({ timeout: 15000 });
  ok(await p2.getByLabel("Senha do painel").count() === 0, "recarregou e entrou sozinho, sem pedir a senha");
  ok(await p2.evaluate(() => localStorage.getItem("ahsd:painel:usuario")) === "avaliador@example.com", "usuário lembrado no aparelho");
  await p2.getByRole("button", { name: /Esquecer senha neste aparelho/ }).click();
  await p2.getByLabel("Senha do painel").waitFor();
  ok(await p2.evaluate(() => localStorage.getItem("ahsd:painel:senha")) === null, "'Esquecer' apaga a senha guardada e volta ao login");
  ok((await p2.getByLabel(/Usuário/).inputValue()) === "avaliador@example.com", "usuário continua preenchido para o próximo login");
  await p2.close();
}

await browser.close();
console.log(log.join("\n"));
const falhas = log.filter((l) => l.startsWith("FALHOU")).length;
console.log(`\n${log.length - falhas}/${log.length} verificações`);
process.exit(falhas ? 1 : 0);
