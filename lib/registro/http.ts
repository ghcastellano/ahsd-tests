import { ErroRegistro, registrarErro, resumoDoErro } from "./erros";
import { ipDosCabecalhos } from "../visitas";

// Utilitários das rotas /api/* do registro central: respostas JSON sem cache,
// leitura do corpo com limite de tamanho, tradução de erros em HTTP e um
// freio para tentativas de senha.

export const SEM_CACHE = { "Cache-Control": "no-store" } as const;

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: SEM_CACHE });
}

export type CorpoLido = { ok: true; dados: unknown } | { ok: false; resposta: Response };

/** Lê e interpreta o corpo JSON; recusa corpos grandes (413) e JSON inválido (400). */
export async function lerJson(req: Request, maxBytes: number): Promise<CorpoLido> {
  const anunciado = Number(req.headers.get("content-length") ?? "0");
  if (anunciado > maxBytes) return { ok: false, resposta: json({ erro: "corpo grande demais" }, 413) };
  let texto: string;
  try {
    texto = await req.text();
  } catch {
    return { ok: false, resposta: json({ erro: "não foi possível ler o corpo" }, 400) };
  }
  if (new TextEncoder().encode(texto).length > maxBytes) return { ok: false, resposta: json({ erro: "corpo grande demais" }, 413) };
  try {
    return { ok: true, dados: JSON.parse(texto) };
  } catch {
    return { ok: false, resposta: json({ erro: "JSON inválido" }, 400) };
  }
}

/** A senha do painel no corpo ({ senha }), ou "" quando ausente. */
export function senhaDoCorpo(dados: unknown): string {
  if (!dados || typeof dados !== "object") return "";
  const s = (dados as { senha?: unknown }).senha;
  return typeof s === "string" ? s : "";
}

// ---------------------------------------------------------------------------
// Freio de tentativas de senha (força bruta online). Por IP, em memória: cada
// instância da função serverless conta as suas próprias falhas, então é um
// limite de melhor esforço — barato e suficiente para tornar a adivinhação
// impraticável e conter o custo (uma consulta + bcrypt por tentativa). Para
// um limite global, some a regra de rate limit do Firewall da Vercel.
// ---------------------------------------------------------------------------

/** Falhas de senha toleradas por IP dentro da janela. */
export const MAX_FALHAS_SENHA = 10;
/** Janela de contagem (ms). */
export const JANELA_FALHAS_MS = 15 * 60_000;
const MAX_IPS_LEMBRADOS = 5000;

const falhasPorIp = new Map<string, number[]>();

function chaveDoCliente(req: Request): string {
  return ipDosCabecalhos(req.headers) ?? "sem-ip";
}

function falhasRecentes(chave: string, agora: number): number[] {
  const lista = (falhasPorIp.get(chave) ?? []).filter((t) => agora - t < JANELA_FALHAS_MS);
  if (lista.length === 0) falhasPorIp.delete(chave);
  else falhasPorIp.set(chave, lista);
  return lista;
}

/** Esquece as falhas registradas (testes). */
export function limparTentativas(): void {
  falhasPorIp.clear();
}

/** Resposta 429 quando o cliente já errou a senha demais; null quando pode tentar. */
export function bloqueioPorTentativas(req: Request, agora = Date.now()): Response | null {
  const falhas = falhasRecentes(chaveDoCliente(req), agora);
  if (falhas.length < MAX_FALHAS_SENHA) return null;
  const esperaSeg = Math.max(1, Math.ceil((falhas[0] + JANELA_FALHAS_MS - agora) / 1000));
  return Response.json(
    { erro: `muitas tentativas de senha; aguarde ${Math.ceil(esperaSeg / 60)} min` },
    { status: 429, headers: { ...SEM_CACHE, "Retry-After": String(esperaSeg) } },
  );
}

/** Anota uma senha errada deste cliente. */
export function registrarSenhaErrada(req: Request, agora = Date.now()): void {
  if (falhasPorIp.size >= MAX_IPS_LEMBRADOS) {
    for (const chave of Array.from(falhasPorIp.keys())) falhasRecentes(chave, agora);
    if (falhasPorIp.size >= MAX_IPS_LEMBRADOS) falhasPorIp.clear();
  }
  const chave = chaveDoCliente(req);
  falhasPorIp.set(chave, [...falhasRecentes(chave, agora), agora]);
}

/**
 * Senha errada -> 401 (e conta a tentativa quando `req` é informado); falha
 * com texto curado (ErroRegistro) -> 502 com o texto; qualquer outro erro
 * (driver/Postgres) -> 502 genérico, com o texto completo só no log. Nunca lança.
 */
export function respostaDeErro(e: unknown, req?: Request): Response {
  if (e instanceof ErroRegistro) {
    if (e.message.includes("senha incorreta")) {
      if (req) registrarSenhaErrada(req);
      return json({ erro: "senha incorreta" }, 401);
    }
    return json({ erro: e.message }, 502);
  }
  registrarErro("rota protegida", e);
  return json({ erro: `falha no banco central: ${resumoDoErro(e)}` }, 502);
}
