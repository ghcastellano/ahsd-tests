"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { MensaItem } from "@/lib/mensa/banco";
import { answerOf, explanationOf } from "@/lib/mensa/banco";
import { diagnoseFigureChoice, diagnosePatternChoice, teachingFor } from "@/lib/mensa/teaching";
import CellSvg from "./CellSvg";
import { PairSvg, PatternSvg } from "./MensaStimulus";
import styles from "./MensaItemLesson.module.css";

function statusText(q: MensaItem, chosen: number | null) {
  const correct = answerOf(q);
  if (chosen == null) return { label: "Não respondido", cls: "border-amber-300 bg-amber-50 text-amber-900" };
  if (chosen === correct) return { label: "Correto", cls: "border-emerald-300 bg-emerald-50 text-emerald-900" };
  return { label: "Erro", cls: "border-rose-300 bg-rose-50 text-rose-900" };
}

function MatrixBoard({ q, phase }: { q: Extract<MensaItem, { type: "figura" }>; phase: number }) {
  const item = q.item;
  const grid = item.grid!;
  const answer = (item.options ?? [])![item.answerIndex];
  const focus =
    phase === 1 ? new Set([0, 1, 2]) :
    phase === 2 ? new Set([6, 7, 8]) :
    phase === 3 ? new Set([8]) :
    new Set<number>();

  return <div className="mx-auto grid w-fit grid-cols-3 gap-2 rounded-2xl border border-slate-300 bg-white p-3">
    {grid.flat().map((cell, i) => {
      const finalCell = i === 8;
      const highlighted = focus.size === 0 || focus.has(i);
      return <div
        key={i}
        className={`relative flex h-[78px] w-[78px] items-center justify-center rounded-xl border transition-all ${highlighted ? styles.pulse : styles.dim} ${phase === 3 && finalCell ? styles.answerGlow : ""}`}
      >
        <span className="absolute left-1 top-1 text-[9px] font-bold text-slate-400">{String.fromCharCode(65 + (i % 3))}{Math.floor(i / 3) + 1}</span>
        {finalCell && phase < 3
          ? <span className="text-3xl font-bold text-brand-600">?</span>
          : <CellSvg cell={finalCell ? answer : cell} uid={`lesson-grid-${i}-p${phase}`} size={62}/>}
      </div>;
    })}
  </div>;
}

function FigureSequenceBoard({ q, phase }: { q: Extract<MensaItem, { type: "figura" }>; phase: number }) {
  const item = q.item;
  const seq = item.sequence!;
  const answer = (item.options ?? [])![item.answerIndex];
  return <div className="flex flex-wrap items-center justify-center gap-2">
    {seq.map((cell, i) => <div key={i} className={`rounded-xl border bg-white p-1 ${phase <= 1 ? styles.pulse : ""}`}>
      <CellSvg cell={cell} uid={`lesson-seq-${i}-p${phase}`} size={62}/>
      <p className="text-center text-[10px] text-slate-400">{i + 1}</p>
    </div>)}
    <span className="text-xl text-slate-400">→</span>
    <div className={`rounded-xl border-2 p-1 ${phase === 3 ? `border-emerald-400 bg-emerald-50 ${styles.answerGlow}` : "border-dashed border-brand-300"}`}>
      {phase === 3 ? <CellSvg cell={answer} uid={`lesson-seq-answer-${phase}`} size={62}/> : <span className="flex h-[62px] w-[62px] items-center justify-center text-3xl font-bold text-brand-600">?</span>}
    </div>
  </div>;
}

function FigureSetBoard({ q, phase }: { q: Extract<MensaItem, { type: "figura" }>; phase: number }) {
  const item = q.item;
  const set = item.set!;
  return <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
    {set.map((cell, i) => {
      const correct = i === item.answerIndex;
      return <div key={i} className={`rounded-xl border-2 bg-white p-2 text-center ${phase === 3 && correct ? `border-emerald-400 bg-emerald-50 ${styles.answerGlow}` : phase === 2 ? styles.pulse : "border-slate-200"}`}>
        <CellSvg cell={cell} uid={`lesson-set-${i}-p${phase}`} size={60}/>
        <p className="mt-1 text-xs font-bold text-slate-500">{i + 1}</p>
      </div>;
    })}
  </div>;
}

