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
          Questionários validados, com correção automática, pontuação e detalhamento dos
          resultados. Feito para autoavaliação e para que profissionais e familiares possam
          aplicar e interpretar. Os resultados são calculados no seu navegador — nada é enviado
          para servidores.
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
