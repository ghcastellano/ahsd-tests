"use client";

import Link from "next/link";
import type { Instrument, InstrumentResult, Severity } from "@/lib/types";
import type { ResultRecord } from "@/lib/history";
import ShareBlock from "./ShareBlock";

const severityStyles: Record<Severity, { badge: string; bar: string; text: string }> = {
  info: { badge: "bg-slate-100 text-slate-700", bar: "bg-slate-400", text: "text-slate-700" },
  none: { badge: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500", text: "text-emerald-700" },
  low: { badge: "bg-lime-100 text-lime-800", bar: "bg-lime-500", text: "text-lime-700" },
  mild: { badge: "bg-yellow-100 text-yellow-800", bar: "bg-yellow-500", text: "text-yellow-700" },
  moderate: { badge: "bg-amber-100 text-amber-800", bar: "bg-amber-500", text: "text-amber-700" },
  high: { badge: "bg-orange-100 text-orange-800", bar: "bg-orange-500", text: "text-orange-700" },
  severe: { badge: "bg-rose-100 text-rose-800", bar: "bg-rose-500", text: "text-rose-700" },
};

export default function ResultView({
  inst,
  result,
  record,
  onRetake,
}: {
  inst: Instrument;
  result: InstrumentResult;
  record?: ResultRecord;
  onRetake: () => void;
}) {
  const sev = severityStyles[result.band.severity];
  const isMean = result.metricIsMean ?? false;
  const scorePct = Math.min(100, Math.round((result.totalScore / result.maxScore) * 100));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="no-print text-sm text-brand-600 hover:underline">
        ← Todos os testes
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {inst.acronym}
        </span>
        <span className="text-xs text-slate-400">Resultado</span>
      </div>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{inst.name}</h1>

      {/* Headline score */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{inst.primaryMetricLabel}</p>
            <p className="mt-1 text-4xl font-bold text-slate-900">
              {formatNumber(result.totalScore)}
              <span className="text-lg font-normal text-slate-400"> / {formatNumber(result.maxScore)}</span>
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${sev.badge}`}>
            {result.band.label}
          </span>
        </div>

        {!isMean && (
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${sev.bar}`} style={{ width: `${scorePct}%` }} />
          </div>
        )}

        <p className="mt-4 text-slate-700">{result.band.description}</p>

        {result.positive !== undefined && (
          <p className={`mt-3 text-sm font-medium ${result.positive ? "text-orange-700" : "text-emerald-700"}`}>
            {result.positive
              ? `● ${result.positiveLabel ?? "Rastreio positivo"}`
              : "● Rastreio negativo / abaixo do limiar"}
          </p>
        )}
      </div>

      {/* Subscales */}
      {result.subscales && result.subscales.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Detalhamento por dimensão</h2>
          <div className="space-y-3">
            {result.subscales.map((s) => {
              const denom = s.mean !== undefined ? 5 : s.max || 1;
              const value = s.mean !== undefined ? s.mean : s.raw;
              const barPct = Math.min(100, Math.round((value / denom) * 100));
              const ssev = s.band ? severityStyles[s.band.severity] : severityStyles.info;
              return (
                <div key={s.key} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{s.name}</span>
                    <span className="text-sm text-slate-500">
                      {s.mean !== undefined ? `média ${formatNumber(s.mean)}/5` : `${s.raw}/${s.max}`}
                    </span>
                  </div>
                  {s.description && <p className="mt-0.5 text-xs text-slate-400">{s.description}</p>}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${ssev.bar}`} style={{ width: `${barPct}%` }} />
                  </div>
                  {s.band && <p className={`mt-1 text-xs ${ssev.text}`}>{s.band.label}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {result.notes && result.notes.length > 0 && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Observações</h2>
          <ul className="space-y-1.5 text-sm text-slate-600">
            {result.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Interpretation legend */}
      {inst.interpretationBands.length > 1 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Faixas de interpretação</h2>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <tbody>
                {inst.interpretationBands.map((b, i) => {
                  const bsev = severityStyles[b.severity];
                  const active = result.totalScore >= b.min && result.totalScore <= b.max;
                  return (
                    <tr key={i} className={`border-b border-slate-100 last:border-0 ${active ? "bg-brand-50" : "bg-white"}`}>
                      <td className="whitespace-nowrap px-3 py-2 align-top text-slate-500">
                        {formatNumber(b.min)}–{formatNumber(b.max)}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${bsev.badge}`}>
                          {b.label}
                        </span>
                        {active && <span className="ml-2 text-xs font-medium text-brand-600">← você</span>}
                      </td>
                      <td className="px-3 py-2 align-top text-slate-600">{b.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* References */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Referências</h2>
        <ul className="space-y-1 text-xs text-slate-500">
          {inst.references.map((ref, i) => (
            <li key={i}>
              {ref.url ? (
                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {ref.label}
                </a>
              ) : (
                ref.label
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Compartilhar com o avaliador */}
      {record && <ShareBlock record={record} />}

      {/* Disclaimer */}
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Lembrete:</strong> este resultado é um rastreio (triagem), não um diagnóstico.
        Instrumentos de autorrelato têm limitações. Leve este relatório a um profissional
        qualificado para interpretação no seu contexto.
        {inst.category === "altas-habilidades" && (
          <>
            {" "}
            <Link href="/superdotacao" className="font-medium underline">
              Entenda como este rastreio se relaciona com testes de QI e com o laudo formal de
              AH/SD →
            </Link>
          </>
        )}
      </div>

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-brand-600 px-5 py-2.5 font-medium text-brand-700 transition hover:bg-brand-50"
        >
          Imprimir / salvar PDF
        </button>
        <button
          type="button"
          onClick={onRetake}
          className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Refazer
        </button>
        <Link
          href="/"
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700"
        >
          Outros testes
        </Link>
      </div>
    </div>
  );
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ",");
}
