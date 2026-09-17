"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildCsv,
  clearLocalRecords,
  fetchRemoteRecords,
  formatDateTimeBR,
  insertRemoteRecordDetalhado,
  loadLocalRecords,
  saveLocalRecord,
  type ResultRecord,
} from "@/lib/history";
import { codeFromHash, decodeRecord, extractCode, shareLink } from "@/lib/share";
import { remoteEnabled } from "@/lib/remote-config";
import { fmt, formatSubscaleValue } from "@/lib/subscale-format";
import VisitasPanel from "./VisitasPanel";
import type { Severity } from "@/lib/types";

// Chaves do localStorage para o login lembrado (só neste navegador).
const CHAVE_USUARIO = "ahsd:painel:usuario";
const CHAVE_SENHA = "ahsd:painel:senha";

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

function RecordsTable({ records, compartilhavel = false }: { records: ResultRecord[]; compartilhavel?: boolean }) {
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
                compartilhavel={compartilhavel}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RowGroup({ r, open, onToggle, compartilhavel }: { r: ResultRecord; open: boolean; onToggle: () => void; compartilhavel: boolean }) {
  const [copiado, setCopiado] = useState<"idle" | "ok" | "fail">("idle");
  async function copiarLink() {
    const url = shareLink(window.location.origin, r);
    try {
      await navigator.clipboard.writeText(url);
      setCopiado("ok");
    } catch {
      window.prompt("Copie o link do resultado:", url);
      setCopiado("fail");
    }
    setTimeout(() => setCopiado("idle"), 2500);
  }
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
          {fmt(r.totalScore)}/{fmt(r.maxScore)}
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
        <td className="whitespace-nowrap px-3 py-2 text-right">
          {compartilhavel && (
            <button type="button" onClick={() => void copiarLink()} className="mr-3 text-xs text-brand-600 hover:underline" aria-label={`Copiar link do resultado ${r.acronym}`}>
              {copiado === "ok" ? "link copiado ✓" : copiado === "fail" ? "copie do aviso" : "copiar link"}
            </button>
          )}
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
                    {formatSubscaleValue(r.instrumentId, s)}
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


export default function AdminPanel() {
  const [local, setLocal] = useState<ResultRecord[]>([]);
  const [password, setPassword] = useState("");
  const [remote, setRemote] = useState<ResultRecord[] | null>(null);
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Fila de importações pendentes: um segundo link aberto antes de confirmar o
  // primeiro entra na fila em vez de descartar o anterior silenciosamente.
  const [pendingImports, setPendingImports] = useState<ResultRecord[]>([]);
  const [pasteValue, setPasteValue] = useState("");
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  // Login do painel: usuário (só para o gerenciador de senhas do navegador
  // associar a senha a uma conta) e "lembrar neste aparelho" (guarda a senha
  // no localStorage e entra sozinho na próxima abertura).
  const [usuario, setUsuario] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [entrouSozinho, setEntrouSozinho] = useState(false);
  // Sonda: o site consegue gravar novos resultados no banco central?
  const [sonda, setSonda] = useState<{ gravacao: string; texto: string; detalhe: string } | null>(null);
  useEffect(() => {
    if (!remoteEnabled()) return;
    fetch("/api/registro-central", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setSonda(j))
      .catch(() => setSonda({ gravacao: "sem-conexao", texto: "não foi possível testar a gravação", detalhe: "" }));
  }, []);
  const central = useMemo(() => remoteEnabled(), []);

  // Sincroniza os registros deste dispositivo com o banco central (idempotente:
  // o banco ignora client_id duplicado, então rodar toda vez é seguro).
  useEffect(() => {
    if (!remoteEnabled()) return;
    const records = loadLocalRecords();
    if (records.length === 0) return;
    let cancelled = false;
    void (async () => {
      let ok = 0;
      const falhas: string[] = [];
      for (const r of records) {
        const e = await insertRemoteRecordDetalhado(r);
        if (e.ok) ok++;
        else falhas.push(e.motivo ?? "falha desconhecida");
        if (cancelled) return;
      }
      if (cancelled) return;
      // Antes só o sucesso era anunciado; a falha ficava muda e o registro
      // sumia do painel central sem explicação.
      if (falhas.length > 0) {
        setSyncMsg(
          `${ok} registro(s) sincronizado(s); ${falhas.length} não enviado(s) ao banco central — ${[...new Set(falhas)].join("; ")}. ` +
            'Use "copiar link" no registro para enviá-lo por mensagem ao avaliador.',
        );
      } else if (ok > 0) {
        setSyncMsg(`${ok} registro(s) deste dispositivo sincronizado(s) com o banco central.`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Usuário e senha lembrados neste aparelho.
    try {
      const u = window.localStorage.getItem(CHAVE_USUARIO);
      if (u) setUsuario(u);
      const sen = window.localStorage.getItem(CHAVE_SENHA);
      if (sen && remoteEnabled()) {
        setPassword(sen);
        setLembrar(true);
        setEntrouSozinho(true);
        void loadRemote(sen);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocal(loadLocalRecords());
    // Hoje os links de compartilhamento apontam para /resultado#CODIGO, mas
    // links antigos (/painel-ahsd#add=CODIGO) continuam funcionando aqui: o
    // fragmento não passa por servidores e o registro chega pronto para
    // confirmação. O listener de hashchange cobre um segundo link aberto na
    // mesma aba (navegação same-document não remonta o componente).
    function handleHash() {
      const code = codeFromHash(window.location.hash);
      if (!code) return;
      const rec = decodeRecord(code);
      if (rec) {
        setPendingImports((prev) => (prev.some((p) => p.id === rec.id) ? prev : [...prev, rec]));
        setImportMsg(null);
      } else {
        setImportMsg("O link de resultado recebido é inválido ou está corrompido.");
      }
      // Remove só o fragmento, preservando o caminho e a query string.
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const pendingImport = pendingImports[0] ?? null;

  function acceptPending() {
    if (!pendingImport) return;
    const exists = loadLocalRecords().some((r) => r.id === pendingImport.id);
    if (exists) {
      setImportMsg("Este resultado já estava no painel (não duplicado).");
    } else if (saveLocalRecord(pendingImport)) {
      setImportMsg("Resultado importado com sucesso.");
    } else {
      setImportMsg(
        "Não foi possível gravar neste navegador (modo privado ou armazenamento bloqueado). O resultado NÃO foi importado.",
      );
    }
    setLocal(loadLocalRecords());
    setPendingImports((prev) => prev.slice(1));
  }

  function importPasted() {
    // extractCode aceita o código puro (v2.…/v1.…) ou o link completo
    // (…/resultado#v2.… e o antigo …#add=v1.…) e ignora palavras soltas de uma
    // mensagem colada junto.
    const tokens = pasteValue.split(/\s+/).filter(Boolean);
    const codes = tokens.map(extractCode).filter((c): c is string => c !== null);
    let ok = 0;
    let dup = 0;
    let bad = 0;
    let failed = 0;
    const existing = new Set(loadLocalRecords().map((r) => r.id));
    for (const c of codes) {
      const rec = decodeRecord(c);
      if (!rec) {
        bad++;
      } else if (existing.has(rec.id)) {
        dup++;
      } else if (saveLocalRecord(rec)) {
        existing.add(rec.id);
        ok++;
      } else {
        failed++;
      }
    }
    setLocal(loadLocalRecords());
    setPasteValue("");
    if (codes.length === 0) {
      setImportMsg("Nenhum código de resultado encontrado no texto colado.");
    } else {
      setImportMsg(
        `Importação: ${ok} novo(s), ${dup} já existente(s), ${bad} inválido(s)` +
          (failed ? `, ${failed} com falha de gravação.` : "."),
      );
    }
  }

  async function loadRemote(senha: string = password) {
    setLoading(true);
    setRemoteError(null);
    try {
      setRemote(await fetchRemoteRecords(senha));
      try {
        if (usuario.trim()) window.localStorage.setItem(CHAVE_USUARIO, usuario.trim());
        if (lembrar) window.localStorage.setItem(CHAVE_SENHA, senha);
      } catch {
        // armazenamento bloqueado: segue sem lembrar
      }
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

  function esquecerSenha() {
    try {
      window.localStorage.removeItem(CHAVE_SENHA);
    } catch {
      // ignore
    }
    setLembrar(false);
    setEntrouSozinho(false);
    setPassword("");
    setRemote(null);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="no-print text-sm text-brand-600 hover:underline">← Site</Link>
      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Área restrita</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Painel de acompanhamento</h1>
        <p className="mt-1 text-sm text-slate-500">
          Histórico dos testes realizados, com data, hora, pontuação e detalhamento.
        </p>
      </div>

      {/* Confirmação de importação via link */}
      {pendingImport && (
        <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-5">
          <h2 className="font-semibold text-emerald-900">Resultado recebido por link</h2>
          <p className="mt-1 text-sm text-emerald-900">
            <strong>{pendingImport.acronym}</strong> — {pendingImport.instrumentName}
            {pendingImport.respondent ? ` · ${pendingImport.respondent}` : ""} ·{" "}
            {formatDateTimeBR(pendingImport.createdAt)} ·{" "}
            {fmt(pendingImport.totalScore)}/{fmt(pendingImport.maxScore)} ({pendingImport.bandLabel})
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
              onClick={() => setPendingImports((prev) => prev.slice(1))}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Descartar
            </button>
          </div>
          {pendingImports.length > 1 && (
            <p className="mt-2 text-xs text-emerald-800">
              +{pendingImports.length - 1} resultado(s) na fila.
            </p>
          )}
        </div>
      )}
      {importMsg && (
        <p className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          {importMsg}
        </p>
      )}
      {syncMsg && (
        <p
          className={`mt-3 rounded-lg border px-4 py-2 text-sm ${syncMsg.includes("não enviado") ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
          data-sync={syncMsg.includes("não enviado") ? "parcial" : "ok"}
        >
          ☁️ {syncMsg}
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
        <RecordsTable records={local} compartilhavel />

        <details className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">
            Importar resultado(s) por código
          </summary>
          <p className="mt-2 text-xs text-slate-500">
            Cole aqui um ou mais links/códigos de resultado recebidos (um por linha). O código é a
            parte que começa com <code className="rounded bg-slate-100 px-1">v2.</code> (ou{" "}
            <code className="rounded bg-slate-100 px-1">v1.</code>, formato antigo) — pode colar o
            link inteiro também.
          </p>
          <textarea
            value={pasteValue}
            onChange={(e) => setPasteValue(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-brand-500 focus:outline-none"
            placeholder="https://…/resultado#v2.YWhz…  ou  v2.YWhz…"
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
        {central && (
          <p
            className={`mt-1 text-sm ${!sonda ? "text-slate-400" : sonda.gravacao === "ok" ? "text-emerald-700" : "text-rose-700"}`}
            title={sonda?.detalhe || undefined}
            data-sonda={sonda?.gravacao}
          >
            Gravação de novos resultados: {sonda ? sonda.texto : "testando…"}
          </p>
        )}
        {!central ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            <p>
              O banco central (Supabase) <strong>não está ativado</strong> — mas você não precisa
              dele para receber resultados de outras pessoas: peça que usem o botão{" "}
              <strong>&quot;Compartilhar este resultado&quot;</strong> na tela de resultado e cole
              o link recebido no campo acima — o resultado entra na lista deste aparelho, sem
              passar por servidor nenhum.
            </p>
            <p className="mt-2">
              Para gravação automática num banco central (sem depender de links), siga o{" "}
              <code className="rounded bg-slate-100 px-1">GUIA-SUPABASE.md</code> do repositório.
            </p>
          </div>
        ) : remote === null ? (
          <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
            {/* Formulário de verdade (com usuário + senha e submit) para o navegador
                oferecer "salvar senha" e preencher sozinho nas próximas vezes. */}
            <form
              className="max-w-sm"
              onSubmit={(e) => {
                e.preventDefault();
                if (password && !loading) void loadRemote();
              }}
            >
              <label htmlFor="usuario" className="block text-sm font-medium text-slate-700">
                Usuário (e-mail) <span className="font-normal text-slate-400">— só para o navegador salvar a senha</span>
              </label>
              <input
                id="usuario"
                name="username"
                type="email"
                autoComplete="username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <label htmlFor="senha" className="mt-3 block text-sm font-medium text-slate-700">
                Senha do painel
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="senha"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!password || loading}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {loading ? "Carregando…" : "Entrar"}
                </button>
              </div>
              <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={lembrar} onChange={(e) => setLembrar(e.target.checked)} />
                Lembrar neste aparelho (entra sozinho da próxima vez)
              </label>
            </form>
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
                {(lembrar || entrouSozinho) && (
                  <button
                    type="button"
                    onClick={esquecerSenha}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                    title="Apaga a senha guardada neste aparelho"
                  >
                    Esquecer senha neste aparelho
                  </button>
                )}
              </div>
            </div>
            <RecordsTable records={remote} />
          </>
        )}
      </section>

      {/* Acessos (IP) — só depois que a senha foi aceita pelo registro central */}
      {central && remote !== null && <VisitasPanel password={password} />}

      <p className="mt-10 text-xs text-slate-400">
        Esta página não é indexada por buscadores e não aparece na navegação do site. Os registros
        não incluem as respostas individuais — apenas resultado agregado (pontuações, faixas e
        subescalas), data/hora e a identificação opcional informada por quem respondeu. O registro
        de acessos guarda IP, localização aproximada, página, origem e navegador de cada abertura
        de página, para segurança e auditoria de uso.
      </p>
    </div>
  );
}
