import { NOME_COOKIE } from "@/lib/portao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${NOME_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`, "Cache-Control": "no-store" } });
}
