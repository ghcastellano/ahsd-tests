import type { TestDef } from "./types";
import { advancedMatrixItems } from "./advanced-matrices";
import { figureSeriesItems } from "./figure-series";
import { classificationItems } from "./classification";
import { numericSeriesItems } from "./numeric-series";

// Bateria de treino. Os tempos reproduzem os dois regimes que aparecem nos
// instrumentos reais: POTÊNCIA (itens complexos, ~67 s cada, no formato das
// matrizes avançadas) e VELOCIDADE (itens curtos, ~14–17 s cada, no formato
// dos subtestes cronometrados). Misturar os dois regimes seria um erro de
// calibração: item complexo com tempo curto mede chute, não raciocínio.

export const tests: TestDef[] = [
  {
    id: "matrizes-avancadas",
    name: "Matrizes Avançadas",
    short: "36 itens · 40 min · regime de potência",
    format: "matriz",
    modeledOn: "Formato das Matrizes Progressivas Avançadas (36 itens / 40 min)",
    itemCount: 36,
    timeLimitSeconds: 40 * 60,
    regime: "potencia",
    intro:
      "O teste mais próximo do que se enfrenta numa avaliação supervisionada. Cada matriz 3×3 combina várias regras ao mesmo tempo — distribuição de três, distribuição de dois, operações lógicas entre elementos e componentes independentes sem separação visual. Você tem tempo para pensar: são ~67 segundos por item, em média.",
    instructions:
      "Descubra as regras que governam as linhas e escolha a figura que completa a matriz. Os distratores foram construídos para satisfazer PARTE das regras — conferir todas antes de responder é essencial.",
    items: advancedMatrixItems,
  },
  {
    id: "series-figuras",
    name: "Séries de Figuras",
    short: "13 itens · 3 min · regime de velocidade",
    format: "serie-figural",
    modeledOn: "Formato dos subtestes de séries cronometrados (13 itens / 3 min)",
    itemCount: 13,
    timeLimitSeconds: 3 * 60,
    regime: "velocidade",
    intro:
      "Velocidade pura: cerca de 14 segundos por item. Três figuras evoluem segundo uma transformação; escolha a quarta. Aqui não dá para deliberar — o objetivo é treinar reconhecimento imediato de padrão e triagem (pular e voltar).",
    instructions:
      "Identifique a transformação (rotação, quantidade, tamanho, preenchimento) e escolha a figura que continua a série. Se travar, pule: cada item vale o mesmo.",
    items: figureSeriesItems,
  },
  {
    id: "classificacao",
    name: "Classificação (exclusão)",
    short: "14 itens · 4 min · regime de velocidade",
    format: "classificacao",
    modeledOn: "Formato dos subtestes de classificação cronometrados (14 itens / 4 min)",
    itemCount: 14,
    timeLimitSeconds: 4 * 60,
    regime: "velocidade",
    intro:
      "Cinco figuras: quatro compartilham uma propriedade abstrata e uma não. A dificuldade está em achar a propriedade certa — que raramente é a mais visível (pode ser simetria, tipo de linha ou quantidade, e não a forma em si).",
    instructions:
      "Marque a figura que NÃO pertence ao grupo. Procure a propriedade compartilhada pelas outras quatro antes de decidir.",
    items: classificationItems,
  },
  {
    id: "series-numericas",
    name: "Séries Numéricas e de Letras",
    short: "20 itens · 12 min · regime misto",
    format: "serie-numerica",
    modeledOn: "Formato de séries numéricas de testes de aptidão (~36 s por item)",
    itemCount: 20,
    timeLimitSeconds: 12 * 60,
    regime: "potencia",
    intro:
      "Sequências numéricas e alfabéticas com dificuldade crescente: progressões simples, diferenças de segunda ordem, séries intercaladas (duas sequências dentro de uma!), recursões tipo Fibonacci e regras posicionais no alfabeto.",
    instructions:
      "Descubra a regra e escolha o próximo termo. Dica de método: calcule primeiro as diferenças entre termos vizinhos; se elas não revelarem padrão, teste se a série está intercalada (posições ímpares e pares como sequências separadas).",
    items: numericSeriesItems,
  },
];

export function getTest(id: string): TestDef | undefined {
  return tests.find((t) => t.id === id);
}
