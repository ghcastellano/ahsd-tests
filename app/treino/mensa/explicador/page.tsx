"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { PatternSvg } from "@/components/MensaStimulus";
import styles from "./page.module.css";

type Focus =
  | { axis: "row" | "col"; index: 0 | 1 | 2 }
  | { pair: number };

type AnimationSpec =
  | { kind: "focus"; text: string }
  | { kind: "binary"; op: "XOR" | "AND"; a: number; b: number; result: number; rule: string }
  | { kind: "transform"; transform: "flipV" | "transpose" | "rotateCCW" | "invert"; from: number; to: number; label: string }
  | { kind: "compare"; expected: number; shown: number; detail: string };

type TutorialStep = {
  title: string;
  text: string;
  watch: string;
  focus?: Focus;
  animation: AnimationSpec;
};

type MatrixItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: "matrix";
  grid: number[];
  answer: number;
  steps: TutorialStep[];
};

type PairItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: "pairs";
  pairs: [number, number][];
  answerPair: number;
  steps: TutorialStep[];
};

type TutorialItem = MatrixItem | PairItem;

function m(rows: string[]) {
  let mask = 0;
  rows.join("").split("").forEach((v, i) => {
    if (v === "1") mask |= 1 << i;
  });
  return mask;
}

const items: TutorialItem[] = [
  {
    id: "1",
    title: "Item 1/24 · Matrizes compostas",
    subtitle: "Primeiro descubra a regra em uma linha completa. Depois aplique a mesma regra à linha com o ?.",
    kind: "matrix",
    grid: [
      m(["110","101","101"]), m(["101","010","110"]), m(["011","111","011"]),
      m(["100","100","101"]), m(["011","011","001"]), m(["100","111","111"]),
      m(["100","111","110"]), m(["111","011","001"]), -1
    ],
    answer: m(["111","100","011"]),
    steps: [
      {
        title: "1. Use a LINHA 2 como referência",
        text: "A linha 2 está completa: A2 e B2 produzem C2. Ela é a melhor referência porque revela as duas operações da regra. Ignore temporariamente as linhas 1 e 3.",
        watch: "Veja a faixa horizontal inteira: A2 → B2 → C2. A animação apaga o resto para deixar claro qual linha estamos usando.",
        focus: { axis: "row", index: 1 },
        animation: { kind: "focus", text: "LINHA 2: A2 + B2 precisam explicar C2" }
      },
      {
        title: "2. Primeira operação da linha 2: XOR",
        text: "Compare A2 e B2 quadrado por quadrado. Se os dois quadrados têm a MESMA cor, o resultado fica branco. Se têm cores DIFERENTES, fica preto.",
        watch: "Olhe os dois blocos à esquerda pulsando. O resultado só aparece depois. A regra curta é: igual → branco; diferente → preto.",
        focus: { axis: "row", index: 1 },
        animation: {
          kind: "binary",
          op: "XOR",
          a: m(["100","100","101"]),
          b: m(["011","011","001"]),
          result: m(["111","111","100"]),
          rule: "IGUAL = branco · DIFERENTE = preto"
        }
      },
      {
        title: "3. Segunda operação: espelhamento vertical",
        text: "O XOR ainda produz 111 / 111 / 100. Mas C2 é 100 / 111 / 111. Portanto a linha de cima e a linha de baixo trocam de lugar.",
        watch: "Acompanhe os quadrados se movendo para cima e para baixo. A linha central permanece no meio.",
        focus: { axis: "row", index: 1 },
        animation: {
          kind: "transform",
          transform: "flipV",
          from: m(["111","111","100"]),
          to: m(["100","111","111"]),
          label: "ESPELHAR ↕"
        }
      },
      {
        title: "4. Agora mude a referência para a LINHA 3",
        text: "Já sabemos a regra. A linha 3 é a linha do problema: A3 e B3 devem gerar o bloco faltante C3.",
        watch: "O foco desce da linha 2 para a linha 3. Agora toda a sua atenção deve ficar em A3, B3 e no ?.",
        focus: { axis: "row", index: 2 },
        animation: { kind: "focus", text: "LINHA 3: A3 + B3 → ?" }
      },
      {
        title: "5. Faça XOR entre A3 e B3",
        text: "Repita exatamente a primeira operação que funcionou na linha de referência. O resultado intermediário é 011 / 100 / 111.",
        watch: "Não tente adivinhar a resposta final ainda. Primeiro obtenha apenas o resultado do XOR.",
        focus: { axis: "row", index: 2 },
        animation: {
          kind: "binary",
          op: "XOR",
          a: m(["100","111","110"]),
          b: m(["111","011","001"]),
          result: m(["011","100","111"]),
          rule: "IGUAL = branco · DIFERENTE = preto"
        }
      },
      {
        title: "6. Espelhe verticalmente e obtenha a resposta",
        text: "Troque a linha superior 011 pela inferior 111. A linha central 100 permanece. Assim surge 111 / 100 / 011.",
        watch: "Observe a primeira e a terceira linhas cruzando de posição. Esse bloco é colocado no lugar do ?.",
        focus: { axis: "row", index: 2 },
        animation: {
          kind: "transform",
          transform: "flipV",
          from: m(["011","100","111"]),
          to: m(["111","100","011"]),
          label: "ESPELHAR ↕"
        }
      }
    ]
  },
  {
    id: "2",
    title: "Item 2/24 · Matrizes compostas",
    subtitle: "Neste item a direção muda: a regra é lida de CIMA PARA BAIXO, por colunas.",
    kind: "matrix",
    grid: [
      m(["011","000","100"]), m(["001","110","101"]), m(["011","000","111"]),
      m(["110","010","000"]), m(["101","110","111"]), m(["000","110","101"]),
      m(["000","100","100"]), m(["001","010","101"]), -1
    ],
    answer: m(["001","000","001"]),
    steps: [
      {
        title: "1. Use a COLUNA A como referência",
        text: "A coluna A está completa: A1 e A2 produzem A3. Aqui você NÃO lê da esquerda para a direita. A referência é vertical.",
        watch: "Veja a coluna A acesa e uma seta imaginária descendo: A1 ↓ A2 ↓ A3.",
        focus: { axis: "col", index: 0 },
        animation: { kind: "focus", text: "COLUNA A: A1 + A2 → A3" }
      },
      {
        title: "2. Transforme A1: transposição",
        text: "No bloco de cima, linhas viram colunas. Uma célula em (linha 1, coluna 3) vai para (linha 3, coluna 1). A diagonal principal funciona como eixo de referência.",
        watch: "Siga os quadrados deslizando através da diagonal. Os que já estão na diagonal praticamente ficam no lugar.",
        focus: { axis: "col", index: 0 },
        animation: {
          kind: "transform",
          transform: "transpose",
          from: m(["011","000","100"]),
          to: m(["001","100","100"]),
          label: "TRANSPOR"
        }
      },
      {
        title: "3. Transforme A2: giro de 90° para a esquerda",
        text: "O bloco do meio usa outra transformação. Imagine segurar a grade inteira e girá-la um quarto de volta no sentido anti-horário.",
        watch: "Acompanhe principalmente os cantos: o canto superior direito caminha para o superior esquerdo.",
        focus: { axis: "col", index: 0 },
        animation: {
          kind: "transform",
          transform: "rotateCCW",
          from: m(["110","010","000"]),
          to: m(["000","110","100"]),
          label: "GIRAR ↺ 90°"
        }
      },
      {
        title: "4. Combine os dois resultados com AND",
        text: "Agora sobreponha os dois padrões transformados. No AND, um quadrado só fica preto quando está preto NOS DOIS blocos.",
        watch: "Os dois operandos piscam primeiro. Depois o resultado aparece. Preto em apenas um deles não sobrevive.",
        focus: { axis: "col", index: 0 },
        animation: {
          kind: "binary",
          op: "AND",
          a: m(["001","100","100"]),
          b: m(["000","110","100"]),
          result: m(["000","100","100"]),
          rule: "PRETO + PRETO = preto · qualquer outro caso = branco"
        }
      },
      {
        title: "5. Vá para a COLUNA C, onde está o ?",
        text: "A coluna A ensinou a regra. Agora aplique exatamente as mesmas operações na coluna C: C1 e C2 devem gerar C3.",
        watch: "O foco salta para a coluna C. Ignore a coluna B por enquanto.",
        focus: { axis: "col", index: 2 },
        animation: { kind: "focus", text: "COLUNA C: C1 + C2 → ?" }
      },
      {
        title: "6. Transponha C1",
        text: "C1 = 011 / 000 / 111. Depois da transposição, ele vira 001 / 101 / 101.",
        watch: "Observe novamente linhas virando colunas. Use a diagonal principal como referência visual.",
        focus: { axis: "col", index: 2 },
        animation: {
          kind: "transform",
          transform: "transpose",
          from: m(["011","000","111"]),
          to: m(["001","101","101"]),
          label: "TRANSPOR"
        }
      },
      {
        title: "7. Gire C2 90° para a esquerda",
        text: "C2 = 000 / 110 / 101. Girando toda a grade para a esquerda, obtemos 001 / 010 / 011.",
        watch: "Preste atenção aos três quadrados da borda direita; eles mudam de orientação juntos.",
        focus: { axis: "col", index: 2 },
        animation: {
          kind: "transform",
          transform: "rotateCCW",
          from: m(["000","110","101"]),
          to: m(["001","010","011"]),
          label: "GIRAR ↺ 90°"
        }
      },
      {
        title: "8. Faça AND e obtenha C3",
        text: "Compare 001 / 101 / 101 com 001 / 010 / 011. Só as posições pretas nos dois permanecem: 001 / 000 / 001.",
        watch: "Os únicos pretos sobreviventes são o canto superior direito e o canto inferior direito.",
        focus: { axis: "col", index: 2 },
        animation: {
          kind: "binary",
          op: "AND",
          a: m(["001","101","101"]),
          b: m(["001","010","011"]),
          result: m(["001","000","001"]),
          rule: "PRETO + PRETO = preto"
        }
      }
    ]
  },
  {
    id: "23",
    title: "Item 23/24 · Classificação relacional",
    subtitle: "Aqui cada número é um PAR. Descubra a transformação esquerda → direita que funciona em cinco pares e encontre o intruso.",
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
        title: "1. Use o PAR 1 como referência",
        text: "Não compare os seis pares ao mesmo tempo. Comece pelo par 1 e procure uma transformação simples que leve o bloco da esquerda ao da direita.",
        watch: "Apenas o par 1 fica em foco. Leia sempre esquerda → direita.",
        focus: { pair: 1 },
        animation: { kind: "focus", text: "PAR 1: esquerda → direita" }
      },
      {
        title: "2. A regra do par 1 é TRANSPOSIÇÃO",
        text: "Imagine uma diagonal do canto superior esquerdo ao inferior direito. Tudo que está fora dela troca linha por coluna: (linha, coluna) vira (coluna, linha).",
        watch: "Os quadrados atravessam a diagonal. Células da diagonal ficam na mesma posição.",
        focus: { pair: 1 },
        animation: {
          kind: "transform",
          transform: "transpose",
          from: m(["001","110","100"]),
          to: m(["011","010","100"]),
          label: "TRANSPOR"
        }
      },
      {
        title: "3. Valide a hipótese no PAR 2",
        text: "Uma regra só é confiável se funcionar em outro exemplo. A transposição também transforma exatamente o lado esquerdo do par 2 no lado direito.",
        watch: "Veja o mesmo movimento ocorrer em um desenho diferente. Isso confirma que não foi coincidência.",
        focus: { pair: 2 },
        animation: {
          kind: "transform",
          transform: "transpose",
          from: m(["110","100","010"]),
          to: m(["110","101","000"]),
          label: "TRANSPOR"
        }
      },
      {
        title: "4. Teste o PAR 3 sem olhar o resultado",
        text: "Pegue apenas o lado esquerdo do par 3 e aplique a transposição. O resultado correto deveria ser 101 / 011 / 000.",
        watch: "Primeiro veja o resultado esperado ser construído. Só depois compare com o bloco realmente mostrado.",
        focus: { pair: 3 },
        animation: {
          kind: "transform",
          transform: "transpose",
          from: m(["100","010","110"]),
          to: m(["101","011","000"]),
          label: "RESULTADO ESPERADO"
        }
      },
      {
        title: "5. Compare ESPERADO × MOSTRADO",
        text: "Esperado: 101 / 011 / 000. Mostrado no par 3: 101 / 101 / 000. A linha central não coincide. Por isso o par 3 é o intruso.",
        watch: "O esperado recebe brilho verde; o mostrado pisca em vermelho. Foque na linha do meio.",
        focus: { pair: 3 },
        animation: {
          kind: "compare",
          expected: m(["101","011","000"]),
          shown: m(["101","101","000"]),
          detail: "A diferença está na LINHA CENTRAL."
        }
      }
    ]
  },
  {
    id: "24",
    title: "Item 24/24 · Classificação relacional",
    subtitle: "Neste conjunto a transformação tem DUAS etapas. Separe-as para não tentar enxergar tudo de uma vez.",
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
        title: "1. Use o PAR 1 como referência",
        text: "Comece apenas com o par 1. O bloco da direita parece muito diferente porque há duas operações sucessivas.",
        watch: "O par 1 fica em foco. Leia esquerda → direita e ignore os outros cinco.",
        focus: { pair: 1 },
        animation: { kind: "focus", text: "PAR 1: encontre duas operações" }
      },
      {
        title: "2. Primeira operação: gire 90° para a esquerda",
        text: "Gire o bloco inteiro um quarto de volta no sentido anti-horário. Ainda NÃO inverta as cores.",
        watch: "Acompanhe os cantos se deslocando juntos. O desenho intermediário é 011 / 100 / 010.",
        focus: { pair: 1 },
        animation: {
          kind: "transform",
          transform: "rotateCCW",
          from: m(["010","101","001"]),
          to: m(["011","100","010"]),
          label: "1º · GIRAR ↺ 90°"
        }
      },
      {
        title: "3. Segunda operação: inverta as cores",
        text: "Agora cada preto vira branco e cada branco vira preto. As posições não mudam nesta etapa; só a cor muda.",
        watch: "Nenhum quadrado se desloca. Observe apenas o preenchimento de cada célula trocar.",
        focus: { pair: 1 },
        animation: {
          kind: "transform",
          transform: "invert",
          from: m(["011","100","010"]),
          to: m(["100","011","101"]),
          label: "2º · INVERTER CORES"
        }
      },
      {
        title: "4. Agora teste o PAR 6",
        text: "Depois de confirmar a regra nos pares válidos, aplique as duas etapas ao lado esquerdo do par 6.",
        watch: "Somente o par 6 fica aceso. O bloco mostrado à direita não deve ser usado até calcularmos o esperado.",
        focus: { pair: 6 },
        animation: { kind: "focus", text: "PAR 6: calcule antes de comparar" }
      },
      {
        title: "5. Gire o lado esquerdo do PAR 6",
        text: "001 / 001 / 011 girado 90° para a esquerda torna-se 111 / 001 / 000.",
        watch: "Veja a coluna da direita se transformar na linha de cima.",
        focus: { pair: 6 },
        animation: {
          kind: "transform",
          transform: "rotateCCW",
          from: m(["001","001","011"]),
          to: m(["111","001","000"]),
          label: "1º · GIRAR ↺ 90°"
        }
      },
      {
        title: "6. Inverta as cores para obter o esperado",
        text: "Invertendo todas as cores de 111 / 001 / 000, obtemos 000 / 110 / 111.",
        watch: "As posições ficam paradas e apenas branco/preto trocam. Esse é o resultado que o par 6 DEVERIA mostrar.",
        focus: { pair: 6 },
        animation: {
          kind: "transform",
          transform: "invert",
          from: m(["111","001","000"]),
          to: m(["000","110","111"]),
          label: "2º · INVERTER CORES"
        }
      },
      {
        title: "7. Compare o esperado com o mostrado",
        text: "Esperado: 000 / 110 / 111. Mostrado: 000 / 011 / 111. A linha central está invertida lateralmente. Portanto o par 6 viola a regra.",
        watch: "O esperado brilha em verde; o bloco mostrado pisca em vermelho. Compare somente a linha do meio.",
        focus: { pair: 6 },
        animation: {
          kind: "compare",
          expected: m(["000","110","111"]),
          shown: m(["000","011","111"]),
          detail: "A diferença está na LINHA CENTRAL."
        }
      }
    ]
  }
];

