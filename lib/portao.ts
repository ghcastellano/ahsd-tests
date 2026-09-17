// Portão de acesso ao site: tudo exige a senha de entrada (cookie assinado).
// A senha pode ser trocada sem alterar código pela variável SITE_SENHA na
// Vercel. O cookie guarda só um hash da senha com sal — não a senha.

export const NOME_COOKIE = "ahsd_acesso";
export const DIAS_COOKIE = 30;
const SAL = "ahsd-portao-v1";

export function senhaDoSite(): string {
  return process.env.SITE_SENHA || "senha123";
}

async function sha256Hex(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Token esperado no cookie (funciona no Edge e no Node). */
export async function tokenEsperado(): Promise<string> {
  return sha256Hex(`${SAL}:${senhaDoSite()}`);
}

export function senhaConfere(tentativa: string): boolean {
  const a = new TextEncoder().encode(tentativa);
  const b = new TextEncoder().encode(senhaDoSite());
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Caminho seguro para redirecionar depois do login (só caminhos internos). */
export function destinoSeguro(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/entrar")) return "/";
  return next;
}
