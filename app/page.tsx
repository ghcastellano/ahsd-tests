import Link from "next/link";
import { categories, instrumentsByCategory } from "@/lib/instruments";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-10">
        <p className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
          Triagem e orientação inicial
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Mapa de testes de Altas Habilidades/Superdotação e neurodivergências
        </h1>
        <p className="mt-4 max-w-3xl text-slate-600">
          Rastreios clínicos validados (PHQ-9, GAD-7, ASRS, ASRS-18 da ABDA, WURS-25, BIS-11,
          SNAP-IV, SWAN, CFQ, BSCS, UPPS-P, Vanderbilt, AQ-50, RAADS-R, MDQ, HCL-32, PCL-5, ACE e DERS) e módulos autorais de
          AH/SD sobre indicadores, intensidades, perfeccionismo, impostor, sensorialidade,
          personalidade e bem-estar — com correção automática, pontuação e detalhamento. Feito
          para autoavaliação e para que profissionais
          e familiares possam aplicar e interpretar. Os resultados são calculados no seu
          navegador; um registro do resultado (data/hora, identificação opcional e pontuações —
          sem as respostas de cada questão) é guardado para o painel de acompanhamento.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-slate-500">
          Quer entender como estes rastreios se relacionam com testes de QI e com o laudo formal
          de superdotação?{" "}
          <Link href="/superdotacao" className="font-medium text-brand-600 hover:underline">
            Leia o guia sobre superdotação →
          </Link>
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            {instrumentAllCount()} instrumentos
          </span>
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            {categories.length} áreas
          </span>
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2">
            Correção e interpretação automáticas
          </span>
        </div>
      </section>

      {categories.map((cat) => {
        const items = instrumentsByCategory(cat.key);
        if (!items.length) return null;
        return (
          <section key={cat.key} className="mb-10">
            <div className="mb-4 border-l-4 border-brand-500 pl-3">
              <h2 className="text-xl font-semibold text-slate-900">{cat.name}</h2>
              <p className="text-sm text-slate-500">{cat.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {items.map((inst) => (
                <Link
                  key={inst.id}
                  href={`/teste/${inst.id}`}
                  className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                      {inst.acronym}
                    </span>
                    <span className="text-xs text-slate-400">
                      {inst.questions.length} itens · {inst.estMinutes} min
                    </span>
                  </div>
                  <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-brand-700">
                    {inst.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{inst.summary}</p>
                  <p className="mt-3 text-sm font-medium text-brand-600">Responder →</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mb-10">
        <div className="mb-4 border-l-4 border-brand-500 pl-3">
          <h2 className="text-xl font-semibold text-slate-900">Raciocínio Fluido (treino)</h2>
          <p className="text-sm text-slate-500">
            Bateria cronometrada nos formatos usados em avaliações supervisionadas de alto QI.
          </p>
        </div>
        <Link
          href="/treino"
          className="group block rounded-xl border-2 border-brand-300 bg-brand-50 p-5 transition hover:border-brand-500 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
              BATERIA
            </span>
            <span className="text-xs text-slate-500">4 treinos · 83 itens · 59 min</span>
          </div>
          <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-brand-700">
            Bateria de treino + guia de regras
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Matrizes avançadas (36 itens/40 min), séries de figuras e classificação sob pressão de
            tempo, e séries numéricas. Com <strong>revisão da regra de cada item</strong> ao final —
            o passo que a pesquisa aponta como o mais rentável da preparação.
          </p>
          <p className="mt-3 text-sm font-medium text-brand-600">Ver a bateria →</p>
        </Link>
        <Link
          href="/teste-qi"
          className="group mt-3 block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-400"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              INICIANTE
            </span>
            <span className="text-xs text-slate-400">30 itens · 25 min</span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-brand-700">
            Treino introdutório de matrizes
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Versão mais leve, para o primeiro contato com o formato.
          </p>
        </Link>
        <Link
          href="/treino/go-nogo"
          className="group mt-3 block rounded-xl border border-amber-300 bg-amber-50 p-4 transition hover:border-amber-500"
        >
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-amber-600 px-2 py-0.5 text-xs font-semibold text-white">
              TAREFA OBJETIVA · TDAH
            </span>
            <span className="text-xs text-slate-500">120 letras · ~2 min</span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-amber-800">
            Go/NoGo — controle inibitório
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Erros de comissão e variabilidade do tempo de reação: os marcadores objetivos do TDAH,
            sem autorrelato.
          </p>
        </Link>
      </section>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <strong>Importante:</strong> nenhum questionário isolado diagnostica altas habilidades ou
        qualquer condição. Estes instrumentos são de rastreio: apontam indícios que merecem
        aprofundamento com profissionais qualificados (psicólogos, psiquiatras, neuropsicólogos e
        especialistas em AH/SD).
      </section>
    </div>
  );
}

function instrumentAllCount(): number {
  return categories.reduce((acc, c) => acc + instrumentsByCategory(c.key).length, 0);
}
