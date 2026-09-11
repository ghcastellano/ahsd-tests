import type { Instrument, Question, Responses, Subscale } from "../types";
import { bandFor, scoreSubscales, sumScore } from "../scoring";

// RAADS-R (Ritvo et al., 2011). 80 itens; 17 itens normativos são reversos.
// Pontuação: itens normais 3/2/1/0; itens reversos 0/1/2/3. Total 0–240; corte 65.

const RAADS_OPTS = [
  { label: "Verdadeiro agora e quando eu era jovem", value: 3 },
  { label: "Verdadeiro somente agora", value: 2 },
  { label: "Verdadeiro somente quando eu tinha menos de 16 anos", value: 1 },
  { label: "Nunca foi verdadeiro", value: 0 },
];

const REVERSE = new Set([1, 6, 11, 18, 23, 26, 33, 37, 43, 47, 48, 53, 58, 62, 68, 72, 77]);

const SOCIAL = new Set([1, 3, 5, 6, 8, 11, 12, 14, 17, 18, 20, 21, 22, 23, 25, 26, 28, 31, 37, 38, 39, 43, 44, 45, 47, 48, 53, 54, 55, 60, 61, 64, 68, 69, 72, 76, 77, 79, 80]);
const LANGUAGE = new Set([2, 7, 15, 27, 35, 58, 66]);
const SENSORY = new Set([4, 10, 16, 19, 29, 33, 34, 36, 42, 46, 49, 51, 57, 59, 62, 65, 67, 71, 73, 74]);
const INTERESTS = new Set([9, 13, 24, 30, 32, 40, 41, 50, 52, 56, 63, 70, 75, 78]);

function subscaleOf(n: number): string {
  if (SOCIAL.has(n)) return "social";
  if (LANGUAGE.has(n)) return "linguagem";
  if (SENSORY.has(n)) return "sensorial";
  return INTERESTS.has(n) ? "interesses" : "social";
}

