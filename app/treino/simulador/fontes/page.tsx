import type { Metadata } from "next";
import Link from "next/link";
import TreinoPublicado from "@/components/TreinoPublicado";

export const metadata: Metadata = {
  title: "Plano de prática e questões públicas — Simulador",
  description: "Plano de oito semanas, questões públicas do ICAR e fontes verificáveis. Treino sem estimativa de QI.",
};

const semanas = [
  ["01–02", "Separar os atributos", "Matrizes: descreva forma externa, elemento interno e quantidade separadamente. Confira a regra nas duas linhas completas antes de escolher. Faça 6–10 itens por sessão, inicialmente sem tempo. Na velocidade, priorize decisões corretas e aprenda as teclas S/N."],
  ["03–04", "Distinguir as operações", "Compare união (OR), interseção (AND) e diferença simétrica (XOR). No XOR, o que se repete desaparece. Misture tipos de regra. Memória: registre separadamente ordem direta, inversa e letras/números; os erros de um formato não diagnosticam os demais."],
  ["05–06", "Ganhar ritmo com precisão", "Introduza o tempo depois de duas sessões estáveis. Compare acertos, erros e itens por minuto sob a mesma configuração. Reduza o ritmo se a precisão cair. No verbal, explicite a relação: regra → unidade, evidência → hipótese, categoria → membros."],
  ["07–08", "Verificar retenção e transferência", "Reavalie com itens ainda não vistos, sem consultar o gabarito. Uma nova semente pode só mudar as figuras de uma regra conhecida. Use outra família de tarefas para verificar transferência. Faça um único simulado completo na semana 8 e uma revisão sete dias depois."],
];

