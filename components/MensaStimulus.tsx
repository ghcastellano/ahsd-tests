"use client";
import CellSvg from "./CellSvg";
import type { MensaItem, Pair, PairItem } from "@/lib/mensa/banco";

const dots = [[], [[0, 0]], [[-9, -9], [9, 9]], [[-9, -9], [0, 0], [9, 9]], [[-9, -9], [9, -9], [-9, 9], [9, 9]], [[-9, -9], [9, -9], [0, 0], [-9, 9], [9, 9]], [[-9, -10], [9, -10], [-9, 0], [9, 0], [-9, 10], [9, 10]]];
export function PairSvg({ pair, type }: { pair: Pair; type: PairItem["type"] }) {
  return <svg viewBox="0 0 80 92" width="72" height="82" role="img" aria-label={type === "domino" ? `Peça: ${pair[0]} acima, ${pair[1]} abaixo` : `Mostrador: ponteiro curto na posição ${pair[0] || 12}, longo na posição ${pair[1] || 12}`}>
    {type === "domino" ? <g stroke="#1e293b" strokeWidth="2" fill="none"><rect x="18" y="3" width="44" height="86" rx="5"/><path d="M18 46h44"/>{pair.map((n, half) => dots[n].map(([x, y], i) => <circle key={`${half}-${i}`} cx={40 + x} cy={half === 0 ? 25 + y : 67 + y} r="3" fill="#1e293b"/>))}</g> : <g stroke="#1e293b" fill="none"><circle cx="40" cy="46" r="33" strokeWidth="2"/>{Array.from({ length: 12 }, (_, i) => <path key={i} d="M40 14v4" transform={`rotate(${i * 30} 40 46)`}/>)}<path d="M40 46V28" strokeWidth="5" transform={`rotate(${pair[0] * 30} 40 46)`}/><path d="M40 46V17" strokeWidth="2" transform={`rotate(${pair[1] * 30} 40 46)`}/><circle cx="40" cy="46" r="3" fill="#1e293b"/></g>}
  </svg>;
}
export function MensaOption({ q, index, uid }: { q: MensaItem; index: number; uid: string }) {
  if (q.type !== "figura") return <PairSvg pair={q.options[index]} type={q.type}/>;
  return <CellSvg cell={(q.item.options ?? q.item.set)![index]} uid={uid} size={64}/>;
}
export default function MensaStimulus({ q, uid }: { q: MensaItem; uid: string }) {
  const figure = q.type === "figura" ? q.item : null;
  const grid = figure?.grid ?? (q.type !== "figura" ? q.grid : undefined);
  const sequence = figure?.sequence ?? (q.type !== "figura" ? q.sequence : undefined);
  const render = (row: number, col: number) => q.type === "figura" ? <CellSvg cell={q.item.grid![row][col]} uid={`${uid}-${row}-${col}`} size={64}/> : <PairSvg pair={q.grid![row][col]} type={q.type}/>;
  return <div className="my-5">
    <p className="mb-4 text-center text-sm text-slate-600">{figure?.set ? "Qual figura não pertence ao grupo?" : grid ? "Qual alternativa completa a última célula?" : "Qual figura continua a sequência?"}</p>
    {q.type === "domino" && <p className="mb-4 text-sm text-slate-500">Cada metade tem 0 a 6 pontos; a contagem pode dar a volta (6 → 0). Aplique a mesma relação nas três linhas.</p>}
    {q.type === "mostrador" && <p className="mb-4 text-sm text-slate-500">Os ponteiros curto e longo seguem regras independentes em 12 posições. Não representam horas reais.</p>}
    {grid && <div className="mx-auto grid w-fit grid-cols-3 gap-1 rounded-xl border border-slate-300 bg-white p-2">{[0, 1, 2].flatMap(r => [0, 1, 2].map(c => <div key={`${r}-${c}`} className="flex min-h-[82px] w-[76px] items-center justify-center">{r === 2 && c === 2 ? <span className="text-3xl text-brand-600">?</span> : render(r, c)}</div>))}</div>}
    {sequence && <div className="flex flex-wrap items-center justify-center gap-2">{sequence.map((_, i) => <div key={i} className="rounded-lg border border-slate-200 bg-white p-1">{q.type === "figura" ? <CellSvg cell={q.item.sequence![i]} uid={`${uid}-s${i}`} size={64}/> : <PairSvg pair={q.sequence![i]} type={q.type}/>}</div>)}<span className="p-3 text-3xl text-brand-600">?</span></div>}
  </div>;
}
