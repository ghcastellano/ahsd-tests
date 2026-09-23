"use client";

import { useState } from "react";
import { FONTES_ICAR, ICAR_PUBLICO, pontuarIcar } from "@/lib/simulador/icar-publico";

export default function TreinoPublicado() {
  const [escolhas, setEscolhas] = useState<Record<string, number>>({});
  const [corrigido, setCorrigido] = useState(false);
  const [ingles, setIngles] = useState(false);
  const pontos = pontuarIcar(escolhas);
  return (
    <section aria-labelledby="itens-publicados" className="mt-10 border-t border-slate-200 pt-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">Prática com fonte identificada</p>
      <h2 id="itens-publicados" className="mt-2 text-2xl font-bold text-slate-900">12 questões públicas do ICAR</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Seleção de quatro itens verbais/quantitativos e quatro séries de letras e quatro matrizes do ICAR Sample Test (2014). Não é o ICAR-16 completo e não mede os quatro domínios do simulador. Sem tempo limite e sem conversão para QI. A tradução abaixo é de apoio, sem validação brasileira.</p>
      <p className="mt-2 text-sm text-slate-600">Resolva antes de abrir a correção. Ao repetir, você estará revisando itens já conhecidos; uma nota maior não mede transferência.</p>
      <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700"><input type="checkbox" checked={ingles} onChange={(e) => setIngles(e.target.checked)} /> Mostrar enunciados e alternativas originais em inglês</label>
      <form onSubmit={(e) => { e.preventDefault(); setCorrigido(true); }} className="mt-6 space-y-5">
        {ICAR_PUBLICO.map((q, n) => (
          <fieldset key={q.id} disabled={corrigido} className="rounded-xl border border-slate-200 bg-white p-5" lang={ingles ? "en" : "pt-BR"}>
            <legend className="px-2 text-xs font-semibold text-teal-800">{n + 1} / {pontos.total} · {q.id} · {q.dominio}</legend>
            <p className="font-medium leading-7 text-slate-900">{ingles ? q.original : q.enunciado}</p>
            {q.imagem && <a href={q.imagem} target="_blank" rel="noreferrer" className="mt-4 block" aria-label={`Abrir figura original ${q.id} em tamanho completo`}>
              {/* Extração direta do PDF de domínio público; sem redesenho. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={q.imagem} alt={`Matriz ${q.id} original do ICAR, com alternativas A a F. Abra para ampliar.`} className="mx-auto h-auto w-full max-w-xl" />
              <span className="mt-2 block text-xs text-teal-800 underline">Abrir figura original para ampliar</span>
            </a>}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(ingles ? q.opcoesOriginais : q.opcoes).map((op, i) => (
                <label key={i} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm ${escolhas[q.id] === i ? "border-teal-600 bg-teal-50" : "border-slate-200"}`}>
                  <input type="radio" name={q.id} value={i} checked={escolhas[q.id] === i} onChange={() => setEscolhas({ ...escolhas, [q.id]: i })} />
                  <span>{i + 1}. {op}</span>
                </label>
              ))}
            </div>
            {corrigido && <div lang="pt-BR" className={`mt-4 rounded-lg p-4 text-sm leading-6 ${escolhas[q.id] === q.resposta ? "bg-teal-50 text-teal-900" : "bg-amber-50 text-amber-950"}`}>
              <p className="font-semibold">{escolhas[q.id] === undefined ? "Não respondida" : escolhas[q.id] === q.resposta ? "Correta" : "Incorreta"} · Gabarito: {q.resposta + 1}. {q.opcoes[q.resposta]}</p>
              <p className="mt-1">{q.explicacao}</p>
              <a href={FONTES_ICAR.chave} className="mt-2 inline-block underline">Conferir chave publicada (iq.keys)</a>
            </div>}
          </fieldset>
        ))}
        <div className="flex flex-wrap items-center gap-4">
          {!corrigido ? <button className="rounded-lg bg-teal-800 px-5 py-3 font-semibold text-white hover:bg-teal-900" type="submit">Corrigir {pontos.respondidos} de {pontos.total} respondidas</button> : <button className="rounded-lg border border-slate-300 px-5 py-3 font-semibold" type="button" onClick={(e) => { e.preventDefault(); setCorrigido(false); setEscolhas({}); }}>Revisar novamente</button>}
          <p role="status" className="text-sm text-slate-700">{corrigido ? `${pontos.acertos}/${pontos.total} acertos · ${pontos.total - pontos.respondidos} em branco. Resultado de prática, sem percentil.` : "A correção aparece somente ao finalizar."}</p>
        </div>
      </form>
      <details className="mt-6 rounded-lg bg-slate-100 p-4 text-sm leading-6 text-slate-600">
        <summary className="cursor-pointer font-semibold text-slate-800">Origem, direitos e limites da conferência</summary>
        <p className="mt-3">Condon &amp; Revelle, 2014, suplemento, Apêndice A, páginas 2–4: VR.4, VR.16, VR.17, VR.19, LN.7, LN.33, LN.34, LN.58, MX.45, MX.46, MX.47 e MX.55. Ordem das alternativas preservada. O projeto declara os itens de domínio público. As explicações são editoriais e foram verificadas por cálculo/relações lógicas e confrontadas com a chave do psychTools.</p>
        <p className="mt-2">Consulta em {FONTES_ICAR.acesso}: texto e matrizes conferidos visualmente no suplemento original da editora. Figuras extraídas diretamente do PDF, sem redesenho. A chave publicada usa os nomes matrix.45/46/47/55 para os itens rotulados MX no suplemento. Séries finitas permitem extrapolações alternativas; apresentamos a regra compatível com a chave, sem prometer unicidade absoluta.</p>
        <ul className="mt-3 list-disc pl-5">
          <li><a className="underline" href={FONTES_ICAR.itens}>Suplemento original da editora</a></li>
          <li><a className="underline" href={FONTES_ICAR.chave}>Gabarito e ordem dos itens no psychTools</a></li>
          <li><a className="underline" href={FONTES_ICAR.projeto}>Projeto ICAR e declaração de domínio público</a></li>
          <li><a className="underline" href={FONTES_ICAR.estudo}>Artigo dos autores</a></li>
        </ul>
      </details>
    </section>
  );
}