function has(mask: number, index: number) {
  return (mask & (1 << index)) !== 0;
}

function destination(index: number, transform: "flipV" | "transpose" | "rotateCCW" | "invert") {
  const r = Math.floor(index / 3);
  const c = index % 3;
  if (transform === "flipV") return { r: 2 - r, c };
  if (transform === "transpose") return { r: c, c: r };
  if (transform === "rotateCCW") return { r: 2 - c, c: r };
  return { r, c };
}

function TinyGrid({ mask }: { mask: number }) {
  return <PatternSvg mask={mask} size={82}/>;
}

function AnimatedTransform({
  from,
  to,
  transform,
}: {
  from: number;
  to: number;
  transform: "flipV" | "transpose" | "rotateCCW" | "invert";
}) {
  const step = 32;
  return (
    <div className={styles.patternShell} aria-label="Transformação animada do mosaico">
      {Array.from({ length: 9 }, (_, i) => {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const dest = destination(i, transform);
        const cellStyle = {
          left: c * step,
          top: r * step,
          background: has(from, i) ? "#1e293b" : "#ffffff",
          "--dx": `${(dest.c - c) * step}px`,
          "--dy": `${(dest.r - r) * step}px`,
          "--delay": `${i * 0.035}s`,
        } as CSSProperties;
        return <span key={i} className={`${styles.gridCell} ${styles.sourceCell}`} style={cellStyle}/>;
      })}
      <div className={styles.afterLayer}>
        {Array.from({ length: 9 }, (_, i) => {
          const r = Math.floor(i / 3);
          const c = i % 3;
          return <span
            key={i}
            className={styles.gridCell}
            style={{ left: c * step, top: r * step, background: has(to, i) ? "#1e293b" : "#ffffff" }}
          />;
        })}
      </div>
    </div>
  );
}

