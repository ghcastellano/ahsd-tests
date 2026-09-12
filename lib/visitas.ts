import { csvEscape, formatDateTimeBR } from "./history";
import { ADMIN_VISITS_RPC, SUPABASE_KEY, SUPABASE_URL, VISITS_TABLE, remoteEnabled } from "./remote-config";

// Registro de acessos: quem abre o site tem o IP (e o que a Vercel informa de
// localização) gravado no banco central. O IP vem dos cabeçalhos carimbados
// pela plataforma — nunca do corpo da requisição, que o visitante controla.

export interface Visita {
  ip: string | null;
  pais: string | null;
  regiao: string | null;
  cidade: string | null;
  caminho: string | null;
  referer: string | null;
  userAgent: string | null;
  idioma: string | null;
}

export interface VisitaRegistro extends Visita {
  id: string;
  createdAt: string; // ISO 8601
}

/** Interface mínima de cabeçalhos (Headers do fetch ou um objeto simples). */
export type CabecalhoLeitor = { get(name: string): string | null } | Record<string, string | undefined>;

function ler(h: CabecalhoLeitor, nome: string): string | null {
  const v = typeof (h as { get?: unknown }).get === "function"
    ? (h as { get(n: string): string | null }).get(nome)
    : (h as Record<string, string | undefined>)[nome] ?? (h as Record<string, string | undefined>)[nome.toLowerCase()];
  return v && v.trim() ? v.trim() : null;
}

const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6 = /^[0-9a-f:]+(%[0-9a-z]+)?$/i;

/** Normaliza um IP: tira porta/colchetes/espaços; rejeita o que não é IP. */
export function normalizarIp(bruto: string | null | undefined): string | null {
  if (!bruto) return null;
  let v = bruto.trim();
  // "[::1]:8080" ou "1.2.3.4:5678"
  const m6 = v.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (m6) v = m6[1];
  else if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(v)) v = v.slice(0, v.lastIndexOf(":"));
  if (v.startsWith("::ffff:") && IPV4.test(v.slice(7))) v = v.slice(7);
  if (IPV4.test(v)) return v;
  if (v.includes(":") && v.length <= 45 && IPV6.test(v)) return v.toLowerCase();
  return null;
}

/**
 * IP do cliente a partir dos cabeçalhos. Ordem: os que a Vercel carimba por
 * conta própria (x-real-ip, x-vercel-forwarded-for) e, por fim, o primeiro
 * endereço de x-forwarded-for (o mais próximo do cliente).
 */
export function ipDosCabecalhos(h: CabecalhoLeitor): string | null {
  for (const nome of ["x-real-ip", "x-vercel-forwarded-for", "cf-connecting-ip", "x-forwarded-for"]) {
    const bruto = ler(h, nome);
    if (!bruto) continue;
    for (const parte of bruto.split(",")) {
      const ip = normalizarIp(parte);
      if (ip) return ip;
    }
  }
  return null;
}

function limitar(v: string | null, max: number): string | null {
  if (!v) return null;
  return v.length > max ? v.slice(0, max) : v;
}

function decodificar(v: string | null): string | null {
  if (!v) return null;
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

/** Mantém só caminho (sem query, que pode trazer ?seed= ou fragmentos irrelevantes). */
export function limparCaminho(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const c = v.split(/[?#]/)[0].trim();
  if (!c.startsWith("/")) return null;
  return limitar(c, 200);
}

/** Referer só como origem + caminho, sem query (evita guardar tokens de terceiros). */
export function limparReferer(v: unknown): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return limitar(`${u.origin}${u.pathname}`, 300);
  } catch {
    return null;
  }
}

/** Monta a visita a partir dos cabeçalhos da requisição e do corpo enviado pelo cliente. */
export function visitaDaRequisicao(h: CabecalhoLeitor, corpo: unknown): Visita {
  const b = (corpo && typeof corpo === "object" ? corpo : {}) as Record<string, unknown>;
  return {
    ip: ipDosCabecalhos(h),
    pais: limitar(ler(h, "x-vercel-ip-country"), 8),
    regiao: limitar(decodificar(ler(h, "x-vercel-ip-country-region")), 80),
    cidade: limitar(decodificar(ler(h, "x-vercel-ip-city")), 120),
    caminho: limparCaminho(b.caminho),
    referer: limparReferer(b.referer),
    userAgent: limitar(ler(h, "user-agent"), 300),
    idioma: limitar(ler(h, "accept-language"), 40),
  };
}

/** Grava a visita no banco central (servidor). Melhor-esforço: nunca lança. */
export async function insertVisit(v: Visita, prazoMs = 5000): Promise<boolean> {
  if (!remoteEnabled()) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${VISITS_TABLE}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        ip: v.ip,
        pais: v.pais,
        regiao: v.regiao,
        cidade: v.cidade,
        caminho: v.caminho,
        referer: v.referer,
        user_agent: v.userAgent,
        idioma: v.idioma,
      }),
      signal: AbortSignal.timeout(prazoMs),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface LinhaRemota {
  id: string;
  created_at: string;
  ip: string | null;
  pais: string | null;
  regiao: string | null;
  cidade: string | null;
  caminho: string | null;
  referer: string | null;
  user_agent: string | null;
  idioma: string | null;
}

