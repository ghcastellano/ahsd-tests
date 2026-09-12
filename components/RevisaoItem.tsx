"use client";

import CellSvg from "./CellSvg";
import type { Cell, Item } from "@/lib/battery/types";

// Revisão de um item da bateria: a questão como foi apresentada, a alternativa
// que a pessoa marcou (em vermelho, se errada) e a correta (em verde). Serve
// para a bateria de treino e para o raciocínio do simulador.

function classeDe(i: number, escolhido: number | null, correta: number): string {
  if (i === correta) return "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200";
  if (i === escolhido) return "border-rose-500 bg-rose-50 ring-2 ring-rose-200";
  return "border-slate-200 bg-white opacity-60";
}

function papelDe(i: number, escolhido: number | null, correta: number): "correta" | "escolhida" | "certa-e-escolhida" | null {
  if (i === correta && i === escolhido) return "certa-e-escolhida";
  if (i === correta) return "correta";
  if (i === escolhido) return "escolhida";
  return null;
}

function Rotulo({ papel }: { papel: ReturnType<typeof papelDe> }) {
  if (!papel) return null;
  const texto = papel === "certa-e-escolhida" ? "✓ sua resposta (correta)" : papel === "correta" ? "✓ correta" : "✗ sua resposta";
  const cor = papel === "escolhida" ? "text-rose-700" : "text-emerald-700";
  return <span className={`mt-1 block text-center text-[11px] font-semibold ${cor}`}>{texto}</span>;
}

function Figura({ cell, uid, size = 64 }: { cell: Cell; uid: string; size?: number }) {
  return (
    <div className="flex h-[72px] w-[72px] items-center justify-center rounded border border-slate-200 bg-white">
      <CellSvg cell={cell} uid={uid} size={size} />
    </div>
  );
}

export function fraseResultado(escolhido: number | null, correta: number): string {
  if (escolhido === null) return `Você não respondeu este item. A correta é a alternativa ${correta + 1}.`;
  if (escolhido === correta) return `Você acertou: alternativa ${correta + 1}.`;
  return `Você marcou a alternativa ${escolhido + 1}; a correta é a ${correta + 1}.`;
}

export default function RevisaoItem({ item, escolhido, uid }: { item: Item; escolhido: number | null; uid: string }) {
  const correta = item.answerIndex;
  const figuras = item.options ?? item.set;
  return (
    <div className="mt-3" data-revisao={item.id}>
      <p className={`text-sm font-medium ${escolhido === correta ? "text-emerald-700" : "text-rose-700"}`}>
        {fraseResultado(escolhido, correta)}
      </p>

      {/* Enunciado, como foi apresentado — com a resposta certa no lugar do "?" */}
      {item.grid && (
        <div className="mt-3 flex justify-center">
          <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-300 bg-white p-2">
            {[0, 1, 2].flatMap((r) =>
              [0, 1, 2].map((c) => {
                const vazia = r === 2 && c === 2;
                return (
                  <div
                    key={`${r}${c}`}
                    className={`flex h-[72px] w-[72px] items-center justify-center rounded ${vazia ? "border-2 border-dashed border-emerald-400 bg-emerald-50" : ""}`}
                  >
                    <CellSvg cell={vazia ? item.options![correta] : item.grid![r][c]} uid={`${uid}-g${r}${c}`} size={64} />
                  </div>
                );
              }),
            )}
          </div>
        </div>
      )}
      {item.sequence && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {item.sequence.map((c, i) => (
            <Figura key={i} cell={c} uid={`${uid}-s${i}`} />
          ))}
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded border-2 border-dashed border-emerald-400 bg-emerald-50">
            <CellSvg cell={item.options![correta]} uid={`${uid}-sr`} size={64} />
          </div>
        </div>
      )}
      {item.prompt && !item.grid && (
        <p className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-center font-mono text-lg text-slate-800">{item.prompt}</p>
      )}

      {/* Alternativas (ou o conjunto, na classificação) com a marcada e a correta */}
      {item.set && <p className="mt-3 text-xs text-slate-500">Qual figura NÃO pertence ao grupo?</p>}
      {figuras && (
        <div className={`mt-2 grid gap-2 ${item.set ? "grid-cols-5" : "grid-cols-3 sm:grid-cols-6"}`}>
          {figuras.map((c, i) => {
            const papel = papelDe(i, escolhido, correta);
            return (
              <div key={i} data-papel={papel ?? undefined} aria-label={`Alternativa ${i + 1}${papel ? ` (${papel})` : ""}`}>
                <div className={`flex items-center justify-center rounded-xl border-2 p-1 ${classeDe(i, escolhido, correta)}`}>
                  <CellSvg cell={c} uid={`${uid}-o${i}`} size={56} />
                </div>
                <Rotulo papel={papel} />
              </div>
            );
          })}
        </div>
      )}
      {item.textOptions && (
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {item.textOptions.map((t, i) => {
            const papel = papelDe(i, escolhido, correta);
            return (
              <div key={i} data-papel={papel ?? undefined} aria-label={`Alternativa ${i + 1}${papel ? ` (${papel})` : ""}`}>
                <div className={`rounded-xl border-2 px-3 py-2 text-center font-mono ${classeDe(i, escolhido, correta)}`}>{t}</div>
                <Rotulo papel={papel} />
              </div>
            );
          })}
        </div>
      )}
      {item.explanation && <p className="mt-3 text-sm text-slate-600"><strong>Regra:</strong> {item.explanation}</p>}
    </div>
  );
}