function PatternBoard({ q, phase }: { q: Extract<MensaItem, { type: "padrao" }>; phase: number }) {
  if (q.grid) {
    const flat = q.grid.flat();
    const correct = q.options[q.answerIndex];
    const focus =
      phase === 1 ? new Set([0,1,2]) :
      phase === 2 ? new Set([6,7,8]) :
      phase === 3 ? new Set([8]) :
      new Set<number>();
    return <div className="mx-auto grid w-fit grid-cols-3 gap-2 rounded-2xl border border-slate-300 bg-white p-3">
      {flat.map((mask, i) => {
        const finalCell = i === 8;
        const highlighted = focus.size === 0 || focus.has(i);
        return <div key={i} className={`flex h-[76px] w-[76px] items-center justify-center rounded-xl border ${highlighted ? styles.pulse : styles.dim} ${phase === 3 && finalCell ? styles.answerGlow : ""}`}>
          {finalCell && phase < 3 ? <span className="text-3xl font-bold text-brand-600">?</span> : <PatternSvg mask={finalCell ? correct : mask} size={64}/>}
        </div>;
      })}
    </div>;
  }

  if (q.sequence) {
    const correct = q.options[q.answerIndex];
    return <div className="flex flex-wrap items-center justify-center gap-2">
      {q.sequence.map((mask, i) => <div key={i} className={`rounded-lg border bg-white p-1 ${phase < 3 ? styles.pulse : ""}`}><PatternSvg mask={mask} size={56}/></div>)}
      <span className="text-xl text-slate-400">→</span>
      <div className={`rounded-lg border-2 p-1 ${phase === 3 ? `border-emerald-400 bg-emerald-50 ${styles.answerGlow}` : "border-dashed border-brand-300"}`}>
        {phase === 3 ? <PatternSvg mask={correct} size={56}/> : <span className="flex h-14 w-14 items-center justify-center text-3xl font-bold text-brand-600">?</span>}
      </div>
    </div>;
  }

  if (q.pairs) {
    return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {q.pairs.map(([a,b], i) => {
        const correct = i === q.answerIndex;
        return <div key={i} className={`rounded-xl border-2 bg-white p-2 ${phase === 3 && correct ? `border-rose-400 bg-rose-50 ${styles.answerGlow}` : phase >= 1 ? styles.pulse : "border-slate-200"}`}>
          <div className="flex items-center justify-center gap-1"><PatternSvg mask={a} size={45}/><span>→</span><PatternSvg mask={b} size={45}/></div>
          <p className="text-center text-xs font-bold text-slate-500">Par {i + 1}</p>
        </div>;
      })}
    </div>;
  }

  return null;
}

function PairBoard({ q, phase }: { q: Extract<MensaItem, { type: "domino" | "mostrador" }>; phase: number }) {
  const correct = q.options[q.answerIndex];
  if (q.grid) {
    return <div className="mx-auto grid w-fit grid-cols-3 gap-2">
      {q.grid.flat().map((pair, i) => <div key={i} className={`rounded-xl border bg-white p-1 ${i === 8 && phase === 3 ? styles.answerGlow : phase < 3 ? styles.pulse : ""}`}>
        {i === 8 && phase < 3 ? <div className="flex h-[82px] w-[72px] items-center justify-center text-3xl font-bold text-brand-600">?</div> : <PairSvg pair={i === 8 ? correct : pair} type={q.type}/>}
      </div>)}
    </div>;
  }
  return <div className="flex flex-wrap items-center justify-center gap-2">
    {q.sequence?.map((pair, i) => <div key={i} className={`rounded-xl border bg-white p-1 ${phase < 3 ? styles.pulse : ""}`}><PairSvg pair={pair} type={q.type}/></div>)}
    <span>→</span>
    <div className={`rounded-xl border-2 p-1 ${phase === 3 ? `border-emerald-400 bg-emerald-50 ${styles.answerGlow}` : "border-dashed border-brand-300"}`}>
      {phase === 3 ? <PairSvg pair={correct} type={q.type}/> : <div className="flex h-[82px] w-[72px] items-center justify-center text-3xl font-bold text-brand-600">?</div>}
    </div>
  </div>;
}

function LessonBoard({ q, phase }: { q: MensaItem; phase: number }) {
  if (q.type === "padrao") return <PatternBoard q={q} phase={phase}/>;
  if (q.type === "domino" || q.type === "mostrador") return <PairBoard q={q} phase={phase}/>;
  if (q.type !== "figura") return null;
  if (q.item.grid) return <MatrixBoard q={q} phase={phase}/>;
  if (q.item.sequence) return <FigureSequenceBoard q={q} phase={phase}/>;
  if (q.item.set) return <FigureSetBoard q={q} phase={phase}/>;
  return null;
}