const items = [
  "Sou uma pessoa solidária.",
  "Costumo usar palavras e frases de filmes e televisão nas conversas.",
  "Muitas vezes fico surpreso(a) quando me dizem que fui rude ou grosseiro(a).",
  "Às vezes falo alto demais ou baixo demais sem perceber.",
  "Muitas vezes não sei como me comportar em situações sociais.",
  "Consigo 'me colocar no lugar' das outras pessoas.",
  "Tenho dificuldade de entender o que certas expressões querem dizer, como 'você é a menina dos meus olhos'.",
  "Só gosto de conversar com pessoas que compartilham meus interesses especiais.",
  "Concentro-me mais nos detalhes do que na ideia geral.",
  "Sempre reparo na textura da comida na minha boca; isso é mais importante para mim do que o sabor.",
  "Sinto falta dos meus melhores amigos ou da família quando ficamos muito tempo separados.",
  "Às vezes ofendo os outros por dizer o que estou pensando, mesmo sem intenção.",
  "Só gosto de pensar e falar sobre poucas coisas que me interessam.",
  "Prefiro comer em um restaurante sozinho(a) a ir acompanhado(a) de alguém que conheço.",
  "Não consigo imaginar como seria ser outra pessoa.",
  "Já me disseram que sou desajeitado(a) ou descoordenado(a).",
  "Os outros me consideram esquisito(a) ou diferente.",
  "Percebo quando meus amigos precisam de consolo.",
  "Sou muito sensível à forma como minhas roupas tocam a minha pele; a sensação delas é mais importante do que a aparência.",
  "Gosto de imitar o jeito de falar e de agir de certas pessoas; isso me ajuda a parecer mais 'normal'.",
  "Conversar com mais de uma pessoa ao mesmo tempo pode ser muito intimidador para mim.",
  "Tenho que 'agir normal' para agradar as pessoas e fazer com que gostem de mim.",
  "Conhecer pessoas novas geralmente é fácil para mim.",
  "Fico extremamente confuso(a) quando alguém me interrompe enquanto falo de algo que me interessa muito.",
  "É difícil para mim entender como as outras pessoas estão se sentindo durante uma conversa.",
  "Gosto de conversar com várias pessoas ao mesmo tempo, por exemplo à mesa de jantar, na escola ou no trabalho.",
  "Interpreto as coisas de forma literal demais e, por isso, muitas vezes não entendo o que as pessoas querem dizer.",
  "É muito difícil para mim perceber quando alguém está envergonhado(a) ou com ciúmes.",
  "Algumas texturas comuns, que não incomodam os outros, tornam-se muito desagradáveis quando tocam a minha pele.",
  "Fico extremamente chateado(a) quando a forma como gosto de fazer as coisas muda de repente.",
  "Nunca quis nem precisei daquilo que as pessoas chamam de 'relacionamento íntimo'.",
  "É difícil para mim começar e terminar uma conversa; preciso continuar até acabar o que quero dizer.",
  "Falo com um ritmo normal.",
  "O mesmo som, cor ou textura pode mudar de repente, para mim, de muito intenso para muito fraco.",
  "A expressão 'carrego você debaixo da minha pele' me deixa desconfortável.",
  "Às vezes o som de uma palavra ou um barulho agudo chega a doer nos meus ouvidos.",
  "Sou uma pessoa compreensiva.",
  "Não me conecto com personagens de filmes e não consigo sentir o que eles sentem.",
  "Não percebo quando alguém está flertando comigo.",
  "Consigo ver na minha mente, em detalhes exatos, as coisas que me interessam.",
  "Mantenho listas de coisas que me interessam, mesmo sem utilidade prática (estatísticas esportivas, horários de trem, datas históricas etc.).",
  "Quando me sinto sobrecarregado(a) pelos meus sentidos, preciso me isolar para 'desligá-los'.",
  "Gosto de conversar sobre as coisas com meus amigos.",
  "Não consigo perceber se alguém está interessado ou entediado com o que estou dizendo.",
  "Pode ser muito difícil 'ler' o rosto, as mãos e os movimentos do corpo de alguém durante uma conversa.",
  "A mesma coisa (como roupas ou temperaturas) pode parecer muito diferente para mim em momentos diferentes.",
  "Sinto-me muito à vontade em encontros românticos ou em situações sociais com outras pessoas.",
  "Tento ajudar o máximo que posso quando as pessoas me contam seus problemas pessoais.",
  "Já me disseram que tenho uma voz incomum (por exemplo monótona, infantil ou aguda).",
  "Às vezes um pensamento ou assunto fica preso na minha mente e preciso falar sobre ele, mesmo que ninguém se interesse.",
  "Faço certos movimentos repetidos com as mãos (balançar, girar objetos, agitar coisas diante dos olhos).",
  "Nunca me interessei pelo que a maioria das pessoas que conheço considera interessante.",
  "Sou considerado(a) uma pessoa compassiva.",
  "Convivo com as outras pessoas seguindo um conjunto de regras específicas que me ajudam a parecer normal.",
  "É muito difícil para mim trabalhar e funcionar em grupos.",
  "Quando estou conversando, é difícil mudar de assunto; se a outra pessoa muda, posso ficar muito chateado(a) e confuso(a).",
  "Às vezes preciso tampar os ouvidos para bloquear barulhos dolorosos (como aspirador de pó ou pessoas falando demais ou muito alto).",
  "Consigo bater papo e conversar sobre amenidades com as pessoas.",
  "Às vezes, coisas que deveriam doer não doem (por exemplo, quando me machuco ou queimo a mão no fogão).",
  "Ao conversar com alguém, tenho dificuldade de saber quando é a minha vez de falar ou de ouvir.",
  "Sou considerado(a) 'solitário(a)' por quem me conhece bem.",
  "Normalmente falo em um tom de voz normal.",
  "Gosto que as coisas sejam exatamente iguais dia após dia; até pequenas mudanças na rotina me perturbam.",
  "Fazer amigos e socializar é um mistério para mim.",
  "Girar o corpo ou me balançar em uma cadeira me acalma quando estou estressado(a).",
  "A expressão 'ele carrega o coração na mão' não faz sentido para mim.",
  "Se estou em um lugar com muitos cheiros, texturas, barulhos ou luzes fortes, sinto ansiedade ou medo.",
  "Percebo quando alguém diz uma coisa mas quer dizer outra.",
  "Gosto de ficar sozinho(a) o máximo que posso.",
  "Guardo meus pensamentos organizados na memória como fichas de arquivo, e escolho a que preciso percorrendo a 'pilha' (ou de outro jeito só meu).",
  "O mesmo som às vezes parece muito alto ou muito baixo, mesmo eu sabendo que ele não mudou.",
  "Gosto de passar tempo comendo e conversando com minha família e meus amigos.",
  "Não tolero coisas de que não gosto (cheiros, texturas, sons ou cores).",
  "Não gosto de ser abraçado(a) ou segurado(a).",
  "Quando vou a algum lugar, preciso seguir um trajeto conhecido; senão, posso ficar muito confuso(a) e chateado(a).",
  "É difícil descobrir o que as outras pessoas esperam de mim.",
  "Gosto de ter amigos próximos.",
  "As pessoas me dizem que dou detalhes demais.",
  "Muitas vezes me dizem que faço perguntas constrangedoras.",
  "Tendo a apontar os erros dos outros.",
];

