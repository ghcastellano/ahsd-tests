import { backendAtual } from "@/lib/registro";
import { registrarErro } from "@/lib/registro/erros";
import { json, lerJson } from "@/lib/registro/http";
import { validarRegistro } from "@/lib/registro/linhas";

// Gravação de um resultado no registro central, pelo servidor.
// POST /api/resultados { record } -> { ok, status, motivo? }
// Nunca lança para fora: toda falha vira JSON com o motivo. Rota pública:
// nenhum texto cru de erro do banco/driver sai daqui (só categorias).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_CORPO = 300 * 1024;

export async function POST(req: Request): Promise<Response> {
  const corpo = await lerJson(req, MAX_CORPO);
  if (!corpo.ok) return corpo.resposta;
  const record = validarRegistro((corpo.dados as { record?: unknown } | null)?.record);
  if (!record) return json({ ok: false, status: 400, motivo: "registro inválido (campos obrigatórios ausentes ou com tipo errado)" }, 400);
  try {
    return json(await backendAtual().inserirResultado(record));
  } catch (e) {
    registrarErro("POST /api/resultados", e);
    return json({ ok: false, status: 500, motivo: "falha inesperada no servidor ao gravar no registro central" });
  }
}

export function GET(): Response {
  return new Response("Método não permitido", { status: 405, headers: { Allow: "POST" } });
}
