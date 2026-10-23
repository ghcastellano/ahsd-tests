import { backendAtual } from "@/lib/registro";
import { bloqueioPorTentativas, json, lerJson, respostaDeErro, senhaDoCorpo } from "@/lib/registro/http";

// Listagem dos acessos (IP) para o painel, mediante a senha.
// POST /api/painel/visitas { senha } -> { visitas }
// Senha errada -> 401 { erro: "senha incorreta" } (e 429 após muitas
// tentativas); outras falhas -> 502 { erro }.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const corpo = await lerJson(req, 4096);
  if (!corpo.ok) return corpo.resposta;
  const senha = senhaDoCorpo(corpo.dados);
  if (!senha) return json({ erro: "senha ausente" }, 400);
  const bloqueio = bloqueioPorTentativas(req);
  if (bloqueio) return bloqueio;
  try {
    return json({ visitas: await backendAtual().listarVisitas(senha) });
  } catch (e) {
    return respostaDeErro(e, req);
  }
}

export function GET(): Response {
  return new Response("Método não permitido", { status: 405, headers: { Allow: "POST" } });
}
