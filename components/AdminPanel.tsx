"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildCsv,
  clearLocalRecords,
  fetchRemoteRecords,
  formatDateTimeBR,
  loadLocalRecords,
  type ResultRecord,
} from "@/lib/history";
import { remoteEnabled } from "@/lib/remote-config";
import type { Severity } from "@/lib/types";

const severityBadge: Record<Severity, string> = {
  info: "bg-slate-100 text-slate-700",
  none: "bg-emerald-100 text-emerald-800",
  low: "bg-lime-100 text-lime-800",
  mild: "bg-yellow-100 text-yellow-800",
  moderate: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  severe: "bg-rose-100 text-rose-800",
};

function downloadCsv(records: ResultRecord[], filename: string) {
  const csv = buildCsv(records);
  // BOM para o Excel abrir com acentuação correta.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function RecordsTable({ records }: { records: ResultRecord[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (records.length === 0) {
    return <p className="mt-3 text-sm text-slate-500">Nenhum registro ainda.</p>;
  }

  return (
    <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Data e hora</th>
            <th className="px-3 py-2">Instrumento</th>
            <th className="px-3 py-2">Respondente</th>
            <th className="px-3 py-2">Pontuação</th>
            <th className="px-3 py-2">Faixa</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const open = openId === r.id;
            return (
              <RowGroup
                key={r.id + r.createdAt}
                r={r}
                open={open}
                onToggle={() => setOpenId(open ? null : r.id)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RowGroup({ r, open, onToggle }: { r: ResultRecord; open: boolean; onToggle: () => void }) {
  return (
    <>
      <tr className="border-t border-slate-100">
        <td className="whitespace-nowrap px-3 py-2 text-slate-600">{formatDateTimeBR(r.createdAt)}</td>
        <td className="px-3 py-2">
          <span className="mr-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
            {r.acronym}
          </span>
          <span className="text-slate-700">{r.instrumentName}</span>
        </td>
        <td className="px-3 py-2 text-slate-600">{r.respondent ?? <span className="text-slate-300">—</span>}</td>
        <td className="whitespace-nowrap px-3 py-2 font-medium text-slate-800">
          {formatScore(r.totalScore)}/{formatScore(r.maxScore)}
          {r.positive !== undefined && (
            <span className={`ml-2 text-xs ${r.positive ? "text-orange-600" : "text-emerald-600"}`}>
              {r.positive ? "positivo" : "negativo"}
            </span>
          )}
        </td>
        <td className="px-3 py-2">
          <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${severityBadge[r.severity] ?? severityBadge.info}`}>
            {r.bandLabel}
          </span>
        </td>
        <td className="px-3 py-2 text-right">
          {(r.subscales?.length || r.notes?.length) ? (
            <button type="button" onClick={onToggle} className="text-xs text-brand-600 hover:underline">
              {open ? "fechar" : "detalhes"}
            </button>
          ) : null}
        </td>
      </tr>
      {open && (
        <tr className="border-t border-slate-100 bg-slate-50/60">
          <td colSpan={6} className="px-4 py-3">
            {r.subscales && r.subscales.length > 0 && (
              <div className="grid gap-1 sm:grid-cols-2">
                {r.subscales.map((s, i) => (
                  <p key={i} className="text-xs text-slate-600">
                    <span className="font-medium text-slate-700">{s.name}:</span>{" "}
                    {s.mean !== undefined ? `média ${formatScore(s.mean)}/5` : `${formatScore(s.raw)}/${formatScore(s.max)}`}
                  </p>
                ))}
              </div>
            )}
            {r.notes && r.notes.length > 0 && (
              <ul className="mt-2 space-y-1">
                {r.notes.map((n, i) => (
                  <li key={i} className="text-xs text-slate-500">
                    {n}
                  </li>
                ))}
              </ul>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function formatScore(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
}

export default function AdminPanel() {
  const [local, setLocal] = useState<ResultRecord[]>([]);
  const [password, setPassword] = useState("");
  const [remote, setRemote] = useState<ResultRecord[] | null>(null);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const central = useMemo(() => remoteEnabled(), []);

  useEffect(() => {
    setLocal(loadLocalRecords());
  }, []);

  async function loadRemote() {
    setLoading(true);
    setRemoteError(null);
    try {
      setRemote(await fetchRemoteRecords(password));
    } catch (e) {
      setRemote(null);
      setRemoteError(e instanceof Error ? e.message : "Erro ao consultar o registro central.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Área restrita</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Painel de acompanhamento</h1>
          <p className="mt-1 text-sm text-slate-500">
            Histórico dos testes realizados, com data, hora, pontuação e detalhamento.
          </p>
        </div>
        <Link href="/" className="no-print text-sm text-brand-600 hover:underline">
          ← Site
        </Link>
      </div>

      {/* Registros deste dispositivo */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">
            Registros deste dispositivo{" "}
            <span className="text-sm font-normal text-slate-400">({local.length})</span>
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => downloadCsv(local, "resultados-dispositivo.csv")}
              disabled={local.length === 0}
              className="rounded-lg border border-brand-600 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-40"
            >
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Apagar todos os registros salvos neste dispositivo?")) {
                  clearLocalRecords();
                  setLocal([]);
                }
              }}
              disabled={local.length === 0}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              Apagar histórico
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Testes respondidos neste navegador. Registros feitos antes da criação deste painel não
          existem — o histórico começa a partir da ativação do recurso.
        </p>
        <RecordsTable records={local} />
      </section>

      {/* Registro central */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Registro central (todos os dispositivos)</h2>
        {!central ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p>
              O registro central ainda <strong>não está ativado</strong> — por enquanto, cada
              dispositivo guarda apenas os próprios testes.
            </p>
            <p className="mt-2">
              Para ativar: crie um projeto gratuito no Supabase, rode o script{" "}
              <code className="rounded bg-slate-100 px-1">supabase/setup.sql</code> do repositório e
              defina <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
              <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> nas
              variáveis de ambiente do Vercel. Instruções completas no README.
            </p>
          </div>
        ) : remote === null ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
            <label htmlFor="senha" className="block text-sm font-medium text-slate-700">
              Senha do painel
            </label>
            <div className="mt-2 flex max-w-sm gap-2">
              <input
                id="senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && password && !loading) void loadRemote();
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void loadRemote()}
                disabled={!password || loading}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? "Carregando…" : "Entrar"}
              </button>
            </div>
            {remoteError && <p className="mt-2 text-sm text-rose-600">{remoteError}</p>}
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-500">{remote.length} registro(s) no banco central.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => downloadCsv(remote, "resultados-central.csv")}
                  disabled={remote.length === 0}
                  className="rounded-lg border border-brand-600 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-40"
                >
                  Exportar CSV
                </button>
                <button
                  type="button"
                  onClick={() => void loadRemote()}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Atualizar
                </button>
              </div>
            </div>
            <RecordsTable records={remote} />
          </>
        )}
      </section>

      <p className="mt-10 text-xs text-slate-400">
        Esta página não é indexada por buscadores e não aparece na navegação do site. Os registros
        não incluem as respostas individuais — apenas resultado agregado (pontuações, faixas e
        subescalas), data/hora e a identificação opcional informada por quem respondeu.
      </p>
    </div>
  );
}
