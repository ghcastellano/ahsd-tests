"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildCsv,
  clearLocalRecords,
  fetchRemoteRecords,
  formatDateTimeBR,
  loadLocalRecords,
  saveLocalRecord,
  type ResultRecord,
} from "@/lib/history";
import { codeFromHash, decodeRecord } from "@/lib/share";
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
  const [pendingImport, setPendingImport] = useState<ResultRecord | null>(null);
  const [pasteValue, setPasteValue] = useState("");
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const central = useMemo(() => remoteEnabled(), []);

  useEffect(() => {
    setLocal(loadLocalRecords());
    // Link de compartilhamento: /painel-ahsd#add=CODIGO — o fragmento não passa
    // por servidores; o registro chega pronto para confirmação. O listener de
    // hashchange cobre um segundo link aberto na mesma aba (navegação
    // same-document não remonta o componente).
    function handleHash() {
      const code = codeFromHash(window.location.hash);
      if (!code) return;
      const rec = decodeRecord(code);
      if (rec) {
        setPendingImport(rec);
        setImportMsg(null);
      } else {
        setImportMsg("O link de resultado recebido é inválido ou está corrompido.");
      }
      window.history.replaceState(null, "", window.location.pathname);
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  function acceptPending() {
    if (!pendingImport) return;
    const exists = loadLocalRecords().some((r) => r.id === pendingImport.id);
    if (!exists) saveLocalRecord(pendingImport);
    setLocal(loadLocalRecords());
    setImportMsg(exists ? "Este resultado já estava no painel (não duplicado)." : "Resultado importado com sucesso.");
    setPendingImport(null);
  }

  function importPasted() {
    // Aceita tanto o código puro (v1.…) quanto o link completo (…#add=v1.…).
    const codes = pasteValue
      .split(/\s+/)
      .filter(Boolean)
      .map((tok) => {
        const idx = tok.indexOf("#add=");
        if (idx === -1) return tok;
        try {
          return decodeURIComponent(tok.slice(idx + 5));
        } catch {
          return tok.slice(idx + 5);
        }
      });
    let ok = 0;
    let dup = 0;
    let bad = 0;
    const existing = new Set(loadLocalRecords().map((r) => r.id));
    for (const c of codes) {
      const rec = decodeRecord(c);
      if (!rec) {
        bad++;
      } else if (existing.has(rec.id)) {
        dup++;
      } else {
        saveLocalRecord(rec);
        existing.add(rec.id);
        ok++;
      }
    }
    setLocal(loadLocalRecords());
    setPasteValue("");
    setImportMsg(
      `Importação: ${ok} novo(s), ${dup} já existente(s), ${bad} inválido(s).`,
    );
  }

  async function loadRemote() {
    setLoading(true);
    setRemoteError(null);
    try {
      setRemote(await fetchRemoteRecords(password));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao consultar o registro central.";
      setRemoteError(msg);
      // Senha recusada volta ao login; falha transitória (rede/5xx) durante um
      // "Atualizar" preserva os dados já carregados.
      setRemote((prev) => (msg === "Senha incorreta." ? null : prev));
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

      {/* Confirmação de importação via link */}
      {pendingImport && (
        <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-5">
          <h2 className="font-semibold text-emerald-900">Resultado recebido por link</h2>
          <p className="mt-1 text-sm text-emerald-900">
            <strong>{pendingImport.acronym}</strong> — {pendingImport.instrumentName}
            {pendingImport.respondent ? ` · ${pendingImport.respondent}` : ""} ·{" "}
            {formatDateTimeBR(pendingImport.createdAt)} ·{" "}
            {pendingImport.totalScore}/{pendingImport.maxScore} ({pendingImport.bandLabel})
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={acceptPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Importar para o painel
            </button>
            <button
              type="button"
              onClick={() => setPendingImport(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
      {importMsg && (
        <p className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          {importMsg}
        </p>
      )}

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
          Testes respondidos neste navegador + resultados importados por link. Registros feitos
          antes da criação deste painel não existem — o histórico começa a partir da ativação do
          recurso.
        </p>
        <RecordsTable records={local} />

        <details className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            Importar resultado(s) por código
          </summary>
          <p className="mt-2 text-xs text-slate-500">
            Cole aqui um ou mais links/códigos de resultado recebidos (um por linha). O código é a
            parte que começa com <code className="rounded bg-slate-100 px-1">v1.</code> — pode
            colar o link inteiro também.
          </p>
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-brand-500 focus:outline-none"
            placeholder="https://…/painel-ahsd#add=v1.eyJ…  ou  v1.eyJ…"
          />
          <button
            type="button"
            onClick={importPasted}
            disabled={!pasteValue.trim()}
            className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
          >
            Importar
          </button>
        </details>
      </section>

      {/* Registro central */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Registro central (todos os dispositivos)</h2>
        {!central ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p>
              O banco central (Supabase) <strong>não está ativado</strong> — mas você não precisa
              dele para receber resultados de outras pessoas: peça que usem o botão{" "}
              <strong>&quot;Enviar este resultado ao avaliador&quot;</strong> na tela de resultado
              e abra o link aqui neste aparelho — o resultado entra na lista acima, sem passar por
              servidor nenhum.
            </p>
            <p className="mt-2">
              Para gravação automática num banco central (sem depender de links), siga o{" "}
              <code className="rounded bg-slate-100 px-1">GUIA-SUPABASE.md</code> do repositório.
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
            {remoteError && <p className="mt-2 text-sm text-rose-600">{remoteError}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-500">
                {remote.length} registro(s) no banco central
                {remote.length >= 2000 ? " (o painel mostra até os 2.000 mais recentes)" : ""}.
              </p>
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
