import { mulberry32 } from "../battery/rng";
import type { ItemMemoria } from "../simulador/memoria";

// Material autoral. Não reproduz itens nem regras de pontuação do SB5.
const FRASES = [
  "A menina guardou o livro na gaveta", "O barco atravessou o lago",
  "O músico afinou o violino", "A chuva molhou o jardim",
  "O viajante fechou a mala", "O pintor escolheu uma tinta",
  "A criança desenhou uma estrela", "O carteiro entregou a carta",
  "O vento abriu a janela", "O cozinheiro cortou a cenoura",
  "A ciclista atravessou a ponte", "O gato subiu no telhado",
  "A professora apagou o quadro", "O menino encontrou uma chave",
  "A avó preparou o jantar", "O jardineiro plantou uma roseira",
  "A atleta amarrou o sapato", "O cavalo correu pelo campo",
  "O fotógrafo ajustou a lente", "O passageiro comprou a passagem",
  "O marceneiro lixou a madeira", "A cantora guardou o microfone",
  "O astrônomo observou a lua", "A pesquisadora anotou o resultado",
];

export function gerarMemoriaSB5(seed: number, n: number): ItemMemoria[] {
  const rnd = mulberry32(seed * 8191 + 73);
  const embaralhar = <T,>(lista: T[]) => {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  return Array.from({ length: n }, (_, i) => {
    if (i % 2 === 0) {
      const estimulos = embaralhar(FRASES).slice(0, 4 + Math.floor(rnd() * 3));
      const sequencia = estimulos.map((f) => f.split(" ").at(-1)!);
      return { id: `sb5-palavras-${seed}-${i}`, nivel: 3, formato: "ultima-palavra", sequencia, estimulos, intervaloMs: 4000, resposta: sequencia.join(" ") };
    }
    const sequencia = embaralhar(["1", "2", "3", "4", "5", "6", "7", "8", "9"]).slice(0, 5 + Math.floor(rnd() * 3));
    return { id: `sb5-posicoes-${seed}-${i}`, nivel: 3, formato: "posicoes", sequencia, intervaloMs: 1000, resposta: sequencia.join("") };
  });
}
