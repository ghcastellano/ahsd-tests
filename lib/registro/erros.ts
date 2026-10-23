// Erros do registro central e o que pode (e o que não pode) sair para o navegador.
//
// Duas famílias:
//   - ErroRegistro: lançado pelo nosso código com um texto curado e seguro
//     ("senha incorreta", "painel sem senha configurada", "importação
//     disponível só com DATABASE_URL"…). Pode ir direto para a resposta.
//   - qualquer outro erro (driver, Postgres, rede): o texto cru pode trazer
//     usuário do banco, nome de relação ou a própria connection string. Para
//     o navegador vai só uma categoria genérica (resumoDoErro); o texto
//     completo — já sem a connection string — vai para o log do servidor.

export class ErroRegistro extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ErroRegistro";
  }
}

const URL_DE_BANCO = /postgres(?:ql)?:\/\/[^\s'"]+/gi;

function textoDoErro(e: unknown): string {
  return e instanceof Error ? e.message : typeof e === "string" ? e : "erro desconhecido";
}

/** Mensagem sem a connection string (usuário e senha do banco) e sem textos quilométricos. */
export function mensagemSegura(e: unknown, max = 300): string {
  let msg = textoDoErro(e);
  const url = process.env.DATABASE_URL;
  if (url) msg = msg.split(url).join("[DATABASE_URL]");
  msg = msg.replace(URL_DE_BANCO, "[DATABASE_URL]").replace(/\s+/g, " ").trim();
  return msg.length > max ? `${msg.slice(0, max)}…` : msg || "erro desconhecido";
}

/**
 * Categoria genérica de um erro do banco/driver, para rotas sem senha: diz o
 * suficiente para orientar ("sem conexão", "credenciais") sem ecoar nomes de
 * usuário, relações ou detalhes internos.
 */
export function resumoDoErro(e: unknown): string {
  if (e instanceof ErroRegistro) return e.message;
  const msg = textoDoErro(e);
  const code = (e as { code?: unknown } | null)?.code;
  if (/not a valid url|invalid (connection )?string|connection string|DATABASE_URL não definida/i.test(msg)) {
    return "DATABASE_URL inválida (use a connection string do Neon)";
  }
  if (/password authentication|authentication failed|SASL|pg_hba|no password supplied|28P01|28000/i.test(msg) || code === "28P01" || code === "28000") {
    return "o banco recusou as credenciais de DATABASE_URL";
  }
  if (/fetch failed|ECONN|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|timeout|timed out|aborted|network|connection refused|could not connect|socket|TLS|certificate/i.test(msg)) {
    return "sem conexão com o banco";
  }
  if (/permission denied|42501/i.test(msg) || code === "42501") return "permissão negada no banco";
  if (/does not exist|42P01|undefined_table/i.test(msg) || code === "42P01") return "tabela ou objeto ausente no banco";
  if (/violates check constraint|23514/i.test(msg) || code === "23514") return "o banco rejeitou os dados (restrição de valores)";
  return "erro interno do banco";
}

/** Registra o erro no log do servidor (texto completo, sem a connection string). */
export function registrarErro(contexto: string, e: unknown): void {
  console.error(`[registro] ${contexto}: ${mensagemSegura(e, 2000)}`);
}
