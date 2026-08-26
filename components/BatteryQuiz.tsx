"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import CellSvg from "./CellSvg";
import ShareBlock from "./ShareBlock";
import { getTest } from "@/lib/battery";
import type { Item, TestDef } from "@/lib/battery/types";
import { insertRemoteRecord, makeRecordId, saveLocalRecord, type ResultRecord } from "@/lib/history";
import { remoteEnabled } from "@/lib/remote-config";
import { useScrollTopOnScreenChange } from "@/lib/use-scroll-top";

type Phase = "intro" | "running" | "done";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  return `${m}:${String(sec % 60).padStart(2, "0")}`;
}

function band(pct: number): { label: string; text: string } {
  if (pct >= 0.9)
    return {
      label: "Excepcional no treino",
      text: "Você resolveu quase tudo, incluindo os itens de maior carga. Esse é o nível que justifica agendar a avaliação supervisionada.",
    };
  if (pct >= 0.75)
    return {
      label: "Forte",
      text: "Domínio consistente das regras, inclusive nas mais difíceis. Vale repetir sob tempo para consolidar velocidade.",
    };
  if (pct >= 0.5)
    return {
      label: "Intermediário",
      text: "Boa base. Reveja abaixo as regras dos itens que errou — a literatura mostra que aprender a taxonomia rende mais do que repetir itens.",
    };
  return {
    label: "Em construção",
    text: "Comece pelo guia de regras e refaça: ganho por familiaridade com o formato é real e rápido nas primeiras tentativas.",
  };
}