function MatrixView({
  item,
  focus,
  reveal,
}: {
  item: MatrixItem;
  focus?: Focus;
  reveal: boolean;
}) {
  const axis = focus && "axis" in focus ? focus : undefined;
  const labels = ["A", "B", "C"];
  return (
    <div>
      <div className="mx-auto w-fit rounded-2xl border border-slate-300 bg-white p-3 shadow-sm">
        <div className="grid grid-cols-[28px_repeat(3,76px)] gap-x-2 gap-y-2 sm:gap-x-4">
          <div />
          {labels.map((label, c) => (
            <div key={label} className={`text-center text-xs font-bold ${axis?.axis === "col" && axis.index === c ? "text-brand-700" : "text-slate-400"}`}>
              COL. {label}
            </div>
          ))}
          {[0,1,2].flatMap((r) => [
            <div key={`r-${r}`} className={`flex items-center justify-center text-xs font-bold ${axis?.axis === "row" && axis.index === r ? "text-brand-700" : "text-slate-400"}`}>
              L{r + 1}
            </div>,
            ...[0,1,2].map((c) => {
              const i = r * 3 + c;
              const mask = item.grid[i];
              const focused = !axis || (axis.axis === "row" ? axis.index === r : axis.index === c);
              return (
                <div
                  key={`c-${r}-${c}`}
                  className={`relative flex h-[76px] w-[76px] items-center justify-center rounded-xl transition ${axis && !focused ? styles.dimCell : ""} ${axis && focused ? styles.focusCell : ""}`}
                >
                  <span className="absolute left-1 top-0.5 z-10 rounded bg-white/85 px-1 text-[9px] font-bold text-slate-400">{labels[c]}{r + 1}</span>
                  {mask === -1
                    ? reveal
                      ? <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-1"><PatternSvg mask={item.answer} size={68}/></div>
                      : <span className="text-4xl font-semibold text-brand-600">?</span>
                    : <PatternSvg mask={mask} size={72}/>}
                </div>
              );
            }),
          ])}
        </div>
      </div>
      {axis && (
        <div className="mx-auto mt-3 max-w-sm rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">referência visual</p>
          <p className="mt-1 font-semibold text-brand-950">
            {axis.axis === "row"
              ? `LINHA ${axis.index + 1}: ${labels[0]}${axis.index + 1} → ${labels[1]}${axis.index + 1} → ${labels[2]}${axis.index + 1}`
              : `COLUNA ${labels[axis.index]}: ${labels[axis.index]}1 ↓ ${labels[axis.index]}2 ↓ ${labels[axis.index]}3`}
          </p>
          <div className="mx-auto mt-2 w-44">
            {axis.axis === "row" ? <div className={styles.axisArrowH}/> : <div className="mx-auto h-10 w-fit"><div className={styles.axisArrowV}/></div>}
          </div>
        </div>
      )}
    </div>
  );
}

