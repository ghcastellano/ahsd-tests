import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Exames reais: Mensa, WAIS, SB5, custos e percentis" };
const fonte = "font-medium text-brand-700 underline underline-offset-2";
const card = "rounded-xl border border-slate-200 bg-white p-5";
const MENSA = "https://mensa.org.br/faq-testes";
const TNS = "https://www.triplenine.org/HowtoJoin/TestScores.aspx";

export default function GuiaExames() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-slate-700">
      <Link href="/treino" className={fonte}>← Treinos</Link>
      <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-brand-700">Exames reais · fontes consultadas em 23/09/2026</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Do treino à avaliação real</h1>
      <p className="mt-3 max-w-3xl">O simulador prepara para formatos de tarefa. Uma avaliação real usa aplicação padronizada, normas por idade e interpretação profissional. Acertar questões aqui não produz QI nem comprova um percentil.</p>
      <nav aria-label="Seções do guia" className="mt-5 flex flex-wrap gap-2 text-sm">
        {[["conceitos", "Mensa × WAIS"], ["pontuacao", "QI × percentil"], ["agendar", "Exames e custos"], ["tempos", "Tempos"], ["guias", "O que mudou com os guias"], ["dificuldade", "Mais difíceis e sorteio"]].map(([id, nome]) => <a key={id} href={`#${id}`} className="rounded-full border border-slate-300 bg-white px-3 py-2 hover:border-brand-500">{nome}</a>)}
      </nav>

      <Link href="/treino/mensa" className="mt-5 block rounded-xl border border-brand-300 bg-brand-50 p-4 font-semibold text-brand-800">Seu objetivo é a Mensa Brasil? Preparação específica, auditoria dos relatos de 2026 e fontes →</Link>

      <section id="conceitos" className="mt-8 scroll-mt-6">
        <h2 className="text-2xl font-semibold text-slate-900">Mensa não é Wechsler</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className={card}><h3 className="font-semibold text-slate-900">Sociedades: Mensa e Triple Nine</h3><p className="mt-2">Mensa admite resultados no percentil 98; Triple Nine, no 99,9. Cada sociedade define os instrumentos e documentos aceitos. Ser membro de uma não comprova automaticamente o requisito da outra. <a className={fonte} href={MENSA}>Mensa</a> · <a className={fonte} href={TNS}>Triple Nine</a>.</p></div>
          <div className={card}><h3 className="font-semibold text-slate-900">Instrumentos: WAIS e Stanford-Binet</h3><p className="mt-2">WAIS significa Escala Wechsler de Inteligência para Adultos. O PDF enviado é da terceira edição, com adaptação brasileira. Stanford-Binet 5 (SB5) é outra bateria, com cinco fatores em modalidades verbal e não verbal. Edições, população normativa e critérios de aplicação importam.</p></div>
        </div>
      </section>

      <section id="pontuacao" className="mt-9 scroll-mt-6">
        <h2 className="text-2xl font-semibold text-slate-900">QI é uma escala; percentil é uma posição</h2>
        <p className="mt-3">QI padronizado expressa o resultado em uma escala, geralmente com média 100. Percentil indica a posição relativa à população normativa: P98 corresponde aproximadamente aos 2% superiores. Não é porcentagem de acertos. “QI 99,9%” mistura duas medidas diferentes; não existe promessa válida de chegar ao percentil 100.</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <caption className="p-4 text-left font-medium text-slate-900">Equivalências matemáticas aproximadas sob distribuição normal — não tabelas de um teste</caption>
            <thead className="bg-slate-50"><tr>{["Percentil", "Fração superior", "QI: DP 15", "QI: DP 16", "QI: DP 24"].map((h) => <th key={h} className="whitespace-nowrap px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>{[["50", "50%", "100", "100", "100"], ["98", "2% (1 em 50)", "130,8", "132,9", "149,3"], ["99,9", "0,1% (1 em 1.000)", "146,4", "149,4", "174,2"]].map((row) => <tr key={row[0]} className="border-t border-slate-100">{row.map((c, i) => <td key={i} className="whitespace-nowrap px-4 py-3">{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p className="mt-3 text-sm">Cálculo: QI = 100 + DP × z. WAIS e SB5 usam DP 15; SB-IV usa 16. A escala tradicional do Cattell III B usa 24; isso não autoriza usar DP 24 em todo teste com “Cattell” no nome. Cortes publicados pelas sociedades são operacionais, específicos por instrumento, e podem diferir dessa aproximação contínua.</p>
        <p className="mt-2 text-sm">Por exemplo, com DP 15, QI 130 corresponde aproximadamente a P97,72; QI 145 a P99,865; QI 160 a P99,9968. Agrupar 145–160 como se todos fossem “1 em 1.000” perde uma diferença grande na cauda da distribuição.</p>
      </section>

      <section id="agendar" className="mt-9 scroll-mt-6">
        <h2 className="text-2xl font-semibold text-slate-900">O que você pode procurar e como agendar</h2>
        <p className="mt-3">Disponibilidade local exige cidade, idade, idioma e objetivo. As opções abaixo distinguem um serviço de admissão no Brasil de instrumentos comercializados internacionalmente. Preço de kit ou manual não é o preço de uma avaliação.</p>
        <div className="mt-4 space-y-3">
          <article className={card}>
            <h3 className="text-lg font-semibold text-slate-900">1. Mensa Brasil — ingresso na sociedade</h3>
            <p className="mt-2">Presencial, até 60 min, conforme instrumento. A FAQ informa R$ 149 no coletivo e R$ 224 no individual; confirme o valor da sessão antes de pagar. Ela também informa anuidade inicial de R$ 146, separada do teste. <a href={MENSA} className={fonte}>Fonte dos valores</a>.</p>
            <p className="mt-2">O agendamento anuncia elegibilidade de 17–63 anos e superior incompleto ou mais, resultado de aptidão e percentil, em até 15 dias. A FAQ ainda menciona 10–60 dias: confirme o prazo da sua sessão. Se estiver fora do público, consulte a via por laudo. <a href="https://mensa.org.br/testagem" className={fonte}>Escolher cidade e data</a>.</p>
          </article>
          <article className={card}>
            <h3 className="text-lg font-semibold text-slate-900">2. WAIS-III no Brasil — perfil cognitivo adulto</h3>
            <p className="mt-2">Procure psicólogo com experiência em avaliação cognitiva e peça orçamento que discrimine entrevistas, aplicação, correção, devolutiva e documento. Não foi localizada uma tarifa nacional única verificável. A Pearson informa 60–90 min de aplicação para a edição norte-americana; a avaliação brasileira e o processo completo podem exigir mais tempo e sessões. <a href="https://www.pearsonassessments.com/en-us/Store/Professional-Assessments/Cognition-%2526-Neuro/Wechsler-Adult-Intelligence-Scale-%257C-Third-Edition/p/100000243" className={fonte}>Pearson: WAIS-III</a>.</p>
            <p className="mt-2">A Mensa Brasil lista WAIS-III, WASI, WISC-IV, SON-R e CPM para análise de laudos, com restrições de idade e data. WASI é abreviada; WISC-IV é infantil; não são substitutos idênticos da WAIS. A taxa de análise do laudo, quando cobrada, é separada do honorário do psicólogo. <a href="https://mensa.org.br/admissao" className={fonte}>Lista brasileira</a> · <a href="https://mensa.org.br/laudo" className={fonte}>Submeter laudo</a>.</p>
          </article>
          <article className={card}>
            <h3 className="text-lg font-semibold text-slate-900">3. Stanford-Binet 5 — disponibilidade internacional</h3>
            <p className="mt-2">O SB5 está no catálogo da Riverside para idades de 2 a 85+ anos, com cerca de 5 min por subteste. São dez subtestes; a duração efetiva depende do percurso e do examinando. Solicite a um profissional habilitado orçamento, versão, idioma e normas. Não confirmei uma oferta local nem aprovação brasileira atual do SB5; o catálogo estrangeiro não comprova isso. <a href="https://store.riversideinsights.com/shop/stanford-binet-intelligence-scales" className={fonte}>Catálogo oficial</a>.</p>
          </article>
          <article className={card}>
            <h3 className="text-lg font-semibold text-slate-900">4. Cattell, Raven e outras baterias</h3>
            <p className="mt-2">CFIT, CFT 20-R, Cattell III B e as versões de Raven são instrumentos distintos. Confirme o nome completo e a edição com o aplicador; duração, custo, normas e aceitação variam. Não foi verificada uma tabela única de atendimento no Brasil. Para uso profissional brasileiro, confira o parecer vigente da versão no <a href="https://satepsi.cfp.org.br/testesFavoraveis.cfm" className={fonte}>SATEPSI/CFP</a>. A busca individual não foi concluída nesta revisão; nenhum instrumento estrangeiro está sendo apresentado aqui como automaticamente aprovado.</p>
          </article>
          <article className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-lg font-semibold text-amber-950">Se a meta é a Triple Nine, escolha a prova antes de pagar</h3>
            <p className="mt-2">A lista exige, entre outros: WAIS FSIQ 146, mas exclui WAIS-III feito após 15/02/2015; SB5 146 com idade mínima de 16 na aplicação; SB-IV 149; CFT 20-R 146; Cattell III B 173. Raven APM só consta para resultados anteriores a abril/2014. Mega e Titan aparecem apenas com correção anterior a janeiro/1995. Não são rotas atuais de admissão.</p>
            <p className="mt-2">A candidatura exige 18 anos. A sociedade pede declaração de acesso prévio aos testes aceitos; informe o contato com material de aplicação antes de escolher uma prova. Documento, data, edição e acesso prévio podem impedir o uso do resultado. <a href={TNS} className={fonte}>Conferir critérios completos da TNS</a>.</p>
          </article>
        </div>
        <p className="mt-4 rounded-lg bg-slate-100 p-4 text-sm"><strong>Roteiro para orçamento:</strong> informe cidade, idade e objetivo; confirme instrumento, edição, idioma, normas por idade, tempo de aplicação e número de sessões; peça valor total com devolutiva e documento; se a finalidade for admissão, confirme previamente se a sociedade aceita essa versão e data.</p>
      </section>

      <section id="tempos" className="mt-9 scroll-mt-6">
        <h2 className="text-2xl font-semibold text-slate-900">Os tempos estavam adequados?</h2>
        <p className="mt-3">Eram limites de jogo, insuficientes para afirmar fidelidade clínica. Agora o simulador permite estudo sem corte em verbal/matrizes e desafio cronometrado. Procura de símbolos oferece 120 s ou treino curto de 60 s. O Dojo mede o tempo por item sem eliminar a resposta.</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead className="bg-slate-50"><tr>{["Tarefa", "Referência consultada", "Como ficou aqui"].map((h) => <th key={h} className="p-4">{h}</th>)}</tr></thead>
            <tbody>
              {[
                ["Procurar Símbolos / Códigos", "Caderno WAIS-III: 120 s (p. 4 e 10 do PDF).", "Procura de símbolos: 120 s padrão; 60 s opcional. Não implementamos Códigos clínico."],
                ["Verbal", "Respostas abertas e rubricas, não um limite uniforme de 30 s.", "Estudo livre ou 4 min para 8 itens no desafio. Antes de olhar as opções, formule a resposta em voz alta."],
                ["Aritmética", "Caderno: limites por item, de 15 a 120 s (p. 6).", "Dojo sem corte; tempo registrado. Para treino mental, alguém pode ler o enunciado e você responder sem consultar a tela."],
                ["Matrizes", "O caderno parcial não basta para reconstruir todo o protocolo.", "4/5/6 min por conjunto no desafio são convenções do treino. Estudo sem limite disponível."],
                ["Memória", "Exposição, modalidade e regras de interrupção fazem parte da tarefa.", "Dígitos/posições: 1 s por elemento; frases: 4 s. São escolhas editoriais, com resposta livre após a exposição."],
                ["SB5", "O guia independente propõe 50 questões em 25 min para seu próprio simulado.", "Esse ritmo não foi adotado como norma do SB5. A escala real tem percurso individual."],
              ].map((row) => <tr key={row[0]} className="border-t border-slate-100">{row.map((c, i) => <td key={i} className="p-4 align-top">{c}</td>)}</tr>)}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm">Compare sessões do mesmo protocolo e dispositivo. Pontos por minuto são apenas uma taxa interna: 60 s e 120 s não se tornam psicometricamente equivalentes por divisão.</p>
      </section>

      <section id="guias" className="mt-9 scroll-mt-6">
        <h2 className="text-2xl font-semibold text-slate-900">Como os dois PDFs mudaram o treino</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <article className={card}><h3 className="font-semibold text-slate-900">Caderno WAIS-III</h3><p className="mt-2">É um protocolo parcial de aplicação/registro, não o conjunto completo de estímulos, manual e normas. Ajudou a corrigir duração, distinguir resposta produzida de alternativa reconhecida e reconhecer a falta de tarefas manipuláveis no simulador. Não autoriza calcular QI com nossos itens.</p></article>
          <article className={card}><h3 className="font-semibold text-slate-900">Guia preparatório de StanfordBinetTest.com</h3><p className="mt-2">O próprio guia se declara independente e sem endosso da editora. Aproveitamos a organização por fatores para acrescentar quantitativo, espacial e duas modalidades de memória. Isso muda bastante a cobertura do Dojo SB5; os três blocos do simulador continuam um treino compacto.</p></article>
        </div>
        <p className="mt-4">A revisão encontrou um erro numérico no guia (p. 18 do PDF): 1,5 DP não equivale a cerca de 7 pontos em índices de DP 15; equivale a 22,5. Sua classificação de 145–160 como aproximadamente P99,9 também é grosseira (p. 17). Um guia comprado não é, por si só, um gabarito validado.</p>
        <p className="mt-3 text-sm">Os PDFs privados não foram publicados, nem suas baterias copiadas em massa. Os novos exercícios são autorais, identificados como tal, com solução conferível. O conjunto de 12 itens públicos ICAR permanece separado e documentado: <Link href="/treino/simulador/fontes" className={fonte}>praticar questões publicadas e ver fontes</Link>.</p>
      </section>

      <section id="dificuldade" className="mt-9 scroll-mt-6">
        <h2 className="text-2xl font-semibold text-slate-900">Mais difícil, com variedade verificável</h2>
        <p className="mt-3">O terceiro bloco e o domínio “Desafio de matrizes” incluem operações lógicas combinadas com distribuição e matrizes de múltiplas regras. O domínio específico usa apenas os modelos rotulados como extremos neste banco. Esse rótulo é editorial: não significa que tenham dificuldade igual aos itens finais de um exame clínico.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>Novos problemas quantitativos, espaciais e lógicos variam dados e relações entre tentativas; alternativas também são embaralhadas.</li>
          <li>Mais 24 itens verbais autorais e duas famílias de memória ampliam a cobertura. Variações numéricas de um modelo não são contadas como provas independentes.</li>
          <li>O Dojo prioriza enunciados/estímulos não vistos nos últimos 300 itens deste navegador. Bancos finitos podem repetir quando as opções inéditas se esgotam.</li>
          <li>A mesma semente reproduz o banco da versão atual; novas tentativas usam novas sementes. O histórico registra versão, protocolo e semente. Mudar a versão pode mudar o banco.</li>
          <li>A correção é testada com cálculos independentes, enumeração de casos, integridade das alternativas e testes de repetição. Isso verifica o software, não substitui estudo de validade, normas ou calibração de dificuldade.</li>
        </ul>
        <p className="mt-4">Mega, Titan e outros desafios de alto alcance não receberam um selo de “mais válidos” nem foram copiados como se fossem exames atuais. Dificuldade extrema sem normas adequadas não sustenta um percentil extremo. Não há garantia de aprovação ou de transferência do treino.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/treino/dojo?exame=stanford-binet" className="rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white">Treinar SB5 ampliado</Link>
          <Link href="/treino/simulador" className="rounded-lg border border-brand-600 px-5 py-3 font-semibold text-brand-700">Escolher protocolo do simulador</Link>
        </div>
      </section>
    </main>
  );
}
