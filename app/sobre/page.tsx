import Link from "next/link";
import { instruments } from "@/lib/instruments";

export const metadata = { title: "Sobre a plataforma" };

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 prose-slate">
      <h1 className="text-2xl font-bold text-slate-900">Sobre esta plataforma</h1>
      <p className="mt-4 text-slate-600">
        Este é um sistema de <strong>rastreio (triagem)</strong> de Altas Habilidades/Superdotação
        (AH/SD) e de condições que frequentemente coocorrem — o que a literatura chama de{" "}
        <em>dupla excepcionalidade</em>. A correção e a interpretação são feitas automaticamente no
        seu navegador. Ao concluir um teste, um registro do <strong>resultado agregado</strong>{" "}
        (data/hora, pontuações, faixas e a identificação opcional) é salvo no dispositivo — e no
        registro central da plataforma, quando ativado — para o painel de acompanhamento. As
        respostas individuais de cada questão não são armazenadas.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Como funciona a pontuação</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
        <li>
          Cada instrumento tem sua própria regra de pontuação, fiel ao método publicado (somatório,
          itens reversos, marcas de rastreio ou algoritmo de critérios).
        </li>
        <li>
          As faixas de interpretação e pontos de corte seguem as fontes originais citadas em cada
          teste.
        </li>
        <li>
          Os módulos de AH/SD são <strong>baseados em perfil de forças</strong>: não há nota de
          aprovação. A superdotação pode se manifestar em uma ou mais áreas, isoladas ou combinadas.
        </li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Instrumentos disponíveis</h2>
      <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-3 py-2">Sigla</th>
              <th className="px-3 py-2">Instrumento</th>
              <th className="px-3 py-2">Itens</th>
            </tr>
          </thead>
          <tbody>
            {instruments.map((i) => (
              <tr key={i.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-semibold text-slate-600">{i.acronym}</td>
                <td className="px-3 py-2">
                  <Link href={`/teste/${i.id}`} className="text-brand-700 hover:underline">
                    {i.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-slate-500">{i.questions.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Origem dos instrumentos</h2>
      <p className="mt-2 text-slate-600">
        Os rastreios clínicos (PHQ-9, GAD-7, ASRS, AQ, RAADS-R, MDQ, HCL-32, PCL-5, ACE, DERS) são
        instrumentos validados, de uso livre para fins clínicos e de pesquisa, apresentados aqui em
        versão em português com as devidas referências. Os módulos de Altas
        Habilidades/Superdotação — indicadores e sobre-excitabilidades — são instrumentos{" "}
        <strong>autorais</strong> desta plataforma: os itens são originais e não passaram por
        estudo de validação psicométrica.
      </p>
      <p className="mt-3 text-slate-600">
        O que fizemos foi alinhar o <strong>desenho</strong> às convenções dos instrumentos
        validados. Três decisões concretas: (1) as perguntas usam{" "}
        <strong>frequência de comportamentos concretos</strong> (últimos 12 meses) ou{" "}
        <strong>comparação normativa</strong> com a maioria das pessoas — nunca concordância com
        adjetivos, porque nenhuma escala validada de superdotação (TIAH/S, GRS, HOPE, SRBCSS)
        pergunta por concordância; (2) o resultado é reportado <strong>por domínio</strong>, sem
        escore único, porque um índice geral achata perfis com picos em poucas áreas — exatamente
        o padrão da dupla excepcionalidade; (3) a cobertura segue as cinco áreas da Política
        Nacional (MEC, 2008) mais criatividade, envolvimento com a tarefa e a intensidade
        emocional que a <strong>Lei nº 15.436/2026</strong> passou a nomear na definição legal de
        AH/SD.
      </p>
      <p className="mt-3 text-slate-600">
        E os limites, ditos com todas as letras: autorrelato de capacidade correlaciona{" "}
        <strong>~0,30</strong> com medidas objetivas (cerca de 9% de variância compartilhada), e{" "}
        <strong>não existe instrumento brasileiro de AH/SD validado para adultos</strong> — os
        validados (TIAH/S, EICAS-AH/SD, BAAH/S) cobrem 9 a 15 anos. Nosso instrumento não
        substitui nenhum deles nem a avaliação profissional; ele serve para indicar se vale a pena
        buscá-la.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Limitações importantes</h2>
      <p className="mt-2 text-slate-600">
        Nenhum questionário isolado diagnostica AH/SD ou qualquer condição. Instrumentos de
        autorrelato estão sujeitos a vieses. Use os resultados como ponto de partida para uma
        conversa com profissionais qualificados. Em situações de crise, procure ajuda imediata —
        CVV 188 (24h).
      </p>

      <p className="mt-8">
        <Link href="/" className="text-brand-600 hover:underline">
          ← Voltar aos testes
        </Link>
      </p>
    </div>
  );
}