const questions: Question[] = items.map((text, i) => {
  const n = i + 1;
  return {
    id: `q${n}`,
    text,
    reverse: REVERSE.has(n),
    subscale: subscaleOf(n),
  };
});

const subscales: Subscale[] = [
  { key: "social", name: "Relacionamento social", description: "39 itens sobre reciprocidade social, empatia e convivência." },
  { key: "sensorial", name: "Sensorial / Motor", description: "20 itens sobre sensibilidade sensorial e coordenação." },
  { key: "interesses", name: "Interesses circunscritos", description: "14 itens sobre interesses intensos e necessidade de rotina." },
  { key: "linguagem", name: "Linguagem", description: "7 itens sobre uso literal e pragmático da linguagem." },
];

const bands = [
  { min: 0, max: 64, label: "Abaixo do limiar", severity: "none" as const, description: "Abaixo do ponto de corte de 65. No estudo original, nenhuma pessoa com TEA pontuou abaixo de 65 — escores baixos tornam o TEA improvável por este rastreio." },
  { min: 65, max: 240, label: "Faixa compatível com TEA", severity: "high" as const, description: "Igual ou acima do corte de 65 (Ritvo et al., 2011). Sugere avaliação especializada. Estudos posteriores sugerem cortes de até ~72; o RAADS-R foi validado para aplicação com acompanhamento clínico e não é diagnóstico." },
];

export const raadsR: Instrument = {
  id: "raads-r",
  acronym: "RAADS-R",
  name: "Escala Diagnóstica de Autismo e Asperger de Ritvo — Revisada",
  originalName: "Ritvo Autism Asperger Diagnostic Scale–Revised (Ritvo et al., 2011)",
  category: "autismo",
  summary: "Rastreio aprofundado de traços do espectro autista em adultos, incluindo apresentações sutis. 80 itens.",
  audience: "Adultos (18+) com linguagem fluente",
  estMinutes: 15,
  intro:
    "O RAADS-R foi desenhado para identificar traços do espectro autista em adultos, inclusive em quem 'passou despercebido' a vida toda. Um diferencial é considerar o tempo: cada item pergunta se a característica vale para agora, para antes dos 16 anos, ou para os dois períodos. O total vai de 0 a 240, com corte clínico em 65.",
  instructions:
    "Para cada afirmação, escolha a opção que melhor descreve quando ela foi verdadeira para você: sempre (agora e na juventude), somente agora, somente antes dos 16 anos, ou nunca.",
  scaleType: "custom",
  defaultOptions: RAADS_OPTS,
  questions,
  subscales,
  interpretationBands: bands,
  primaryMetricLabel: "Pontuação total (0–240)",
  references: [
    { label: "Ritvo RA, et al. The Ritvo Autism Asperger Diagnostic Scale-Revised (RAADS-R): a scale to assist the diagnosis of Autism Spectrum Disorder in adults. J Autism Dev Disord. 2011;41(8):1076-1089." },
    { label: "Andersen LMJ, et al. The Swedish version of the RAADS-R. J Autism Dev Disord. 2011 (corte alternativo ~72)." },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, RAADS_OPTS);
    const band = bandFor(total, bands);
    const subs = scoreSubscales(questions, r, RAADS_OPTS, subscales).map((s) => ({
      ...s,
      mean: undefined,
    }));
    return {
      totalScore: total,
      maxScore: 240,
      band,
      positive: total >= 65,
      positiveLabel: "Rastreio positivo para transtorno do espectro autista (65 ou mais)",
      negativeLabel: "Rastreio negativo para transtorno do espectro autista (abaixo de 65)",
      subscales: subs,
      notes: [
        "O RAADS-R considera o histórico de vida: traços presentes 'agora e na juventude' pesam mais, refletindo a natureza do neurodesenvolvimento.",
      ],
    };
  },
};
