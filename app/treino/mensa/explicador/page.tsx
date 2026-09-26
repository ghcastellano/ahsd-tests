"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PatternSvg } from "@/components/MensaStimulus";

type MatrixItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: "matrix";
  grid: number[];
  answer: number;
  steps: { title: string; text: string; before?: number[]; op?: string; after?: number }[];
};

type PairItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: "pairs";
  pairs: [number, number][];
  answerPair: number;
  steps: { title: string; text: string; before?: number[]; op?: string; after?: number }[];
};

type TutorialItem = MatrixItem | PairItem;

function m(rows: string[]) {
  let mask = 0;
  rows.join("").split("").forEach((v, i) => { if (v === "1") mask |= 1 << i; });
  return mask;
}

const items: TutorialItem[] = [
  {
    id: "1",
    title: "Item 1/24 · Matrizes compostas",
    subtitle: "Qual mosaico completa a matriz? Considere relações por linhas ou por colunas.",
    kind: "matrix",
    grid: [
      m(["110","101","101"]), m(["101","010","110"]), m(["011","111","011"]),
      m(["100","100","101"]), m(["011","011","001"]), m(["100","111","111"]),
      m(["100","111","110"]), m(["111","011","001"]), -1
    ],
    answer: m(["111","100","011"]),
    steps: [
      {
        title: "1. Compare os dois primeiros blocos de uma linha",
        text: "Comece célula por célula. Quando as duas células são iguais, o resultado fica branco; quando são diferentes, fica preto. Essa operação é XOR.",
        before: [m(["100","111","110"]), m(["111","011","001"])],
        op: "XOR",
        after: m(["011","100","111"])
      },
      {
        title: "2. Descubra a segunda transformação",
        text: "Na segunda linha da matriz, o XOR sozinho ainda não coincide com o terceiro bloco. O que falta é trocar a linha superior com a inferior: um espelhamento vertical.",
        before: [m(["111","111","100"])],
        op: "espelhar ↕",
        after: m(["100","111","111"])
      },
      {
        title: "3. Aplique a regra à linha incompleta",
        text: "G XOR H produz o padrão intermediário mostrado abaixo.",
        before: [m(["100","111","110"]), m(["111","011","001"])],
        op: "XOR",
        after: m(["011","100","111"])
      },
      {
        title: "4. Espelhe verticalmente",
        text: "Troque a primeira linha pela terceira. O padrão final é a resposta.",
        before: [m(["011","100","111"])],
        op: "↕",
        after: m(["111","100","011"])
      }
    ]
  },
  {
    id: "2",
    title: "Item 2/24 · Matrizes compostas",
    subtitle: "Qual mosaico completa a matriz? Considere relações por linhas ou por colunas.",
    kind: "matrix",
    grid: [
      m(["011","000","100"]), m(["001","110","101"]), m(["011","000","111"]),
      m(["110","010","000"]), m(["101","110","111"]), m(["000","110","101"]),
      m(["000","100","100"]), m(["001","010","101"]), -1
    ],
    answer: m(["001","000","001"]),
    steps: [
      {
        title: "1. Leia a matriz por colunas",
        text: "As duas primeiras colunas estão completas. Elas mostram que o bloco inferior resulta da combinação dos dois blocos acima, depois de transformações geométricas.",
        before: [m(["011","000","100"]), m(["110","010","000"])],
        op: "transformar",
        after: m(["000","100","100"])
      },
      {
        title: "2. Transponha o bloco superior",
        text: "Na terceira coluna, linhas e colunas do bloco superior trocam de lugar.",
        before: [m(["011","000","111"])],
        op: "transpor",
        after: m(["001","101","101"])
      },
      {
        title: "3. Gire o bloco do meio 90° anti-horário",
        text: "A mesma transformação usada nas colunas completas gera o segundo padrão intermediário.",
        before: [m(["000","110","101"])],
        op: "↺ 90°",
        after: m(["001","010","011"])
      },
      {
        title: "4. Mantenha apenas a interseção preta",
        text: "Agora aplique AND: uma célula só permanece preta se for preta nos dois padrões. O resultado é a resposta.",
        before: [m(["001","101","101"]), m(["001","010","011"])],
        op: "AND",
        after: m(["001","000","001"])
      }
    ]
  },
  {
    id: "23",
    title: "Item 23/24 · Classificação relacional",
    subtitle: "Qual par viola a relação compartilhada pelos outros cinco?",
    kind: "pairs",
    pairs: [
      [m(["001","110","100"]), m(["011","010","100"])],
      [m(["110","100","010"]), m(["110","101","000"])],
      [m(["100","010","110"]), m(["101","101","000"])],
      [m(["100","011","001"]), m(["100","010","011"])],
      [m(["000","111","010"]), m(["010","011","010"])],
      [m(["110","100","100"]), m(["111","100","000"])]
    ],
    answerPair: 3,
    steps: [
      {
        title: "1. Procure uma transformação que preserve a diagonal",
        text: "Nos pares válidos, as células da diagonal principal ficam no lugar. As demais trocam linha por coluna. Isso é transposição.",
        before: [m(["001","110","100"])],
        op: "transpor",
        after: m(["011","010","100"])
      },
      {
        title: "2. Valide em outro par",
        text: "O par 2 também obedece exatamente à mesma transformação.",
        before: [m(["110","100","010"])],
        op: "transpor",
        after: m(["110","101","000"])
      },
      {
        title: "3. Calcule o que deveria acontecer no par 3",
        text: "Transpondo o bloco da esquerda do par 3, este seria o resultado correto.",
        before: [m(["100","010","110"])],
        op: "transpor",
        after: m(["101","011","000"])
      },
      {
        title: "4. Compare esperado e apresentado",
        text: "O par 3 mostra 101 / 101 / 000 em vez de 101 / 011 / 000. Por isso ele é o único intruso.",
        before: [m(["101","011","000"]), m(["101","101","000"])],
        op: "≠"
      }
    ]
  },
  {
    id: "24",
    title: "Item 24/24 · Classificação relacional",
    subtitle: "Qual par viola a relação compartilhada pelos outros cinco?",
    kind: "pairs",
    pairs: [
      [m(["010","101","001"]), m(["100","011","101"])],
      [m(["010","011","010"]), m(["101","000","111"])],
      [m(["000","101","110"]), m(["101","110","100"])],
      [m(["001","100","101"]), m(["010","111","100"])],
      [m(["000","111","010"]), m(["101","100","101"])],
      [m(["001","001","011"]), m(["000","011","111"])]
    ],
    answerPair: 6,
    steps: [
      {
        title: "1. Separe a transformação em duas partes",
        text: "Primeiro gire o mosaico 90° para a esquerda. Depois inverta todas as cores: preto vira branco e branco vira preto.",
        before: [m(["010","101","001"])],
        op: "↺ 90° + inverter",
        after: m(["100","011","101"])
      },
      {
        title: "2. Confira em outro par",
        text: "O par 5 reproduz a mesma sequência de duas operações, confirmando a regra.",
        before: [m(["000","111","010"])],
        op: "↺ + inverter",
        after: m(["101","100","101"])
      },
      {
        title: "3. Aplique a regra ao par 6",
        text: "Este é o resultado que o bloco da esquerda do par 6 deveria produzir.",
        before: [m(["001","001","011"])],
        op: "↺ + inverter",
        after: m(["000","110","111"])
      },
      {
        title: "4. Compare com o que aparece",
        text: "O par 6 apresenta 000 / 011 / 111. A linha central está invertida em relação ao resultado exigido. Logo, o intruso é o par 6.",
        before: [m(["000","110","111"]), m(["000","011","111"])],
        op: "≠"
      }
    ]
  }
];

