import { sondarGravacao, TEXTO_SITUACAO } from "@/lib/registro-central";

// Diagnóstico do registro central: o site consegue gravar resultados no banco?
// GET /api/registro-central -> { gravacao, status, detalhe, texto }
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const s = await sondarGravacao();
  return Response.json({ ...s, texto: TEXTO_SITUACAO[s.gravacao] }, { headers: { "Cache-Control": "no-store" } });
}