/** Lista os acessos mediante a senha do painel (RPC protegida). */
export async function fetchRemoteVisits(password: string): Promise<VisitaRegistro[]> {
  if (!remoteEnabled()) throw new Error("Registro central não está ativado.");
  const prazo =
    typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(20_000)
      : undefined;
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${ADMIN_VISITS_RPC}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_senha: password }),
      signal: prazo,
    });
  } catch {
    throw new Error("Não foi possível falar com o banco central (sem conexão, VPN/firewall ou o projeto Supabase pausado).");
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (body.includes("senha incorreta")) throw new Error("Senha incorreta.");
    if (res.status === 404 || body.includes("PGRST202")) {
      throw new Error("A tabela de acessos ainda não existe no banco: rode supabase/visitas.sql no SQL Editor do projeto.");
    }
    throw new Error(`Falha ao consultar os acessos (${res.status}).`);
  }
  let rows: LinhaRemota[];
  try {
    rows = (await res.json()) as LinhaRemota[];
  } catch {
    throw new Error("A resposta do banco central veio incompleta. Tente novamente.");
  }
  if (!Array.isArray(rows)) throw new Error("Resposta inesperada do banco central.");
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    ip: r.ip ?? null,
    pais: r.pais ?? null,
    regiao: r.regiao ?? null,
    cidade: r.cidade ?? null,
    caminho: r.caminho ?? null,
    referer: r.referer ?? null,
    userAgent: r.user_agent ?? null,
    idioma: r.idioma ?? null,
  }));
}

/** "Chrome · Android", "Safari · iPhone"… a partir do user-agent (heurística simples). */
export function resumirNavegador(ua: string | null): string {
  if (!ua) return "—";
  const nav = /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /SamsungBrowser/.test(ua) ? "Samsung"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\/|CriOS\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : /bot|crawl|spider|curl|wget|python|node|Go-http/i.test(ua) ? "robô"
    : "outro";
  const so = /iPhone/.test(ua) ? "iPhone"
    : /iPad/.test(ua) ? "iPad"
    : /Android/.test(ua) ? "Android"
    : /Windows/.test(ua) ? "Windows"
    : /Mac OS X|Macintosh/.test(ua) ? "Mac"
    : /Linux/.test(ua) ? "Linux"
    : null;
  return so ? `${nav} · ${so}` : nav;
}

/** "Cidade, Região, PAÍS" com o que existir. */
export function localDaVisita(v: Visita): string {
  const partes = [v.cidade, v.regiao, v.pais].filter((x): x is string => !!x);
  return partes.length ? partes.join(", ") : "—";
}

/** Resumo para o painel: total, IPs distintos e acessos nas últimas 24 h. */
export function resumoVisitas(vs: VisitaRegistro[], agora: number = Date.now()) {
  const ips = new Set(vs.map((v) => v.ip).filter((x): x is string => !!x));
  const corte = agora - 24 * 60 * 60 * 1000;
  const ultimas24h = vs.filter((v) => Date.parse(v.createdAt) >= corte).length;
  return { total: vs.length, ipsDistintos: ips.size, ultimas24h };
}

/** CSV (separador ';', pt-BR/Excel) dos acessos. */
export function buildVisitsCsv(vs: VisitaRegistro[]): string {
  const header = ["data_hora", "ip", "pais", "regiao", "cidade", "caminho", "origem", "navegador", "user_agent", "idioma"];
  const linhas = vs.map((v) =>
    [
      formatDateTimeBR(v.createdAt),
      v.ip ?? "",
      v.pais ?? "",
      v.regiao ?? "",
      v.cidade ?? "",
      v.caminho ?? "",
      v.referer ?? "",
      resumirNavegador(v.userAgent),
      v.userAgent ?? "",
      v.idioma ?? "",
    ].map(csvEscape).join(";"),
  );
  return [header.join(";"), ...linhas].join("\r\n");
}
