import { SUPABASE_URL } from "@/lib/remote-config";
import { backendAtual } from "@/lib/registro";
import { bloqueioPorTentativas, json, lerJson, respostaDeErro, senhaDoCorpo } from "@/lib/registro/http";

// Exportação do registro central, protegida pela senha do painel: lê os
// resultados e os acessos pelo backend atual, no servidor, e devolve em JSON.
// Serve para backup e para migrar de banco (cole o JSON em "Importar
// exportação" no painel). Senha errada -> 401; nada é gravado.
// Resposta: { origem, resultados, visitas, visitas_status }
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  const corpo = await lerJson(req, 4096);
  if (!corpo.ok) return corpo.resposta;
  const senha = senhaDoCorpo(corpo.dados);
  if (!senha) return json({ erro: "senha ausente" }, 400);
  const bloqueio = bloqueioPorTentativas(req);
  if (bloqueio) return bloqueio;
  let backend;
  let resultados;
  try {
    backend = backendAtual();
    resultados = await backend.listarResultados(senha);
  } catch (e) {
    return respostaDeErro(e, req);
  }
  // A tabela de acessos pode não existir num projeto antigo: a exportação dos
  // resultados segue mesmo assim, e visitas_status conta o que houve.
  let visitas: unknown[] = [];
  let visitas_status = 200;
  try {
    visitas = await backend.listarVisitas(senha);
  } catch {
    visitas_status = 502;
  }
  return json({ origem: backend.nome === "supabase" ? SUPABASE_URL : backend.nome, resultados, visitas, visitas_status });
}