export default function FontesPage() {
  return <main className="mx-auto max-w-3xl px-4 py-10">
    <Link href="/treino/simulador" className="text-sm text-teal-800 hover:underline">← Voltar ao simulador</Link>
    <header className="mt-8 border-l-4 border-teal-700 pl-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal-800">Caderno de prática · 8 semanas</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900">Entender a regra.<br />Conferir cada resposta.</h1>
      <p className="mt-4 leading-7 text-slate-600">Um percurso para trabalhar decomposição de figuras, raciocínio lógico, memória e precisão sob tempo. As metas são de aprendizagem neste formato; não representam percentis populacionais.</p>
    </header>
    <section className="mt-8 rounded-xl bg-teal-950 p-6 text-white" aria-labelledby="rotina">
      <h2 id="rotina" className="text-lg font-semibold">Rotina proposta: 40 minutos, 5 dias por semana</h2>
      <p className="mt-3 leading-7 text-teal-50">15 min de matrizes · 8 min de memória · 7 min de procura de símbolos · 5 min de verbal · 5 min de registro e revisão dos erros.</p>
      <p className="mt-3 text-sm leading-6 text-teal-100">Essa distribuição é uma proposta prática, não uma dosagem validada. Reveja conceitos após 1, 3, 7 e 14 dias. Se o tempo for curto, faça 20 minutos alternando os domínios, sem acumular sessões atrasadas.</p>
    </section>
    <section aria-labelledby="percurso" className="mt-10">
      <h2 id="percurso" className="text-2xl font-bold text-slate-900">O percurso</h2>
      <ol className="mt-5 divide-y divide-slate-200">
        {semanas.map(([n, titulo, texto]) => <li key={n} className="grid gap-3 py-6 sm:grid-cols-[100px_1fr]">
          <p className="text-sm font-semibold text-teal-800">Semanas {n}</p>
          <div><h3 className="text-lg font-semibold text-slate-900">{titulo}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{texto}</p></div>
        </li>)}
      </ol>
      <p className="mt-3 text-sm leading-7 text-slate-600"><strong>Critério de avanço proposto:</strong> ≥90% de acerto em dois conjuntos de pelo menos 10 itens não vistos, com explicação da regra. Em memória, ≥80% em dois conjuntos na mesma extensão antes de aumentá-la. São critérios operacionais de treino, sem valor diagnóstico. Se não houver itens novos suficientes, registre apenas revisão, não transferência.</p>
      <p className="mt-3 text-sm leading-7 text-slate-600"><strong>Diário:</strong> data, fonte/ID, primeira exposição ou repetição, tempo, resposta, gabarito e motivo do erro. Separe regra não identificada, atributo ignorado, troca de ordem, vocabulário desconhecido, pressa e possível ambiguidade do item.</p>
    </section>
    <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
      <h2 className="text-lg font-semibold">Como interpretar o simulador</h2>
      <p className="mt-2">Os itens dos três blocos principais são autorais ou gerados por regras. Os nomes das escalas são referências de formato: não tornam esses itens oficiais nem validam seus cortes. “0 de 3 blocos” descreve uma regra interna de precisão e velocidade. Não mede ausência de altas habilidades.</p>
      <p className="mt-2">A procura de símbolos recebeu uma correção de equivalência visual: figuras idênticas sob rotação devem receber o mesmo gabarito. Resultados anteriores podem ter sido afetados. Faça uma nova linha de base na versão corrigida; não compare diretamente seus pontos com os antigos.</p>
      <p className="mt-2">Aprender o formato pode melhorar seu desempenho. Isso não garante aumento de inteligência geral, eliminação permanente de dificuldades ou percentil 99,9. “100% de acertos” é diferente de “percentil 100”.</p>
    </section>
    <TreinoPublicado />
    <section className="mt-10 border-t border-slate-200 pt-8 text-sm leading-7 text-slate-600" aria-labelledby="tns">
      <h2 id="tns" className="text-2xl font-bold text-slate-900">Triple Nine Society</h2>
      <p className="mt-3">A TNS exige laudo ou relatório oficial em um dos testes aceitos. O simulador e os itens ICAR desta página não são testes de admissão. A tabela consultada lista 146 para WAIS FSIQ e SB-5 (este com idade mínima de 16 anos no teste), 146 para CFT 20-R e 173 para Cattell IIIB; versões e datas também importam.</p>
      <p className="mt-3">A revista Vidya publica puzzles, mas o arquivo consultado redirecionou para login. Nenhuma questão foi atribuída à TNS sem acesso ao enunciado, à solução e às condições de reprodução. Acesso prévio a testes de admissão deve ser declarado conforme as regras da sociedade.</p>
      <p className="mt-3"><a href="https://www.triplenine.org/HowtoJoin/TestScores.aspx" className="underline text-teal-800">Critérios oficiais de admissão</a> · <a href="https://www.triplenine.org/Vidya.aspx" className="underline text-teal-800">Vidya</a></p>
    </section>
    <section className="mt-10 text-sm leading-7 text-slate-600" aria-labelledby="evidencia">
      <h2 id="evidencia" className="text-xl font-bold text-slate-900">Evidência usada no plano</h2>
      <ul className="mt-4 list-disc space-y-3 pl-5">
        <li><a className="underline text-teal-800" href="https://doi.org/10.1177/1529100612453266">Dunlosky et al. (2013)</a>: recuperação ativa e prática distribuída apoiam a retenção. O cronograma exato acima é uma escolha prática.</li>
        <li><a className="underline text-teal-800" href="https://doi.org/10.1016/j.intell.2020.101473">Schneider et al. (2020)</a>: instrução sobre regras elevou escores de matrizes em dois experimentos com estudantes. Não estabelece ganho individual de QI.</li>
        <li><a className="underline text-teal-800" href="https://discovery.ucl.ac.uk/id/eprint/10120081/">Melby-Lervåg, Redick &amp; Hulme (2016)</a>: os ganhos de treino de memória não demonstram transferência geral convincente para inteligência e outras habilidades distantes.</li>
      </ul>
      <p className="mt-4 text-xs">Fontes consultadas em 12/09/2026. Não há normatização deste módulo nem validação de sua tradução para inferir QI.</p>
    </section>
  </main>;
}
