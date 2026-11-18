import { buildMatrixBank, type MatrixSlot } from "./advanced-matrices";
import type { TestDef } from "./types";

// Bancos autorais inéditos inspirados no formato e extensão de G-38, G-36 e
// Matrizes Progressivas Avançadas de Raven (APM Conjunto II).
// Todos os itens são gerados por regras determinísticas com alternativas
// visualmente distintas e explicação da regra aplicada.

const G38_SLOTS: readonly MatrixSlot[] = [
  // 14 itens médios (regras intercaladas)
  { kind: "const-rc", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  { kind: "rot-prog", difficulty: "media" },
  { kind: "logic-or", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  { kind: "const-rc", difficulty: "media" },
  { kind: "logic-and", difficulty: "media" },
  { kind: "rot-prog", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  { kind: "logic-or", difficulty: "media" },
  { kind: "const-rc", difficulty: "media" },
  { kind: "rot-prog", difficulty: "media" },
  { kind: "logic-and", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  // 18 itens difíceis (regras intercaladas)
  { kind: "dual", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "rot-prog", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "d3", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "rot-prog", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "d3", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  // 6 itens de carga extrema
  { kind: "triad", difficulty: "extrema" },
  { kind: "logicD2-xor", difficulty: "extrema" },
  { kind: "triad", difficulty: "extrema" },
  { kind: "logicD2-and", difficulty: "extrema" },
  { kind: "triad", difficulty: "extrema" },
  { kind: "logicD2-xor", difficulty: "extrema" },
];

const G36_SLOTS: readonly MatrixSlot[] = [
  // 14 itens médios
  { kind: "d3", difficulty: "media" },
  { kind: "rot-prog", difficulty: "media" },
  { kind: "const-rc", difficulty: "media" },
  { kind: "logic-and", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  { kind: "logic-or", difficulty: "media" },
  { kind: "rot-prog", difficulty: "media" },
  { kind: "const-rc", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  { kind: "logic-and", difficulty: "media" },
  { kind: "const-rc", difficulty: "media" },
  { kind: "rot-prog", difficulty: "media" },
  { kind: "logic-or", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  // 17 itens difíceis
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "rot-prog", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "d3", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "rot-prog", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "d3", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  // 5 itens de carga extrema
  { kind: "logicD2-xor", difficulty: "extrema" },
  { kind: "triad", difficulty: "extrema" },
  { kind: "logicD2-and", difficulty: "extrema" },
  { kind: "triad", difficulty: "extrema" },
  { kind: "logicD2-xor", difficulty: "extrema" },
];

const RAVEN_SLOTS: readonly MatrixSlot[] = [
  // 14 itens médios
  { kind: "rot-prog", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  { kind: "logic-or", difficulty: "media" },
  { kind: "const-rc", difficulty: "media" },
  { kind: "rot-prog", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  { kind: "logic-and", difficulty: "media" },
  { kind: "const-rc", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  { kind: "rot-prog", difficulty: "media" },
  { kind: "logic-or", difficulty: "media" },
  { kind: "const-rc", difficulty: "media" },
  { kind: "logic-and", difficulty: "media" },
  { kind: "d3", difficulty: "media" },
  // 17 itens difíceis
  { kind: "d2", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "rot-prog", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "d3", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "rot-prog", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  { kind: "d2", difficulty: "dificil" },
  { kind: "logic-xor", difficulty: "dificil" },
  { kind: "d3", difficulty: "dificil" },
  { kind: "dual", difficulty: "dificil" },
  // 5 itens de carga extrema
  { kind: "triad", difficulty: "extrema" },
  { kind: "logicD2-and", difficulty: "extrema" },
  { kind: "triad", difficulty: "extrema" },
  { kind: "logicD2-xor", difficulty: "extrema" },
  { kind: "triad", difficulty: "extrema" },
];

export const g38Test: TestDef = {
  id: "g38",
  name: "Treino estilo G-38 (38 itens)",
  short: "38 itens · 40 min · regime de potência",
  format: "matriz",
  modeledOn: "Inspirado na estrutura de 38 itens do Teste Não Verbal G-38 (bateria autoral)",
  itemCount: 38,
  timeLimitSeconds: 40 * 60,
  regime: "potencia",
  intro:
    "Simulado autoral com 38 matrizes progressivas não verbais e regras intercaladas (distribuição de três, progressão rotacional, operações lógicas OR/AND/XOR, dois componentes e distribuição de dois). Não reproduz itens protegidos do teste comercial.",
  instructions:
    "Identifique a relação lógica que governa cada matriz 3×3 e escolha a figura que completa o quadro inferior direito. Ao finalizar, confira o gabarito comentado de cada item.",
  reference: {
    title: "G-38 — Teste Não Verbal de Inteligência",
    publisher: "Vetor Editora (Giunti Psychometrics)",
    citation: "Instrumento psicológico de uso privativo de psicólogos (SATEPSI Favorável). Para avaliação formal com validade clínica e normas brasileiras, adquira o material oficial com um profissional habilitado.",
    purchaseUrl: "https://www.vetoreditora.com.br/produto/colecao-g-38-teste-nao-verbal-de-inteligencia-70740",
    purchaseLabel: "Adquirir coleção oficial G-38 na Vetor Editora",
  },
  items: (seed = 0) => buildMatrixBank("g38-", G38_SLOTS, 100_000, seed),
};

export const g36Test: TestDef = {
  id: "g36",
  name: "Treino estilo G-36 (36 itens)",
  short: "36 itens · 40 min · regime de potência",
  format: "matriz",
  modeledOn: "Inspirado na estrutura de 36 itens do Teste Não Verbal G-36 (bateria autoral)",
  itemCount: 36,
  timeLimitSeconds: 40 * 60,
  regime: "potencia",
  intro:
    "Simulado autoral com 36 matrizes não verbais de raciocínio fluido e dificuldade crescente, variando regras a cada questão. Não reproduz itens protegidos do teste comercial.",
  instructions:
    "Observe linhas e colunas para descobrir a regra da matriz 3×3 e marque a alternativa correta. Ao concluir, revise a explicação detalhada do padrão de cada item.",
  reference: {
    title: "G-36 — Teste Não Verbal de Inteligência",
    publisher: "Vetor Editora (Giunti Psychometrics)",
    citation: "Instrumento psicológico de uso privativo de psicólogos (SATEPSI Favorável). Para avaliação psicológica formal, utilize o caderno e crivo oficiais.",
    purchaseUrl: "https://www.vetoreditora.com.br/produto/colecao-g-36-teste-nao-verbal-de-inteligencia-70739",
    purchaseLabel: "Adquirir coleção oficial G-36 na Vetor Editora",
  },
  items: (seed = 0) => buildMatrixBank("g36-", G36_SLOTS, 200_000, seed),
};

export const ravenTest: TestDef = {
  id: "raven",
  name: "Treino estilo Raven Avançado (36 itens)",
  short: "36 itens · 40 min · regime de potência",
  format: "matriz",
  modeledOn: "Inspirado no Conjunto II (36 itens) das Matrizes Progressivas Avançadas de Raven (bateria autoral)",
  itemCount: 36,
  timeLimitSeconds: 40 * 60,
  regime: "potencia",
  intro:
    "Simulado autoral com 36 matrizes progressivas inspiradas na taxonomia do Raven APM Conjunto II, com escalada de carga cognitiva e regras variadas sem repetição consecutiva. Não reproduz pranchas originais protegidas.",
  instructions:
    "Analise os atributos de forma, preenchimento, rotação, contagem e operações lógicas em linhas e colunas para escolher a peça que completa a matriz.",
  reference: {
    title: "APM-Raven — Matrizes Progressivas Avançadas de Raven",
    publisher: "Hogrefe Brasil / Pearson Clinical",
    citation: "Raven, J., Raven, J. C., & Court, J. H. Instrumento padrão-ouro para avaliação da capacidade edutiva (fator g), de uso restrito a psicólogos no Brasil (SATEPSI Favorável).",
    purchaseUrl: "https://hogrefe.com.br/matrizes-progressivas-avancadas-de.html",
    purchaseLabel: "Adquirir APM-Raven oficial na Hogrefe Brasil",
  },
  items: (seed = 0) => buildMatrixBank("rav-", RAVEN_SLOTS, 300_000, seed),
};

export const extraTests: TestDef[] = [g38Test, g36Test, ravenTest];

export function getExtraTest(id: string): TestDef | undefined {
  return extraTests.find((t) => t.id === id);
}

