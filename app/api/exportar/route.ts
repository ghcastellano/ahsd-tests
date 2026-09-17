import { ADMIN_RPC, ADMIN_VISITS_RPC, SUPABASE_KEY, SUPABASE_URL } from "@/lib/remote-config";

// Exportação do registro central, protegida pela senha do painel: chama as
// mesmas funções SQL que o painel usa (admin_listar_resultados e
// admin_listar_visitas), no servidor, e devolve as linhas em JSON. Serve para
// migrar o banco e para backup. Senha errada -> 401; nada é gravado.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function rpc(nome: string, senha: string): Promise<{ status: number; body: unknown }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_senha: senha }),
    signal: AbortSignal.timeout(20_000),
  });
  const texto = await res.text();
  let body: unknown = texto;
  try { body = JSON.parse(texto); } catch { /* texto cru */ }
  return { status: res.status, body };
}

export async function POST(req: Request): Promise<Response> {
  let senha = "";
  try { senha = String(((await req.json()) as { senha?: string }).senha ?? ""); } catch { senha = ""; }
  if (!senha) return Response.json({ erro: "senha ausente" }, { status: 400 });
  const resultados = await rpc(ADMIN_RPC, senha);
  if (resultados.status !== 200) {
    const msg = typeof resultados.body === "string" ? resultados.body : JSON.stringify(resultados.body);
    return Response.json({ erro: msg.includes("senha incorreta") ? "senha incorreta" : `falha (${resultados.status})` }, { status: msg.includes("senha incorreta") ? 401 : 502 });
  }
  const visitas = await rpc(ADMIN_VISITS_RPC, senha);
  return Response.json(
    { origem: SUPABASE_URL, resultados: resultados.body, visitas: visitas.status === 200 ? visitas.body : [], visitas_status: visitas.status },
    { headers: { "Cache-Control": "no-store" } },
  );
}
