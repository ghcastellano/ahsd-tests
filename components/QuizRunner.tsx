"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getInstrument } from "@/lib/instruments";
import { countAnswered, isComplete, optionsFor } from "@/lib/scoring";
import type { Responses } from "@/lib/types";
import ResultView from "./ResultView";

export default function QuizRunner({ id }: { id: string }) {
  const inst = getInstrument(id);
  const [responses, setResponses] = useState<Responses>({});
  const [submitted, setSubmitted] = useState(false);
  const [showError, setShowError] = useState(false);

  const answered = useMemo(
    () => (inst ? countAnswered(inst.questions, responses) : 0),
    [inst, responses],
  );

  if (!inst) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p>Instrumento não encontrado.</p>
        <Link href="/" className="text-brand-600 underline">
          Voltar
        </Link>
      </div>
    );
  }

  const total = inst.questions.length;
  const complete = isComplete(inst.questions, responses);
  const pct = Math.round((answered / total) * 100);

  function select(qid: string, value: number) {
    setResponses((r) => ({ ...r, [qid]: value }));
    setShowError(false);
  }

  function handleSubmit() {
    if (!complete) {
      setShowError(true);
      const firstUnanswered = inst!.questions.find((q) => responses[q.id] === undefined);
      if (firstUnanswered) {
        document.getElementById(`q-${firstUnanswered.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted) {
    const result = inst.score(responses);
    return (
      <ResultView
        inst={inst}
        result={result}
        onRetake={() => {
          setResponses({});
          setSubmitted(false);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="no-print text-sm text-brand-600 hover:underline">
        ← Todos os testes
      </Link>

      <header className="mt-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {inst.acronym}
          </span>
          <span className="text-xs text-slate-400">
            {total} itens · ~{inst.estMinutes} min · {inst.audience}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{inst.name}</h1>
        {inst.originalName && <p className="text-sm text-slate-400">{inst.originalName}</p>}
        <p className="mt-3 text-slate-600">{inst.intro}</p>
        <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm text-brand-900">
          <strong>Instruções:</strong> {inst.instructions}
        </div>
      </header>

      {/* sticky progress */}
      <div className="no-print sticky top-0 z-10 -mx-4 mt-6 border-b border-slate-200 bg-slate-50/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {answered} de {total} respondidas
          </span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ol className="mt-6 space-y-5">
        {inst.questions.map((q, idx) => {
          const opts = optionsFor(q, inst.defaultOptions);
          const chosen = responses[q.id];
          const unanswered = showError && chosen === undefined;
          return (
            <li
              key={q.id}
              id={`q-${q.id}`}
              className={`rounded-xl border bg-white p-4 ${
                unanswered ? "border-rose-300 ring-1 ring-rose-200" : "border-slate-200"
              }`}
            >
              <p className="font-medium text-slate-800">
                <span className="mr-1 text-slate-400">{idx + 1}.</span>
                {q.text}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {opts.map((o) => {
                  const active = chosen === o.value;
                  return (
                    <button
                      key={`${q.id}-${o.value}-${o.label}`}
                      type="button"
                      onClick={() => select(q.id, o.value)}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                        active
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      {showError && !complete && (
        <p className="mt-4 text-sm text-rose-600">
          Responda a todas as questões para ver o resultado (faltam {total - answered}).
        </p>
      )}

      <div className="no-print mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          Ver resultado
        </button>
        <span className="text-sm text-slate-400">
          {complete ? "Tudo respondido ✓" : `${total - answered} restantes`}
        </span>
      </div>
    </div>
  );
}