function BigPattern({ mask, selected = false }: { mask: number; selected?: boolean }) {
  return (
    <div className={`flex items-center justify-center rounded-lg ${selected ? "ring-2 ring-brand-500 bg-brand-50" : ""}`}>
      <PatternSvg mask={mask} size={72} />
    </div>
  );
}

function MatrixView({ item, reveal }: { item: MatrixItem; reveal: boolean }) {
  return (
    <div className="mx-auto grid w-fit grid-cols-3 gap-x-4 gap-y-4 rounded-2xl border border-slate-300 bg-white p-4 shadow-sm sm:gap-x-6 sm:gap-y-5">
      {item.grid.map((mask, i) => (
        <div key={i} className="flex h-[76px] w-[76px] items-center justify-center">
          {mask === -1
            ? reveal
              ? <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-1"><PatternSvg mask={item.answer} size={68}/></div>
              : <span className="text-4xl font-semibold text-brand-600">?</span>
            : <PatternSvg mask={mask} size={72}/>}
        </div>
      ))}
    </div>
  );
}

function PairsView({ item, reveal }: { item: PairItem; reveal: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {item.pairs.map(([a,b], i) => {
        const n = i + 1;
        const bad = n === item.answerPair;
        return (
          <div key={i} className={`rounded-2xl border-2 bg-white px-2 py-3 sm:px-3 ${reveal && bad ? "border-rose-500 bg-rose-50" : "border-slate-200"}`}>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <PatternSvg mask={a} size={58}/>
              <span className="text-2xl text-slate-700">→</span>
              <PatternSvg mask={b} size={58}/>
            </div>
            <div className={`mt-1 text-center text-lg font-semibold ${reveal && bad ? "text-rose-700" : "text-slate-900"}`}>{n}{reveal && bad ? " · intruso" : ""}</div>
          </div>
        );
      })}
    </div>
  );
}

