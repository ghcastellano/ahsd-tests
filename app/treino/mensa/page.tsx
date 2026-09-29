import Link from "next/link";
import type { Metadata } from "next";
import MensaPrep from "@/components/MensaPrep";

export const metadata: Metadata = {
  title: "Mensa Brasil — preparação calibrada por referências oficiais",
  description: "Preparação independente para a Mensa Brasil, recalibrada com referências oficiais da Mensa Norge e da Mensa Brasil: matrizes visuais, velocidade e limites da inferência.",
};

const link = "font-medium text-brand-700 underline underline-offset-2";
const card = "rounded-xl border border-slate-200 bg-white p-5";

export default function MensaPage() {
  return <main className="mx-auto max-w-4xl px-4 py-8 text-slate-800">
    <Link href="/treino" className={link}>← Todos os treinos</Link>

    <header className="mb-8 mt-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">Objetivo: admissão brasileira · revisão em 28/09/2026</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Preparação Mensa Brasil</h1>
      <p className="mt-4 max-w-3xl text-slate-600">
        Recalibramos esta área depois de comparar o nosso banco com o processo oficial da Mensa Norge e com as regras publicadas pela Mensa Brasil.
        O foco principal agora é <strong>matriz visual com dificuldade crescente + velocidade</strong>, e não composições artificiais de muitas operações.
      </p>
      <p className="mt-3 text-sm text-slate-500">
        Material autoral e independente. Não reproduz itens oficiais, não estima aprovação, QI ou percentil e não pressupõe que Brasil e Noruega usem o mesmo instrumento.
      </p>
      <nav aria-label="Seções Mensa" className="mt-5 flex flex-wrap gap-2 text-sm">
        <a href="#mensa-treino" className="rounded-full border-2 border-brand-500 bg-brand-50 px-4 py-2 font-semibold text-brand-800">Iniciar treino calibrado</a>
        <a href="#noruega" className="rounded-full border border-slate-300 bg-white px-4 py-2 hover:border-brand-500">O que a Noruega confirma</a>
        <a href="#inferencia" className="rounded-full border border-slate-300 bg-white px-4 py-2 hover:border-brand-500">O que inferimos para o Brasil</a>
        <a href="#familias" className="rounded-full border border-slate-300 bg-white px-4 py-2 hover:border-brand-500">Famílias candidatas</a>
        <a href="#calibracao" className="rounded-full border border-slate-300 bg-white px-4 py-2 hover:border-brand-500">Como recalibramos</a>
        <Link href="/treino/mensa/explicador" className="rounded-full border border-slate-300 bg-white px-4 py-2 hover:border-brand-500">Explicador avançado</Link>
      </nav>
    </header>

    <section className="mb-7 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Mudança principal</p>
      <h2 className="mt-2 text-xl font-bold text-slate-900">As questões extremas saíram do fluxo principal</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">
        O banco anterior misturava transformações como rotação, transposição e operação lógica na mesma questão. Isso é útil como overtraining,
        mas ficou mais complexo do que o benchmark público mais defensável. Agora esse conteúdo fica separado no modo <strong>Overtraining · acima do alvo</strong>.
      </p>
    </section>

    <MensaPrep/>

    <section id="noruega" className="mt-12 scroll-mt-6">
      <h2 className="text-2xl font-bold">O que a Mensa Norge confirma oficialmente</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        A Noruega fornece uma referência excepcionalmente concreta porque publica tanto o formato do teste supervisionado quanto um teste online de familiarização.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase text-emerald-800">Teste supervisionado</p>
          <h3 className="mt-2 font-semibold">45 questões em 20 minutos</h3>
          <p className="mt-2 text-sm leading-relaxed">
            A página oficial informa 45 questões, 20 minutos de prova, resposta em folha separada e aplicação presencial.
            Isso equivale a cerca de <strong>27 segundos por questão</strong> em média.
          </p>
          <a href="https://mensa.no/iq-test/" className={link + " mt-3 inline-block"}>Mensa Norge · IQ-test →</a>
        </article>

        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase text-emerald-800">Tipo de tarefa</p>
          <h3 className="mt-2 font-semibold">Matrizes figurais com a célula inferior direita ausente</h3>
          <p className="mt-2 text-sm leading-relaxed">
            A descrição oficial é de reconhecimento de padrões por figuras: cada item é uma matriz e falta o símbolo do canto inferior direito.
            O candidato escolhe a alternativa que completa a matriz.
          </p>
          <a href="https://mensa.no/iq-test/" className={link + " mt-3 inline-block"}>Descrição oficial →</a>
        </article>

        <article className={card}>
          <p className="text-xs font-semibold uppercase text-brand-700">Teste online oficial de familiarização</p>
          <h3 className="mt-2 font-semibold">35 padrões visuais em 25 minutos</h3>
          <p className="mt-2 text-sm leading-relaxed">
            O teste online tem dificuldade crescente, todas as questões valem um ponto, não há penalidade por erro e não exige conhecimento específico ou matemática.
            A média é de aproximadamente <strong>43 segundos por item</strong>.
          </p>
          <a href="https://test.mensa.no/Home/Test/pt-BR" className={link + " mt-3 inline-block"}>Abrir Mensa Norway online →</a>
        </article>

        <article className={card}>
          <p className="text-xs font-semibold uppercase text-brand-700">Ligação entre online e supervisionado</p>
          <h3 className="mt-2 font-semibold">A própria Mensa Norge diz que é o mesmo tipo de tarefa</h3>
          <p className="mt-2 text-sm leading-relaxed">
            A organização deixa explícito que o online não é um teste autorizado, mas usa o <strong>mesmo tipo de questões</strong> do teste autorizado para familiarização.
            Isso torna o Norway online uma âncora de estilo muito melhor do que bancos de puzzles arbitrariamente difíceis.
          </p>
          <a href="https://mensa.no/iq-test/" className={link + " mt-3 inline-block"}>Fonte oficial →</a>
        </article>
      </div>

      <details className={card + " mt-4"}>
        <summary className="cursor-pointer font-semibold">Exemplos públicos de regras usadas pela própria Mensa Norge</summary>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Na campanha do Dia Nacional de Testes de 2025, a Mensa Norge publicou soluções de puzzles promocionais envolvendo espelhamento,
          rotação de 90°/180°, distribuição de cores e mudanças independentes de atributos. Há composição de regras, mas elas permanecem visualmente rastreáveis;
          isso é diferente de exigir uma cadeia longa e pouco natural de operações algorítmicas em quase todo item.
        </p>
        <a href="https://mensa.no/nasjonal-testdag-2025/" className={link + " mt-3 inline-block"}>Nasjonal Testdag 2025 →</a>
      </details>
    </section>

    <section id="inferencia" className="mt-12 scroll-mt-6">
      <h2 className="text-2xl font-bold">O que isso permite inferir — e o que não permite — para a Mensa Brasil</h2>

      <div className="mt-5 space-y-3">
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-xs font-semibold uppercase text-emerald-800">Confirmado no Brasil</p>
          <h3 className="mt-2 font-semibold">Culture fair, presencial e percentil 98</h3>
          <p className="mt-2 text-sm leading-relaxed">
            A Mensa Brasil informa que o teste é culture fair, independente de língua e conhecimentos específicos; testes online não têm validade para admissão.
            O critério é estar no percentil 98 ou acima.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <a href="https://mensa.org.br/faq-testes" className={link}>FAQ oficial →</a>
            <a href="https://mensa.org.br/admissao" className={link}>Admissão →</a>
          </div>
        </article>

        <article className={card}>
          <p className="text-xs font-semibold uppercase text-amber-800">Diferença importante</p>
          <h3 className="mt-2 font-semibold">O Brasil diz usar diferentes testes sorteados no dia</h3>
          <p className="mt-2 text-sm leading-relaxed">
            A FAQ brasileira fala em diferentes testes de admissão com tempos distintos, de até 60 minutos. Portanto não é correto dizer
            “a prova brasileira é 45 matrizes em 20 minutos”. A referência norueguesa serve para calibrar <strong>estilo, progressão e velocidade</strong>, não para identificar o instrumento brasileiro.
          </p>
          <a href="https://mensa.org.br/faq-testes" className={link + " mt-3 inline-block"}>FAQ oficial →</a>
        </article>

        <article className="rounded-xl border border-brand-200 bg-brand-50 p-5">
          <p className="text-xs font-semibold uppercase text-brand-800">Inferência forte, não confirmação</p>
          <h3 className="mt-2 font-semibold">Matrizes devem ser o núcleo do treino</h3>
          <p className="mt-2 text-sm leading-relaxed">
            A Mensa Brasil escolheu justamente o teste online da Mensa Norway para seu “Desafio de QI”.
            Somando isso ao caráter culture fair do teste brasileiro, faz sentido usar matrizes visuais como o núcleo da preparação.
            Ainda assim, mantemos um modo de cobertura visual adicional porque a própria Mensa Brasil informa variabilidade de instrumentos.
          </p>
          <a href="https://mensa.org.br/desafio-de-qi-mensa" className={link + " mt-3 inline-block"}>Desafio de QI da Mensa Brasil →</a>
        </article>

        <article className={card}>
          <p className="text-xs font-semibold uppercase text-slate-600">Limite da comparação</p>
          <h3 className="mt-2 font-semibold">Países podem usar procedimentos e instrumentos diferentes</h3>
          <p className="mt-2 text-sm leading-relaxed">
            A própria Mensa Brasil explica que grupos nacionais possuem regras e procedimentos próprios e que a comparação relevante entre testes é pelo percentil,
            não pelo número bruto ou pelo “QI” mostrado em plataformas diferentes.
          </p>
          <a href="https://mensa.org.br/quem-somos" className={link + " mt-3 inline-block"}>Mensa Brasil · quem somos →</a>
        </article>
      </div>
    </section>

    <section id="familias" className="mt-12 scroll-mt-6">
      <h2 className="text-2xl font-bold">Famílias candidatas usadas no modo Brasil</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Os nomes abaixo vêm de pistas comunitárias sobre instrumentos historicamente associados à Mensa Brasil, mas o uso atual de cada um
        <strong> não foi confirmado pela Mensa Brasil</strong>. Por isso o treino usa apenas formatos autorais inspirados nas descrições públicas de cada família.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl border border-brand-200 bg-brand-50 p-5">
          <p className="text-xs font-semibold uppercase text-brand-800">16 itens no treino Brasil</p>
          <h3 className="mt-2 font-semibold">Raven / APM-like</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            Matrizes progressivas com dificuldade crescente, distribuição, transformação espacial e operações visuais. É a família com melhor convergência entre
            o benchmark Norway indicado pela Mensa Brasil e relatos comunitários brasileiros.
          </p>
        </article>

        <article className={card}>
          <p className="text-xs font-semibold uppercase text-slate-600">8 itens no treino Brasil</p>
          <h3 className="mt-2 font-semibold">G-36 / G-38 / R-1-like</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            A Vetor descreve o G-36 como 36 matrizes gráficas não verbais que exploram identidade simples, analogia, raciocínio numérico e espacial;
            o G-38 tem 38 itens de dificuldade crescente; e o R-1 possui 40 itens progressivos e é explicitamente descrito como baseado no modelo de Raven.
            Nossos itens são novos e apenas treinam essas categorias gerais.
          </p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <a href="https://www.vetoreditora.com.br/produto/colecao-g-36-teste-nao-verbal-de-inteligencia-70739" className={link}>G-36 →</a>
            <a href="https://www.vetoreditora.com.br/produto/colecao-g-38-teste-nao-verbal-de-inteligencia-70740" className={link}>G-38 →</a>
            <a href="https://www.vetoreditora.com.br/produto/colecao-r-1-teste-nao-verbal-de-inteligencia-70738" className={link}>R-1 →</a>
          </div>
        </article>

        <article className={card}>
          <p className="text-xs font-semibold uppercase text-slate-600">4 itens no treino Brasil</p>
          <h3 className="mt-2 font-semibold">TIG-NV-like</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            A descrição pública do TIG-NV informa 30 matrizes de figuras com seis alternativas e avaliação de diferentes raciocínios não verbais.
            Portanto ele entra como outra família de matrizes — <strong>não</strong> como teste de dominós.
          </p>
          <a href="https://sinopsyseditora.com.br/testes-psicologicos/tig-nv-teste-de-inteligencia-geral-nao-verbal-cad-de-aplicacao-pearson-casa-do-psicologo-292" className={link + " mt-3 inline-block"}>Descrição pública do TIG-NV →</a>
        </article>

        <article className={card}>
          <p className="text-xs font-semibold uppercase text-slate-600">4 itens no treino Brasil</p>
          <h3 className="mt-2 font-semibold">D-48 / D-70-like · dominós</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            O D-70 é publicamente descrito como prova de dominós para abstração e compreensão de relações, derivada do D-48, com dificuldade crescente.
            O nosso módulo usa dominós inteiramente autorais apenas para familiarização com esse tipo de relação.
          </p>
          <a href="https://www.hogrefe.com/pt/shop/teste-de-dominos-92742.html" className={link + " mt-3 inline-block"}>D-70 · descrição pública →</a>
        </article>

        <article className={card + " sm:col-span-2"}>
          <p className="text-xs font-semibold uppercase text-slate-600">4 itens no treino Brasil</p>
          <h3 className="mt-2 font-semibold">Exploratório · séries e classificação</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Dois itens de séries visuais e dois de classificação ficam como proteção contra a incerteza sobre o instrumento sorteado.
            Eles têm peso pequeno justamente porque não encontramos confirmação oficial recente de que esses formatos componham a admissão brasileira atual.
          </p>
        </article>
      </div>

      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
        <strong>Importante:</strong> os rótulos “-like” significam apenas família de raciocínio e formato geral. Não usamos, copiamos ou reconstruímos itens protegidos dos instrumentos psicológicos.
      </p>
    </section>

    <section id="calibracao" className="mt-12 scroll-mt-6">
      <h2 className="text-2xl font-bold">Como o nosso treino foi recalibrado</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <article className={card}>
          <span className="text-xs font-semibold text-brand-700">01 · PADRÃO</span>
          <h3 className="mt-2 font-semibold">35 matrizes / 25 minutos</h3>
          <p className="mt-2 text-sm text-slate-600">
            É o ponto de partida. Imita o regime público do Norway online: dificuldade crescente, uma matriz por item e sem questões “extremas” de quatro regras independentes.
          </p>
        </article>
        <article className={card}>
          <span className="text-xs font-semibold text-brand-700">02 · VELOCIDADE</span>
          <h3 className="mt-2 font-semibold">45 matrizes / 20 minutos</h3>
          <p className="mt-2 text-sm text-slate-600">
            Treina o ritmo oficial publicado pela Mensa Norge. Removemos do banco desse modo os itens de dois componentes mais pesados e todos os itens extremos.
          </p>
        </article>
        <article className={card}>
          <span className="text-xs font-semibold text-brand-700">03 · BRASIL</span>
          <h3 className="mt-2 font-semibold">36 itens / 45 minutos · famílias rotuladas</h3>
          <p className="mt-2 text-sm text-slate-600">
            16 Raven/APM-like, 8 G36/G38/R1-like, 4 TIG-NV-like, 4 dominós D48/D70-like e 4 exploratórios. O mix aumenta cobertura sem fingir que conhecemos o teste sorteado.
          </p>
        </article>
        <article className={card}>
          <span className="text-xs font-semibold text-rose-700">04 · OVERTRAINING</span>
          <h3 className="mt-2 font-semibold">Questões antigas de alta composição</h3>
          <p className="mt-2 text-sm text-slate-600">
            XOR + transformação, relações compostas e outros itens deliberadamente acima do alvo continuam disponíveis para desafio pessoal,
            mas deixaram de contaminar a referência principal de dificuldade.
          </p>
        </article>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
        <strong>Como tratamos as pistas comunitárias:</strong> APM/Raven, G36/G38, R1, D48/D70 e TIG-NV podem orientar familiarização porque existem descrições públicas consistentes desses instrumentos,
        mas a lista comunitária não confirma que qualquer um deles esteja sendo sorteado hoje pela Mensa Brasil. “Clocks” permanece fora do modo Brasil por falta de suporte público comparável.
      </div>
    </section>

    <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold">Ordem de uso recomendada</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-600">
        <li><strong>Estudo sem limite</strong> no modo Norway online até reconhecer rapidamente rotação, espelho, distribuição, OR/AND/XOR e mudanças de atributos.</li>
        <li><strong>35 / 25 min</strong> em outra semente. Revise somente os erros e explique a regra com suas palavras.</li>
        <li>Quando a precisão estiver estável, passe para <strong>45 / 20 min</strong> para treinar velocidade e triagem.</li>
        <li>Use <strong>Cobertura Mensa Brasil · famílias candidatas</strong> para alternar Raven/APM-like, G36/G38/R1-like, TIG-NV-like, dominós e uma pequena parcela exploratória.</li>
        <li>Use <strong>Overtraining</strong> apenas como desafio extra. Errar ali não é evidência de que você esteja abaixo do nível esperado para a Mensa.</li>
      </ol>
      <p className="mt-4 text-xs text-slate-500">
        O desempenho neste site não é normatizado. A admissão real depende do instrumento oficial aplicado e de suas normas populacionais.
      </p>
    </section>
  </main>;
}
