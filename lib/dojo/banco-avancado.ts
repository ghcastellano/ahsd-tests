import { mulberry32 } from "../battery/rng";
import type { ItemTexto } from "./tipos";

/** Exercícios autorais, não itens dos manuais. Dados permitem auditoria independente. */
export interface ItemAvancado extends ItemTexto {
  familia: string;
  dados: number[];
}

export const FAMILIAS_AVANCADAS = [
  "taxas", "mistura", "combinacoes", "media", "restos", "desconto", "sistema", "probabilidade",
  "rotacao", "cubo-faces", "cubo-arestas", "percurso",
  "condicional", "exclusiva", "negacao", "ordem",
] as const;

const mdc = (a: number, b: number): number => b ? mdc(b, a % b) : a;
function fracao(a: number, b: number): string { const d = mdc(a, b); return `${a / d}/${b / d}`; }

export function gerarBancoAvancado(seed: number, area: "quantitativo" | "espacial" | "logica", porFamilia = 12): ItemAvancado[] {
  const rnd = mulberry32(seed * 65537 + 431);
  const inteiro = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
  const familias = area === "quantitativo" ? FAMILIAS_AVANCADAS.slice(0, 8) : area === "espacial" ? FAMILIAS_AVANCADAS.slice(8, 12) : FAMILIAS_AVANCADAS.slice(12);
  const itens: ItemAvancado[] = [];
  const vistos = new Set<string>();
  const adicionar = (familia: string, dados: number[], enunciado: string, correta: string | number, erradas: (string | number)[], explicacao: string) => {
    if (vistos.has(enunciado)) return;
    vistos.add(enunciado);
    const opcoes = [...new Set([String(correta), ...erradas.map(String)])];
    if (opcoes.length < 4) throw new Error(`Distratores insuficientes: ${familia}`);
    itens.push({ id: `av-${familia}-${dados.join("_")}`, familia, dados, enunciado, opcoes: opcoes.slice(0, 4), resposta: 0, explicacao });
  };
  for (const f of familias) {
    for (let tentativa = 0, feitas = 0; feitas < porFamilia && tentativa < porFamilia * 50; tentativa++) {
      const antes = itens.length;
      const a = inteiro(3, 19), b = inteiro(4, 23);
      switch (f) {
        case "taxas":
          adicionar(f, [a], `Duas máquinas, a ritmo constante, completam separadamente um lote em ${10 * a} e ${15 * a} minutos. Trabalhando juntas desde o início, em quantos minutos completam um lote?`, 6 * a, [5 * a, 12 * a, 25 * a], `Somam-se as taxas: 1/${10 * a} + 1/${15 * a} = 1/${6 * a} lote/min. Logo, ${6 * a} minutos.`); break;
        case "mistura": {
          const p = inteiro(2, 4) * 10, total = 4 * a, x = (50 - p) * a / 10;
          adicionar(f, [a, p], `Misturam-se soluções de 10% e 50% de sal para obter ${total} litros a ${p}%. Suponha volumes aditivos. Quantos litros da solução de 10% entram?`, x, [x + a, x - a, x + 2 * a], `Conservação do sal: 0,10x + 0,50(${total} − x) = ${p / 100} × ${total}. Assim x = ${x} litros.`); break;
        }
        case "combinacoes":
          adicionar(f, [a, b], `Há ${a} fichas vermelhas e ${b} azuis, todas numeradas e distintas. Quantos conjuntos de três fichas contêm exatamente duas vermelhas e uma azul? A ordem não conta.`, a * (a - 1) * b / 2, [a * a * b, a * (a - 1) * b, a * b, a + b], `Escolha duas vermelhas sem ordem: ${a} × ${a - 1}/2. Multiplique pelas ${b} escolhas da azul: ${a * (a - 1) * b / 2}.`); break;
        case "media":
          adicionar(f, [a, b], `A média de ${a} valores é ${b}. Acrescentam-se dois valores iguais a ${b + a + 2}. Qual é a nova média?`, b + 2, [b + 1, b + a + 2, b + 4], `A soma passa de ${a * b} a ${a * b + 2 * (b + a + 2)}; dividida por ${a + 2}, resulta em ${b + 2}.`); break;
        case "restos": {
          const x = inteiro(1, 76);
          adicionar(f, [x % 7, x % 11], `Qual inteiro entre 0 e 76 deixa resto ${x % 7} na divisão por 7 e resto ${x % 11} na divisão por 11?`, x, [(x + 7) % 77, (x + 11) % 77, (x + 22) % 77], `Liste os números congruentes a ${x % 7} módulo 7 e confira o resto por 11. Só ${x} satisfaz ambas as condições no intervalo; 7 e 11 são coprimos.`); break;
        }
        case "desconto": {
          const base = 100 * a, p = inteiro(1, 4) * 10, final = base * (100 + p) * (100 - p) / 10000;
          adicionar(f, [a, p], `Um produto de R$ ${base} sofre aumento de ${p}% e depois desconto de ${p}% sobre o preço aumentado. Qual é o preço final, em reais?`, final, [base, base * (100 - p) / 100, base * (100 + p) / 100], `Os fatores se multiplicam: ${base} × ${1 + p / 100} × ${1 - p / 100} = ${final}. Percentuais sucessivos incidem sobre bases diferentes.`); break;
        }
        case "sistema":
          adicionar(f, [a, b], `Duas caixas têm juntas ${a + b} peças. O dobro da quantidade da primeira mais o triplo da segunda é ${2 * a + 3 * b}. Quantas peças há na primeira?`, a, [a + 1, a + 2, a + b], `Subtraia duas vezes o total da soma ponderada: a segunda tem ${b}. Restam ${a} na primeira.`); break;
        case "probabilidade":
          adicionar(f, [a, b], `Uma urna contém ${a} bolas brancas e ${b} pretas. Duas bolas são retiradas ao acaso, sem reposição. Qual a probabilidade de ambas serem brancas?`, fracao(a * (a - 1), (a + b) * (a + b - 1)), [fracao(a * a, (a + b) ** 2), "0", "1"], `Sem reposição: ${a}/${a + b} × ${a - 1}/${a + b - 1} = ${fracao(a * (a - 1), (a + b) * (a + b - 1))}.`); break;
        case "rotacao":
          adicionar(f, [a, b], `No plano cartesiano, gire o ponto (${a}, ${b}) 90° no sentido anti-horário em torno da origem. Depois reflita o resultado no eixo horizontal (x). Qual é o ponto final?`, `(${-b}, ${-a})`, [`(${b}, ${a})`, `(${-b}, ${a})`, `(${b}, ${-a})`], `A rotação faz (x,y) → (−y,x). A reflexão no eixo x faz (u,v) → (u,−v). Resultado: (${-b}, ${-a}).`); break;
        case "cubo-faces":
          adicionar(f, [a], `Um cubo tem todas as faces externas pintadas. Ele é dividido em ${a} partes iguais por aresta, formando cubinhos. Quantos cubinhos têm exatamente UMA face pintada?`, 6 * (a - 2) ** 2, [12 * (a - 2), a ** 3, 6 * (a - 1) ** 2, 8], `Conte apenas os centros de cada face, sem arestas: (${a} − 2)² por face × 6 = ${6 * (a - 2) ** 2}.`); break;
        case "cubo-arestas":
          adicionar(f, [a], `Um cubo totalmente pintado por fora é cortado em ${a} partes iguais por aresta. Quantos cubinhos têm exatamente DUAS faces pintadas?`, 12 * (a - 2), [8, 6 * (a - 2) ** 2, a ** 3, 12 * a], `São as 12 arestas, excluindo os dois cantos em cada uma: 12 × (${a} − 2) = ${12 * (a - 2)}.`); break;
        case "percurso":
          adicionar(f, [a, b], `Você parte da origem voltado ao norte, anda ${a} m, gira 90° à direita e anda ${b} m, gira 90° à direita e anda ${a + 2} m. Qual é seu deslocamento final?`, `${b} m a leste e 2 m ao sul`, [`${b} m a oeste e 2 m ao sul`, `${b} m a leste e 2 m ao norte`, `${b} m a leste e ${2 * a + 2} m ao norte`], `Os deslocamentos norte/sul se cancelam parcialmente: ${a} − ${a + 2} = −2. A componente leste é ${b}.`); break;
        case "condicional":
          adicionar(f, [a, b], `Regra: se o sensor ${a} está ativo, a lâmpada ${b} está acesa. A lâmpada ${b} está apagada. O que decorre necessariamente, supondo a regra verdadeira?`, `O sensor ${a} não está ativo`, [`O sensor ${a} está ativo`, "A regra nada permite concluir", "Todos os sensores estão inativos"], `Modus tollens: P implica Q; não Q, portanto não P. Nada foi afirmado sobre outros sensores.`); break;
        case "exclusiva":
          adicionar(f, [a, b], `Exatamente uma destas proposições é verdadeira: “a caixa A contém ${a} peças” e “a caixa B contém ${b} peças”. Sabendo que A contém ${a} peças, o que é necessário?`, `B não contém ${b} peças`, [`B contém ${b} peças`, "B está vazia", `B contém ${a + b} peças`], `No OU exclusivo, quando uma proposição é verdadeira, a outra é falsa. Isso não informa a quantidade exata de B.`); break;
        case "negacao":
          adicionar(f, [a, b], `Qual é a negação lógica de “todos os ${a + b} cartões têm número maior que ${a}”?`, `Pelo menos um cartão tem número menor ou igual a ${a}`, [`Todos têm número menor que ${a}`, `Pelo menos um tem número maior que ${a}`, `Nenhum tem número igual a ${a}`], `Negar “para todo x, P(x)” dá “existe x tal que não P(x)”. Negar maior que ${a} inclui a igualdade.`); break;
        case "ordem":
          adicionar(f, [a, b], `Cinco cartões A, B, C, D e E têm números distintos. B é maior que A, D é maior que C, C é maior que B e E é maior que D. Se A vale ${a} e E vale ${a + b + 4}, qual cartão ocupa a posição mediana?`, "C", ["B", "D", "Não é possível determinar"], `As relações impõem A < B < C < D < E. C é o terceiro de cinco, independentemente dos intervalos numéricos.`); break;
      }
      if (itens.length > antes) feitas++;
    }
  }
  return itens;
}
