import type { EnvioRemoto, ResultRecord } from "../history";
import type { Visita, VisitaRegistro } from "../visitas";
import type { Sonda } from "../registro-central";

// Contrato comum dos backends do registro central. O site conversa com um
// deles sempre pelo servidor (rotas /api/*): o navegador nunca fala direto
// com o banco. Três backends existem hoje:
//   - "postgres": o Neon via DATABASE_URL, pelo driver HTTP serverless do
//     próprio Neon (um Postgres comum não responde nesse protocolo — ver
//     neon.ts). O schema é criado sozinho e a senha do painel é conferida no
//     servidor.
//   - "supabase": o projeto Supabase de antes (PostgREST + RLS + funções SQL
//     protegidas por senha), usado quando DATABASE_URL não existe.
//   - "desligado": NEXT_PUBLIC_REGISTRO_CENTRAL=off — nada é gravado nem lido.

export type { EnvioRemoto, ResultRecord, Visita, VisitaRegistro, Sonda };

/** Dados aceitos pela importação: a exportação de /api/exportar (ou só as listas). */
export interface DadosImportacao {
  resultados?: unknown[];
  visitas?: unknown[];
}

export type NomeBackend = "postgres" | "supabase" | "desligado";

export interface RegistroBackend {
  nome: NomeBackend;
  /** Grava um resultado; repetição do mesmo id conta como ok (status 409). */
  inserirResultado(r: ResultRecord): Promise<EnvioRemoto>;
  /** Lista os resultados (mais recentes primeiro). Senha errada lança ErroRegistro("senha incorreta"). */
  listarResultados(senha: string): Promise<ResultRecord[]>;
  /** Grava um acesso. Melhor-esforço: nunca lança. */
  inserirVisita(v: Visita): Promise<boolean>;
  /** Lista os acessos (mais recentes primeiro). Senha errada lança ErroRegistro("senha incorreta"). */
  listarVisitas(senha: string): Promise<VisitaRegistro[]>;
  /** O site consegue gravar? Nunca lança. */
  sondar(): Promise<Sonda>;
  /** Importa uma exportação (idempotente) e devolve quantas linhas entraram. */
  importar(senha: string, dados: DadosImportacao): Promise<{ resultados: number; visitas: number }>;
}
