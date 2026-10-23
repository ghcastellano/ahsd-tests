import { backendAtual } from "@/lib/registro";
import { bloqueioPorTentativas, json, lerJson, respostaDeErro, senhaDoCorpo } from "@/lib/registro/http";

// Importação de uma exportação (JSON de /api/exportar) para o banco atual.
// POST /api/importar { senha, resultados?, visitas? } -> { resultados: n, visitas: n }
// Idempotente: o que já existe é ignorado. Senha errada -> 401; corpo inválido
// -> 400; backend sem suporte (Supabase) ou fora do ar -> 502; senha errada
// repetidas vezes -> 429.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Acima disso a própria Vercel recusa o corpo (limite de 4,5 MB por requisição).
const MAX_CORPO = 8 * 1024 * 1024;

export async function POST(req: Request): Promise<Response> {
  const corpo = await lerJson(req, MAX_CORPO);
  if (!corpo.ok) return corpo.resposta;
  const senha = senhaDoCorpo(corpo.dados);
  if (!senha) return json({ erro: "senha ausente" }, 400);
  const d = corpo.dados as { resultados?: unknown; visitas?: unknown };
  if (d.resultados !== undefined && !Array.isArray(d.resultados)) return json({ erro: "resultados deve ser uma lista" }, 400);
  if (d.visitas !== undefined && !Array.isArray(d.visitas)) return json({ erro: "visitas deve ser uma lista" }, 400);
  if (!d.resultados && !d.visitas) return json({ erro: "nada para importar (envie resultados e/ou visitas)" }, 400);
  const bloqueio = bloqueioPorTentativas(req);
  if (bloqueio) return bloqueio;
  try {
    return json(await backendAtual().importar(senha, { resultados: d.resultados, visitas: d.visitas }));
  } catch (e) {
    return respostaDeErro(e, req);
  }
}

export function GET(): Response {
  return new Response("Método não permitido", { status: 405, headers: { Allow: "POST" } });
}
