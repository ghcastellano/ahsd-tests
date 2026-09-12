import { insertVisit, visitaDaRequisicao } from "@/lib/visitas";

// Registro de acesso. O cliente só informa caminho e página de origem; o IP,
// a localização, o navegador e o idioma vêm dos cabeçalhos da requisição —
// que a Vercel carimba e o visitante não controla.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CORPO = 2048;

export async function POST(req: Request): Promise<Response> {
  let corpo: unknown = null;
  try {
    const texto = await req.text();
    if (texto.length <= MAX_CORPO) corpo = JSON.parse(texto);
  } catch {
    corpo = null;
  }
  const visita = visitaDaRequisicao(req.headers, corpo);
  const gravou = await insertVisit(visita);
  return Response.json({ ok: gravou }, { status: gravou ? 200 : 202, headers: { "Cache-Control": "no-store" } });
}

export function GET(): Response {
  return new Response("Método não permitido", { status: 405, headers: { Allow: "POST" } });
}
