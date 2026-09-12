"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  cellAt,
  describeRules,
  grade,
  itemsForSeed,
  optionsFor,
  TIME_LIMIT_SECONDS,
  type CellSpec,
  type MatrixScore,
} from "@/lib/matrix/engine";
import { makeRecordId, saveLocalRecord, type ResultRecord } from "@/lib/history";
import { useScrollTopOnScreenChange } from "@/lib/use-scroll-top";
import { useSeed } from "@/lib/use-seed";
import ShareBlock from "./ShareBlock";

// ---------- Renderização SVG de uma célula ----------

const INK = "#1e293b";

function shapeElement(spec: CellSpec, cx: number, cy: number, s: number, uid: string) {
  const fill =
    spec.fill === "solid" ? INK : spec.fill === "half" ? `url(#half-${uid})` : "transparent";
  const common = {
    fill,
    stroke: INK,
    strokeWidth: 3,
    transform: spec.rotation ? `rotate(${spec.rotation} ${cx} ${cy})` : undefined,
  } as const;

  switch (spec.shape) {
    case "circle":
      return <circle cx={cx} cy={cy} r={s} {...common} />;
    case "square":
      return <rect x={cx - s} y={cy - s} width={2 * s} height={2 * s} {...common} />;
    case "triangle":
      return (
        <polygon
          points={`${cx},${cy - s} ${cx - s * 0.95},${cy + s * 0.75} ${cx + s * 0.95},${cy + s * 0.75}`}
          {...common}
        />
      );
    case "diamond":
      return (
        <polygon points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`} {...common} />
      );
    case "cross": {
      const w = s * 0.38;
      return (
        <polygon
          points={[
            `${cx - w},${cy - s}`, `${cx + w},${cy - s}`, `${cx + w},${cy - w}`,
            `${cx + s},${cy - w}`, `${cx + s},${cy + w}`, `${cx + w},${cy + w}`,
            `${cx + w},${cy + s}`, `${cx - w},${cy + s}`, `${cx - w},${cy + w}`,
            `${cx - s},${cy + w}`, `${cx - s},${cy - w}`, `${cx - w},${cy - w}`,
          ].join(" ")}
          {...common}
        />
      );
    }
    case "star": {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? s : s * 0.45;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
      }
      return <polygon points={pts.join(" ")} {...common} />;
    }
  }
}

const POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[32, 32], [68, 68]],
  3: [[50, 28], [30, 70], [70, 70]],
  4: [[30, 30], [70, 30], [30, 70], [70, 70]],
};

function CellSvg({ spec, uid, size = 92 }: { spec: CellSpec; uid: string; size?: number }) {
  const base = [10, 14, 18][spec.size - 1];
  const s = spec.count > 1 ? base * 0.78 : base * 1.5;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <defs>
        <linearGradient id={`half-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="50%" stopColor={INK} />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {POSITIONS[spec.count].map(([cx, cy], i) => (
        <g key={i}>{shapeElement(spec, cx, cy, s, uid)}</g>
      ))}
    </svg>
  );
}

// ---------- Componente principal ----------

type Phase = "intro" | "running" | "done";

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function bandFor(score: MatrixScore): { label: string; text: string } {
  const c = score.correct;
  if (c >= 28)
    return {
      label: "Desempenho excepcional no treino",
      text: "Você resolveu praticamente tudo, incluindo os itens difíceis. Esse é o tipo de desempenho que justifica agendar o teste supervisionado da Mensa — lembrando que só ele tem validade.",
    };
  if (c >= 23)
    return {
      label: "Desempenho forte no treino",
      text: "Acertos consistentes inclusive nos níveis mais altos. Vale praticar o formato com tempo e tentar o teste oficial supervisionado.",
    };
  if (c >= 15)
    return {
      label: "Bom desempenho no treino",
      text: "Boa base de raciocínio fluido. Familiaridade com o formato costuma melhorar o desempenho — treine e observe os padrões que errou.",
    };
  return {
    label: "Treino inicial",
    text: "Use este resultado como familiarização com o formato. Desempenho em matrizes melhora bastante com prática — e um treino não mede sua capacidade real.",
  };
}

export default function MatrixQuiz() {
  // Cada tentativa recebe uma semente: os itens (valores, formas, ordem das
  // alternativas) mudam, mas a estrutura das regras e a graduação não.
  const [seed] = useSeed();
  const items = useMemo(() => itemsForSeed(seed ?? 0), [seed]);
  const [phase, setPhase] = useState<Phase>("intro");
  const [current, setCurrent] = useState(0);
  const [chosen, setChosen] = useState<(number | null)[]>(() => items.map(() => null));
  // A semente só chega após o primeiro render: zera as respostas quando os itens mudam
  // (sempre antes de começar, porque o botão "Iniciar" espera a semente).
  useEffect(() => {
    setChosen(items.map(() => null));
  }, [items]);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SECONDS);
  const [respondent, setRespondent] = useState("");
  const [savedRecord, setSavedRecord] = useState<ResultRecord | null>(null);
  const [reviewOnlyWrong, setReviewOnlyWrong] = useState(true);
  const finishedRef = useRef(false);

  const allOptions = useMemo(() => items.map((it) => optionsFor(it, seed ?? 0)), [items, seed]);
  const score = useMemo(
    () => (phase === "done" ? grade(chosen, items, seed ?? 0) : null),
    [phase, chosen, items, seed],
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

  useScrollTopOnScreenChange(phase);

  function finish() {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase("done");
  }

  // Grava o registro quando o resultado é calculado.
  useEffect(() => {
    if (phase !== "done" || !score) return;
    const band = bandFor(score);
    const record = {
      id: makeRecordId(),
      createdAt: new Date().toISOString(),
      instrumentId: "treino-matrizes",
      acronym: "MATRIZES",
      instrumentName: "Treino de Raciocínio Fluido (matrizes, estilo Mensa)",
      respondent: respondent.trim() ? respondent.trim().slice(0, 80) : undefined,
      totalScore: score.correct,
      maxScore: score.total,
      bandLabel: band.label,
      severity: "info" as const,
      subscales: (["facil", "medio", "dificil"] as const).map((t) => ({
        name: `Itens ${t === "facil" ? "fáceis" : t === "medio" ? "médios" : "difíceis"}`,
        raw: score.byTier[t].correct,
        max: score.byTier[t].total,
      })),
    };
    saveLocalRecord(record);
    // O envio ao registro central (com status na tela) acontece no ShareBlock.
    setSavedRecord(record);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---------- Telas ----------

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="text-sm text-brand-600 hover:underline">
          ← Todos os testes
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            MATRIZES
          </span>
          <span className="text-xs text-slate-400">30 itens · 25 minutos · cronometrado</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Treino de Raciocínio Fluido — estilo Mensa
        </h1>
        <p className="mt-3 text-slate-600">
          Matrizes progressivas 3×3 no mesmo formato dos testes de admissão da Mensa e das
          Matrizes de Raven: em cada item, descubra o padrão (forma, preenchimento, rotação,
          tamanho, quantidade) e escolha a figura que completa a matriz. A dificuldade aumenta ao
          longo do teste. As questões são sorteadas de um banco a cada tentativa — decorar não
          adianta; só o raciocínio.
        </p>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Leia antes de começar:</strong> este é um <strong>treino original</strong> desta
          plataforma — não é o teste da Mensa (que é sigiloso e aplicado presencialmente) e{" "}
          <strong>não gera QI nem percentil válidos</strong>, pois não tem normatização nem
          supervisão. Ele serve para você conhecer o formato e exercitar o raciocínio fluido. Só o
          teste supervisionado da Mensa (ou um laudo com testes aprovados) decide a admissão.
          Este site <strong>não tem afiliação com a Mensa</strong> — &quot;Mensa&quot; é marca da
          Mensa International, citada aqui apenas para descrever o formato do teste.
        </div>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>30 itens, 25 minutos corridos — o teste encerra sozinho no fim do tempo.</li>
          <li>Você pode navegar entre os itens e mudar respostas antes de finalizar.</li>
          <li>Faça em um lugar tranquilo, sem interrupções, como no teste real.</li>
        </ul>
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
            placeholder="ex.: Gustavo"
            className="mt-1 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => setPhase("running")}
          disabled={seed === null}
          className="mt-5 rounded-lg bg-brand-600 px-6 py-3 font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
        >
          Iniciar cronômetro e começar
        </button>
        <p className="mt-3 text-xs text-slate-400">
          Ao finalizar, um registro do resultado (data/hora, identificação opcional e pontuações)
          é salvo para o painel de acompanhamento.
        </p>
      </div>
    );
  }

  if (phase === "done" && score) {
    const band = bandFor(score);
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="no-print text-sm text-brand-600 hover:underline">
          ← Todos os testes
        </Link>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Resultado do treino</h1>

        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Acertos</p>
              <p className="mt-1 text-4xl font-bold text-slate-900">
                {score.correct}
                <span className="text-lg font-normal text-slate-400"> / {score.total}</span>
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              {band.label}
            </span>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${Math.round((score.correct / score.total) * 100)}%` }}
            />
          </div>
          <p className="mt-4 text-slate-700">{band.text}</p>
          <p className="mt-2 text-sm text-slate-500">
            Tempo utilizado: {fmtTime(TIME_LIMIT_SECONDS - timeLeft)} de {fmtTime(TIME_LIMIT_SECONDS)} ·{" "}
            {score.answered} de {score.total} itens respondidos.
          </p>
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Acertos por dificuldade</h2>
          <div className="space-y-3">
            {(["facil", "medio", "dificil"] as const).map((t) => {
              const b = score.byTier[t];
              const nome = t === "facil" ? "Itens fáceis (1–10)" : t === "medio" ? "Itens médios (11–20)" : "Itens difíceis (21–30)";
              return (
                <div key={t} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-800">{nome}</span>
                    <span className="text-sm text-slate-500">{b.correct}/{b.total}</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${Math.round((b.correct / b.total) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revisão item a item: clique para ver a matriz, a alternativa marcada e a correta */}
        {(() => {
          const errados = items.map((it, i) => ({ it, i })).filter(({ it, i }) => chosen[i] !== allOptions[i].answerIndex);
          const lista = reviewOnlyWrong ? errados : items.map((it, i) => ({ it, i }));
          return (
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-slate-900">Revisão dos itens</h2>
                <button
                  type="button"
                  onClick={() => setReviewOnlyWrong((v) => !v)}
                  className="no-print rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                >
                  {reviewOnlyWrong ? `Ver todos os ${items.length}` : `Ver só os ${errados.length} erros`}
                </button>
              </div>
              <p className="mt-1 text-sm text-slate-500">Clique em um item para ver a matriz, a alternativa que você marcou e a correta.</p>
              {lista.length === 0 ? (
                <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">Nenhum erro — gabarito completo. 🎯</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {lista.map(({ it, i }) => {
                    const { options: ops, answerIndex: correta } = allOptions[i];
                    const marcada = chosen[i];
                    const errou = marcada !== correta;
                    return (
                      <details key={it.id} className={`rounded-lg border px-3 py-2 ${errou ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`} data-revisao={`m${it.id}`}>
                        <summary className={`cursor-pointer text-sm font-medium ${errou ? "text-rose-700" : "text-emerald-800"}`}>
                          Item {i + 1} — {marcada === null ? "não respondido" : errou ? "errado" : "correto"} · {it.tier} · ver a questão
                        </summary>
                        <p className={`mt-2 text-sm font-medium ${errou ? "text-rose-700" : "text-emerald-700"}`}>
                          {marcada === null
                            ? `Você não respondeu este item. A correta é a alternativa ${correta + 1}.`
                            : errou
                              ? `Você marcou a alternativa ${marcada + 1}; a correta é a ${correta + 1}.`
                              : `Você acertou: alternativa ${correta + 1}.`}
                        </p>
                        <div className="mt-3 flex justify-center">
                          <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-300 bg-white p-2">
                            {[0, 1, 2].flatMap((r) =>
                              [0, 1, 2].map((c) => {
                                const vazia = r === 2 && c === 2;
                                return (
                                  <div key={`${r}${c}`} className={`flex h-[72px] w-[72px] items-center justify-center rounded ${vazia ? "border-2 border-dashed border-emerald-400 bg-emerald-50" : ""}`}>
                                    <CellSvg spec={vazia ? ops[correta] : cellAt(it, r, c)} uid={`rev${it.id}-${r}${c}`} size={64} />
                                  </div>
                                );
                              }),
                            )}
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                          {ops.map((opt, k) => {
                            const papel = k === correta && k === marcada ? "certa-e-escolhida" : k === correta ? "correta" : k === marcada ? "escolhida" : null;
                            const classe = k === correta ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200" : k === marcada ? "border-rose-500 bg-rose-50 ring-2 ring-rose-200" : "border-slate-200 bg-white opacity-60";
                            return (
                              <div key={k} data-papel={papel ?? undefined} aria-label={`Alternativa ${k + 1}${papel ? ` (${papel})` : ""}`}>
                                <div className={`flex items-center justify-center rounded-xl border-2 p-1 ${classe}`}>
                                  <CellSvg spec={opt} uid={`revo${it.id}-${k}`} size={56} />
                                </div>
                                {papel && (
                                  <span className={`mt-1 block text-center text-[11px] font-semibold ${papel === "escolhida" ? "text-rose-700" : "text-emerald-700"}`}>
                                    {papel === "certa-e-escolhida" ? "✓ sua resposta (correta)" : papel === "correta" ? "✓ correta" : "✗ sua resposta"}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <ul className="mt-3 list-disc space-y-0.5 pl-5 text-sm text-slate-600">
                          {describeRules(it).map((t, k) => (
                            <li key={k}>{t}</li>
                          ))}
                        </ul>
                      </details>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Interpretação honesta:</strong> não existe conversão válida deste treino para QI
          ou percentil — ele não é normatizado nem supervisionado. Um bom desempenho aqui é um
          incentivo real para tentar o teste oficial; um desempenho fraco hoje também não te
          define: familiaridade com o formato melhora muito o resultado.
        </div>

        {savedRecord && <ShareBlock record={savedRecord} />}

        <Link href="/treino/simulador" className="mt-6 block rounded-xl border-2 border-violet-300 bg-violet-50 p-5 transition hover:border-violet-500">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Continue — os domínios que as matrizes não medem</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">Simulador: compreensão verbal, memória operacional e velocidade de processamento</h2>
          <p className="mt-1 text-sm text-slate-600">Três blocos crescentes — Wechsler (130) → Stanford-Binet (133) → Cattell (149) — com raciocínio fluido incluído.</p>
        </Link>

        <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
          <h2 className="text-lg font-semibold text-brand-900">Como entrar na Mensa Brasil</h2>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-brand-900">
            <li>
              Acesse <strong>mensa.org.br → Admissão</strong> e agende o teste supervisionado
              presencial na sua cidade (≈1h, taxa de inscrição). O critério é ficar no{" "}
              <strong>percentil 98</strong> (2% superiores) — não um número fixo de QI.
            </li>
            <li>
              Alternativa: <strong>submeter um laudo</strong> de psicólogo(a) registrado(a) no CRP
              com um teste aceito (WAIS-III, WASI, WISC-IV, SON-R ou Raven), dentro do prazo de
              validade das normas.
            </li>
            <li>Testes online não são aceitos — nenhum, de nenhum site.</li>
            <li>Aprovado(a), você recebe o convite de associação e paga a anuidade.</li>
          </ol>
          <p className="mt-2 text-xs text-brand-800">
            Regras, taxas e idades mudam — confirme sempre no site oficial.
          </p>
        </div>

        <div className="no-print mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-brand-600 px-5 py-2.5 font-medium text-brand-700 transition hover:bg-brand-50"
          >
            Imprimir / salvar PDF
          </button>
          <Link
            href="/superdotacao"
            className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Guia: QI e superdotação
          </Link>
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

  // ---------- Em execução ----------
  const it = items[current];
  const { options } = allOptions[current];
  const answeredCount = chosen.filter((c) => c !== null).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* Barra superior: cronômetro + progresso */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            Item {current + 1} de {items.length} · {answeredCount} respondidos
          </span>
          <span
            className={`rounded-lg px-3 py-1 font-mono text-sm font-semibold ${
              timeLeft <= 120 ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-700"
            }`}
          >
            ⏱ {fmtTime(timeLeft)}
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
                i === current
                  ? "bg-brand-600 ring-2 ring-brand-300"
                  : chosen[i] !== null
                    ? "bg-brand-400"
                    : "bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Matriz 3x3 */}
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
                    <CellSvg spec={cellAt(it, r, c)} uid={`g${it.id}-${r}${c}`} />
                  )}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {/* Alternativas */}
      <p className="mt-5 text-center text-sm font-medium text-slate-600">
        Qual figura completa a matriz?
      </p>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {options.map((opt, i) => {
          const active = chosen[current] === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() =>
                setChosen((prev) => {
                  const next = [...prev];
                  next[current] = i;
                  return next;
                })
              }
              className={`flex items-center justify-center rounded-xl border-2 bg-white p-2 transition ${
                active ? "border-brand-600 ring-2 ring-brand-200" : "border-slate-200 hover:border-brand-300"
              }`}
              aria-label={`Alternativa ${i + 1}`}
            >
              <CellSvg spec={opt} uid={`o${it.id}-${i}`} size={72} />
            </button>
          );
        })}
      </div>

      {/* Navegação */}
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40"
        >
          ← Anterior
        </button>
        {current < items.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.min(items.length - 1, c + 1))}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Próximo →
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => {
            if (
              answeredCount === items.length ||
              window.confirm(`Você respondeu ${answeredCount} de ${items.length} itens. Finalizar mesmo assim?`)
            ) {
              finish();
            }
          }}
          className="rounded-lg border border-brand-600 px-5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          Finalizar teste
        </button>
      </div>
    </div>
  );
}
