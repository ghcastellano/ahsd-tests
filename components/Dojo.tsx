"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { EXAMES, exame as exameDe, rodada, assinaturaItem } from "@/lib/dojo/exames";
import type { DominioDojo, ExameDojo, ItemDojo } from "@/lib/dojo/tipos";
import { carregar, planoDoDia, registrar, salvar, sequencia, taxa, type ProgressoDojo, vazio } from "@/lib/dojo/progresso";
import { useSeed } from "@/lib/use-seed";
import { useScrollTopOnScreenChange } from "@/lib/use-scroll-top";
import { cellAt } from "@/lib/matrix/engine";
import { conferirMemoria } from "@/lib/simulador/memoria";
import CellSvg from "./CellSvg";
import MatrixCellSvg from "./MatrixCellSvg";
import CondicaoSvg from "./CondicaoSvg";
import RevisaoItem from "./RevisaoItem";
import ShareBlock from "./ShareBlock";
import { makeRecordId, saveLocalRecord, type ResultRecord } from "@/lib/history";

type Fase = "escolha" | "exame" | "treino" | "fim";

const PRINCIPIOS: { titulo: string; texto: string }[] = [
  { titulo: "Regra antes do item", texto: "Aprenda a taxonomia de regras (distribuição de três, de dois, operações lógicas, progressão) antes de resolver. Em estudo controlado, 14 minutos de instrução explícita renderam mais que horas de repetição." },
  { titulo: "20 minutos por dia, não 3 horas no domingo", texto: "A memória consolida entre sessões. Distribua revisões ao longo da semana e avalie seu progresso com questões novas." },
  { titulo: "Intercale domínios", texto: "Misture matrizes, séries, verbal e memória na mesma sessão. Isso exercita a escolha da estratégia a cada item. Registre o desempenho para avaliar o efeito no seu treino." },
  { titulo: "Caderno de erros por REGRA", texto: "Não anote 'errei o item 12'. Anote 'confundi XOR com OR' ou 'não vi a regra de quantidade'. Releia antes de cada sessão. O Dojo guarda seus erros por regra automaticamente." },
  { titulo: "Verbalize antes de olhar as alternativas", texto: "Diga a regra em voz alta ('forma em quadrado latino, preenchimento constante na linha') e só então procure a alternativa. Quem olha as alternativas primeiro é fisgado pelo distrator n−1." },
  { titulo: "Zero erros antes de velocidade", texto: "Nos subtestes cronometrados, treine primeiro sem relógio até a precisão ficar perto de 100%. Só depois acelere. Velocidade com erro é chute rápido." },
  { titulo: "Uma prova completa por semana", texto: "Condições reais: cronômetro, silêncio, sem pausa. Isso ajuda a observar como o ritmo e a fadiga afetam sua precisão." },
  { titulo: "Não decore itens", texto: "O sorteio prioriza questões não vistas recentemente. Regras podem repetir; reavalie com itens novos para distinguir memorização de aprendizagem." },
  { titulo: "Sono é treino", texto: "Raciocínio fluido cai com privação de sono mais do que com falta de prática. Na véspera do teste, treinar pouco e dormir bem vale mais que a última sessão." },
  { titulo: "Meça e ataque o ponto fraco", texto: "Olhe a taxa por domínio. Reserve, como ponto de partida, 60% do tempo para o domínio com mais erros e mantenha revisões dos demais." },
];

