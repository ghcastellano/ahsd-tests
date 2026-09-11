"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { codeFromHash, decodeRecord } from "@/lib/share";
import {
  formatDateTimeBR,
  insertRemoteRecord,
  loadLocalRecords,
  saveLocalRecord,
  type ResultRecord,
} from "@/lib/history";
import { remoteEnabled } from "@/lib/remote-config";
import type { Severity } from "@/lib/types";
import { formatSubscaleValue, subscaleFraction } from "@/lib/subscale-format";

const cor: Record<Severity, { badge: string; bar: string }> = {
  info: { badge: "bg-slate-100 text-slate-700", bar: "bg-slate-400" },
  none: { badge: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500" },
  low: { badge: "bg-lime-100 text-lime-800", bar: "bg-lime-500" },
  mild: { badge: "bg-yellow-100 text-yellow-800", bar: "bg-yellow-500" },
  moderate: { badge: "bg-amber-100 text-amber-800", bar: "bg-amber-500" },
  high: { badge: "bg-orange-100 text-orange-800", bar: "bg-orange-500" },
  severe: { badge: "bg-rose-100 text-rose-800", bar: "bg-rose-500" },
};

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
}

type Estado = "carregando" | "invalido" | "ok";

/**
 * Nem todo registro veio de /teste/[id]: os treinos de raciocínio gravam
 * `treino-*` e moram em outras rotas. Mandar todo mundo para /teste/{id}
 * levaria a uma página 404.
 */
function caminhoDoTeste(instrumentId: string): string {
  if (instrumentId === "treino-matrizes") return "/teste-qi";
  if (instrumentId.startsWith("treino-")) return `/treino/${instrumentId.slice("treino-".length)}`;
  return `/teste/${instrumentId}`;
}

export default function SharedResult() {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [rec, setRec] = useState<ResultRecord | null>(null);
  const [salvo, setSalvo] = useState<string | null>(null);

  useEffect(() => {
    function ler() {
      const code = codeFromHash(window.location.hash);
      const r = code ? decodeRecord(code) : null;
      if (r) {
        setRec(r);
        setEstado("ok");
        setSalvo(loadLocalRecords().some((x) => x.id === r.id) ? "ja" : null);
      } else {
        setEstado("invalido");
      }
    }
    ler();
    window.addEventListener("hashchange", ler);
    return () => window.removeEventListener("hashchange", ler);
  }, []);

  function importar() {
    if (!rec) return;
    if (loadLocalRecords().some((x) => x.id === rec.id)) {
      setSalvo("ja");
      return;
    }
    const ok = saveLocalRecord(rec);
    if (ok && remoteEnabled()) void insertRemoteRecord(rec);
    setSalvo(ok ? "novo" : "falhou");
  }

  if (estado === "carregando") {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center text-slate-400">Abrindo resultado…</div>;
  }

  if (estado === "invalido" || !rec) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Link de resultado inválido</h1>
        <p className="mt-3 text-slate-600">
          O link pode ter sido cortado ao ser enviado (alguns aplicativos quebram links longos).
          Peça para reenviarem — ou cole o código completo no painel.
        </p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
          Ir para os testes
        </Link>
      </div>
    );
  }

  const c = cor[rec.severity] ?? cor.info;
  const pct = rec.maxScore > 0 ? Math.min(100, Math.round((rec.totalScore / rec.maxScore) * 100)) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
        Resultado compartilhado
      </p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">{rec.instrumentName}</h1>
      <p className="mt-1 text-sm text-slate-500">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
          {rec.acronym}
        </span>
        {rec.respondent ? ` · ${rec.respondent}` : ""} · {formatDateTimeBR(rec.createdAt)}
      </p>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Pontuação</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">
              {fmt(rec.totalScore)}
              <span className="text-lg font-normal text-slate-400"> / {fmt(rec.maxScore)}</span>
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${c.badge}`}>{rec.bandLabel}</span>
        </div>
        {!rec.metricIsMean && (
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
          </div>
        )}
        {rec.positive !== undefined && (
          <p className={`mt-3 text-sm font-medium ${rec.positive ? "text-orange-700" : "text-emerald-700"}`}>
            ● {rec.positive ? "Rastreio positivo" : "Rastreio negativo / abaixo do limiar"}
          </p>
        )}
      </div>

      {rec.subscales && rec.subscales.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Detalhamento por dimensão</h2>
          <div className="space-y-3">
            {rec.subscales.map((s, i) => {
              const pct = Math.min(100, Math.max(0, Math.round(subscaleFraction(rec.instrumentId, s) * 100)));
              return (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className="text-sm text-slate-500">{formatSubscaleValue(rec.instrumentId, s)}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ação de quem recebeu: guardar no próprio painel */}
      <div className="no-print mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="font-semibold text-emerald-900">Guardar no meu painel</h2>
        <p className="mt-1 text-sm text-emerald-900">
          Salva este resultado na sua lista de acompanhamento
          {remoteEnabled() ? " e no registro central" : " neste aparelho"}.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={importar}
            disabled={salvo === "novo" || salvo === "ja"}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {salvo === "novo" ? "Guardado ✓" : salvo === "ja" ? "Já estava no painel" : "Guardar no painel"}
          </button>
          <Link
            href="/painel-ahsd"
            className="rounded-lg border border-emerald-600 px-5 py-2.5 font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            Abrir o painel
          </Link>
        </div>
        {salvo === "falhou" && (
          <p className="mt-2 text-sm text-rose-700">
            Não foi possível gravar neste navegador (modo privado ou armazenamento bloqueado).
          </p>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Lembrete:</strong> este é um resultado de rastreio (triagem), não um diagnóstico.
        Ele mostra apenas o resultado agregado — as respostas item a item não são compartilhadas.
      </div>

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-brand-600 px-5 py-2.5 font-medium text-brand-700 hover:bg-brand-50"
        >
          Imprimir / salvar PDF
        </button>
        <Link href={caminhoDoTeste(rec.instrumentId)} className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
          Fazer este teste
        </Link>
        <Link href="/" className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
          Todos os testes
        </Link>
      </div>
    </div>
  );
}
