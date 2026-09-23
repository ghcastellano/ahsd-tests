"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import CellSvg from "./CellSvg";
import RevisaoItem from "./RevisaoItem";
import ShareBlock from "./ShareBlock";
import { blocos, pontuarSimulador, NOMES_DOMINIO, CORTES, type Bloco, type ResultadoBloco, type Dominio } from "@/lib/simulador";
import { gerarItensMemoria, conferirMemoria, type ItemMemoria } from "@/lib/simulador/memoria";
import { gerarTrials, pontuarVelocidade, type TrialVelocidade } from "@/lib/simulador/velocidade";
import { makeRecordId, saveLocalRecord, type ResultRecord } from "@/lib/history";
import { useScrollTopOnScreenChange } from "@/lib/use-scroll-top";
import { useSeed } from "@/lib/use-seed";

type Etapa = "intro" | "verbal" | "memoria" | "velocidade" | "raciocinio" | "entre-blocos" | "done";

/**
 * Simulador em três blocos crescentes (Wechsler → Stanford-Binet → Cattell),
 * cada um com compreensão verbal, memória operacional, velocidade de
 * processamento e raciocínio fluido. Toda a lógica de itens e pontuação está
 * em lib/simulador; aqui só o fluxo e a coleta.
 */
export default function Simulador() {
  // ?seed=N fixa a semente (testes automatizados); sem ele, sorteia uma a cada abertura.
  const [seed, novaSemente] = useSeed();
  const todos = useMemo(() => blocos(seed ?? 0), [seed]);
  const [etapa, setEtapa] = useState<Etapa>("intro");
  const [b, setB] = useState(0); // índice do bloco atual
  const [respondent, setRespondent] = useState("");
  const [resultados, setResultados] = useState<ResultadoBloco[]>([]);
  const [savedRecord, setSavedRecord] = useState<ResultRecord | null>(null);

  // --- estado da etapa verbal / raciocínio (múltipla escolha) ---
  const [escolhas, setEscolhas] = useState<Record<string, number>>({});
  const [restante, setRestante] = useState(0);

  // --- estado da memória ---
  const [itensMem, setItensMem] = useState<ItemMemoria[]>([]);
  const [im, setIm] = useState(0);
  const [mostrandoIdx, setMostrandoIdx] = useState(-1); // -1 = digitando
  const [entrada, setEntrada] = useState("");
  const [acertosMem, setAcertosMem] = useState(0);

  // --- estado da velocidade ---
  const [trials, setTrials] = useState<TrialVelocidade[]>([]);
  const [it, setIt] = useState(0);
  const respostasVel = useRef<{ presente: boolean; disse: boolean; rt: number }[]>([]);
  const inicioTrial = useRef(0);
  const [velRestante, setVelRestante] = useState(0);

  // acumulado do bloco atual
  const parcial = useRef<Partial<ResultadoBloco>>({});
  // escolhas de cada bloco (verbal e raciocínio), para a revisão no resultado
  const escolhasPorBloco = useRef<Record<number, { verbal: Record<string, number>; raciocinio: Record<string, number> }>>({});
  // memória item a item e início da prova, para o histórico rastreável
  const memoriaPorBloco = useRef<Record<number, { id: string; formato: string; sequencia: string; esperado: string; digitado: string; ok: boolean }[]>>({});
  const inicioProva = useRef(0);

  useScrollTopOnScreenChange(`${etapa}-${b}-${im}`);

  const bloco: Bloco = todos[b];

  // ---------- cronômetro genérico (verbal/raciocínio) ----------
  const cronometro = useRef<number | null>(null);
  const pararCronometro = () => { if (cronometro.current) { window.clearInterval(cronometro.current); cronometro.current = null; } };
  const iniciarCronometro = useCallback((segundos: number, aoZerar: () => void) => {
    pararCronometro();
    setRestante(segundos);
    const fim = Date.now() + segundos * 1000;
    cronometro.current = window.setInterval(() => {
      const r = Math.max(0, Math.ceil((fim - Date.now()) / 1000));
      setRestante(r);
      if (r <= 0) { pararCronometro(); aoZerar(); }
    }, 250);
  }, []);
  useEffect(() => () => pararCronometro(), []);

  // ---------- transições ----------
  const irParaVerbal = (idx: number) => {
    if (idx === 0) { inicioProva.current = Date.now(); memoriaPorBloco.current = {}; }
    setB(idx); parcial.current = {}; setEscolhas({}); setEtapa("verbal");
    iniciarCronometro(todos[idx].verbal.length * 30, () => fecharVerbalRef.current());
  };
  const fecharVerbal = () => {
    pararCronometro();
    const acertos = bloco.verbal.filter((q) => escolhas[q.id] === q.resposta).length;
    parcial.current.verbal = { acertos, total: bloco.verbal.length };
    escolhasPorBloco.current[b] = { verbal: { ...escolhas }, raciocinio: {} };
    // memória
    const itens = gerarItensMemoria(bloco.nivel, (seed ?? 1) + b);
    setItensMem(itens); setIm(0); setAcertosMem(0); setEntrada(""); setMostrandoIdx(0); setEtapa("memoria");
  };
  const fecharVerbalRef = useRef(fecharVerbal); fecharVerbalRef.current = fecharVerbal;

  // apresentação da sequência de memória: 1 s por elemento
  useEffect(() => {
    if (etapa !== "memoria" || mostrandoIdx < 0) return;
    const item = itensMem[im];
    if (!item) return;
    const t = window.setTimeout(() => {
      setMostrandoIdx((i) => (i + 1 < item.sequencia.length ? i + 1 : -1));
    }, 1000);
    return () => window.clearTimeout(t);
  }, [etapa, mostrandoIdx, im, itensMem]);

  const responderMemoria = () => {
    const item = itensMem[im];
    const ok = conferirMemoria(item, entrada);
    (memoriaPorBloco.current[b] ??= []).push({ id: item.id, formato: item.formato, sequencia: item.sequencia.join(" "), esperado: item.resposta, digitado: entrada, ok });
    const novos = acertosMem + (ok ? 1 : 0);
    setAcertosMem(novos); setEntrada("");
    if (im + 1 < itensMem.length) { setIm(im + 1); setMostrandoIdx(0); return; }
    parcial.current.memoria = { acertos: novos, total: itensMem.length };
    // velocidade
    const t = gerarTrials(bloco.nivel, (seed ?? 1) + b * 3, 80);
    setTrials(t); setIt(0); respostasVel.current = []; inicioTrial.current = performance.now();
    setEtapa("velocidade");
    setVelRestante(bloco.segundosVelocidade);
    const fim = Date.now() + bloco.segundosVelocidade * 1000;
    pararCronometro();
    cronometro.current = window.setInterval(() => {
      const r = Math.max(0, Math.ceil((fim - Date.now()) / 1000));
      setVelRestante(r);
      if (r <= 0) { pararCronometro(); fecharVelocidadeRef.current(); }
    }, 250);
  };

  const responderVelocidade = useCallback((disse: boolean) => {
    const trial = trials[it];
    if (!trial) return;
    respostasVel.current.push({ presente: trial.presente, disse, rt: Math.round(performance.now() - inicioTrial.current) });
    inicioTrial.current = performance.now();
    if (it + 1 >= trials.length) { pararCronometro(); fecharVelocidadeRef.current(); return; }
    setIt(it + 1);
  }, [trials, it]);

  const fecharVelocidade = () => {
    parcial.current.velocidade = pontuarVelocidade(respostasVel.current);
    setEscolhas({}); setEtapa("raciocinio");
    iniciarCronometro(bloco.segundosRaciocinio, () => fecharRaciocinioRef.current());
  };
  const fecharVelocidadeRef = useRef(fecharVelocidade); fecharVelocidadeRef.current = fecharVelocidade;

  const fecharRaciocinio = () => {
    pararCronometro();
    const acertos = bloco.raciocinio.filter((q) => escolhas[q.id] === q.answerIndex).length;
    escolhasPorBloco.current[b] = { ...(escolhasPorBloco.current[b] ?? { verbal: {} }), raciocinio: { ...escolhas } };
    const completo: ResultadoBloco = {
      nivel: bloco.nivel,
      verbal: parcial.current.verbal ?? { acertos: 0, total: bloco.verbal.length },
      memoria: parcial.current.memoria ?? { acertos: 0, total: 0 },
      velocidade: parcial.current.velocidade ?? { respondidos: 0, acertos: 0, erros: 0, pontos: 0, rtMedio: 0 },
      raciocinio: { acertos, total: bloco.raciocinio.length },
    };
    const novos = [...resultados.filter((r) => r.nivel !== completo.nivel), completo];
    setResultados(novos);
    setEtapa(b + 1 < todos.length ? "entre-blocos" : "done");
  };
  const fecharRaciocinioRef = useRef(fecharRaciocinio); fecharRaciocinioRef.current = fecharRaciocinio;

  // teclado na velocidade: S = sim, N = não
  useEffect(() => {
    if (etapa !== "velocidade") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return; // segurar a tecla não pode disparar respostas em rajada
      if (e.key === "s" || e.key === "S") responderVelocidade(true);
      if (e.key === "n" || e.key === "N") responderVelocidade(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [etapa, responderVelocidade]);

  // grava o registro ao terminar
  const final = useMemo(() => (etapa === "done" ? pontuarSimulador(resultados) : null), [etapa, resultados]);
  useEffect(() => {
    if (!final) return;
    const record: ResultRecord = {
      id: makeRecordId(),
      createdAt: new Date().toISOString(),
      instrumentId: "treino-simulador",
      acronym: "SIMULADOR",
      instrumentName: "Simulador de escalas — Wechsler · Stanford-Binet · Cattell (v2 visual)",
      respondent: respondent.trim() ? respondent.trim().slice(0, 80) : undefined,
      totalScore: final.blocoAlcancado,
      maxScore: 3,
      bandLabel: final.faixa.label,
      severity: final.faixa.severity,
      subscales: (Object.keys(NOMES_DOMINIO) as Dominio[]).map((d) => ({ name: NOMES_DOMINIO[d], raw: final.porDominio[d].acertos, max: final.porDominio[d].total })),
      durationSeconds: inicioProva.current ? Math.round((Date.now() - inicioProva.current) / 1000) : undefined,
      // Revisão item a item de todos os blocos feitos: verbal, memória, velocidade e matrizes.
      detalhes: (() => {
        const out: NonNullable<ResultRecord["detalhes"]> = [];
        let n = 0;
        for (const r of [...resultados].sort((a, c) => a.nivel - c.nivel)) {
          const idx = r.nivel - 1;
          const x = todos[idx];
          const esc = escolhasPorBloco.current[idx] ?? { verbal: {}, raciocinio: {} };
          for (const q of x.verbal) {
            const m = esc.verbal[q.id];
            out.push({ n: ++n, id: q.id, escolhida: m === undefined ? null : q.opcoes[m], correta: q.opcoes[q.resposta], acertou: m === q.resposta, regra: q.explicacao, grupo: `bloco ${r.nivel} · verbal` });
          }
          for (const mItem of memoriaPorBloco.current[idx] ?? []) {
            out.push({ n: ++n, id: mItem.id, escolhida: mItem.digitado || null, correta: mItem.esperado, acertou: mItem.ok, regra: `${mItem.formato} · sequência ${mItem.sequencia}`, grupo: `bloco ${r.nivel} · memória` });
          }
          out.push({ n: ++n, id: `vel-b${r.nivel}`, escolhida: `${r.velocidade.acertos} certos, ${r.velocidade.erros} erros, ${r.velocidade.pontos} pontos, TR médio ${r.velocidade.rtMedio} ms`, correta: `≥ ${CORTES[r.nivel].velocidade} pontos`, acertou: r.velocidade.pontos >= CORTES[r.nivel].velocidade, regra: "procura de símbolos, 60 s (acertos − erros)", grupo: `bloco ${r.nivel} · velocidade` });
          x.raciocinio.forEach((it, i) => {
            const m = esc.raciocinio[it.id];
            out.push({ n: ++n, id: it.id, escolhida: m === undefined ? null : m + 1, correta: it.answerIndex + 1, acertou: m === it.answerIndex, regra: it.explanation, grupo: `bloco ${r.nivel} · matriz ${i + 1}` });
          });
        }
        return out;
      })(),
    };
    saveLocalRecord(record);
    // O envio ao registro central (com status na tela) acontece no ShareBlock.
    setSavedRecord(record);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [final]);

  const Cabecalho = ({ titulo, sub }: { titulo: string; sub: string }) => (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{bloco.nome} · treino não normatizado</p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">{titulo}</h1>
        <p className="text-sm text-slate-500">{sub}</p>
      </div>
      {etapa !== "memoria" && (
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm text-slate-700" aria-live="polite">
          ⏱ {etapa === "velocidade" ? velRestante : restante}s
        </span>
      )}
    </div>
  );

  // ---------------- Intro ----------------
  if (etapa === "intro") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/treino" className="text-sm text-brand-600 hover:underline">← Bateria de treino</Link>
        <p className="mt-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">Treino · versão 2 · equivalência visual corrigida</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Wechsler → Stanford-Binet → Cattell</h1>
        <p className="mt-3 text-slate-600">
          Treino de compreensão verbal, memória operacional, procura visual e raciocínio
          com matrizes. Os itens principais são autorais ou gerados por regras; não são
          questões oficiais das escalas citadas. A dificuldade dos blocos não foi normatizada.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {todos.map((x) => (
            <div key={x.nivel} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{x.nome}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">Etapa {x.nivel}</p>
              <p className="text-xs text-slate-500">Referência de formato</p>
              <p className="mt-2 text-xs text-slate-600">{x.descricao}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Leia antes:</strong> os nomes Wechsler, Stanford-Binet e Cattell não
          estabelecem uma progressão entre escalas nem validam este treino. Os cortes são
          convenções internas. O resultado não estima QI, percentil ou diagnóstico.
        </div>
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Como funciona cada bloco (≈ 12 min)</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li><strong>Compreensão verbal</strong> — 8 itens de vocabulário, semelhanças e analogias (30 s por item).</li>
            <li><strong>Memória operacional</strong> — sequências mostradas um elemento por vez; digite na ordem pedida (direta, inversa, ou números crescentes e depois letras).</li>
            <li><strong>Velocidade</strong> — 60 s: dois símbolos-alvo à esquerda; algum deles aparece IGUAL na fileira? Responda Sim/Não (teclas S/N). Erro desconta ponto.</li>
            <li><strong>Raciocínio</strong> — 4 matrizes 3×3 com tempo.</li>
          </ol>
          <p className="mt-2 text-xs text-slate-500">Um bloco "fecha" com precisão média de 70% (bloco 1), 75% (bloco 2) ou 80% (bloco 3) nos domínios de acerto, mais 22 / 24 / 26 pontos na velocidade. Os blocos precisam ser fechados em ordem. O sorteio varia os itens e as figuras, mas regras e itens podem se repetir. Repetição não mede transferência para tarefas novas.</p>
        </div>
        <Link href="/treino/simulador/fontes" className="mt-5 block rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-900 hover:bg-teal-100">Plano de 8 semanas e 12 questões públicas do ICAR →</Link>
        <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="resp">Identificação (opcional)</label>
        <input id="resp" type="text" value={respondent} onChange={(e) => setRespondent(e.target.value)} className="mt-1 w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" placeholder="Nome ou iniciais" />
        <button type="button" onClick={() => irParaVerbal(0)} disabled={seed === null} className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-50">
          Começar pelo Bloco 1
        </button>
      </div>
    );
  }

  // ---------------- Verbal ----------------
  if (etapa === "verbal") {
    const respondidas = bloco.verbal.filter((q) => escolhas[q.id] !== undefined).length;
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Cabecalho titulo="Compreensão verbal" sub="Vocabulário, semelhanças e analogias — escolha a alternativa mais precisa." />
        <ol className="mt-6 space-y-4">
          {bloco.verbal.map((q, idx) => (
            <li key={q.id} id={`q-${q.id}`} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-medium text-slate-800"><span className="mr-1 text-slate-400">{idx + 1}.</span>{q.enunciado}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {q.opcoes.map((o, i) => (
                  <button key={i} type="button" onClick={() => setEscolhas((e) => ({ ...e, [q.id]: i }))}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${escolhas[q.id] === i ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"}`}>
                    {o}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-slate-500">{respondidas} de {bloco.verbal.length} respondidas</span>
          <button type="button" onClick={fecharVerbal} className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
            Seguir para a memória →
          </button>
        </div>
      </div>
    );
  }

  // ---------------- Memória ----------------
  if (etapa === "memoria") {
    const item = itensMem[im];
    const instrucao = item.formato === "direta" ? "Digite na MESMA ordem" : item.formato === "inversa" ? "Digite na ordem INVERSA (do último para o primeiro)" : "Digite os NÚMEROS em ordem crescente e depois as LETRAS em ordem alfabética";
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 select-none">
        <Cabecalho titulo="Memória operacional" sub={`Sequência ${im + 1} de ${itensMem.length} · ${instrucao}`} />
        <div className="mt-6 flex h-56 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white">
          {mostrandoIdx >= 0 ? (
            <span className="text-8xl font-bold text-slate-900" aria-live="off">{item.sequencia[mostrandoIdx]}</span>
          ) : (
            <form className="flex w-full max-w-sm flex-col items-center gap-3 px-4" onSubmit={(e) => { e.preventDefault(); responderMemoria(); }}>
              <label htmlFor="mem" className="text-sm text-slate-600">{instrucao}</label>
              <input id="mem" autoFocus autoComplete="off" value={entrada} onChange={(e) => setEntrada(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center font-mono text-2xl tracking-widest focus:border-brand-500 focus:outline-none" placeholder="…" />
              <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-700">Confirmar</button>
            </form>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-slate-500">{mostrandoIdx >= 0 ? "Memorize…" : "Sem separadores; maiúsculas ou minúsculas tanto faz."}</p>
      </div>
    );
  }

  // ---------------- Velocidade ----------------
  if (etapa === "velocidade") {
    const trial = trials[it];
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 select-none">
        <Cabecalho titulo="Velocidade de processamento" sub="Algum dos dois símbolos-alvo aparece IGUAL (mesma forma, rotação e preenchimento) na fileira?" />
        {trial && (
          <div className="mt-6 rounded-2xl border-2 border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 rounded-lg border border-brand-300 bg-brand-50 p-2">
                {trial.alvos.map((c, i) => <CellSvg key={i} cell={c} uid={`a${it}-${i}`} size={48} />)}
              </div>
              <span className="text-slate-400">→</span>
              <div className="flex flex-wrap items-center gap-1">
                {trial.candidatos.map((c, i) => <CellSvg key={i} cell={c} uid={`c${it}-${i}`} size={48} />)}
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={() => responderVelocidade(true)} className="flex-1 rounded-lg bg-emerald-600 py-3 text-lg font-semibold text-white hover:bg-emerald-700">SIM (S)</button>
              <button type="button" onClick={() => responderVelocidade(false)} className="flex-1 rounded-lg bg-rose-600 py-3 text-lg font-semibold text-white hover:bg-rose-700">NÃO (N)</button>
            </div>
          </div>
        )}
        <p className="mt-3 text-center text-xs text-slate-500">Item {it + 1} · respondidos {respostasVel.current.length} · acerto conta +1, erro −1</p>
      </div>
    );
  }

  // ---------------- Raciocínio ----------------
  if (etapa === "raciocinio") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Cabecalho titulo="Raciocínio fluido" sub="Escolha a figura que completa cada matriz." />
        <ol className="mt-6 space-y-6">
          {bloco.raciocinio.map((item, idx) => (
            <li key={item.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-sm font-medium text-slate-700">Matriz {idx + 1}</p>
              {item.grid && (
                <div className="grid w-fit grid-cols-3 gap-1">
                  {item.grid.flatMap((linha, r) => linha.map((c, cidx) => (
                    <div key={`${r}-${cidx}`} className="rounded border border-slate-200 bg-slate-50 p-1">
                      {r === 2 && cidx === 2 ? <div className="flex h-[72px] w-[72px] items-center justify-center text-2xl text-slate-300">?</div> : <CellSvg cell={c} uid={`g${item.id}-${r}-${cidx}`} size={72} />}
                    </div>
                  )))}
                </div>
              )}
              {item.options && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.options.map((o, i) => (
                    <button key={i} type="button" onClick={() => setEscolhas((e) => ({ ...e, [item.id]: i }))}
                      className={`rounded-lg border-2 p-1 ${escolhas[item.id] === i ? "border-brand-600 bg-brand-50" : "border-slate-200 bg-white hover:border-brand-400"}`}>
                      <CellSvg cell={o} uid={`o${item.id}-${i}`} size={56} />
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ol>
        <button type="button" onClick={fecharRaciocinio} className="mt-6 rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
          {b + 1 < todos.length ? "Fechar o bloco →" : "Ver o resultado →"}
        </button>
      </div>
    );
  }

  // ---------------- Entre blocos ----------------
  if (etapa === "entre-blocos") {
    const ultimo = resultados.find((r) => r.nivel === bloco.nivel)!;
    const fechou = pontuarSimulador(resultados).blocos.find((x) => x.nivel === bloco.nivel)?.fechado;
    const prox = todos[b + 1];
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-600">{bloco.nome} concluído</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{fechou ? "Bloco fechado ✓" : "Bloco não fechado"}</h1>
        <p className="mt-2 text-slate-600">
          Verbal {ultimo.verbal.acertos}/{ultimo.verbal.total} · Memória {ultimo.memoria.acertos}/{ultimo.memoria.total} · Velocidade {ultimo.velocidade.pontos} pontos ({ultimo.velocidade.acertos} certos, {ultimo.velocidade.erros} errados) · Raciocínio {ultimo.raciocinio.acertos}/{ultimo.raciocinio.total}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => irParaVerbal(b + 1)} className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
            Seguir para o {prox.nome} →
          </button>
          <button type="button" onClick={() => setEtapa("done")} className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
            Parar aqui e ver o resultado
          </button>
        </div>
      </div>
    );
  }

  // ---------------- Resultado ----------------
  const res = final ?? pontuarSimulador(resultados);
  const cor: Record<string, string> = { info: "bg-slate-100 text-slate-700", none: "bg-emerald-100 text-emerald-800", low: "bg-lime-100 text-lime-800", moderate: "bg-amber-100 text-amber-800", high: "bg-orange-100 text-orange-800" };
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Seu resultado</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Simulador de escalas — Wechsler · Stanford-Binet · Cattell</h1>
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Blocos fechados em sequência</p>
        <p className="mt-1 text-4xl font-bold text-slate-900">{res.blocoAlcancado} <span className="text-lg font-normal text-slate-400">de 3</span></p>
        <span className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${cor[res.faixa.severity]}`}>{res.faixa.label}</span>
        <p className="mt-3 text-slate-700">{res.faixa.description}</p>
        <p className="mt-4 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
          <strong>O que fazer agora:</strong> revise a regra dos itens errados e compare precisão e ritmo separadamente. Consulte o plano e as questões públicas com gabarito no treino suplementar.
        </p>
      </div>
      <Link href="/treino/simulador/fontes" className="mt-5 block rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-900 hover:bg-teal-100">Plano de 8 semanas e 12 questões públicas do ICAR →</Link>
      <h2 className="mt-6 text-lg font-semibold text-slate-900">Por domínio (todos os blocos feitos)</h2>
      <div className="mt-3 space-y-3">
        {(Object.keys(NOMES_DOMINIO) as Dominio[]).map((d) => {
          const x = res.porDominio[d];
          return (
            <div key={d} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between"><span className="font-medium text-slate-800">{NOMES_DOMINIO[d]}</span><span className="text-sm text-slate-500">{x.acertos}/{x.total} · {x.pct}%</span></div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${x.pct}%` }} /></div>
              {d === "velocidade" && <p className="mt-1 text-xs text-slate-500">Pontos (acertos − erros): {res.velocidadePontos}</p>}
            </div>
          );
        })}
      </div>
      <h2 className="mt-6 text-lg font-semibold text-slate-900">Por bloco</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Bloco</th><th className="px-3 py-2">Verbal</th><th className="px-3 py-2">Memória</th><th className="px-3 py-2">Velocidade</th><th className="px-3 py-2">Raciocínio</th><th className="px-3 py-2">Fechou?</th></tr></thead>
          <tbody>
            {[...resultados].sort((a, c) => a.nivel - c.nivel).map((r) => (
              <tr key={r.nivel} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{todos[r.nivel - 1].nome}</td>
                <td className="px-3 py-2">{r.verbal.acertos}/{r.verbal.total}</td>
                <td className="px-3 py-2">{r.memoria.acertos}/{r.memoria.total}</td>
                <td className="px-3 py-2">{r.velocidade.pontos} pts</td>
                <td className="px-3 py-2">{r.raciocinio.acertos}/{r.raciocinio.total}</td>
                <td className="px-3 py-2">{res.blocos.find((x) => x.nivel === r.nivel)?.fechado ? "✓" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Revisão item a item: o que foi marcado e o que era certo */}
      <h2 className="mt-6 text-lg font-semibold text-slate-900">Revisão dos itens</h2>
      <p className="mt-1 text-sm text-slate-500">Erros aparecem em vermelho; clique em uma matriz para ver a questão com a sua resposta e a correta.</p>
      {todos.slice(0, Math.max(1, resultados.length)).map((x, idx) => {
        const esc = escolhasPorBloco.current[idx] ?? { verbal: {}, raciocinio: {} };
        const errosVerbal = x.verbal.filter((q) => esc.verbal[q.id] !== q.resposta).length;
        const errosRac = x.raciocinio.filter((q) => esc.raciocinio[q.id] !== q.answerIndex).length;
        return (
          <div key={x.nivel} className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{x.nome}</p>
            <details className="mt-2" open={errosVerbal > 0}>
              <summary className="cursor-pointer text-sm font-medium text-slate-700">Compreensão verbal — {errosVerbal === 0 ? "sem erros" : `${errosVerbal} erro(s)`}</summary>
              <ul className="mt-2 space-y-2 text-sm">
                {x.verbal.map((q) => {
                  const marcada = esc.verbal[q.id];
                  const errou = marcada !== q.resposta;
                  return (
                    <li key={q.id} className={`rounded-lg border p-3 ${errou ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`} data-revisao={q.id}>
                      <p className="font-medium text-slate-800">{q.enunciado}</p>
                      {errou && <p className="mt-1 text-rose-700">✗ Sua resposta: <strong>{marcada === undefined ? "(em branco)" : q.opcoes[marcada]}</strong></p>}
                      <p className={`mt-1 ${errou ? "text-emerald-700" : "text-emerald-800"}`}>✓ Correta: <strong>{q.opcoes[q.resposta]}</strong></p>
                      <p className="mt-1 text-xs text-slate-600">{q.explicacao}</p>
                    </li>
                  );
                })}
              </ul>
            </details>
            <details className="mt-2" open={errosRac > 0}>
              <summary className="cursor-pointer text-sm font-medium text-slate-700">Raciocínio (matrizes) — {errosRac === 0 ? "sem erros" : `${errosRac} erro(s)`}</summary>
              <div className="mt-2 space-y-2">
                {x.raciocinio.map((item, i) => {
                  const marcada = esc.raciocinio[item.id] ?? null;
                  const errou = marcada !== item.answerIndex;
                  return (
                    <details key={item.id} className={`rounded-lg border px-3 py-2 ${errou ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
                      <summary className={`cursor-pointer text-sm font-medium ${errou ? "text-rose-700" : "text-emerald-800"}`}>
                        Matriz {i + 1} — {marcada === null ? "não respondida" : errou ? "errada" : "correta"} · ver a questão
                      </summary>
                      <RevisaoItem item={item} escolhido={marcada} uid={`rev-${x.nivel}-${item.id}`} />
                    </details>
                  );
                })}
              </div>
            </details>
          </div>
        );
      })}
      {savedRecord && <ShareBlock record={savedRecord} />}
      <div className="no-print mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={() => { setResultados([]); setSavedRecord(null); escolhasPorBloco.current = {}; novaSemente(); setEtapa("intro"); }} className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">Refazer</button>
        <Link href="/teste-qi" className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100">Teste de matrizes</Link>
        <Link href="/treino" className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100">Bateria de treino</Link>
      </div>
    </div>
  );
}