export default function MensaItemLesson({
  q,
  chosen,
  itemNumber,
  emphasized = false,
}: {
  q: MensaItem;
  chosen: number | null;
  itemNumber: number;
  emphasized?: boolean;
}) {
  const guide = useMemo(() => teachingFor(q), [q]);
  const status = statusText(q, chosen);
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slow, setSlow] = useState(true);
  const [replay, setReplay] = useState(0);
  const phaseMs = slow ? 3300 : 1900;

  useEffect(() => {
    if (paused) return;
    const id = window.setTimeout(() => setPhase(p => (p + 1) % guide.phases.length), phaseMs);
    return () => window.clearTimeout(id);
  }, [phase, paused, phaseMs, guide.phases.length, replay]);

  const diagnostics = q.type === "figura"
    ? diagnoseFigureChoice(q, chosen)
    : q.type === "padrao"
      ? diagnosePatternChoice(q, chosen)
      : [];

  return <div className={`mt-4 space-y-4 ${emphasized ? "rounded-2xl border-2 border-rose-200 bg-rose-50/30 p-3 sm:p-4" : ""}`}>
    <div className={`rounded-xl border px-4 py-3 ${status.cls}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong>Item {itemNumber} · {status.label}</strong>
        <span className="text-sm">Correta: alternativa {answerOf(q) + 1}{chosen != null ? ` · sua: ${chosen + 1}` : ""}</span>
      </div>
    </div>

    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-brand-700">microvídeo instrutivo</p>
          <h4 className="mt-1 text-lg font-bold text-slate-900">{guide.patternName}</h4>
          <p className="mt-1 text-sm text-slate-600">{guide.oneLine}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">passo {phase + 1}/{guide.phases.length}</span>
      </div>

      <div
        key={replay}
        className={`mt-4 ${styles.stage} ${paused ? styles.paused : ""}`}
        style={{ "--phase-ms": `${phaseMs}ms` } as CSSProperties}
      >
        <div className="mb-4 rounded-xl border border-brand-200 bg-brand-50 p-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-brand-700">{guide.phases[phase].title}</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-brand-950">{guide.phases[phase].instruction}</p>
        </div>

        <LessonBoard q={q} phase={phase}/>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div key={`${phase}-${replay}`} className={`h-full w-full bg-brand-600 ${styles.progress}`}/>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => { setPhase(0); setPaused(false); setReplay(v => v + 1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold">↻ Repetir do início</button>
        <button onClick={() => setPaused(v => !v)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold">{paused ? "▶ Continuar" : "Ⅱ Pausar"}</button>
        <button onClick={() => { setSlow(v => !v); setReplay(v => v + 1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold">{slow ? "0,5× · lento" : "1× · normal"}</button>
        <button onClick={() => { setPhase(p => (p + 1) % guide.phases.length); setReplay(v => v + 1); }} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold">Próximo passo →</button>
      </div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-black uppercase tracking-wider text-slate-500">Regra desta questão</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{explanationOf(q)}</p>
      </div>
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <p className="text-xs font-black uppercase tracking-wider text-indigo-700">Modelo mental</p>
        <p className="mt-2 text-sm leading-relaxed text-indigo-950">{guide.mentalModel}</p>
      </div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-black uppercase tracking-wider text-emerald-700">Como usar em questões parecidas</p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-950">{guide.transfer}</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-xs font-black uppercase tracking-wider text-amber-700">Armadilha comum</p>
        <p className="mt-2 text-sm leading-relaxed text-amber-950">{guide.commonTrap}</p>
      </div>
    </section>

    {diagnostics.length > 0 && chosen !== answerOf(q) && <section className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4">
      <p className="text-xs font-black uppercase tracking-wider text-rose-700">Diagnóstico da sua resposta</p>
      {diagnostics.map((d, i) => <p key={i} className="mt-2 text-sm leading-relaxed text-rose-950">{d}</p>)}
    </section>}

    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Roteiro mental para a próxima</p>
      <ol className="mt-2 space-y-2 text-sm leading-relaxed text-slate-700">
        {guide.checklist.map((x, i) => <li key={i}>{x}</li>)}
      </ol>
    </section>
  </div>;
}
