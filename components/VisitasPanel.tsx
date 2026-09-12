"use client";

import { useState } from "react";
import { formatDateTimeBR } from "@/lib/history";
import {
  buildVisitsCsv,
  fetchRemoteVisits,
  localDaVisita,
  resumirNavegador,
  resumoVisitas,
  type VisitaRegistro,
} from "@/lib/visitas";

function baixarCsv(vs: VisitaRegistro[]) {
  const blob = new Blob(["﻿" + buildVisitsCsv(vs)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "acessos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Acessos ao site (IP, local, página, navegador). Só aparece depois que a
 * senha do painel foi aceita pelo registro central; a listagem usa a mesma
 * senha na função protegida admin_listar_visitas.
 */
export default function VisitasPanel({ password }: { password: string }) {
  const [visitas, setVisitas] = useState<VisitaRegistro[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [filtroIp, setFiltroIp] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro(null);
    try {
      setVisitas(await fetchRemoteVisits(password));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao consultar os acessos.");
    } finally {
      setCarregando(false);
    }
  }

  const lista = visitas
    ? filtroIp.trim()
      ? visitas.filter((v) => (v.ip ?? "").includes(filtroIp.trim()))
      : visitas
    : [];
  const resumo = visitas ? resumoVisitas(visitas) : null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold text-slate-900">Acessos ao site (IP)</h2>
      <p className="mt-1 text-sm text-slate-500">
        Cada página aberta grava IP, localização aproximada, página, origem e navegador. O IP é lido
        pelo servidor nos cabeçalhos da requisição — o visitante não consegue forjá-lo.
      </p>
      {erro && <p className="mt-2 text-sm text-rose-600">{erro}</p>}
      {visitas === null ? (
        <button
          type="button"
          onClick={() => void carregar()}
          disabled={carregando}
          className="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {carregando ? "Carregando…" : "Carregar acessos"}
        </button>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-600">
              <strong>{resumo!.total}</strong> acesso(s) · <strong>{resumo!.ipsDistintos}</strong> IP(s) distinto(s) ·{" "}
              <strong>{resumo!.ultimas24h}</strong> nas últimas 24 h
              {visitas.length >= 5000 ? " (o painel mostra até os 5.000 mais recentes)" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={filtroIp}
                onChange={(e) => setFiltroIp(e.target.value)}
                placeholder="Filtrar por IP"
                aria-label="Filtrar por IP"
                className="w-40 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => baixarCsv(visitas)}
                disabled={visitas.length === 0}
                className="rounded-lg border border-brand-600 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-40"
              >
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={() => void carregar()}
                disabled={carregando}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                {carregando ? "Atualizando…" : "Atualizar"}
              </button>
            </div>
          </div>
          {lista.length === 0 ? (
            <p className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
              {visitas.length === 0 ? "Nenhum acesso registrado ainda." : "Nenhum acesso com esse IP."}
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Data/hora</th>
                    <th className="px-3 py-2">IP</th>
                    <th className="px-3 py-2">Local</th>
                    <th className="px-3 py-2">Página</th>
                    <th className="px-3 py-2">Navegador</th>
                    <th className="px-3 py-2">Origem</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((v) => (
                    <tr key={v.id} className="border-t border-slate-100">
                      <td className="whitespace-nowrap px-3 py-2 text-slate-600">{formatDateTimeBR(v.createdAt)}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-800">{v.ip ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-600">{localDaVisita(v)}</td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-700">{v.caminho ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-600" title={v.userAgent ?? undefined}>{resumirNavegador(v.userAgent)}</td>
                      <td className="max-w-[220px] truncate px-3 py-2 text-slate-500" title={v.referer ?? undefined}>{v.referer ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
