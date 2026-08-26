import type { Metadata } from "next";
import Link from "next/link";
import CellSvg from "@/components/CellSvg";
import type { Cell } from "@/lib/battery/types";

export const metadata: Metadata = {
  title: "Guia de regras — raciocínio figural",
  description:
    "A taxonomia de regras das matrizes figurais: constante na linha, progressão, adição/subtração, distribuição de três e de dois, além das operações lógicas XOR/AND/OR.",
};

function Row({ cells, label }: { cells: Cell[]; label: string }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {cells.map((c, i) => (
        <div
          key={i}
          className="flex h-16 w-16 items-center justify-center rounded border border-slate-300 bg-white"
        >
          <CellSvg cell={c} uid={`${label}-${i}`} size={56} />
        </div>
      ))}
    </div>
  );
}

function Rule({
  n,
  title,
  load,
  children,
}: {
  n: string;
  title: string;
  load: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">
          <span className="mr-2 text-brand-600">{n}</span>
          {title}
        </h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          carga: {load}
        </span>
      </div>
      <div className="mt-2 text-sm text-slate-600">{children}</div>
    </div>
  );
}

export default function RegrasPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/treino" className="text-sm text-brand-600 hover:underline">
        ← Bateria de treino
      </Link>
      <p className="mt-3 inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
        Leitura de ~14 minutos
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        Guia de regras do raciocínio figural
      </h1>
      <p className="mt-4 text-slate-600">
        Este é o passo mais rentável da preparação — e não é opinião: em experimento controlado
        (Schneider et al., <em>Intelligence</em>, 2020), assistir a menos de 14 minutos de
        instrução explícita sobre as regras das matrizes figurais produziu ganho de{" "}
        <strong>d ≥ 1,19</strong> em relação a um grupo controle, <strong>maior do que qualquer
        efeito obtido por simples repetição de itens</strong>. E, importante: a correlação com
        outras medidas de inteligência permaneceu — aprender as regras não &quot;quebra&quot; o teste,
        apenas remove o ruído de não conhecer o formato.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">
        As cinco regras, da mais leve à mais pesada
      </h2>
      <p className="mt-2 text-slate-600">
        Carpenter, Just &amp; Shell (1990) analisaram matrizes avançadas e encontraram cinco
        regras. A ordem abaixo é a ordem de dificuldade — e ela não é arbitrária: as duas
        últimas exigem manter as três células na memória <em>ao mesmo tempo</em> e raciocinar
        sobre o que está <em>faltando</em>.
      </p>

      <Rule n="1." title="Constante na linha" load="baixa">
        Um atributo permanece igual ao longo da linha (mas pode mudar entre linhas). É
        perceptual: você vê sem calcular.
        <Row
          label="cr"
          cells={[
            { marks: ["square"], innerFill: "solid" },
            { marks: ["square"], innerFill: "solid" },
            { marks: ["square"], innerFill: "solid" },
          ]}
        />
      </Rule>

      <Rule n="2." title="Progressão quantitativa" load="baixa">
        Um atributo cresce ou diminui de forma constante: tamanho, quantidade, ângulo de
        rotação, intensidade do preenchimento. Basta comparar duas células para generalizar
        para a terceira.
        <Row
          label="pp"
          cells={[
            { marks: ["circle"], count: 1 },
            { marks: ["circle"], count: 2 },
            { marks: ["circle"], count: 3 },
          ]}
        />
      </Rule>

      <Rule n="3." title="Adição / subtração de figuras" load="média">
        A terceira célula é a combinação (ou a diferença) das duas primeiras. Aqui começa o
        raciocínio sobre conjuntos de elementos.
        <Row
          label="as"
          cells={[
            { marks: ["hbar"] },
            { marks: ["vbar"] },
            { marks: ["hbar", "vbar"] },
          ]}
        />
      </Rule>

      <Rule n="4." title="Distribuição de três" load="alta">
        Três valores de um atributo aparecem exatamente uma vez em cada linha, em ordens
        diferentes. Você precisa olhar as três células juntas e perguntar:{" "}
        <em>qual valor ainda não apareceu nesta linha?</em>
        <Row
          label="d3"
          cells={[
            { marks: ["circle"] },
            { marks: ["square"] },
            { marks: ["triangle"] },
          ]}
        />
        <p className="mt-2">
          Na linha seguinte as mesmas três formas reaparecem em outra ordem — e é isso que
          engana quem procura repetição posicional.
        </p>
      </Rule>

      <Rule n="5." title="Distribuição de dois (a mais difícil)" load="máxima">
        Só existem dois valores; eles ocupam duas das três células e a terceira fica{" "}
        <strong>vazia</strong>. O salto de dificuldade é conceitual:{" "}
        <strong>a ausência é um valor da regra</strong>, e ausência não se enxerga — se deduz.
        <Row label="d2" cells={[{ marks: ["star"] }, { marks: [] }, { marks: ["dot"] }]} />
      </Rule>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">
        As três operações lógicas
      </h2>
      <p className="mt-2 text-slate-600">
        Verguts &amp; De Boeck (2002) decompuseram a &quot;adição&quot; em três operações distintas
        sobre o conjunto de elementos das duas primeiras células. Reconhecê-las de imediato
        vale muitos pontos:
      </p>
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Operação</th>
              <th className="px-3 py-2">O que sobra na 3ª célula</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="px-3 py-2 font-medium text-slate-700">União (OR)</td>
              <td className="px-3 py-2 text-slate-600">Todos os elementos das duas células, somados.</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-3 py-2 font-medium text-slate-700">Interseção (AND)</td>
              <td className="px-3 py-2 text-slate-600">Só os elementos que aparecem nas <em>duas</em> células.</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="px-3 py-2 font-medium text-slate-700">Exclusiva (XOR)</td>
              <td className="px-3 py-2 text-slate-600">
                Só os que aparecem em <em>apenas uma</em> delas — os repetidos <strong>se cancelam</strong>.
                É a que mais engana.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">
        A alavanca escondida: decomposição em componentes
      </h2>
      <p className="mt-2 text-slate-600">
        Este é o truque que separa item fácil de item difícil, e quase ninguém comenta. Um
        mesmo item pode ter <strong>duas regras rodando ao mesmo tempo em partes diferentes da
        figura</strong> — por exemplo, XOR governando as linhas internas enquanto uma
        distribuição de três governa a forma externa.
      </p>
      <p className="mt-2 text-slate-600">
        Nos itens fáceis, um <em>espaço visual</em> separa as duas partes e praticamente entrega a
        decomposição. Nos difíceis, a mesma estrutura existe <strong>sem nenhuma separação</strong>:
        descobrir o eixo (dentro/fora, cima/baixo, esquerda/direita) faz parte do problema.
        Quando um item parecer &quot;sem regra&quot;, quase sempre é isto: você está tentando aplicar
        uma regra só a uma figura que tem duas.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">Método sob pressão de tempo</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-600">
        <li>
          <strong>Ordem fixa de varredura:</strong> linhas primeiro, depois colunas, depois
          diagonais. Ordem fixa bate inspeção ad hoc — evita reprocessar o que já viu.
        </li>
        <li>
          <strong>Nomeie o atributo antes de olhar as alternativas.</strong> Quem olha as opções
          primeiro é capturado pelos distratores.
        </li>
        <li>
          <strong>Confira TODAS as regras antes de marcar.</strong> Os distratores são
          construídos para satisfazer parte delas — acertar a forma e errar o preenchimento é o
          erro mais comum.
        </li>
        <li>
          <strong>Triagem: pule e volte.</strong> Em subtestes de velocidade (~15 s/item), gastar
          60 s num item custa outros três. Marque e siga.
        </li>
        <li>
          <strong>Nas séries numéricas:</strong> calcule as diferenças entre termos vizinhos; se
          não revelarem padrão, teste se há <em>duas séries intercaladas</em> (posições ímpares e
          pares separadas).
        </li>
      </ol>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">Quanto a prática realmente rende</h2>
      <p className="mt-2 text-slate-600">
        Sendo honesto com os números: a meta-análise de Scharfen, Peters &amp; Holling (2018,
        N &gt; 150 mil) encontrou ganho de <strong>+0,33 DP no primeiro reteste</strong> em provas
        de raciocínio, chegando a ~0,55 DP na terceira aplicação — e{" "}
        <strong>estabilizando depois disso</strong>. Hausknecht et al. (2007) mostraram que
        pessoas de alta habilidade são justamente as que mais ganham com prática (d ≈ 0,80).
      </p>
      <p className="mt-2 text-slate-600">
        Duas consequências práticas: (1) as primeiras 2–3 sessões concentram quase todo o ganho —
        treinar dez vezes não rende dez vezes mais; (2) sessões curtas e frequentes batem
        maratonas: um estudo de 2020 não encontrou aprendizado de regras <em>dentro</em> de uma
        mesma aplicação longa, mas encontrou fadiga mensurável.
      </p>
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>A ressalva honesta:</strong> preparar-se eleva o <em>escore medido</em> sem
        necessariamente elevar a capacidade subjacente — é exatamente por isso que as sociedades
        de alto QI dizem que preparação não é necessária. Treinar o formato é legítimo (não há
        regra proibindo, e há até material oficial de prática); usar itens reais vazados não é.
      </div>

      <h2 className="mt-10 text-xl font-semibold text-slate-900">Plano sugerido</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600">
        <li><strong>Dia 1:</strong> ler este guia e fazer <Link href="/treino/series-numericas" className="text-brand-600 hover:underline">Séries Numéricas</Link> sem pressa.</li>
        <li><strong>Dias 2–4:</strong> <Link href="/treino/series-figuras" className="text-brand-600 hover:underline">Séries de Figuras</Link> e <Link href="/treino/classificacao" className="text-brand-600 hover:underline">Classificação</Link> — treino de velocidade e triagem.</li>
        <li><strong>Dia 5:</strong> <Link href="/treino/matrizes-avancadas" className="text-brand-600 hover:underline">Matrizes Avançadas</Link> completo, cronometrado, sem interrupção.</li>
        <li><strong>Depois:</strong> revisar só os erros e repetir o bloco difícil. 2–4 semanas é a janela típica.</li>
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/treino" className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700">
          Ir para a bateria
        </Link>
        <Link href="/superdotacao" className="rounded-lg border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-100">
          Guia sobre superdotação
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Referências</h2>
        <ul className="space-y-1 text-xs text-slate-500">
          <li>Carpenter PA, Just MA, Shell P. What one intelligence test measures. Psychological Review. 1990;97(3):404-431.</li>
          <li>Verguts T, De Boeck P. The induction of solution rules in Raven&apos;s Progressive Matrices Test. European Journal of Cognitive Psychology. 2002;14(4):521-547.</li>
          <li>Schneider B, et al. Teaching the underlying rules of figural matrices in a short video increases test scores. Intelligence. 2020;82:101473.</li>
          <li>Scharfen J, Peters JM, Holling H. Retest effects in cognitive ability tests: A meta-analysis. Intelligence. 2018;67:44-66.</li>
          <li>Hausknecht JP, et al. Retesting in selection: a meta-analysis. Journal of Applied Psychology. 2007;92(2):373-385.</li>
        </ul>
      </div>
    </div>
  );
}