export default function BatteryQuiz({ id }: { id: string }) {
  const test = getTest(id) as TestDef | undefined;
  const items = useMemo<Item[]>(() => (test ? test.items() : []), [test]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [chosen, setChosen] = useState<(number | null)[]>(() => items.map(() => null));
  const [timeLeft, setTimeLeft] = useState(test?.timeLimitSeconds ?? 0);
  const [respondent, setRespondent] = useState("");
  const [savedRecord, setSavedRecord] = useState<ResultRecord | null>(null);
  const [reviewOnlyWrong, setReviewOnlyWrong] = useState(true);
  const finishedRef = useRef(false);

  const score = useMemo(
    () => items.reduce((acc, it, i) => acc + (chosen[i] === it.answerIndex ? 1 : 0), 0),
    [items, chosen],
  );

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          finish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Rola ao topo depois que a tela nova renderiza (ver o utilitário).
  useScrollTopOnScreenChange(phase);

  function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase("done");
  }

  // Grava o resultado quando o teste termina.
  useEffect(() => {
    if (phase !== "done" || !test) return;
    const correct = items.reduce((acc, it, i) => acc + (chosen[i] === it.answerIndex ? 1 : 0), 0);
    const b = band(correct / items.length);
    const byTier = (["media", "dificil", "extrema"] as const).map((tier) => {
      const subset = items.map((it, i) => ({ it, i })).filter(({ it }) => it.difficulty === tier);
      return {
        name: `Itens ${tier === "media" ? "de nível médio" : tier === "dificil" ? "difíceis" : "de carga extrema"}`,
        raw: subset.filter(({ it, i }) => chosen[i] === it.answerIndex).length,
        max: subset.length,
      };
    }).filter((s) => s.max > 0);

    const record: ResultRecord = {
      id: makeRecordId(),
      createdAt: new Date().toISOString(),
      instrumentId: `treino-${test.id}`,
      acronym: "TREINO",
      instrumentName: `Treino — ${test.name}`,
      respondent: respondent.trim() ? respondent.trim().slice(0, 80) : undefined,
      totalScore: correct,
      maxScore: items.length,
      bandLabel: b.label,
      severity: "info",
      subscales: byTier,
    };
    saveLocalRecord(record);
    if (remoteEnabled()) void insertRemoteRecord(record);
    setSavedRecord(record);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!test) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-slate-600">Treino não encontrado.</p>
        <Link href="/treino" className="text-brand-600 underline">Ver a bateria</Link>
      </div>
    );
  }

  // ---------------- Intro ----------------
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/treino" className="text-sm text-brand-600 hover:underline">← Bateria de treino</Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            {test.regime === "velocidade" ? "VELOCIDADE" : "POTÊNCIA"}
          </span>
          <span className="text-xs text-slate-400">{test.short}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{test.name}</h1>
        <p className="mt-1 text-sm text-slate-400">{test.modeledOn}</p>
        <p className="mt-3 text-slate-600">{test.intro}</p>

        <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-3 text-sm text-brand-900">
          <strong>Instruções:</strong> {test.instructions}
        </div>

        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Treino, não medida:</strong> itens originais, sem normatização — não geram QI nem
          percentil. Servem para você dominar o formato e a taxonomia de regras. Este site não tem
          afiliação com nenhuma sociedade de alto QI.
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Ainda não leu o{" "}
          <Link href="/treino/regras" className="font-medium text-brand-600 hover:underline">
            guia de regras
          </Link>
          ? Comece por ele: em estudo controlado, ~14 minutos de instrução explícita das regras
          produziram ganho maior do que qualquer repetição de itens.
        </p>

        <div className="mt-5">
          <label htmlFor="resp" className="block text-sm font-medium text-slate-700">
            Identificação (opcional)
          </label>
          <input
            id="resp"
            type="text"
            maxLength={80}
            value={respondent}
            onChange={(e) => setRespondent(e.target.value)}
            className="mt-1 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setPhase("running")}
          className="mt-5 rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition hover:bg-brand-700"
        >
          Iniciar — {fmt(test.timeLimitSeconds)} no relógio
        </button>
      </div>
    );
  }

  // ---------------- Resultado ----------------
  if (phase === "done") {
    const pct = score / items.length;
    const b = band(pct);
    const wrong = items.map((it, i) => ({ it, i })).filter(({ it, i }) => chosen[i] !== it.answerIndex);
    const shown = reviewOnlyWrong ? wrong : items.map((it, i) => ({ it, i }));

    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/treino" className="no-print text-sm text-brand-600 hover:underline">← Bateria de treino</Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">{test.name} — resultado</h1>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Acertos</p>
              <p className="mt-1 text-4xl font-bold text-slate-900">
                {score}
                <span className="text-lg font-normal text-slate-400"> / {items.length}</span>
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{b.label}</span>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.round(pct * 100)}%` }} />
          </div>
          <p className="mt-4 text-slate-700">{b.text}</p>
          <p className="mt-2 text-sm text-slate-500">
            Tempo usado: {fmt(test.timeLimitSeconds - timeLeft)} de {fmt(test.timeLimitSeconds)} ·{" "}
            {chosen.filter((c) => c !== null).length} de {items.length} respondidos.
          </p>
        </div>

        {/* Revisão — o núcleo do treino */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Revisão das regras</h2>
            <button
              type="button"
              onClick={() => setReviewOnlyWrong((v) => !v)}
              className="no-print rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              {reviewOnlyWrong ? `Ver todos os ${items.length}` : `Ver só os ${wrong.length} erros`}
            </button>
          </div>
          {shown.length === 0 ? (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Nenhum erro — gabarito completo. 🎯
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {shown.map(({ it, i }) => (
                <div key={it.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">
                      Item {i + 1}
                      <span className={`ml-2 text-xs ${chosen[i] === it.answerIndex ? "text-emerald-600" : "text-rose-600"}`}>
                        {chosen[i] === null ? "não respondido" : chosen[i] === it.answerIndex ? "correto" : "errado"}
                      </span>
                    </span>
                    <span className="text-xs uppercase tracking-wide text-slate-400">{it.difficulty}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{it.explanation}</p>
                  {it.textOptions && (
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-mono">{it.prompt}</span> → resposta:{" "}
                      <strong>{it.textOptions[it.answerIndex]}</strong>
                    </p>
                  )}
                  {it.options && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-slate-500">Resposta correta:</span>
                      <div className="rounded border border-emerald-300 bg-emerald-50 p-1">
                        <CellSvg cell={it.options[it.answerIndex]} uid={`rev-${it.id}`} size={54} />
                      </div>
                    </div>
                  )}
                  {it.set && (
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-slate-500">Era a figura:</span>
                      <div className="rounded border border-emerald-300 bg-emerald-50 p-1">
                        <CellSvg cell={it.set[it.answerIndex]} uid={`revs-${it.id}`} size={54} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {savedRecord && <ShareBlock record={savedRecord} />}

        <div className="no-print mt-6 flex flex-wrap gap-3">
          <Link href="/treino" className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
            Outro treino
          </Link>
          <Link href="/treino/regras" className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
            Guia de regras
          </Link>
        </div>
      </div>
    );
  }

  // ---------------- Execução ----------------
  const item = items[current];
  const answered = chosen.filter((c) => c !== null).length;
  const pick = (idx: number) =>
    setChosen((prev) => {
      const next = [...prev];
      next[current] = idx;
      return next;
    });

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Item {current + 1} de {items.length} · {answered} respondidos
          </span>
          <span className={`rounded-lg px-3 py-1 font-mono text-sm font-semibold ${timeLeft <= 30 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"}`}>
            ⏱ {fmt(timeLeft)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Ir ao item ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                i === current ? "bg-brand-600 ring-2 ring-brand-300" : chosen[i] !== null ? "bg-brand-400" : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Enunciado por formato */}
      {item.grid && (
        <div className="mt-6 flex justify-center">
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-300 bg-white p-3">
            {[0, 1, 2].flatMap((r) =>
              [0, 1, 2].map((c) => {
                const isAnswer = r === 2 && c === 2;
                return (
                  <div
                    key={`${r}${c}`}
                    className={`flex h-24 w-24 items-center justify-center rounded ${
                      isAnswer ? "border-2 border-dashed border-brand-400 bg-brand-50" : ""
                    }`}
                  >
                    {isAnswer ? (
                      <span className="text-3xl font-bold text-brand-400">?</span>
                    ) : (
                      <CellSvg cell={item.grid![r][c]} uid={`${item.id}-${r}${c}`} />
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>
      )}

      {item.sequence && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {item.sequence.map((c, i) => (
            <div key={i} className="flex h-24 w-24 items-center justify-center rounded border border-slate-300 bg-white">
              <CellSvg cell={c} uid={`${item.id}-s${i}`} />
            </div>
          ))}
          <div className="flex h-24 w-24 items-center justify-center rounded border-2 border-dashed border-brand-400 bg-brand-50">
            <span className="text-3xl font-bold text-brand-400">?</span>
          </div>
        </div>
      )}

      {item.prompt && !item.grid && (
        <div className="mt-8 rounded-xl border border-slate-300 bg-white p-6 text-center">
          <p className="font-mono text-2xl tracking-wide text-slate-800">{item.prompt}</p>
        </div>
      )}

      {/* Alternativas */}
      <p className="mt-5 text-center text-sm font-medium text-slate-600">
        {item.set ? "Qual figura NÃO pertence ao grupo?" : "Escolha a alternativa correta."}
      </p>

      {item.set && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {item.set.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              aria-label={`Figura ${i + 1}`}
              className={`flex items-center justify-center rounded-xl border-2 bg-white p-2 transition ${
                chosen[current] === i ? "border-brand-600 ring-2 ring-brand-200" : "border-slate-200 hover:border-brand-300"
              }`}
            >
              <CellSvg cell={c} uid={`${item.id}-o${i}`} size={66} />
            </button>
          ))}
        </div>
      )}

      {item.options && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {item.options.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              aria-label={`Alternativa ${i + 1}`}
              className={`flex items-center justify-center rounded-xl border-2 bg-white p-2 transition ${
                chosen[current] === i ? "border-brand-600 ring-2 ring-brand-200" : "border-slate-200 hover:border-brand-300"
              }`}
            >
              <CellSvg cell={c} uid={`${item.id}-o${i}`} size={70} />
            </button>
          ))}
        </div>
      )}

      {item.textOptions && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {item.textOptions.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              className={`rounded-xl border-2 bg-white px-4 py-3 font-mono text-lg transition ${
                chosen[current] === i ? "border-brand-600 bg-brand-50 ring-2 ring-brand-200" : "border-slate-200 hover:border-brand-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          ← Anterior
        </button>
        {current < items.length - 1 && (
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.min(items.length - 1, c + 1))}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Próximo →
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (answered === items.length || window.confirm(`Você respondeu ${answered} de ${items.length}. Finalizar mesmo assim?`)) {
              finish();
            }
          }}
          className="rounded-lg border border-brand-600 px-5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          Finalizar
        </button>
      </div>
    </div>
  );
}
