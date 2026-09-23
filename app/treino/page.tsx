import type { Metadata } from "next";
import Link from "next/link";
import { tests } from "@/lib/battery";

export const metadata: Metadata = {
  title: "Bateria de treino de raciocínio",
  description:
    "Quatro treinos cronometrados de raciocínio não-verbal — matrizes avançadas, séries de figuras, classificação e séries numéricas — com revisão das regras.",
};

export default function TreinoIndex() {
  const totalItems = tests.reduce((a, t) => a + t.itemCount, 0);
  const totalMin = Math.round(tests.reduce((a, t) => a + t.timeLimitSeconds, 0) / 60);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/" className="text-sm text-brand-600 hover:underline">← Todos os testes</Link>
      <p className="mt-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
        Treino de raciocínio fluido
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        Bateria de treino
      </h1>
      <p className="mt-4 max-w-3xl text-slate-600">
        Quatro treinos cronometrados que reproduzem os formatos usados em avaliações
        supervisionadas de raciocínio não-verbal — com <strong>{totalItems} itens originais</strong>{" "}
        no total ({totalMin} minutos de prova) e revisão das regras ao final de cada um.
      </p>

      <div className="mt-6 rounded-xl border border-brand-200 bg-brand-50 p-5">
        <h2 className="font-semibold text-brand-900">Comece por aqui 👇</h2>
        <p className="mt-1 text-sm text-brand-900">
          O guia de regras é o passo mais rentável: em experimento controlado, menos de 14 minutos
          de instrução explícita sobre as regras renderam ganho maior (d ≥ 1,19) do que qualquer
          repetição de itens.
        </p>
        <Link
          href="/treino/regras"
          className="mt-3 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700"
        >
          Ler o guia de regras
        </Link>
      </div>

      <Link href="/treino/mensa" className="mt-5 block rounded-xl border-2 border-brand-300 bg-brand-50 p-5 hover:border-brand-500"><h2 className="text-xl font-bold text-slate-900">Preparação Mensa Brasil</h2><p className="mt-2 text-sm text-slate-600">Sessão não verbal: 24 itens / 30 min · complemento de dominós e mostradores · evidências e relatos de 2026.</p><p className="mt-3 font-semibold text-brand-700">Começar a preparação específica →</p></Link>
      <Link href="/treino/guia-exames" className="mt-4 block rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm font-semibold text-indigo-900 hover:bg-indigo-100">Exames reais: Mensa × WAIS · QI e percentil · custos e agendamento →</Link>
        <Link
        href="/treino/dojo"
        className="group mt-8 block rounded-xl border-2 border-emerald-300 bg-emerald-50 p-5 transition hover:border-emerald-500 hover:shadow-md"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">NOVO</span>
          <span className="text-xs text-emerald-700">treino ativo · explicação após cada item · plano do dia</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">Dojo: Mensa, Wechsler, Stanford-Binet e Cattell</h2>
        <p className="mt-1 text-sm text-slate-600">
          Escolha o exame, faça 10 itens rápidos e veja, a cada resposta, a regra, o porquê da dificuldade e uma dica. O progresso por domínio fica no aparelho e monta o seu plano de treino.
        </p>
      </Link>
      <Link
        href="/treino/simulador"
        className="group mt-8 block rounded-xl border-2 border-violet-300 bg-violet-50 p-5 transition hover:border-violet-500 hover:shadow-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="shrink-0 whitespace-nowrap rounded-md bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">SIMULADOR · 3 BLOCOS</span>
          <span className="text-xs text-slate-500">3 blocos · tempo configurável</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Wechsler · Stanford-Binet · Cattell — referências de formato</p>
        <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-violet-800">Simulador de escalas completas</h3>
        <p className="mt-1 text-sm text-slate-600">
          Compreensão verbal, memória operacional, velocidade de processamento e raciocínio fluido, em três
          blocos de treino. Os itens e cortes são autorais, sem equivalência com QI ou percentis.
        </p>
        <p className="mt-3 text-sm font-medium text-violet-700">Fazer o simulador →</p>
      </Link>

      <Link
        href="/treino/go-nogo"
        className="group mt-8 block rounded-xl border-2 border-amber-300 bg-amber-50 p-5 transition hover:border-amber-500 hover:shadow-md"
      >
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <span className="shrink-0 whitespace-nowrap rounded-md bg-amber-600 px-2 py-0.5 text-xs font-semibold text-white">
            TAREFA OBJETIVA · TDAH
          </span>
          <span className="text-xs text-slate-500">120 letras · ~2 min</span>
        </div>
        <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-amber-800">
          Go/NoGo — controle inibitório
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Responda a cada letra, segure no X. Mede erros de comissão (o freio) e a variabilidade
          do tempo de reação — os marcadores objetivos mais ligados ao TDAH. Sem autorrelato.
        </p>
        <p className="mt-3 text-sm font-medium text-amber-700">Fazer a tarefa →</p>
      </Link>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tests.map((t) => (
          <Link
            key={t.id}
            href={`/treino/${t.id}`}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  t.regime === "velocidade"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                {t.regime === "velocidade" ? "VELOCIDADE" : "POTÊNCIA"}
              </span>
              <span className="text-xs text-slate-400">
                {t.itemCount} itens · {Math.round(t.timeLimitSeconds / 60)} min
              </span>
            </div>
            <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-brand-700">{t.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{t.intro.slice(0, 155)}…</p>
            <p className="mt-3 text-sm font-medium text-brand-600">Iniciar →</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Por que dois regimes de tempo?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Os instrumentos reais se dividem em dois grupos incompatíveis. Os de{" "}
          <strong>potência</strong> dão ~40–70 segundos por item e cobram integração de várias
          regras. Os de <strong>velocidade</strong> dão ~15 segundos e cobram reconhecimento
          imediato mais triagem. Misturar os dois — item complexo com tempo curto — mediria
          apenas taxa de chute, então cada treino aqui respeita o seu próprio regime.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <strong>Treino, não medida.</strong> Todos os itens são originais desta plataforma e não
        têm normatização — <strong>não geram QI nem percentil</strong> e não substituem avaliação
        supervisionada. Este site não tem afiliação com nenhuma sociedade de alto QI; nomes de
        instrumentos, quando citados, servem apenas para descrever formato e tempo.
      </div>
    </div>
  );
}