function PairsView({
  item,
  focus,
  reveal,
}: {
  item: PairItem;
  focus?: Focus;
  reveal: boolean;
}) {
  const pairFocus = focus && "pair" in focus ? focus.pair : undefined;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {item.pairs.map(([a,b], i) => {
        const n = i + 1;
        const bad = n === item.answerPair;
        const focused = !pairFocus || pairFocus === n;
        return (
          <div
            key={i}
            className={`rounded-2xl border-2 bg-white px-2 py-3 transition sm:px-3 ${pairFocus && !focused ? styles.dimCell : ""} ${pairFocus === n ? styles.focusPair : ""} ${reveal && bad ? "border-rose-500 bg-rose-50" : "border-slate-200"}`}
          >
            <div className="mb-1 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">par {n}</div>
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <PatternSvg mask={a} size={58}/>
              <span className="text-2xl text-slate-700">→</span>
              <PatternSvg mask={b} size={58}/>
            </div>
            {reveal && bad && <div className="mt-1 text-center text-sm font-bold text-rose-700">INTRUSO</div>}
          </div>
        );
      })}
    </div>
  );
}

function Movie({
  spec,
  watch,
  replayKey,
}: {
  spec: AnimationSpec;
  watch: string;
  replayKey: number;
}) {
  return (
    <div key={replayKey} className={styles.stage}>
      <div className="relative z-10">
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">O que observar agora</p>
          <p className={`mt-1 text-sm font-medium leading-relaxed text-amber-950 ${styles.attentionText}`}>{watch}</p>
        </div>

        {spec.kind === "focus" && (
          <div className="flex min-h-[150px] items-center justify-center">
            <div className={`rounded-2xl border-2 border-brand-300 bg-white px-6 py-6 text-center shadow-sm ${styles.focusPair}`}>
              <div className="text-4xl">👁</div>
              <p className="mt-3 text-lg font-bold text-brand-900">{spec.text}</p>
              <p className="mt-2 text-sm text-slate-600">O restante fica apagado para indicar exatamente a referência.</p>
            </div>
          </div>
        )}

        {spec.kind === "binary" && (
          <div className="flex min-h-[170px] items-center justify-center gap-2 overflow-x-auto py-2 sm:gap-4">
            <div className={`rounded-xl bg-white p-2 shadow-sm ${styles.binaryOperand}`}><TinyGrid mask={spec.a}/><p className="text-center text-[10px] font-bold text-slate-500">BLOCO A</p></div>
            <div className={`rounded-xl bg-brand-100 px-3 py-2 text-lg font-black text-brand-800 ${styles.operatorBadge}`}>{spec.op}</div>
            <div className={`rounded-xl bg-white p-2 shadow-sm ${styles.binaryOperand}`}><TinyGrid mask={spec.b}/><p className="text-center text-[10px] font-bold text-slate-500">BLOCO B</p></div>
            <span className="text-2xl font-bold text-slate-400">→</span>
            <div className={`rounded-xl border-2 border-emerald-300 bg-emerald-50 p-2 ${styles.binaryResult}`}><TinyGrid mask={spec.result}/><p className="text-center text-[10px] font-bold text-emerald-700">RESULTADO</p></div>
          </div>
        )}

        {spec.kind === "binary" && (
          <div className="mt-3 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white">{spec.rule}</div>
        )}

        {spec.kind === "transform" && (
          <div className="flex min-h-[190px] items-center justify-center gap-4 py-3">
            <div className="text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">antes</p>
              <AnimatedTransform from={spec.from} to={spec.to} transform={spec.transform}/>
            </div>
            <div className={`rounded-xl bg-brand-100 px-3 py-2 text-center text-xs font-black text-brand-800 ${styles.operatorBadge}`}>
              {spec.label}
            </div>
            <div className={`text-center ${styles.binaryResult}`}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">depois</p>
              <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-1"><TinyGrid mask={spec.to}/></div>
            </div>
          </div>
        )}

        {spec.kind === "compare" && (
          <div className="grid min-h-[180px] grid-cols-2 gap-4 py-3">
            <div className={`rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3 text-center ${styles.compareRight}`}>
              <p className="mb-2 text-xs font-black uppercase text-emerald-700">esperado</p>
              <div className="flex justify-center"><TinyGrid mask={spec.expected}/></div>
            </div>
            <div className={`rounded-2xl border-2 border-rose-300 bg-rose-50 p-3 text-center ${styles.compareWrong}`}>
              <p className="mb-2 text-xs font-black uppercase text-rose-700">mostrado</p>
              <div className="flex justify-center"><TinyGrid mask={spec.shown}/></div>
            </div>
            <p className="col-span-2 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-bold text-white">{spec.detail}</p>
          </div>
        )}

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className={styles.loopProgress}/>
        </div>
        <p className="mt-2 text-center text-[11px] font-medium text-slate-500">A animação reinicia automaticamente.</p>
      </div>
    </div>
  );
}

