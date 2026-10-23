import bcrypt from "bcryptjs";
import type { EnvioRemoto, ResultRecord, Sonda, Visita, VisitaRegistro } from "./tipos";
import type { DadosImportacao, RegistroBackend } from "./tipos";
import {
  MOTIVO_SEM_DETALHES,
  detalhesCortados,
  linhaDaVisita,
  linhaDoResultado,
  resultadoDaLinha,
  resultadoImportado,
  visitaDaLinha,
  visitaImportada,
  type LinhaResultado,
  type LinhaResultadoBruta,
  type LinhaVisita,
  type LinhaVisitaBruta,
} from "./linhas";
import { ErroRegistro, registrarErro, resumoDoErro } from "./erros";

// Backend Postgres "puro", em SQL parametrizado: em produção roda no Neon
// (DATABASE_URL + driver HTTP, ver neon.ts) e nos testes no PGlite — qualquer
// executor que fale SQL do Postgres serve. Toda a proteção fica no servidor:
// a senha do painel é conferida aqui (bcrypt) e nenhuma política RLS é
// necessária, porque o navegador nunca fala com o banco diretamente.
//
// Regras: SQL sempre parametrizado (nunca interpolar valores); um comando por
// chamada (o Neon em modo HTTP e o PGlite não aceitam vários de uma vez).