function StepVisual({ before, op, after }: { before?: number[]; op?: string; after?: number }) {
  if (!before?.length && after === undefined) return null;
  return (
    <div className="mt-4 overflow-x-auto">
      <div className="flex min-w-max items-center gap-3 rounded-xl bg-slate-50 p-3">
        {before?.map((mask, i) => (
          <div key={i} className="flex items-center gap-3">
            <BigPattern mask={mask}/>
            {i < before.length - 1 && <span className="text-sm font-bold text-slate-400">+</span>}
          </div>
        ))}
        {op && <span className="rounded-lg bg-brand-100 px-3 py-2 text-sm font-bold text-brand-800">{op}</span>}
        {after !== undefined && <>
          <span className="text-xl font-bold text-slate-400">→</span>
          <BigPattern mask={after} selected/>
        </>}
      </div>
    </div>
  );
}

export default function MensaVisualExplainer() {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [reveal, setReveal] = useState(false);
  const item = items[active];
  const current = item.steps[step];
  const maxStep = item.steps.length - 1;

  const answerText = useMemo(() => {
    if (item.kind === "matrix") return "Resposta: o mosaico destacado em verde.";
    return `Resposta: par ${item.answerPair}.`;
  }, [item]);

  function selectItem(index: number) {
    setActive(index);
    setStep(0);
    setReveal(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="mx-auto max-w-3xl px-3 py-5 sm:px-4 sm:py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/treino/mensa" className="text-sm font-medium text-brand-700 hover:underline">← Voltar à preparação Mensa</Link>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Explicador visual</span>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-4 pb-4 pt-5 sm:px-7">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">MENSA BRASIL · PREPARAÇÃO</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{item.title}</h1>
        </header>

        <div className="px-4 py-5 sm:px-7">
          <p className="mb-5 text-center text-base leading-relaxed text-slate-600">{item.subtitle}</p>

          {item.kind === "matrix"
            ? <MatrixView item={item} reveal={reveal}/>
            : <PairsView item={item} reveal={reveal}/>}

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-brand-700">PASSO {step + 1} DE {item.steps.length}</p>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-brand-600 transition-all" style={{ width: `${((step + 1) / item.steps.length) * 100}%` }}/>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
              <h2 className="text-lg font-bold text-slate-900">{current.title}</h2>
              <p className="mt-2 leading-relaxed text-slate-700">{current.text}</p>
              <StepVisual before={current.before} op={current.op} after={current.after}/>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 disabled:opacity-35"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setStep(s => Math.min(maxStep, s + 1))}
              disabled={step === maxStep}
              className="rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-35"
            >
              Próximo passo →
            </button>
          </div>

          <button
            onClick={() => setReveal(v => !v)}
            className={`mt-3 w-full rounded-xl border-2 px-4 py-3 font-semibold ${reveal ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-brand-300 bg-brand-50 text-brand-800"}`}
          >
            {reveal ? `✓ ${answerText} Toque para ocultar.` : "Mostrar resposta no próprio desenho"}
          </button>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="mb-3 text-sm font-semibold text-slate-700">Escolha outro item</p>
            <div className="grid grid-cols-4 gap-2">
              {items.map((it, i) => (
                <button
                  key={it.id}
                  onClick={() => selectItem(i)}
                  aria-pressed={active === i}
                  className={`rounded-xl border-2 px-3 py-3 text-sm font-bold ${active === i ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 bg-white text-slate-700"}`}
                >
                  {it.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-900">Método para treinar</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Tente prever o próximo passo antes de tocar em “Próximo passo”. Em matrizes, teste primeiro rotação, espelho e transposição; depois XOR, AND e OR. Em classificação, descubra uma única transformação que funcione em cinco pares e procure a exceção.
        </p>
      </section>
    </main>
  );
}
