import type { Instrument, Question, Responses } from "../types";
import { AGREE_4 } from "./options";

// Baron-Cohen AQ. In AGREE_4: Concordo totalmente=3, Concordo um pouco=2,
// Discordo um pouco=1, Discordo totalmente=0.
// "agree-scored" item => 1 point when value >= 2; "disagree-scored" => 1 point when value <= 1.
const AGREE_SCORED = new Set([
  2, 4, 5, 6, 7, 9, 12, 13, 16, 18, 19, 20, 21, 22, 23, 26, 33, 35, 39, 41, 42, 43, 45, 46,
]);

const items = [
  "Prefiro fazer as coisas acompanhado(a) do que sozinho(a).",
  "Prefiro fazer as coisas sempre da mesma maneira, repetidamente.",
  "Se tento imaginar algo, acho muito fácil criar uma imagem na minha mente.",
  "Frequentemente me absorvo tanto em uma coisa que perco de vista outras coisas.",
  "Costumo notar pequenos sons que outras pessoas não percebem.",
  "Costumo reparar em placas de carro ou sequências de informação semelhantes.",
  "Outras pessoas costumam me dizer que o que falei foi indelicado, mesmo quando acho que fui educado(a).",
  "Quando leio uma história, consigo imaginar facilmente como os personagens se parecem.",
  "Sou fascinado(a) por datas.",
  "Em um grupo social, consigo acompanhar facilmente as conversas de várias pessoas ao mesmo tempo.",
  "Acho as situações sociais fáceis.",
  "Costumo notar detalhes que outros não percebem.",
  "Prefiro ir a uma biblioteca do que a uma festa.",
  "Acho fácil inventar histórias.",
  "Sinto-me mais atraído(a) por pessoas do que por objetos.",
  "Tenho interesses muito fortes e fico incomodado(a) quando não posso me dedicar a eles.",
  "Gosto de conversas sociais informais (bate-papo).",
  "Quando falo, nem sempre é fácil para os outros conseguirem falar também.",
  "Sou fascinado(a) por números.",
  "Quando leio uma história, tenho dificuldade de entender as intenções dos personagens.",
  "Não gosto muito de ler ficção.",
  "Acho difícil fazer novos amigos.",
  "Percebo padrões nas coisas o tempo todo.",
  "Prefiro ir ao teatro do que a um museu.",
  "Não me incomoda se minha rotina diária for alterada.",
  "Frequentemente percebo que não sei como manter uma conversa.",
  "Acho fácil 'ler nas entrelinhas' quando alguém está falando comigo.",
  "Costumo me concentrar mais no quadro geral do que nos pequenos detalhes.",
  "Não sou muito bom(boa) em lembrar números de telefone.",
  "Normalmente não noto pequenas mudanças em uma situação ou na aparência de uma pessoa.",
  "Consigo perceber quando alguém que me ouve está ficando entediado(a).",
  "Acho fácil fazer mais de uma coisa ao mesmo tempo.",
  "Quando falo ao telefone, não tenho certeza de quando é a minha vez de falar.",
  "Gosto de fazer as coisas de forma espontânea.",
  "Costumo ser o(a) último(a) a entender a graça de uma piada.",
  "Acho fácil descobrir o que alguém pensa ou sente apenas olhando para o rosto da pessoa.",
  "Se há uma interrupção, consigo voltar rapidamente ao que estava fazendo.",
  "Sou bom(boa) em conversas sociais informais (bate-papo).",
  "As pessoas costumam me dizer que fico insistindo sempre no mesmo assunto.",
  "Quando era criança, gostava de brincar de faz de conta com outras crianças.",
  "Gosto de reunir informações sobre categorias de coisas (tipos de carros, pássaros, trens, plantas etc.).",
  "Acho difícil imaginar como seria ser outra pessoa.",
  "Gosto de planejar cuidadosamente qualquer atividade da qual participo.",
  "Gosto de ocasiões sociais.",
  "Acho difícil descobrir as intenções das pessoas.",
  "Situações novas me deixam ansioso(a).",
  "Gosto de conhecer pessoas novas.",
  "Sou um(a) bom(boa) diplomata.",
  "Não sou muito bom(boa) em lembrar datas de nascimento das pessoas.",
  "Acho muito fácil brincar de faz de conta com crianças.",
];

const questions: Question[] = items.map((text, i) => ({ id: `q${i + 1}`, text }));

const bands = [
  { min: 0, max: 25, label: "Abaixo do limiar", severity: "none" as const, description: "Poucos traços autistas relatados. Escores abaixo de 26 tornam o TEA improvável neste rastreio." },
  { min: 26, max: 31, label: "Zona intermediária", severity: "moderate" as const, description: "Traços autistas acima da média (zona 'cinza'). Alguns estudos usam 26 como corte sensível. Avaliação profissional pode ser útil se houver sofrimento ou prejuízo." },
  { min: 32, max: 50, label: "Traços clinicamente significativos", severity: "high" as const, description: "Nível de traços autistas clinicamente significativo (corte de 32 de Baron-Cohen). Recomenda-se avaliação especializada — o AQ não é diagnóstico." },
];

export const aq50: Instrument = {
  id: "aq-50",
  acronym: "AQ-50",
  name: "Quociente do Espectro Autista",
  originalName: "Autism Spectrum Quotient (Baron-Cohen et al., 2001)",
  category: "autismo",
  summary: "Rastreio de traços do espectro autista em adultos com inteligência preservada. 50 itens.",
  audience: "Adultos (16+)",
  estMinutes: 8,
  intro:
    "O AQ mede a presença de traços associados ao espectro autista em adultos. Cada item pontua quando respondido na 'direção autista'; o total varia de 0 a 50. É um instrumento de rastreio, não de diagnóstico.",
  instructions:
    "Leia cada afirmação e indique o quanto você concorda ou discorda. Não existe resposta certa ou errada; responda de forma espontânea.",
  scaleType: "custom",
  defaultOptions: AGREE_4,
  questions,
  interpretationBands: bands,
  primaryMetricLabel: "Pontuação total (0–50)",
  references: [
    { label: "Baron-Cohen S, Wheelwright S, Skinner R, Martin J, Clubley E. The Autism-Spectrum Quotient (AQ). J Autism Dev Disord. 2001;31(1):5-17." },
    { label: "Formulário de rastreio do NHS (Derbyshire Healthcare) reproduzindo o instrumento e a chave de pontuação." },
  ],
  score: (r: Responses) => {
    let total = 0;
    for (let i = 1; i <= 50; i++) {
      const v = r[`q${i}`];
      if (v === undefined) continue;
      const agreeScored = AGREE_SCORED.has(i);
      if (agreeScored && v >= 2) total++;
      if (!agreeScored && v <= 1) total++;
    }
    const band = bands.find((b) => total >= b.min && total <= b.max) ?? bands[0];
    return {
      totalScore: total,
      maxScore: 50,
      band,
      positive: total >= 32,
      positiveLabel: "Rastreio positivo para traços do espectro autista (32 ou mais)",
      negativeLabel: total >= 26 ? "Abaixo do corte de 32 (rastreio negativo para autismo), mas acima da média da população" : "Rastreio negativo para traços do espectro autista (abaixo de 32)",
    };
  },
};
