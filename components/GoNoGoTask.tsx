"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DURACAO_ESTIMULO_MS,
  INTERVALO_MS,
  N_PRINCIPAL,
  N_TREINO,
  faixaComissao,
  faixaVariabilidade,
  gerarSequencia,
  pontuar,
  type Estimulo,
  type Metricas,
  type Resposta,
} from "@/lib/tasks/go-nogo";
import { makeRecordId, saveLocalRecord, type ResultRecord } from "@/lib/history";
import { useScrollTopOnScreenChange } from "@/lib/use-scroll-top";
import ShareBlock from "./ShareBlock";

type Fase = "intro" | "treino" | "principal" | "done";

/**
 * Tarefa Go/NoGo. Letras aparecem uma a uma por 500 ms, com 1 s entre elas.
 * Para qualquer letra a pessoa responde (barra de espaço ou toque); para "X"
 * ela deve segurar. A janela de resposta vai do início do estímulo ao início
 * do seguinte. A lógica de pontuação fica em lib/tasks/go-nogo.ts.
 */
export default function GoNoGoTask() {
  const [fase, setFase] = useState<Fase>("intro");
  const [respondent, setRespondent] = useState("");
  const [seed, setSeed] = useState<number | null>(null);
  const [indice, setIndice] = useState(-1);
  const [mostrando, setMostrando] = useState(false);
  const [feedback, setFeedback] = useState<"ok" | "erro" | null>(null);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [savedRecord, setSavedRecord] = useState<ResultRecord | null>(null);

  const sequencia = useRef<Estimulo[]>([]);
  const respostas = useRef<Resposta[]>([]);
  const inicioEstimulo = useRef<number>(0);
  const respondeuNoAtual = useRef(false);
  const timers = useRef<number[]>([]);

  useScrollTopOnScreenChange(fase);

  // Semente só no cliente, para não divergir do HTML gerado no servidor.
  useEffect(() => {
    setSeed(Date.now() % 1_000_000);
  }, []);

  const limparTimers = useCallback(() => {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
  }, []);

  const registrar = useCallback(() => {
    if (indice < 0 || respondeuNoAtual.current) return;
    respondeuNoAtual.current = true;
    const rt = Math.round(performance.now() - inicioEstimulo.current);
    const est = sequencia.current[indice];
    respostas.current[indice] = { tipo: est.tipo, rt };
    if (fase === "treino") setFeedback(est.tipo === "go" ? "ok" : "erro");
  }, [indice, fase]);

  // Entrada por teclado.
  useEffect(() => {
    if (fase !== "treino" && fase !== "principal") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        registrar();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fase, registrar]);

  const iniciar = useCallback((qual: "treino" | "principal") => {
    if (seed === null) return;
    const n = qual === "treino" ? N_TREINO : N_PRINCIPAL;
    sequencia.current = gerarSequencia(n, qual === "treino" ? seed + 1 : seed);
    respostas.current = sequencia.current.map((e) => ({ tipo: e.tipo, rt: null }));
    setFase(qual);
    setIndice(-1);
    setFeedback(null);
    // Pequena pausa antes do primeiro estímulo.
    timers.current.push(window.setTimeout(() => setIndice(0), 1200));
  }, [seed]);

  // Apresentação de cada estímulo: mostra por DURACAO, some, e avança após INTERVALO.
  useEffect(() => {
    if ((fase !== "treino" && fase !== "principal") || indice < 0) return;
    if (indice >= sequencia.current.length) {
      const m = pontuar(respostas.current);
      if (fase === "treino") {
        setFase("intro");
        setIndice(-1);
        setFeedback(null);
        setMetricas(m); // métricas do treino, só para mostrar "pronto"
        return;
      }
      setMetricas(m);
      setFase("done");
      return;
    }
    respondeuNoAtual.current = false;
    if (fase === "principal") setFeedback(null);
    inicioEstimulo.current = performance.now();
    setMostrando(true);
    const t1 = window.setTimeout(() => setMostrando(false), DURACAO_ESTIMULO_MS);
    const t2 = window.setTimeout(() => {
      // Omissão em Go no treino: avisa.
      if (fase === "treino" && !respondeuNoAtual.current && sequencia.current[indice].tipo === "go") setFeedback("erro");
      setIndice((i) => i + 1);
    }, INTERVALO_MS);
    timers.current.push(t1, t2);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [fase, indice]);

  useEffect(() => () => limparTimers(), [limparTimers]);

  // Grava o registro ao terminar.
  useEffect(() => {
    if (fase !== "done" || !metricas) return;
    const fc = faixaComissao(metricas.taxaComissao);
    const record: ResultRecord = {
      id: makeRecordId(),
      createdAt: new Date().toISOString(),
      instrumentId: "treino-go-nogo",
      acronym: "GO/NOGO",
      instrumentName: "Tarefa Go/NoGo — controle inibitório",
      respondent: respondent.trim() ? respondent.trim().slice(0, 80) : undefined,
      totalScore: metricas.taxaComissao,
      maxScore: 100,
      bandLabel: fc.label,
      severity: fc.severity,
      subscales: [
        { name: "Erros de comissão (respondeu ao X)", raw: metricas.comissoes, max: metricas.nNogo },
        { name: "Omissões (não respondeu a uma letra)", raw: metricas.omissoes, max: metricas.nGo },
        { name: "Tempo de reação médio (ms)", raw: metricas.rtMedio, max: 1000 },
        { name: "Variabilidade do TR (desvio-padrão, ms)", raw: metricas.rtDesvio, max: 500 },
      ],
    };
    saveLocalRecord(record);
    // O envio ao registro central (com status na tela) acontece no ShareBlock.
    setSavedRecord(record);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  // ---------------- Intro ----------------
  if (fase === "intro") {
    const treinou = metricas !== null;
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/treino" className="text-sm text-brand-600 hover:underline">← Bateria de treino</Link>
        <p className="mt-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
          Tarefa objetiva · controle inibitório
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Go/NoGo — o freio</h1>
        <p className="mt-3 text-slate-600">
          Letras vão aparecer uma a uma, rápido. <strong>Para qualquer letra, responda</strong> —
          barra de espaço no computador, toque na tela no celular. <strong>Para o X, segure: não
          responda.</strong> São {N_PRINCIPAL} letras em cerca de 2 minutos, depois de um treino de{" "}
          {N_TREINO}.
        </p>
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">O que a tarefa mede</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>Erros de comissão</strong>: responder ao X. É a falha do freio — o marcador de Go/NoGo mais ligado ao TDAH.</li>
            <li><strong>Variabilidade do tempo de reação</strong>: respostas rápidas alternando com lentas. Nas meta-análises, é o marcador de desempenho mais consistente do TDAH.</li>
            <li><strong>Omissões</strong>: deixar passar uma letra — lapsos de atenção sustentada.</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Não há norma para esta implementação: as faixas são convencionais e o resultado
            não é diagnóstico. Faça descansado(a), sem distrações, e não tente "adivinhar" o ritmo.
          </p>
        </div>
        <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="resp">
          Identificação (opcional)
        </label>
        <input
          id="resp"
          type="text"
          value={respondent}
          onChange={(e) => setRespondent(e.target.value)}
          className="mt-1 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          placeholder="Nome ou iniciais"
        />
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => iniciar("treino")}
            disabled={seed === null}
            className="rounded-lg border border-brand-600 px-5 py-2.5 font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
          >
            {treinou ? "Repetir o treino" : "Fazer o treino (12 letras)"}
          </button>
          <button
            type="button"
            onClick={() => iniciar("principal")}
            disabled={seed === null}
            className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {treinou ? "Começar a tarefa (120 letras)" : "Pular o treino e começar"}
          </button>
        </div>
        {treinou && (
          <p className="mt-3 text-sm text-emerald-700">
            Treino concluído: {metricas!.comissoes} resposta(s) ao X e {metricas!.omissoes} letra(s) sem resposta. Quando quiser, comece a tarefa.
          </p>
        )}
      </div>
    );
  }

  // ---------------- Tarefa ----------------
  if (fase === "treino" || fase === "principal") {
    const total = sequencia.current.length;
    const est = indice >= 0 && indice < total ? sequencia.current[indice] : null;
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 select-none">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{fase === "treino" ? "Treino" : "Tarefa"} · letra {Math.min(Math.max(indice + 1, 0), total)} de {total}</span>
          <span>Espaço ou toque = responder · X = segurar</span>
        </div>
        <button
          type="button"
          aria-label="Área de resposta: toque para responder"
          onPointerDown={(e) => {
            e.preventDefault();
            registrar();
          }}
          className="mt-4 flex h-[60vh] w-full items-center justify-center rounded-2xl border-2 border-slate-200 bg-white focus:outline-none"
        >
          <span className="text-[min(40vw,14rem)] font-bold leading-none text-slate-900" aria-live="off">
            {mostrando && est ? est.letra : indice < 0 ? "…" : ""}
          </span>
        </button>
        <p className={`mt-3 h-6 text-center text-sm font-medium ${feedback === "erro" ? "text-rose-600" : "text-emerald-600"}`}>
          {fase === "treino" && feedback === "ok" && "✓"}
          {fase === "treino" && feedback === "erro" && "✗ (era para segurar, ou passou uma letra)"}
        </p>
      </div>
    );
  }

  // ---------------- Resultado ----------------
  const m = metricas!;
  const fc = faixaComissao(m.taxaComissao);
  const fv = faixaVariabilidade(m.rtCv);
  const cor: Record<string, string> = { none: "bg-emerald-100 text-emerald-800", low: "bg-lime-100 text-lime-800", moderate: "bg-amber-100 text-amber-800", high: "bg-orange-100 text-orange-800", info: "bg-slate-100 text-slate-700" };
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Seu resultado</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Go/NoGo — controle inibitório</h1>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Respostas ao X (erros de comissão)</p>
        <p className="mt-1 text-4xl font-bold text-slate-900">
          {m.comissoes} <span className="text-lg font-normal text-slate-400">de {m.nNogo} · {m.taxaComissao}%</span>
        </p>
        <span className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${cor[fc.severity]}`}>{fc.label}</span>
        <p className="mt-3 text-slate-700">{fc.description}</p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Ritmo das respostas</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">
          {m.rtMedio} ms <span className="text-base font-normal text-slate-400">em média · desvio ±{m.rtDesvio} ms · CV {m.rtCv}</span>
        </p>
        <span className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${cor[fv.severity]}`}>{fv.label}</span>
        <p className="mt-3 text-slate-700">{fv.description}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Letras sem resposta (omissões)</p><p className="mt-1 text-xl font-semibold text-slate-900">{m.omissoes} <span className="text-sm font-normal text-slate-400">de {m.nGo} · {m.taxaOmissao}%</span></p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Antecipações (&lt; 150 ms)</p><p className="mt-1 text-xl font-semibold text-slate-900">{m.antecipacoes}</p></div>
        <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">Sensibilidade (d′)</p><p className="mt-1 text-xl font-semibold text-slate-900">{m.dPrime}</p><p className="text-xs text-slate-400">separa detecção de impulsividade</p></div>
      </div>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>O que fazer com isso:</strong> esta é uma medida objetiva de um único momento, sem
        norma para este formato. Um freio abaixo do esperado <em>junto</em> com desatenção no dia a
        dia (ASRS, CFQ) é um dado que vale levar a uma avaliação. Sozinho, pode ser sono, pressa ou
        distração. Se repetir descansado(a) e o padrão persistir, ele ganha peso.
      </div>

      {savedRecord && <ShareBlock record={savedRecord} />}

      <div className="no-print mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            setMetricas(null);
            setSavedRecord(null);
            setSeed(Date.now() % 1_000_000);
            setFase("intro");
          }}
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700"
        >
          Refazer
        </button>
        <Link href="/teste/asrs-18-abda" className="rounded-lg border border-brand-600 px-5 py-2.5 font-medium text-brand-700 hover:bg-brand-50">
          Cruzar com o rastreio de sintomas (ASRS)
        </Link>
        <Link href="/treino" className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
          Bateria de treino
        </Link>
      </div>
    </div>
  );
}
