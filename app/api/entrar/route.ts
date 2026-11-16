import { DIAS_COOKIE, NOME_COOKIE, senhaConfere, tokenEsperado } from "@/lib/portao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let senha = "";
  try { senha = String(((await req.json()) as { senha?: string }).senha ?? ""); } catch { senha = ""; }
  if (!senhaConfere(senha)) {
    return Response.json({ ok: false, erro: "Senha incorreta." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const token = await tokenEsperado();
  const seguro = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return Response.json({ ok: true }, {
    headers: {
      "Set-Cookie": `${NOME_COOKIE}=${token}; Path=/; Max-Age=${DIAS_COOKIE * 24 * 3600}; HttpOnly; SameSite=Lax${seguro}`,
      "Cache-Control": "no-store",
    },
  });
}