/** Executa um comando SQL parametrizado e devolve as linhas. */
export type Executor = (sql: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;

/**
 * Sem senha não há painel. A senha inicial vem SÓ de PAINEL_SENHA_INICIAL:
 * não existe senha padrão no código (o repositório é público — uma senha
 * fixa aqui seria conhecida por qualquer pessoa que o lesse).
 */
export const MOTIVO_SEM_SENHA =
  "painel sem senha configurada: defina a variável PAINEL_SENHA_INICIAL na Vercel e faça Redeploy";
const ROUNDS_BCRYPT = 10;
const LIMITE_RESULTADOS = 2000;
const LIMITE_VISITAS = 5000;
/** Linhas por comando na importação (15 parâmetros por linha; o Postgres aceita até 65.535). */
export const LOTE_IMPORTACAO = 200;

// Mesmas colunas e restrições de supabase/setup.sql (sem RLS/policies/funções).
const SCHEMA: readonly string[] = [
  `create table if not exists public.resultados (
    id uuid primary key default gen_random_uuid(),
    client_id text unique check (char_length(client_id) <= 64),
    created_at timestamptz not null default now(),
    instrument_id text not null check (char_length(instrument_id) <= 60),
    acronym text not null check (char_length(acronym) <= 30),
    instrument_name text not null check (char_length(instrument_name) <= 160),
    respondent text check (char_length(respondent) <= 80),
    total_score numeric not null check (total_score >= -1000 and total_score <= 1000),
    max_score numeric not null check (max_score >= 0 and max_score <= 1000),
    band_label text not null check (char_length(band_label) <= 120),
    severity text not null check (char_length(severity) <= 20),
    positive boolean,
    metric_is_mean boolean not null default false,
    subscales jsonb check (pg_column_size(subscales) <= 16384),
    duracao_segundos integer check (duracao_segundos >= 0 and duracao_segundos <= 86400),
    detalhes jsonb check (pg_column_size(detalhes) <= 262144)
  )`,
  `create index if not exists resultados_created_at_idx on public.resultados (created_at desc)`,
  `create table if not exists public.admin_config (
    id int primary key default 1,
    senha_hash text not null
  )`,
  `create table if not exists public.visitas (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    ip text check (char_length(ip) <= 45),
    pais text check (char_length(pais) <= 8),
    regiao text check (char_length(regiao) <= 80),
    cidade text check (char_length(cidade) <= 120),
    caminho text check (char_length(caminho) <= 200),
    referer text check (char_length(referer) <= 300),
    user_agent text check (char_length(user_agent) <= 300),
    idioma text check (char_length(idioma) <= 40)
  )`,
  `create index if not exists visitas_created_at_idx on public.visitas (created_at desc)`,
];

const COLUNAS_RESULTADO = [
  "client_id", "instrument_id", "acronym", "instrument_name", "respondent", "total_score", "max_score",
  "band_label", "severity", "positive", "metric_is_mean", "subscales", "duracao_segundos", "detalhes",
] as const;

const COLUNAS_VISITA = ["ip", "pais", "regiao", "cidade", "caminho", "referer", "user_agent", "idioma"] as const;

/** Parâmetros de uma linha de resultado, na ordem de COLUNAS_RESULTADO. */
function parametrosResultado(l: LinhaResultado): unknown[] {
  return [
    l.client_id, l.instrument_id, l.acronym, l.instrument_name, l.respondent, l.total_score, l.max_score,
    l.band_label, l.severity, l.positive, l.metric_is_mean,
    l.subscales === null ? null : JSON.stringify(l.subscales),
    l.duracao_segundos,
    l.detalhes === null ? null : JSON.stringify(l.detalhes),
  ];
}

/** "$1::text, $2::text, …" com os tipos certos para cada coluna de resultado, a partir do índice `base`. */
function marcadoresResultado(base: number, comCreatedAt: boolean): string {
  const tipos = [
    "text", "text", "text", "text", "text", "numeric", "numeric",
    "text", "text", "boolean", "boolean", "jsonb", "integer", "jsonb",
  ];
  if (comCreatedAt) tipos.push("timestamptz");
  return tipos.map((t, i) => `$${base + i + 1}::${t}`).join(", ");
}

function parametrosVisita(l: LinhaVisita): unknown[] {
  return [l.ip, l.pais, l.regiao, l.cidade, l.caminho, l.referer, l.user_agent, l.idioma];
}

/** Data válida em ISO, ou null (para cair no now() do banco). */
function dataOuNula(iso: string): string | null {
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

function ehViolacaoDeCheck(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  const code = (e as { code?: unknown } | null)?.code;
  return code === "23514" || /violates check constraint/i.test(msg);
}

/** A senha inicial configurada no ambiente, ou null. Lida a cada uso (vale após um Redeploy). */
function senhaInicialConfigurada(): string | null {
  const s = process.env.PAINEL_SENHA_INICIAL;
  return typeof s === "string" && s.length > 0 ? s : null;
}

export function criarBackendPostgres(exec: Executor): RegistroBackend {
  // Memoizado por instância; se falhar, a próxima chamada tenta de novo.
  let schemaPronto: Promise<void> | null = null;

  /** Hash da senha do painel, ou null quando admin_config está vazia. */
  async function hashDaSenha(): Promise<string | null> {
    const { rows } = await exec("select senha_hash from public.admin_config where id = 1", []);
    const hash = rows[0]?.senha_hash;
    return typeof hash === "string" && hash.length > 0 ? hash : null;
  }

  /**
   * Semeia a senha do painel quando a tabela está vazia E PAINEL_SENHA_INICIAL
   * existe. Sem a variável, a tabela fica vazia e o painel falha fechado.
   * Devolve o hash gravado (ou já existente), ou null quando não há senha.
   */
  async function semearSenha(): Promise<string | null> {
    const existente = await hashDaSenha();
    if (existente) return existente;
    const senha = senhaInicialConfigurada();
    if (!senha) return null;
    const hash = await bcrypt.hash(senha, ROUNDS_BCRYPT);
    await exec("insert into public.admin_config (id, senha_hash) values (1, $1::text) on conflict (id) do nothing", [hash]);
    // Outro processo pode ter semeado primeiro: o que vale é o que está no banco.
    return (await hashDaSenha()) ?? hash;
  }

  async function criarSchema(): Promise<void> {
    for (const comando of SCHEMA) await exec(comando, []);
    await semearSenha();
  }

  function garantirSchema(): Promise<void> {
    if (!schemaPronto) {
      schemaPronto = criarSchema().catch((e) => {
        schemaPronto = null;
        throw e;
      });
    }
    return schemaPronto;
  }

  async function conferirSenha(senha: string): Promise<void> {
    await garantirSchema();
    // Tabela vazia (variável definida depois do primeiro acesso): tenta semear agora.
    const hash = await semearSenha();
    if (!hash) throw new ErroRegistro(MOTIVO_SEM_SENHA);
    const confere = typeof senha === "string" && senha.length > 0 && (await bcrypt.compare(senha, hash));
    if (!confere) throw new ErroRegistro("senha incorreta");
  }

  async function inserirResultado(r: ResultRecord): Promise<EnvioRemoto> {
    try {
      await garantirSchema();
      const linha = linhaDoResultado(r);
      // created_at fica de fora de propósito: o banco carimba com now().
      const { rows } = await exec(
        `insert into public.resultados (${COLUNAS_RESULTADO.join(", ")}) values (${marcadoresResultado(0, false)})
         on conflict (client_id) do nothing returning id`,
        parametrosResultado(linha),
      );
      // Nenhuma linha devolvida = client_id já existia: está no banco, missão cumprida.
      const status = rows.length > 0 ? 201 : 409;
      return detalhesCortados(r, linha) ? { ok: true, status, motivo: MOTIVO_SEM_DETALHES } : { ok: true, status };
    } catch (e) {
      if (ehViolacaoDeCheck(e)) {
        return { ok: false, status: 422, motivo: "o banco rejeitou os dados (restrição de valores)" };
      }
      // Rota sem senha: para o navegador vai só a categoria; o texto fica no log.
      registrarErro("inserirResultado", e);
      return { ok: false, status: 500, motivo: `o banco central falhou: ${resumoDoErro(e)}` };
    }
  }

  async function listarResultados(senha: string): Promise<ResultRecord[]> {
    await conferirSenha(senha);
    const { rows } = await exec(
      "select * from public.resultados order by created_at desc limit $1::int",
      [LIMITE_RESULTADOS],
    );
    return rows.map((l) => resultadoDaLinha(l as unknown as LinhaResultadoBruta));
  }

  async function inserirVisita(v: Visita): Promise<boolean> {
    try {
      await garantirSchema();
      const marcadores = COLUNAS_VISITA.map((_, i) => `$${i + 1}::text`).join(", ");
      await exec(
        `insert into public.visitas (${COLUNAS_VISITA.join(", ")}) values (${marcadores})`,
        parametrosVisita(linhaDaVisita(v)),
      );
      return true;
    } catch (e) {
      registrarErro("inserirVisita", e);
      return false;
    }
  }

  async function listarVisitas(senha: string): Promise<VisitaRegistro[]> {
    await conferirSenha(senha);
    const { rows } = await exec(
      "select * from public.visitas order by created_at desc limit $1::int",
      [LIMITE_VISITAS],
    );
    return rows.map((l) => visitaDaLinha(l as unknown as LinhaVisitaBruta));
  }

  async function sondar(): Promise<Sonda> {
    try {
      await garantirSchema();
      await exec("select 1", []);
      const comSenha = (await hashDaSenha()) !== null;
      return {
        gravacao: "ok",
        status: 200,
        detalhe: comSenha ? "Postgres/Neon: conexão e schema OK" : `Postgres/Neon: conexão e schema OK; ${MOTIVO_SEM_SENHA}`,
      };
    } catch (e) {
      // GET /api/registro-central é público: nada do texto cru do driver sai daqui.
      registrarErro("sondar", e);
      return { gravacao: "sem-conexao", status: null, detalhe: `Postgres/Neon: ${resumoDoErro(e)}` };
    }
  }

  /** Insere resultados em lotes; ON CONFLICT (client_id) ignora os que já existem. */
  async function importarResultados(itens: unknown[]): Promise<number> {
    const registros = itens.map(resultadoImportado).filter((r): r is ResultRecord => r !== null);
    let inseridos = 0;
    for (let i = 0; i < registros.length; i += LOTE_IMPORTACAO) {
      const lote = registros.slice(i, i + LOTE_IMPORTACAO);
      const valores: string[] = [];
      const params: unknown[] = [];
      for (const r of lote) {
        valores.push(`(${marcadoresResultado(params.length, true)})`);
        // Aqui (e só aqui) created_at vem dos dados: é a data original do registro.
        params.push(...parametrosResultado(linhaDoResultado(r)), dataOuNula(r.createdAt));
      }
      const { rows } = await exec(
        `insert into public.resultados (${COLUNAS_RESULTADO.join(", ")}, created_at)
         select ${COLUNAS_RESULTADO.join(", ")}, coalesce(created_at, now())
           from (values ${valores.join(", ")}) as v (${COLUNAS_RESULTADO.join(", ")}, created_at)
         on conflict (client_id) do nothing returning id`,
        params,
      );
      inseridos += rows.length;
    }
    return inseridos;
  }

  /**
   * Insere visitas deduplicando por (created_at, ip, caminho) — no banco e
   * dentro do lote. A data é comparada em milissegundos: o now() do Postgres
   * tem microssegundos, mas a exportação (JSON/ISO 8601) só carrega
   * milissegundos — sem o truncamento, reimportar o próprio backup duplicaria
   * todos os acessos.
   */
  async function importarVisitas(itens: unknown[]): Promise<number> {
    const vistas = new Set<string>();
    const visitas: { createdAt: string; linha: LinhaVisita }[] = [];
    for (const item of itens) {
      const v = visitaImportada(item);
      if (!v) continue;
      const linha = linhaDaVisita(v.visita);
      const chave = `${v.createdAt}|${linha.ip ?? ""}|${linha.caminho ?? ""}`;
      if (vistas.has(chave)) continue;
      vistas.add(chave);
      visitas.push({ createdAt: v.createdAt, linha });
    }
    let inseridos = 0;
    const colunas = ["created_at", ...COLUNAS_VISITA].join(", ");
    for (let i = 0; i < visitas.length; i += LOTE_IMPORTACAO) {
      const lote = visitas.slice(i, i + LOTE_IMPORTACAO);
      const valores: string[] = [];
      const params: unknown[] = [];
      for (const v of lote) {
        const base = params.length;
        const marcadores = [`$${base + 1}::timestamptz`, ...COLUNAS_VISITA.map((_, j) => `$${base + j + 2}::text`)];
        valores.push(`(${marcadores.join(", ")})`);
        params.push(v.createdAt, ...parametrosVisita(v.linha));
      }
      const { rows } = await exec(
        `insert into public.visitas (${colunas})
         select ${colunas} from (values ${valores.join(", ")}) as v (${colunas})
          where not exists (
            select 1 from public.visitas x
             where date_trunc('milliseconds', x.created_at) = date_trunc('milliseconds', v.created_at)
               and x.ip is not distinct from v.ip
               and x.caminho is not distinct from v.caminho
          )
         returning id`,
        params,
      );
      inseridos += rows.length;
    }
    return inseridos;
  }

  async function importar(senha: string, dados: DadosImportacao): Promise<{ resultados: number; visitas: number }> {
    await conferirSenha(senha);
    const resultados = Array.isArray(dados.resultados) ? await importarResultados(dados.resultados) : 0;
    const visitas = Array.isArray(dados.visitas) ? await importarVisitas(dados.visitas) : 0;
    return { resultados, visitas };
  }

  return { nome: "postgres", inserirResultado, listarResultados, inserirVisita, listarVisitas, sondar, importar };
}
