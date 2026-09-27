// Entra no site com a senha de acesso (portão): usado por todos os roteiros.
export async function entrar(page, B, senha = process.env.SITE_SENHA ?? "senha321") {
  await page.goto(`${B}/entrar`);
  await page.locator("#senha-site").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/entrar"), { timeout: 15000 });
}
