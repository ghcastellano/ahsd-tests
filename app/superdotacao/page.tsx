import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guia: superdotação, testes de QI e o laudo formal",
  description:
    "Como rastreios online se relacionam com testes de QI (WAIS, WISC, Raven), o que é preciso para um laudo de AH/SD no Brasil e caminhos para adultos.",
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 text-xl font-semibold text-slate-900">{children}</h2>;
}

export default function SuperdotacaoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
        Guia educativo
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        Superdotação, testes de QI e o caminho até o laudo
      </h1>
      <p className="mt-4 text-slate-600">
        Este guia explica, com honestidade, o que os rastreios desta plataforma podem e não podem
        dizer, como funcionam os testes formais de inteligência, o que é exigido para um laudo de
        Altas Habilidades/Superdotação (AH/SD) no Brasil e por onde começar — inclusive para
        adultos que estão se descobrindo agora.
      </p>

      <H2>O que é AH/SD (e por que não é só QI)</H2>
      <p className="mt-3 text-slate-600">
        A política educacional brasileira (MEC, 2008) define estudantes com AH/SD como aqueles que
        demonstram <strong>potencial elevado em uma ou mais áreas, isoladas ou combinadas</strong>{" "}
        — intelectual, acadêmica, liderança, psicomotricidade e artes — junto com criatividade
        elevada e grande envolvimento com áreas de interesse. Repare:{" "}
        <strong>a definição brasileira não exige nenhum número de QI</strong>. Modelos
        internacionais apontam na mesma direção: para Renzulli, o comportamento superdotado emerge
        da interação entre habilidade acima da média, criatividade e comprometimento com a tarefa;
        para Gagné, a superdotação são capacidades naturais no topo ~10% dos pares, que se
        transformam em talento com prática e apoio. O QI 130 (2 desvios-padrão acima da média,
        topo ~2%) é uma <strong>convenção útil</strong>, usada por exemplo pela Mensa, mas não é a
        definição de superdotação.
      </p>

      <H2>Os testes de QI formais: WAIS, WISC, Raven, Stanford-Binet</H2>
      <p className="mt-3 text-slate-600">
        Os grandes testes de inteligência nasceram em contextos universitários (Stanford-Binet em
        Stanford; as escalas Wechsler no hospital Bellevue) e hoje são publicados por editoras
        especializadas. Eles diferem dos questionários online em pontos fundamentais:
      </p>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
        <li>
          <strong>Medem desempenho, não autopercepção.</strong> No WAIS você resolve problemas de
          verdade — semelhanças verbais, cubos, matrizes, dígitos, velocidade de processamento —
          diante de um examinador. Um questionário registra o que você acredita sobre si; a
          correlação entre inteligência autoestimada e QI medido é de apenas ~0,33 (meta-análise
          de Freund &amp; Kasten, 2012) — autopercepção explica cerca de 10% da variação do QI real.
        </li>
        <li>
          <strong>São normatizados e padronizados.</strong> Sua pontuação é comparada a uma amostra
          representativa (média 100, desvio-padrão 15), com aplicação individual, materiais
          controlados e tempo cronometrado, por profissional treinado.
        </li>
        <li>
          <strong>Têm precisão altíssima.</strong> O QI total do WAIS-IV tem consistência interna
          de ~0,97–0,98 e estabilidade teste-reteste de ~0,96 — níveis inalcançáveis por escalas
          breves de autorrelato.
        </li>
      </ul>
      <p className="mt-3 text-slate-600">
        Principais instrumentos: <strong>WAIS</strong> (adultos), <strong>WISC</strong> (crianças e
        adolescentes), <strong>Matrizes Progressivas de Raven</strong> (raciocínio não-verbal) e{" "}
        <strong>Stanford-Binet</strong>. No Brasil, o uso profissional depende de aprovação no{" "}
        <strong>SATEPSI</strong> (sistema do Conselho Federal de Psicologia): hoje estão aprovados,
        entre outros, o <strong>WAIS-III</strong> para adultos, o <strong>WISC-IV</strong> para
        crianças, o WASI (forma abreviada), versões das Matrizes de Raven e o SON-R. Versões mais
        novas usadas no exterior (WISC-V, WAIS-5) ainda não têm adaptação brasileira aprovada. Por
        lei, <strong>somente psicólogos(as)</strong> podem aplicar e interpretar testes
        psicológicos (Lei 4.119/1962; Resolução CFP 31/2022).
      </p>

      <H2>O que é preciso para um laudo de AH/SD no Brasil</H2>
      <p className="mt-3 text-slate-600">
        O laudo psicológico é um documento formal, regulamentado pela Resolução CFP 06/2019,
        produzido ao final de uma <strong>avaliação psicológica multidimensional</strong> conduzida
        por psicólogo(a) — idealmente com experiência em AH/SD. Na prática, uma avaliação de
        superdotação costuma combinar:
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600">
        <li>teste cognitivo padronizado (ex.: WAIS-III em adultos);</li>
        <li>medidas de criatividade;</li>
        <li>indicadores de comprometimento com a tarefa e motivação;</li>
        <li>história de vida, percurso escolar e entrevistas;</li>
        <li>observação e, quando cabível, escalas respondidas por terceiros.</li>
      </ul>
      <p className="mt-3 text-slate-600">
        Ou seja: nenhum questionário isolado — nem este site, nem qualquer outro teste online —
        gera laudo. E como a identificação brasileira não depende de um corte fixo de QI, a
        avaliação pode reconhecer AH/SD pelo conjunto (criatividade, envolvimento, realização em
        um domínio) mesmo quando o QI medido fica abaixo de 130.
      </p>

      <H2>O que um rastreio online pode — e não pode — dizer</H2>
      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p>
          <strong>Pode:</strong> organizar indícios de forma estruturada, mostrar um perfil de
          forças, apontar se vale a pena investir numa avaliação formal e dar vocabulário para
          conversar com profissionais.
        </p>
        <p className="mt-2">
          <strong>Não pode:</strong> prometer um laudo. Pesquisadores brasileiros de instrumentos
          de triagem de AH/SD são explícitos: o resultado de uma triagem não substitui o processo
          de identificação conduzido por psicólogo. Um exemplo ilustrativo com números: se ~2% da
          população tem QI ≥ 130, mesmo um rastreio muito bom (90% de sensibilidade e 90% de
          especificidade) teria valor preditivo positivo de só ~15% para esse critério — a maioria
          dos positivos no rastreio não confirmaria QI ≥ 130 no teste formal. O rastreio{" "}
          <em>aumenta</em> a probabilidade e justifica investigar; não fecha diagnóstico. O
          inverso também vale: um rastreio fraco não descarta AH/SD — programas de triagem
          universal encontram muitas pessoas que os métodos informais deixaram passar.
        </p>
      </div>

      <H2>Descobrir-se na vida adulta: sentir que finalmente encaixa</H2>
      <p className="mt-3 text-slate-600">
        Muitos adultos chegam ao tema depois de décadas se sentindo &quot;fora de sintonia&quot; —
        intensos demais, curiosos demais, sensíveis demais. O Columbus Group descreve a
        superdotação como <strong>desenvolvimento assíncrono</strong>: capacidades cognitivas
        avançadas e intensidade elevada combinam-se em experiências internas qualitativamente
        diferentes da norma. Relatos clínicos e de comunidades de superdotados adultos descrevem a
        identificação tardia como alívio e pertencimento — uma chave que reorganiza a própria
        história — às vezes misturada com luto pelo tempo em que faltou compreensão. Se este
        conteúdo ressoou com você, esse sentimento é significativo por si só, independentemente de
        qualquer número: ele indica que vale a pena se aprofundar, com bons livros, comunidades e,
        se quiser certeza formal, uma avaliação profissional.
      </p>

      <H2>Caminhos práticos no Brasil</H2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-600">
        <li>
          <strong>Avaliação formal (adultos):</strong> procure psicólogo(a)/neuropsicólogo(a) com
          experiência em AH/SD para uma avaliação multidimensional com instrumentos aprovados no
          SATEPSI. Clínicas-escola de universidades costumam oferecer avaliação a custo reduzido.
        </li>
        <li>
          <strong>ConBraSD</strong> — Conselho Brasileiro para Superdotação: entidade nacional que
          reúne pesquisadores, famílias e pessoas com AH/SD (conbrasd.org).
        </li>
        <li>
          <strong>Mensa Brasil</strong> — admissão pelo teste supervisionado próprio (critério: topo
          2%) ou pela submissão de laudo prévio com testes aceitos (mensa.org.br). Testes online
          não são aceitos — mas você pode se familiarizar com o formato no nosso{" "}
          <Link href="/teste-qi" className="font-medium text-brand-600 hover:underline">
            treino de matrizes
          </Link>
          .
        </li>
        <li>
          <strong>Na escola (crianças/adolescentes):</strong> a rede pública deve identificar e
          atender AH/SD (LDB; Lei 13.234/2015); os núcleos NAAH/S e o Atendimento Educacional
          Especializado (AEE) oferecem enriquecimento e aceleração.
        </li>
      </ul>

      <H2>Referências principais</H2>
      <ul className="mt-3 space-y-1 text-xs text-slate-500">
        <li>MEC. Política Nacional de Educação Especial na Perspectiva da Educação Inclusiva, 2008.</li>
        <li>Renzulli JS. The Three-Ring Conception of Giftedness, 1978/2005.</li>
        <li>Gagné F. Differentiated Model of Giftedness and Talent (DMGT), 2004.</li>
        <li>Freund PA, Kasten N. How smart do you think you are? A meta-analysis on the validity of self-estimates of cognitive ability. Psychological Bulletin, 2012.</li>
        <li>Canivez GL. Review of the WAIS-IV. Buros Mental Measurements Yearbook, 2010 (confiabilidade do WAIS-IV).</li>
        <li>Conselho Federal de Psicologia. Resoluções CFP 31/2022 (avaliação psicológica e SATEPSI) e 06/2019 (documentos psicológicos).</li>
        <li>Nakano TC, Oliveira KS. Triagem de Indicadores de Altas Habilidades/Superdotação: limites de instrumentos de triagem. Avaliação Psicológica, 2019.</li>
        <li>Card D, Giuliano L. Universal screening increases the representation of low-income and minority students in gifted education. PNAS, 2016.</li>
        <li>Columbus Group (1991), apud Davidson Institute; Silverman LK (Gifted Development Center) — assincronia e superdotação adulta.</li>
        <li>Lei 4.119/1962; Lei 13.234/2015; LDB arts. 58–59; Decreto 12.686/2025.</li>
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/teste/ahsd-indicadores"
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700"
        >
          Fazer o rastreio de indicadores
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Todos os testes
        </Link>
      </div>
    </div>
  );
}
