import type { RegistroBackend } from "./tipos";
import { criarBackendPostgres } from "./postgres";
import { executorNeon, postgresDisponivel } from "./neon";
import { criarBackendSupabase } from "./supabase";
import { ErroRegistro } from "./erros";
import { remoteEnabled } from "../remote-config";

// Escolha do backend do registro central — SERVIDOR APENAS (as rotas /api/*).
// Com DATABASE_URL definida (Neon, pelo driver HTTP serverless) usa o
// Postgres; sem ela, cai no projeto Supabase de sempre. Com
// NEXT_PUBLIC_REGISTRO_CENTRAL=off nenhum dos dois é usado: o interruptor
// vale no servidor também, independentemente do banco — nada é gravado nem
// lido (inclusive acessos/IP).

const MOTIVO_DESLIGADO = "registro central desativado";

/** Backend inerte, usado quando NEXT_PUBLIC_REGISTRO_CENTRAL=off: nada grava, nada lê. */
export function criarBackendDesligado(): RegistroBackend {
  const recusar = async (): Promise<never> => {
    throw new ErroRegistro(MOTIVO_DESLIGADO);
  };
  return {
    nome: "desligado",
    inserirResultado: async () => ({ ok: false, motivo: MOTIVO_DESLIGADO }),
    listarResultados: recusar,
    inserirVisita: async () => false,
    listarVisitas: recusar,
    sondar: async () => ({ gravacao: "desconhecido", status: null, detalhe: MOTIVO_DESLIGADO }),
    importar: recusar,
  };
}

let atual: RegistroBackend | null = null;
const desligado = criarBackendDesligado();

export function backendAtual(): RegistroBackend {
  if (!remoteEnabled()) return desligado;
  if (!atual) atual = postgresDisponivel() ? criarBackendPostgres(executorNeon()) : criarBackendSupabase();
  return atual;
}

export type { RegistroBackend } from "./tipos";