export default function MensaVisualExplainer() {
  const [active, setActive] = useState(0);
  const [step, setStep] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [slow, setSlow] = useState(true);
  const [paused, setPaused] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const item = items[active];
  const current = item.steps[step];
  const maxStep = item.steps.length - 1;
  const loopSeconds = slow ? 11 : 6;
  const motionStyle = { "--loop-duration": `${loopSeconds}s` } as CSSProperties;

  function selectItem(index: number) {
    setActive(index);
    setStep(0);
    setReveal(false);
    setPaused(false);
    setReplayKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function moveStep(next: number) {
    setStep(Math.max(0, Math.min(maxStep, next)));
    setPaused(false);
    setReplayKey(k => k + 1);
  }

  return (
    <main className="mx-auto max-w-3xl px-3 py-5 sm:px-4 sm:py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/treino/mensa" className="text-sm font-medium text-brand-700 hover:underline">← Voltar à preparação Mensa</Link>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Explicador animado</span>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 px-4 pb-4 pt-5 sm:px-7">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">TREINO VISUAL · PASSO A PASSO</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">{item.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.subtitle}</p>
        </header>

        <div className={paused ? styles.paused : ""} style={motionStyle}>
          <div className="px-3 py-5 sm:px-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">questão original</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">As letras e números foram adicionados apenas para você saber exatamente qual bloco estamos citando.</p>
              </div>
              <button
                onClick={() => setReveal(v => !v)}
                className={`rounded-lg border px-3 py-2 text-xs font-bold ${reveal ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-slate-300 bg-white text-slate-700"}`}
              >
                {reveal ? "Ocultar resposta" : "Mostrar resposta"}
              </button>
            </div>

            {item.kind === "matrix"
              ? <MatrixView item={item} focus={current.focus} reveal={reveal}/>
              : <PairsView item={item} focus={current.focus} reveal={reveal}/>}

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-700">microvídeo {step + 1} de {item.steps.length}</p>
                  <h2 className="mt-1 text-lg font-bold text-slate-900">{current.title}</h2>
                </div>
                <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-brand-600 transition-all" style={{ width: `${((step + 1) / item.steps.length) * 100}%` }}/>
                </div>
              </div>

              <p className="mb-4 leading-relaxed text-slate-700">{current.text}</p>

              <Movie spec={current.animation} watch={current.watch} replayKey={replayKey}/>

              <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3">
                <span className="mr-auto text-xs font-bold uppercase tracking-wider text-slate-500">controles</span>
                <button onClick={() => setReplayKey(k => k + 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold">↻ Repetir</button>
                <button onClick={() => setPaused(v => !v)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold">{paused ? "▶ Continuar" : "Ⅱ Pausar"}</button>
                <button onClick={() => { setSlow(v => !v); setReplayKey(k => k + 1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold">{slow ? "0,5× · lento" : "1× · normal"}</button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => moveStep(step - 1)}
                disabled={step === 0}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-800 disabled:opacity-35"
              >
                ← Passo anterior
              </button>
              <button
                onClick={() => moveStep(step + 1)}
                disabled={step === maxStep}
                className="rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-35"
              >
                Próximo passo →
              </button>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-5">
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
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold text-slate-900">Como usar este modo para aprender</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
          <li>Primeiro identifique a faixa destacada: <strong>linha, coluna ou par</strong>.</li>
          <li>Assista ao loop sem tentar responder. Observe apenas o movimento indicado em “O que observar agora”.</li>
          <li>Use “Repetir” e “0,5× · lento” até conseguir prever o próximo estado antes da animação.</li>
          <li>Só depois avance para o próximo passo. O objetivo é reconhecer a operação sem depender da explicação escrita.</li>
        </ol>
      </section>
    </main>
  );
}
