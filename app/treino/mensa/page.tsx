import Link from "next/link";
import type { Metadata } from "next";
import MensaPrep from "@/components/MensaPrep";

export const metadata: Metadata = { title: "Mensa Brasil — preparação não verbal e evidências", description: "Preparação independente para a Mensa Brasil: matrizes, séries e classificação; complemento de dominós e mostradores. Fontes e limites da pesquisa de 2026." };
const link = "font-medium text-brand-700 underline underline-offset-2";
const card = "rounded-xl border border-slate-200 bg-white p-5";

export default function MensaPage() {
  return <main className="mx-auto max-w-4xl px-4 py-8 text-slate-800">
    <Link href="/treino" className={link}>← Todos os treinos</Link>
    <header className="mb-8 mt-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">Objetivo: admissão brasileira · revisão em 23/09/2026</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Preparação Mensa Brasil</h1>
      <p className="mt-4 max-w-3xl text-slate-600">Pratique relações visuais, composição de regras e gestão do tempo. A preparação principal prioriza matrizes, depois séries e classificação. Essa é uma ordem de estudo, não uma previsão da ordem ou composição da sua prova.</p>
      <p className="mt-3 text-sm text-slate-500">Material autoral e independente, sem afiliação à Mensa. Não reproduz testes oficiais nem estima QI, percentil ou aprovação.</p>
      <nav aria-label="Seções Mensa" className="mt-5 flex flex-wrap gap-2 text-sm">{[["mensa-treino", "Iniciar preparação"], ["evidencias", "O que está confirmado"], ["relatos", "Relatos de 2026"], ["plano", "Ordem de estudo"]].map(([id, text]) => <a key={id} href={`#${id}`} className="rounded-full border border-slate-300 bg-white px-4 py-2 hover:border-brand-500">{text}</a>)}</nav>
    </header>
    <MensaPrep/>

    <section id="evidencias" className="mt-10 scroll-mt-6">
      <h2 className="text-2xl font-bold">O que sabemos sobre a prova brasileira</h2>
      <div className="mt-5 space-y-3">
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><p className="text-xs font-semibold uppercase text-emerald-800">Confirmado por fonte oficial</p><h3 className="mt-2 font-semibold">Não verbal, com instrumento variável</h3><p className="mt-2 text-sm">A Mensa Brasil descreve a admissão como não verbal/culture fair; coletivo e individual têm o mesmo conteúdo e critério. Há diferentes testes sorteados no dia, com duração de até 60 minutos. O critério é percentil 98 ou superior. A FAQ informa aprovação/reprovação e percentil mediante interesse do candidato. <a href="https://mensa.org.br/faq-testes" className={link}>FAQ oficial</a> · <a href="https://mensa.org.br/testagem" className={link}>Agendamento</a>.</p></article>
        <article className={card}><p className="text-xs font-semibold uppercase text-amber-800">Não confirmado para 2026</p><h3 className="mt-2 font-semibold">APM, G36/G38, R1, D48/D70, Clocks e TIG-NV</h3><p className="mt-2 text-sm">Essa lista aparece em um comentário comunitário de março de 2023. Não encontramos nas páginas oficiais consultadas uma relação atual dos instrumentos sorteados. Ela não estabelece frequência, probabilidade ou uso na sua sessão. “Alta confiança em Raven” e “70–90% da prova” vão além da evidência encontrada. <a href="https://www.reddit.com/r/cognitiveTesting/comments/11ku55q/mensa_admission_tests/" className={link}>Origem histórica da lista</a>.</p></article>
        <article className={card}><h3 className="font-semibold">Brasil, Estados Unidos e laudos são caminhos distintos</h3><p className="mt-2 text-sm">A American Mensa descreve RAIT e Wonderlic em sua comunicação sobre a bateria americana. Relatos de vocabulário e conhecimentos gerais dos EUA não comprovam esse conteúdo na admissão brasileira. WAIS é uma escala clínica; submeter um laudo aceito é outra via de ingresso. Na lista brasileira, idade, edição e data importam — inclusive para SON-R; não é correto reduzir automaticamente as opções adultas a WAIS e WASI. <a href="https://www.us.mensa.org/featured-content/changes-to-american-mensas-admission-test-course/" className={link}>American Mensa (2022)</a> · <a href="https://mensa.org.br/admissao" className={link}>Critérios brasileiros para laudos</a>.</p></article>
      </div>
      <p className="mt-4 text-sm text-slate-600"><strong>Sobre os tempos do anexo:</strong> o número de itens ou tempo de uma edição comercial não confirma qual versão a Mensa aplicará. Por exemplo, a editora estima 30 minutos para G36, mas isso não comprova que ele será sorteado. Não adotamos os números do anexo como regras da admissão. <a className={link} href="https://www.vetoreditora.com.br/produto/g-36-livro-de-exercicio-70897">Vetor: G36</a>.</p>
    </section>

    <section id="relatos" className="mt-10 scroll-mt-6">
      <h2 className="text-2xl font-bold">A busca por relatos recentes</h2>
      <p className="mt-3 text-sm text-slate-600">Pesquisa pública em português e inglês, combinando Mensa Brasil/Brazil, “fiz”, “teste”, “relato”, nomes de instrumentos e os meses pedidos; consultas direcionadas a Reddit, comunidades e páginas da associação. Critério de inclusão: experiência em primeira pessoa, aplicação brasileira, mês da prova identificável e descrição do instrumento ou formato. Data de publicação sozinha não basta. Isso não cobre grupos privados nem prova que relatos inexistam.</p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr><th className="p-3">Aplicação solicitada</th><th className="p-3">Conclusão em 23/09/2026</th></tr></thead><tbody className="divide-y divide-slate-200 bg-white">{["Junho de 2026", "Julho de 2026", "Agosto de 2026", "Setembro, até dia 23"].map(month => <tr key={month}><td className="p-3 align-top font-medium">{month}</td><td className="p-3">Nenhum relato público localizado que satisfaça todos os critérios e confirme o instrumento brasileiro.</td></tr>)}<tr><td className="p-3 align-top font-medium">Outubro de 2026</td><td className="p-3">Ainda futuro. Anúncios de agenda não são relatos de provas realizadas.</td></tr></tbody></table></div>
      <details className={`${card} mt-4`}><summary className="cursor-pointer font-semibold">Exemplos encontrados e por que não confirmam o conteúdo</summary><ul className="mt-3 list-disc space-y-3 pl-5 text-sm text-slate-600">
        <li><a href="https://evento.mensa.org.br/eventos/santos-2026/" className={link}>Santos, junho de 2026</a>: programação oficial inclui admissão; não identifica instrumento nem relata uma aplicação. A janela do evento não é a duração individual da prova.</li>
        <li><a href="https://www.reddit.com/r/mensa/comments/1ustnv5/just_got_in/" className={link}>Just Got In</a> e <a href="https://www.reddit.com/r/mensa/comments/1vohrux/got_admitted/" className={link}>Got Admitted!</a>: experiências de admissão recuperadas na busca de 2026, mas os textos consultados não estabelecem aplicação brasileira e instrumento. Comentários sobre a Mensa americana não identificam o país do autor.</li>
        <li><a href="https://www.reddit.com/r/cognitiveTesting/comments/1nh2qcp/" className={link}>Pergunta sobre a Mensa Brasil, setembro de 2025</a>: fora do período solicitado; uma resposta comunitária sobre formatos não é registro de uma prova brasileira de 2026.</li>
      </ul></details>
      <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-950"><strong>Conclusão da auditoria:</strong> alta confiança nas regras públicas da associação; evidência insuficiente para afirmar qual instrumento cairá, em que proporção ou com qual dificuldade. O texto anexo é útil como hipótese de estudo, mas exagera a certeza sobre a lista e a cobertura da prova.</p>
    </section>

    <section id="plano" className="mt-10 scroll-mt-6">
      <h2 className="text-2xl font-bold">Ordem de estudo para o seu objetivo</h2>
      <p className="mt-3 text-sm text-slate-600">Nos resultados enviados, os erros de matrizes envolveram separar forma externa e quantidade interna e distinguir XOR de união. Esses são pontos concretos de treino. Os percentuais do simulador, com poucos itens e sem normas, não medem sua posição na população.</p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        <li className={card}><span className="text-xs font-semibold text-brand-700">01 · PRIMEIRA PRIORIDADE</span><h3 className="mt-2 font-semibold">Matrizes e relações entre atributos</h3><p className="mt-2 text-sm">Três sessões semanais de 20 minutos: isole forma, número, orientação e preenchimento; confira a regra em duas linhas antes de responder. Treine distribuição, ausência, XOR, AND e OR. Inclua as cinco matrizes de maior carga do banco.</p></li>
        <li className={card}><span className="text-xs font-semibold text-brand-700">02 · AMPLIAR FORMATOS</span><h3 className="mt-2 font-semibold">Séries e classificação</h3><p className="mt-2 text-sm">Duas sessões de 15 minutos: acompanhe transformações separadamente e procure o atributo comum do grupo. Matrizes também exercitam analogias visuais. A prioridade é editorial; não estima a incidência na prova.</p></li>
        <li className={card}><span className="text-xs font-semibold text-brand-700">03 · OPCIONAL</span><h3 className="mt-2 font-semibold">Dominós e mostradores</h3><p className="mt-2 text-sm">Uma sessão curta por semana para conhecer representações diferentes. Resolva primeiro sem pressa na revisão, depois use os 12 minutos do complemento. São novas famílias autorais, sem equivalência com D48/D70 ou Clocks.</p></li>
        <li className={card}><span className="text-xs font-semibold text-brand-700">04 · ACOMPANHAR</span><h3 className="mt-2 font-semibold">Uma sessão completa por semana</h3><p className="mt-2 text-sm">Faça os 24 itens em 30 minutos, reveja erros e omissões, anote regra e tempo. Após 48–72 horas, pratique outra semente. Progresso significa menos erros recorrentes e melhor gestão do tempo; não uma previsão de aprovação. Na véspera, priorize descanso.</p></li>
      </ol>
      <p className="mt-4 text-sm">A orientação oficial é comparecer descansado; a Mensa não exige preparação prévia. Este plano atende ao seu objetivo de familiarização e não garante aumento de inteligência ou transferência para uma avaliação formal.</p>
      <div className="mt-5 flex flex-wrap gap-4 text-sm"><Link href="/treino/dojo?exame=mensa" className={link}>Praticar no Dojo Mensa →</Link><Link href="/treino/regras" className={link}>Estudar as regras →</Link><Link href="/treino/guia-exames#agendar" className={link}>Custos, requisitos e agendamento →</Link></div>
    </section>
  </main>;
}