export default function Dojo() {
  const [seed] = useSeed();
  const [fase, setFase] = useState<Fase>("escolha");
  const [exameId, setExameId] = useState<string | null>(null);
  const [dominioId, setDominioId] = useState<string | undefined>(undefined);
  const [sementeRodada, setSementeRodada] = useState(0);
  const [decorrido, setDecorrido] = useState(0);
  const vistos = useRef<string[]>([]);
  const sementeFixada = useRef(false);
  const [rodadaN, setRodadaN] = useState(0);
  const [itens, setItens] = useState<ItemDojo[]>([]);
  const [idx, setIdx] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [entrada, setEntrada] = useState("");
  const [mostrandoIdx, setMostrandoIdx] = useState(-1);
  const [revelado, setRevelado] = useState(false);
  const [acertou, setAcertou] = useState(false);
  const [respostas, setRespostas] = useState<{ dominio: string; acertou: boolean; regra: string; id: string; escolhida: string | number | null; correta: string | number; tempoSeg: number }[]>([]);
  const [savedRecord, setSavedRecord] = useState<ResultRecord | null>(null);
  const inicioRodada = useRef(0);
  const inicioItem = useRef(0);
  const [progresso, setProgresso] = useState<ProgressoDojo>(vazio());
  const registrado = useRef(false);

  useScrollTopOnScreenChange(`${fase}-${idx}`);

  // ?exame=mensa abre direto no painel do exame.
  useEffect(() => {
    setProgresso(carregar());
    try { const v: unknown = JSON.parse(localStorage.getItem("ahsd:dojo:vistos:v1") ?? "[]"); if (Array.isArray(v)) vistos.current = v.filter((x): x is string => typeof x === "string").slice(-300); } catch { /* progresso opcional */ }
    sementeFixada.current = new URLSearchParams(window.location.search).has("seed");
    const q = new URLSearchParams(window.location.search).get("exame");
    if (q && exameDe(q)) { setExameId(q); setFase("exame"); }
  }, []);

  const ex: ExameDojo | undefined = exameId ? exameDe(exameId) : undefined;
  const item = itens[idx];
  const dominio: DominioDojo | undefined = item && ex ? ex.dominios.find((d) => d.id === item.dominio) : undefined;

  function comecar(dom?: string) {
    if (!ex) return;
    const s = (seed ?? 1) + rodadaN * 7919;
    setDominioId(dom);
    const novos = rodada(ex.id, s, 10, dom, sementeFixada.current ? [] : vistos.current);
    setItens(novos); setSementeRodada(s);
    vistos.current = [...vistos.current, ...novos.map(assinaturaItem)].slice(-300);
    try { localStorage.setItem("ahsd:dojo:vistos:v1", JSON.stringify(vistos.current)); } catch { /* treino funciona sem armazenamento */ }
    setDecorrido(0);
    setRodadaN((n) => n + 1);
    setIdx(0); setEscolha(null); setEntrada(""); setRevelado(false); setRespostas([]);
    registrado.current = false;
    setSavedRecord(null);
    inicioRodada.current = Date.now(); inicioItem.current = Date.now();
    setFase("treino");
  }

  // memória: apresentação 1 s por elemento
  useEffect(() => {
    if (fase !== "treino" || !item || item.tipo !== "memoria") return;
    setMostrandoIdx(0);
    setEntrada("");
  }, [fase, idx, item]);
  useEffect(() => {
    if (fase !== "treino" || !item || item.tipo !== "memoria" || mostrandoIdx < 0) return;
    const t = window.setTimeout(() => setMostrandoIdx((i) => (i + 1 < item.item.sequencia.length ? i + 1 : -1)), item.item.intervaloMs ?? 1000);
    return () => window.clearTimeout(t);
  }, [fase, item, mostrandoIdx]);
  useEffect(() => {
    if (fase !== "treino" || revelado) return;
    setDecorrido(0);
    const t = window.setInterval(() => setDecorrido(Math.floor((Date.now() - inicioItem.current) / 1000)), 1000);
    return () => window.clearInterval(t);
  }, [fase, idx, revelado]);

  const respostaCorreta = (it: ItemDojo): number => {
    switch (it.tipo) {
      case "figural": return it.item.answerIndex;
      case "matriz": return it.answerIndex;
      case "texto": return it.item.resposta;
      case "condicao": return it.item.resposta;
      case "memoria": return -1;
    }
  };
  const regraDe = (it: ItemDojo): string => {
    switch (it.tipo) {
      case "figural": return it.item.explanation;
      case "matriz": return it.regras.join(" ");
      case "texto": return it.item.explicacao;
      case "condicao": return it.item.explicacao;
      case "memoria": return `Memória ${it.item.formato}, ${it.item.sequencia.length} elementos`;
    }
  };

  function responder(i: number) {
    if (!item || revelado) return;
    setEscolha(i);
    const ok = i === respostaCorreta(item);
    setAcertou(ok);
    setRevelado(true);
    const textoOpcao = (k: number) => (item.tipo === "texto" ? item.item.opcoes[k] : k + 1);
    setRespostas((r) => [...r, { dominio: item.dominio, acertou: ok, regra: regraDe(item), id: idDe(item), escolhida: textoOpcao(i), correta: textoOpcao(respostaCorreta(item)), tempoSeg: Math.round((Date.now() - inicioItem.current) / 1000) }]);
  }
  function responderMemoria() {
    if (!item || item.tipo !== "memoria" || revelado) return;
    const ok = conferirMemoria(item.item, entrada);
    setAcertou(ok);
    setRevelado(true);
    setRespostas((r) => [...r, { dominio: item.dominio, acertou: ok, regra: regraDe(item), id: item.item.id, escolhida: entrada || null, correta: item.item.resposta, tempoSeg: Math.round((Date.now() - inicioItem.current) / 1000) }]);
  }
  function proximo() {
    inicioItem.current = Date.now();
    if (idx + 1 < itens.length) { setIdx(idx + 1); setEscolha(null); setEntrada(""); setRevelado(false); return; }
    setFase("fim");
  }
  const idDe = (it: ItemDojo): string => {
    switch (it.tipo) {
      case "figural": return it.item.id;
      case "matriz": return `m${it.item.id}`;
      case "texto": return it.item.id;
      case "condicao": return it.item.id;
      case "memoria": return it.item.id;
    }
  };

  // registra a rodada no progresso (uma vez)
  useEffect(() => {
    if (fase !== "fim" || registrado.current) return;
    registrado.current = true;
    const novo = registrar(progresso, respostas);
    setProgresso(novo);
    salvar(novo);
    // Registro no histórico (painel + banco central), com revisão item a item.
    if (ex) {
      const certos = respostas.filter((r) => r.acertou).length;
      const dom = dominioId ? ex.dominios.find((d) => d.id === dominioId) : undefined;
      const record: ResultRecord = {
        id: makeRecordId(),
        createdAt: new Date().toISOString(),
        instrumentId: "treino-dojo",
        acronym: "DOJO",
        instrumentName: `Dojo v3 — ${ex.nome}${dom ? ` · ${dom.nome}` : " · rodada mista"} · semente ${sementeRodada}`,
        notes: [`Versão 3 · semente ${sementeRodada} · estudo sem limite eliminatório`],
        totalScore: certos,
        maxScore: respostas.length,
        bandLabel: `${certos} de ${respostas.length} acertos`,
        severity: "info",
        subscales: ex.dominios.map((d) => ({ name: d.nome, raw: respostas.filter((r) => r.dominio === d.id && r.acertou).length, max: respostas.filter((r) => r.dominio === d.id).length })).filter((s) => s.max > 0),
        durationSeconds: inicioRodada.current ? Math.round((Date.now() - inicioRodada.current) / 1000) : undefined,
        detalhes: respostas.map((r, i) => ({ n: i + 1, id: r.id, escolhida: r.escolhida, correta: r.correta, acertou: r.acertou, regra: r.regra, tempoSeg: r.tempoSeg, grupo: r.dominio })),
      };
      saveLocalRecord(record);
      setSavedRecord(record);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  const plano = useMemo(() => (ex ? planoDoDia(progresso, ex) : []), [ex, progresso]);
  const dias = sequencia(progresso.dias);

  // ---------------- Escolha do exame ----------------
  if (fase === "escolha") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8" data-dojo="escolha">
        <Link href="/treino" className="text-sm text-brand-600 hover:underline">← Bateria de treino</Link>
        <p className="mt-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">Dojo · treino ativo</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Escolha o exame que quer dominar</h1>
        <p className="mt-3 text-slate-600">
          Dez itens rápidos por rodada. Depois de cada resposta você vê a regra, por que aquele tipo de item é difícil e uma dica
          prática. As questões são sorteadas de bancos a cada rodada; o progresso por domínio fica neste aparelho e monta o seu
          plano do dia.
        </p>
        {dias > 0 && <p className="mt-2 text-sm font-medium text-emerald-700">🔥 {dias} dia(s) seguido(s) de treino.</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {EXAMES.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => { setExameId(e.id); setFase("exame"); }}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left transition hover:border-brand-400"
              data-exame={e.id}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{e.sigla}</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{e.nome}</h2>
              <p className="mt-1 text-sm text-slate-600">{e.dominios.length} domínios · {e.corte}</p>
            </button>
          ))}
        </div>

        <h2 className="mt-10 text-xl font-semibold text-slate-900">Como praticar de forma inteligente</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {PRINCIPIOS.map((p) => (
            <div key={p.titulo} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="font-medium text-slate-800">{p.titulo}</p>
              <p className="mt-1 text-sm text-slate-600">{p.texto}</p>
            </div>
          ))}
        </div>

        <Link href="/treino/guia-exames" className="mt-8 block rounded-xl border border-indigo-200 bg-indigo-50 p-5 font-semibold text-indigo-900">Mensa, WAIS, Stanford-Binet e Triple Nine: exames, custos, tempos e percentis →</Link>

      </div>
    );
  }

  // ---------------- Painel do exame ----------------
  if (fase === "exame" && ex) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8" data-dojo="exame">
        <button type="button" onClick={() => setFase("escolha")} className="text-sm text-brand-600 hover:underline">← Outro exame</button>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{ex.sigla}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{ex.nome}</h1>
        <p className="mt-3 text-slate-600">{ex.oQueE}</p>
        {ex.id === "mensa" && <Link href="/treino/mensa" className="mt-4 block rounded-xl border-2 border-brand-300 bg-brand-50 p-4 font-semibold text-brand-800">Mensa Brasil: fazer a preparação cronometrada e conferir evidências de 2026 →</Link>}
        <Link href="/treino/guia-exames" className="mt-3 block text-sm font-semibold text-brand-700 underline">Como fazer o exame real · preços e duração · o que mudou com os guias</Link>
        <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-700">Treino autoral, com gabarito verificável e dificuldade não normatizada. Para as matrizes mais exigentes deste banco, escolha “Desafio de matrizes: múltiplas regras”. O banco prioriza itens não vistos recentemente; regras e questões de bancos finitos podem voltar.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-medium text-slate-800">Como é o exame</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{ex.estrutura.map((t) => <li key={t}>{t}</li>)}</ul>
            <p className="mt-2 text-sm font-medium text-slate-700">Corte: {ex.corte}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-medium text-slate-800">Por que é difícil</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{ex.porQueDificil.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        </div>

        <div className="mt-6 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5">
          <p className="font-semibold text-emerald-900">Plano de hoje{dias > 0 ? ` · 🔥 ${dias} dia(s) seguido(s)` : ""}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-emerald-900">{plano.map((p) => <li key={p}>{p}</li>)}</ol>
          <button type="button" onClick={() => comecar()} className="mt-4 rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700" disabled={seed === null}>
            Treinar 10 itens (misto)
          </button>
        </div>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Domínios deste exame</h2>
        <div className="mt-3 space-y-3">
          {ex.dominios.map((d) => {
            const t = taxa(progresso, d.id);
            return (
              <div key={d.id} className="rounded-lg border border-slate-200 bg-white p-4" data-dominio={d.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-800">{d.nome}</p>
                    <p className="text-xs text-slate-500">Referência: {d.subtesteReal}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{t === null ? "sem dados" : `${Math.round(t * 100)}% de acerto`}</span>
                    <button type="button" onClick={() => comecar(d.id)} disabled={seed === null} className="rounded-lg border border-brand-600 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50">
                      Treinar só este
                    </button>
                  </div>
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-brand-700">Por que é difícil e como treinar</summary>
                  <p className="mt-2 text-sm text-slate-600"><strong>Por que é difícil:</strong> {d.porQueDificil}</p>
                  <p className="mt-1 text-sm text-slate-600"><strong>Dica:</strong> {d.dica}</p>
                </details>
              </div>
            );
          })}
        </div>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Dicas para este exame</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{ex.dicas.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    );
  }

  // ---------------- Fim da rodada ----------------
  if (fase === "fim" && ex) {
    const total = respostas.length;
    const certos = respostas.filter((r) => r.acertou).length;
    const porDom = ex.dominios.map((d) => ({ d, r: respostas.filter((x) => x.dominio === d.id) })).filter((x) => x.r.length > 0);
    const pior = [...porDom].sort((a, b) => a.r.filter((x) => x.acertou).length / a.r.length - b.r.filter((x) => x.acertou).length / b.r.length)[0];
    return (
      <div className="mx-auto max-w-3xl px-4 py-8" data-dojo="fim">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{ex.nome} · rodada concluída</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Resultado da rodada</h1>
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Acertos</p>
          <p className="mt-1 text-4xl font-bold text-slate-900">{certos} <span className="text-lg font-normal text-slate-400">/ {total}</span></p>
          <p className="mt-3 text-sm text-slate-600">
            {certos === total ? "Rodada perfeita. Suba a dificuldade: treine o domínio que menos pratica ou faça a prova completa cronometrada." : pior ? `Domínio a atacar: ${pior.d.nome} (${pior.r.filter((x) => x.acertou).length}/${pior.r.length}). ${pior.d.dica}` : ""}
          </p>
        </div>
        <h2 className="mt-6 text-lg font-semibold text-slate-900">Por domínio nesta rodada</h2>
        <div className="mt-3 space-y-2">
          {porDom.map(({ d, r }) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">
              <span className="text-slate-800">{d.nome}</span>
              <span className="text-slate-500">{r.filter((x) => x.acertou).length}/{r.length} · acumulado {taxa(progresso, d.id) === null ? "—" : `${Math.round((taxa(progresso, d.id) ?? 0) * 100)}%`}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5">
          <p className="font-semibold text-emerald-900">Próximo passo{dias > 0 ? ` · 🔥 ${dias} dia(s) seguido(s)` : ""}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-emerald-900">{plano.map((p) => <li key={p}>{p}</li>)}</ol>
        </div>
        {savedRecord && <ShareBlock record={savedRecord} />}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => comecar(dominioId)} className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">Outra rodada (novas questões)</button>
          {pior && <button type="button" onClick={() => comecar(pior.d.id)} className="rounded-lg border border-brand-600 px-5 py-2.5 font-medium text-brand-700 hover:bg-brand-50">Só {pior.d.nome}</button>}
          <button type="button" onClick={() => setFase("exame")} className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100">Painel do exame</button>
        </div>
      </div>
    );
  }

  // ---------------- Treino: um item por vez ----------------
  if (!ex || !item || !dominio) return null;
  const correta = respostaCorreta(item);
  const classeOpcao = (i: number) => {
    if (!revelado) return escolha === i ? "border-brand-600 ring-2 ring-brand-200" : "border-slate-200 hover:border-brand-300";
    if (i === correta) return "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200";
    if (i === escolha) return "border-rose-500 bg-rose-50 ring-2 ring-rose-200";
    return "border-slate-200 opacity-60";
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6" data-dojo="treino">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm text-slate-500">{ex.nome} · item {idx + 1} de {itens.length}</span>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{dominio.nome}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Referência de formato: {dominio.subtesteReal}</p>
      <p className="mt-2 text-sm text-slate-600" data-tempo-item>Tempo no item: {decorrido}s · estudo sem corte automático</p>
      <p className="text-xs text-slate-500">Semente {sementeRodada} · item autoral · a familiaridade não garante o mesmo desempenho no exame real.</p>

      {/* ----- enunciado + alternativas por tipo ----- */}
      {item.tipo === "figural" && !revelado && (
        <div className="mt-4">
          {item.item.grid && (
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-300 bg-white p-3">
                {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => (
                  <div key={`${r}${c}`} className={`flex h-24 w-24 items-center justify-center rounded ${r === 2 && c === 2 ? "border-2 border-dashed border-brand-400 bg-brand-50" : ""}`}>
                    {r === 2 && c === 2 ? <span className="text-3xl font-bold text-brand-400">?</span> : <CellSvg cell={item.item.grid![r][c]} uid={`dj-${item.item.id}-${r}${c}`} />}
                  </div>
                )))}
              </div>
            </div>
          )}
          {item.item.sequence && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {item.item.sequence.map((c, i) => <div key={i} className="flex h-24 w-24 items-center justify-center rounded border border-slate-300 bg-white"><CellSvg cell={c} uid={`dj-${item.item.id}-s${i}`} /></div>)}
              <div className="flex h-24 w-24 items-center justify-center rounded border-2 border-dashed border-brand-400 bg-brand-50"><span className="text-3xl font-bold text-brand-400">?</span></div>
            </div>
          )}
          {item.item.prompt && !item.item.grid && (
            <div className="rounded-xl border border-slate-300 bg-white p-6 text-center"><p className="font-mono text-2xl tracking-wide text-slate-800">{item.item.prompt}</p></div>
          )}
          <p className="mt-4 text-center text-sm font-medium text-slate-600">{item.item.set ? "Qual figura NÃO pertence ao grupo?" : "Escolha a alternativa correta."}</p>
          {(item.item.set ?? item.item.options) && (
            <div className={`mt-3 grid gap-2 ${item.item.set ? "grid-cols-5" : "grid-cols-3 sm:grid-cols-6"}`}>
              {(item.item.set ?? item.item.options)!.map((c, i) => (
                <button key={i} type="button" onClick={() => responder(i)} aria-label={`Alternativa ${i + 1}`} className={`flex items-center justify-center rounded-xl border-2 bg-white p-1 transition ${classeOpcao(i)}`}>
                  <CellSvg cell={c} uid={`dj-${item.item.id}-o${i}`} size={64} />
                </button>
              ))}
            </div>
          )}
          {item.item.textOptions && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {item.item.textOptions.map((t, i) => (
                <button key={i} type="button" onClick={() => responder(i)} aria-label={`Alternativa ${i + 1}`} className={`rounded-xl border-2 bg-white px-4 py-3 font-mono text-lg transition ${classeOpcao(i)}`}>{t}</button>
              ))}
            </div>
          )}
        </div>
      )}
      {item.tipo === "figural" && revelado && <RevisaoItem item={item.item} escolhido={escolha} uid={`dj-${item.item.id}`} />}

      {item.tipo === "matriz" && (
        <div className="mt-4">
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-300 bg-white p-3">
              {[0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => {
                const vazia = r === 2 && c === 2;
                return (
                  <div key={`${r}${c}`} className={`flex h-24 w-24 items-center justify-center rounded ${vazia ? (revelado ? "border-2 border-dashed border-emerald-400 bg-emerald-50" : "border-2 border-dashed border-brand-400 bg-brand-50") : ""}`}>
                    {vazia && !revelado ? <span className="text-3xl font-bold text-brand-400">?</span> : <MatrixCellSvg spec={vazia ? item.options[item.answerIndex] : cellAt(item.item, r, c)} uid={`djm${item.item.id}-${r}${c}`} />}
                  </div>
                );
              }))}
            </div>
          </div>
          <p className="mt-4 text-center text-sm font-medium text-slate-600">Qual figura completa a matriz?</p>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {item.options.map((opt, i) => (
              <button key={i} type="button" onClick={() => responder(i)} aria-label={`Alternativa ${i + 1}`} className={`flex items-center justify-center rounded-xl border-2 bg-white p-1 transition ${classeOpcao(i)}`}>
                <MatrixCellSvg spec={opt} uid={`djo${item.item.id}-${i}`} size={64} />
              </button>
            ))}
          </div>
          {revelado && (
            <ul className="mt-3 list-disc space-y-0.5 pl-5 text-sm text-slate-600">{item.regras.map((t) => <li key={t}>{t}</li>)}</ul>
          )}
        </div>
      )}

      {item.tipo === "texto" && (
        <div className="mt-4">
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-lg text-slate-800">{item.item.enunciado}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {item.item.opcoes.map((o, i) => (
              <button key={i} type="button" onClick={() => responder(i)} aria-label={`Alternativa ${i + 1}`} className={`rounded-xl border-2 bg-white px-4 py-3 text-left text-slate-800 transition ${classeOpcao(i)}`}>{o}</button>
            ))}
          </div>
          {revelado && <p className="mt-3 text-sm text-slate-600"><strong>Explicação:</strong> {item.item.explicacao}</p>}
        </div>
      )}

      {item.tipo === "condicao" && (
        <div className="mt-4">
          <p className="rounded-xl border border-slate-200 bg-white p-4 text-lg text-slate-800">{item.item.enunciado}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {item.item.opcoes.map((f, i) => (
              <button key={i} type="button" onClick={() => responder(i)} aria-label={`Alternativa ${i + 1}`} className={`flex flex-col items-center rounded-xl border-2 bg-white p-1 transition ${classeOpcao(i)}`}>
                <CondicaoSvg figura={f} uid={`djc${item.item.id}-${i}`} size={88} ponto={revelado && i === correta ? item.item.ponto : null} />
                <span className="text-[11px] text-slate-500">{i + 1}</span>
              </button>
            ))}
          </div>
          {revelado && <p className="mt-3 text-sm text-slate-600"><strong>Explicação:</strong> {item.item.explicacao}</p>}
        </div>
      )}

      {item.tipo === "memoria" && (
        <div className="mt-4 select-none">
          <p className="text-sm text-slate-600">
            {item.item.formato === "ultima-palavra" ? "Leia cada frase em voz alta. Depois digite apenas a ÚLTIMA PALAVRA de cada frase, na ordem" : item.item.formato === "posicoes" ? "Memorize a ordem das posições acesas. Depois use a grade numerada para responder" : item.item.formato === "direta" ? "Digite na MESMA ordem" : item.item.formato === "inversa" ? "Digite na ordem INVERSA (do último para o primeiro)" : "Digite os NÚMEROS em ordem crescente e depois as LETRAS em ordem alfabética"} · {item.item.sequencia.length} elementos
          </p>
          <div className="mt-3 flex h-48 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white">
            {!revelado && mostrandoIdx >= 0 ? (
              item.item.formato === "posicoes" ? (
                <div className="grid grid-cols-3 gap-2" aria-label="Grade de memória">
                  {Array.from({ length: 9 }, (_, i) => <div key={i} className={`h-10 w-10 rounded ${String(i + 1) === item.item.sequencia[mostrandoIdx] ? "bg-brand-600" : "bg-slate-200"}`} />)}
                </div>
              ) : <span className={`${item.item.formato === "ultima-palavra" ? "px-4 text-center text-xl" : "text-7xl"} font-bold text-slate-900`}>{item.item.estimulos?.[mostrandoIdx] ?? item.item.sequencia[mostrandoIdx]}</span>
            ) : !revelado ? (
              <form className="flex w-full max-w-sm flex-col items-center gap-3 px-4" onSubmit={(e) => { e.preventDefault(); responderMemoria(); }}>
                {item.item.formato === "posicoes" && <p className="whitespace-pre text-center font-mono text-sm" aria-label="Referência de posições">{"1 2 3\n4 5 6\n7 8 9"}</p>}
                <input id="dj-mem" autoFocus autoComplete="off" value={entrada} onChange={(e) => setEntrada(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center font-mono text-2xl tracking-widest focus:border-brand-500 focus:outline-none" placeholder="…" aria-label="Sua resposta" />
                <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700">Confirmar</button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-sm text-slate-500">Sequência mostrada: <span className="font-mono">{item.item.sequencia.join(" ")}</span></p>
                <p className="mt-1 text-sm text-slate-500">Resposta esperada: <span className="font-mono font-semibold text-emerald-700">{item.item.resposta}</span> · você digitou: <span className={`font-mono ${acertou ? "text-emerald-700" : "text-rose-700"}`}>{entrada || "(nada)"}</span></p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----- feedback ----- */}
      {revelado && (
        <div className={`mt-5 rounded-xl border p-4 ${acertou ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`} data-feedback={acertou ? "correto" : "errado"}>
          <p className={`font-semibold ${acertou ? "text-emerald-800" : "text-rose-800"}`}>{acertou ? "✓ Correto" : "✗ Errado"}</p>
          <details className="mt-2" open={!acertou}>
            <summary className="cursor-pointer text-sm font-medium text-slate-700">Por que este tipo de item é difícil</summary>
            <p className="mt-1 text-sm text-slate-600">{dominio.porQueDificil}</p>
          </details>
          <details className="mt-1" open={!acertou}>
            <summary className="cursor-pointer text-sm font-medium text-slate-700">Dica prática</summary>
            <p className="mt-1 text-sm text-slate-600">{dominio.dica}</p>
          </details>
          <button type="button" onClick={proximo} className="mt-3 rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700">
            {idx + 1 < itens.length ? "Próximo →" : "Ver resultado →"}
          </button>
        </div>
      )}
    </div>
  );
}
