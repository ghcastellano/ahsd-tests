import { neon } from "@neondatabase/serverless";
import type { Executor } from "./postgres";

// Executor para o Neon a partir de DATABASE_URL, pelo driver serverless em
// modo HTTP: cada comando vira um POST em https://<host>/sql, que SÓ o proxy
// do Neon atende. Uma connection string de Postgres comum (ou a URL direta
// do Supabase) não funciona aqui — a sonda responde "sem conexão". SÓ deve
// ser importado em código de servidor: a connection string carrega usuário e
// senha do banco.

function urlNeon(): string | undefined {
  const raw = (process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim();
  if (!raw) return undefined;
  const match = raw.match(/postgres(?:ql)?:\/\/[^\s'"]+/i);
  return match ? match[0] : raw.replace(/^['"]|['"]$/g, "");
}

/** Há um Postgres configurado? (A Vercel cria DATABASE_URL/POSTGRES_URL ao conectar o Neon.) */
export function postgresDisponivel(): boolean {
  return !!urlNeon();
}

/** Executor em modo HTTP (um comando por chamada, sem conexão persistente). */
export function executorNeon(): Executor {
  const url = urlNeon();
  if (!url) throw new Error("DATABASE_URL não definida");
  const sql = neon(url, { fullResults: true });
  return async (texto, params = []) => {
    const r = await sql.query(texto, params);
    return { rows: r.rows as Record<string, unknown>[] };
  };
}
