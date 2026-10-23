import { TEXTO_SITUACAO, type Sonda } from "@/lib/registro-central";
import { backendAtual } from "@/lib/registro";
import { registrarErro, resumoDoErro } from "@/lib/registro/erros";
import type { NomeBackend } from "@/lib/registro/tipos";

// Diagnóstico do registro central: o site consegue gravar resultados no banco?
// GET /api/registro-central -> { gravacao, status, detalhe, texto, backend }
// Rota pública: o detalhe traz só categorias, nunca o texto cru do driver.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  let backend: NomeBackend | "indefinido" = "indefinido";
  let s: Sonda;
  try {
    const b = backendAtual();
    backend = b.nome;
    s = await b.sondar();
  } catch (e) {
    registrarErro("GET /api/registro-central", e);
    s = { gravacao: "sem-conexao", status: null, detalhe: `falha ao escolher o backend: ${resumoDoErro(e)}` };
  }
  return Response.json({ ...s, backend, texto: TEXTO_SITUACAO[s.gravacao] }, { headers: { "Cache-Control": "no-store" } });
}
