"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { answerOf, explanationOf, makeMensaItems, PROTOCOLS, remainingSeconds, summarize, VERSION, type Mode } from "@/lib/mensa/banco";
import { makeRecordId, saveLocalRecord, type ResultRecord } from "@/lib/history";
import { useSeed } from "@/lib/use-seed";
import MensaStimulus, { MensaOption } from "./MensaStimulus";
import ShareBlock from "./ShareBlock";

const button = "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:border-brand-500 disabled:opacity-40";
const time = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function MensaPrep() {
  const [seed, newSeed] = useSeed();
  const [mode, setMode] = useState<Mode>("principal");
  const [phase, setPhase] = useState<"intro" | "running" | "done">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const answersRef = useRef<(number | null)[]>([]);
  const [flags, setFlags] = useState<number[]>([]);
  const [record, setRecord] = useState<ResultRecord | null>(null);
  const [left, setLeft] = useState(0);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [expired, setExpired] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [respondent, setRespondent] = useState("");
  const [onlyWrong, setOnlyWrong] = useState(true);
  const items = useMemo(() => makeMensaItems(mode, seed ?? 0), [mode, seed]);
  const protocol = PROTOCOLS[mode];
  const session = useRef({ start: 0, deadline: 0, mark: 0, index: 0, times: [] as number[], finished: false });
  const finishRef = useRef<(automatic?: boolean) => void>(() => {});

  function account() {
    const s = session.current;
    const end = Math.min(Date.now(), s.deadline);
    s.times[s.index] = (s.times[s.index] ?? 0) + Math.max(0, end - s.mark) / 1000;
    s.mark = end;
  }
  function finish(automatic = false) {
    const s = session.current;
    if (s.finished) return;
    s.finished = true;
    account();
    const actual = answersRef.current;
    const result = summarize(items, actual);
    const r: ResultRecord = {
      id: makeRecordId(), createdAt: new Date().toISOString(), instrumentId: `treino-mensa-${mode}`, acronym: "MENSA · TREINO",
      instrumentName: `Mensa Brasil — ${protocol.name} · ${VERSION} · seed ${seed}`,
      respondent: respondent.trim().slice(0, 80) || undefined,
      totalScore: result.correct, maxScore: items.length, bandLabel: "Prática não normatizada", severity: "info",
      durationSeconds: Math.min(protocol.seconds, Math.max(0, Math.round((Date.now() - s.start) / 1000))),
      subscales: [...new Set(items.map(q => q.domain))].map(domain => ({ name: domain, raw: items.filter((q, i) => q.domain === domain && actual[i] === answerOf(q)).length, max: items.filter(q => q.domain === domain).length })),
      detalhes: items.map((q, i) => ({ n: i + 1, id: q.id, escolhida: actual[i] == null ? null : actual[i]! + 1, correta: answerOf(q) + 1, acertou: actual[i] === answerOf(q), regra: explanationOf(q), tempoSeg: Math.round(s.times[i] ?? 0), grupo: q.domain })),
    };
    setSaveFailed(!saveLocalRecord(r));
    setRecord(r); setExpired(automatic); setPhase("done");
  }
  useEffect(() => { finishRef.current = finish; });
  useEffect(() => {
    if (phase !== "running") return;
    const tick = () => { const remaining = remainingSeconds(session.current.deadline, Date.now()); setLeft(remaining); if (!remaining) finishRef.current(true); };
    const timer = setInterval(tick, 250);
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(timer); window.removeEventListener("beforeunload", warn); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); };
  }, [phase]);
  useEffect(() => { if (phase !== "intro") document.getElementById("mensa-treino")?.scrollIntoView({ block: "start" }); }, [phase]);

  function start() {
    const now = Date.now();
    session.current = { start: now, deadline: now + protocol.seconds * 1000, mark: now, index: 0, times: [], finished: false };
    const empty = items.map(() => null);
    answersRef.current = empty; setAnswers(empty); setCurrent(0); setFlags([]); setRecord(null); setConfirmFinish(false); setOnlyWrong(true); setLeft(protocol.seconds); setPhase("running");
  }
  function withinTime() { if (session.current.finished) return false; if (Date.now() >= session.current.deadline) { finish(true); return false; } return true; }
  function move(index: number) { if (!withinTime()) return; account(); session.current.index = index; setCurrent(index); setConfirmFinish(false); }
  function choose(value: number | null) { if (!withinTime()) return; const copy = [...answersRef.current]; copy[current] = value; answersRef.current = copy; setAnswers(copy); }

  if (phase === "intro") return <section id="mensa-treino" className="scroll-mt-6 rounded-2xl border-2 border-brand-300 bg-white p-5 sm:p-7">
    <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Preparação Mensa Brasil · treino independente</p>
    <h2 className="mt-2 text-2xl font-bold text-slate-900">Escolha sua sessão</h2>
    <div className="my-5 grid gap-3 sm:grid-cols-2">{(Object.keys(PROTOCOLS) as Mode[]).map(id => <button key={id} onClick={() => setMode(id)} aria-pressed={mode === id} className={`rounded-xl border-2 p-4 text-left ${mode === id ? "border-brand-500 bg-brand-50" : "border-slate-200"}`}><strong className="block">{PROTOCOLS[id].name}</strong><span className="mt-1 block text-sm font-semibold text-brand-700">{PROTOCOLS[id].count} itens · {PROTOCOLS[id].seconds / 60} minutos</span><span className="mt-2 block text-sm text-slate-600">{PROTOCOLS[id].description}</span></button>)}</div>
    <p className="text-sm text-slate-700"><strong>Como fazer:</strong> sem consulta, calculadora ou pausas. Você pode pular, voltar, limpar respostas e marcar itens para rever. Um acerto vale um ponto; erros e omissões não descontam. O gabarito aparece somente ao terminar. Fechar ou recarregar a página perde a tentativa em andamento.</p>
    <p className="mt-3 text-sm text-slate-600"><strong>Tempo de treino:</strong> {protocol.seconds / 60} minutos corridos, sem corte por item. É um protocolo editorial, não o tempo de um instrumento oficial. Itens autorais, dificuldade não calibrada e sem previsão de aprovação, QI ou percentil. Regras e formatos podem reaparecer entre sorteios; variação não significa prova inédita ou equivalente.</p>
    <label htmlFor="mensa-nome" className="mt-5 block text-sm font-medium">Identificação no histórico (opcional)</label><input id="mensa-nome" value={respondent} onChange={e => setRespondent(e.target.value)} maxLength={80} className="mt-1 w-full max-w-sm rounded-lg border border-slate-300 p-2"/>
    <div className="mt-5 flex flex-wrap items-center gap-3"><button disabled={seed === null} onClick={start} className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-40">Iniciar preparação Mensa — {time(protocol.seconds)}</button><span className="text-xs text-slate-500">Versão {VERSION} · semente {seed ?? "…"}</span></div>
  </section>;

  if (phase === "done" && record) {
    const result = summarize(items, answers);
    return <section id="mensa-treino" className="scroll-mt-6 space-y-5" data-mensa="resultado">
      <div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="text-sm font-semibold text-brand-700">Mensa Brasil · {protocol.name}</p><h2 className="mt-2 text-2xl font-bold">Seu resultado de treino</h2><p className="mt-4 text-4xl font-bold">{result.correct}<span className="text-lg font-normal text-slate-500"> / {items.length} acertos</span></p><p className="mt-2">{result.wrong} erros · {result.omitted} omissões · {time(record.durationSeconds ?? 0)}</p><p className="mt-3 text-sm text-slate-600">{expired ? "Tempo encerrado automaticamente. " : "Sessão finalizada. "}Este resultado não corresponde a percentil, QI ou chance de admissão.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">{record.subscales?.map(s => <div key={s.name} className="rounded-lg bg-slate-50 p-3"><strong>{s.name}</strong><p>{s.raw}/{s.max}</p></div>)}</div>
        <p className="mt-4 text-sm">Próximo passo: explique a regra de cada erro antes de abrir outra sessão. {mode === "principal" ? <>No <Link href="/treino/dojo?exame=mensa" className="text-brand-700 underline">Dojo Mensa</Link>, trabalhe matrizes, séries ou classificação.</> : "Use a revisão abaixo para praticar dominós e mostradores sem pressa."} Depois compare acurácia e tempo em uma nova semente.</p>
        <p className="mt-3 text-xs text-slate-500">{VERSION} · seed {seed}. Para repetir exatamente esta sessão: <a className="underline" href={`/treino/mensa?seed=${seed}#mensa-treino`}>abrir a semente</a> e selecionar “{protocol.name}”.</p>
        <button className={`${button} mt-4`} onClick={() => { newSeed(); setPhase("intro"); }}>Nova sessão com outro sorteio</button>
      </div>
      {saveFailed && <p role="alert" className="text-amber-900">Não foi possível gravar no histórico deste aparelho. Guarde o link do resultado abaixo.</p>}
      <ShareBlock record={record}/>
      <div><h3 className="text-xl font-semibold">Revisão por item</h3><p className="mt-2 text-xs text-slate-500">O tempo soma suas visitas ao item, inclusive com a aba oculta. Não mede somente atenção ativa.</p><label className="mt-3 flex gap-2 text-sm"><input type="checkbox" checked={onlyWrong} onChange={e => setOnlyWrong(e.target.checked)}/>Mostrar apenas erros e omissões</label></div>
      {onlyWrong && result.correct === items.length && <p>Todos os itens corretos. Desmarque o filtro para revisar as regras.</p>}
      {items.map((q, i) => onlyWrong && answers[i] === answerOf(q) ? null : <details key={q.id} className="rounded-xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer font-semibold">{i + 1}. {q.domain} · {answers[i] == null ? "Não respondido" : answers[i] === answerOf(q) ? "Correto" : "Erro"} · {record.detalhes?.[i].tempoSeg ?? 0} s</summary><MensaStimulus q={q} uid={`review-${i}`}/><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{Array.from({ length: q.type === "figura" ? (q.item.options ?? q.item.set)!.length : q.options.length }, (_, j) => <div key={j} className={`flex flex-col items-center rounded-lg border-2 p-1 ${j === answerOf(q) ? "border-emerald-500 bg-emerald-50" : j === answers[i] ? "border-rose-500 bg-rose-50" : "border-slate-200"}`}><MensaOption q={q} index={j} uid={`rev-${i}-${j}`}/><span className="text-xs">{j + 1}{j === answerOf(q) ? " · correta" : ""}{j === answers[i] ? " · sua" : ""}</span></div>)}</div><p className="mt-4 text-sm text-slate-700">{explanationOf(q)}</p></details>)}
    </section>;
  }

  const q = items[current];
  const optionCount = q.type === "figura" ? (q.item.options ?? q.item.set)!.length : q.options.length;
  return <section id="mensa-treino" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6" data-mensa="prova">
    <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white py-3"><div><p className="text-xs font-semibold text-brand-700">MENSA BRASIL · PREPARAÇÃO</p><h2 className="font-semibold">Item {current + 1}/{items.length} · {q.domain}</h2></div><span role="timer" aria-label="Tempo restante" className={`rounded-lg px-3 py-2 font-mono text-xl ${left < 60 ? "bg-rose-50 text-rose-700" : "bg-slate-100"}`}>{time(left)}</span></div>
    <MensaStimulus q={q} uid={`run-${current}`}/>
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{Array.from({ length: optionCount }, (_, i) => <button key={i} aria-label={`Alternativa ${i + 1}`} aria-pressed={answers[current] === i} onClick={() => choose(i)} className={`flex flex-col items-center rounded-xl border-2 p-1 ${answers[current] === i ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-brand-400"}`}><MensaOption q={q} index={i} uid={`opt-${current}-${i}`}/><span className="text-sm font-semibold">{i + 1}</span></button>)}</div>
    <div className="mt-5 flex flex-wrap gap-2"><button className={button} disabled={current === 0} onClick={() => move(current - 1)}>Anterior</button><button className={button} disabled={current === items.length - 1} onClick={() => move(current + 1)}>Próximo / pular</button><button className={button} onClick={() => choose(null)}>Limpar resposta</button><button className={button} aria-pressed={flags.includes(current)} onClick={() => setFlags(f => f.includes(current) ? f.filter(i => i !== current) : [...f, current])}>{flags.includes(current) ? "★ Marcado para rever" : "☆ Marcar para rever"}</button></div>
    <nav aria-label="Itens da sessão" className="mt-5 flex flex-wrap gap-2">{items.map((_, i) => <button key={i} aria-label={`Ir ao item ${i + 1}${answers[i] != null ? ", respondido" : ", em branco"}${flags.includes(i) ? ", marcado" : ""}`} aria-current={i === current ? "step" : undefined} onClick={() => move(i)} className={`min-h-10 min-w-10 rounded-lg border p-2 text-sm ${i === current ? "ring-2 ring-brand-500" : ""} ${answers[i] != null ? "border-brand-300 bg-brand-100" : "border-slate-300"}`}>{i + 1}{flags.includes(i) ? "★" : ""}</button>)}</nav>
    <p className="mt-3 text-xs text-slate-500">Fundo colorido: respondido · ★: rever · {answers.filter(a => a != null).length}/{items.length} respondidos</p>
    {confirmFinish ? <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4"><p className="text-sm">Encerrar com {answers.filter(a => a == null).length} itens em branco e {flags.length} marcados para rever? O gabarito será revelado.</p><div className="mt-3 flex gap-2"><button className={button} onClick={() => finish(Date.now() >= session.current.deadline)}>Confirmar término</button><button className={button} onClick={() => setConfirmFinish(false)}>Continuar respondendo</button></div></div> : <button className={`${button} mt-5`} onClick={() => setConfirmFinish(true)}>Finalizar sessão</button>}
  </section>;
}
