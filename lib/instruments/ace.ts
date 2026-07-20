import type { Instrument, Responses } from "../types";
import { YES_NO } from "./options";
import { sumScore } from "../scoring";

const items = [
  "Um dos pais ou outro adulto da casa — com frequência ou muita frequência — xingou, insultou, humilhou ou rebaixou você? Ou agiu de modo que você temesse ser fisicamente ferido(a)?",
  "Um dos pais ou outro adulto da casa — com frequência ou muita frequência — empurrou, agarrou, deu tapas ou jogou algo em você? Ou bateu em você com força a ponto de deixar marcas ou machucar?",
  "Um adulto ou pessoa pelo menos 5 anos mais velha alguma vez tocou/acariciou você sexualmente, fez você tocá-lo(a) sexualmente, ou tentou/teve relação sexual (oral, anal ou vaginal) com você?",
  "Você — com frequência ou muita frequência — sentiu que ninguém na família amava você ou o(a) achava importante; ou que a família não cuidava, não era próxima nem se apoiava?",
  "Você — com frequência ou muita frequência — sentiu que não tinha comida suficiente, precisava usar roupas sujas e não tinha quem o(a) protegesse; ou que seus pais bebiam/usavam drogas a ponto de não cuidar de você?",
  "Seus pais alguma vez se separaram ou se divorciaram?",
  "Sua mãe ou madrasta foi, alguma vez, empurrada, agarrada, esbofeteada, chutada, mordida, socada, golpeada com algo duro, agredida repetidamente ou ameaçada com arma?",
  "Você morou com alguém que tinha problema com bebida, era alcoolista ou usava drogas?",
  "Algum morador da casa era deprimido, tinha doença mental ou tentou suicídio?",
  "Algum morador da casa foi para a prisão?",
];

const questions = items.map((text, i) => ({ id: `q${i + 1}`, text }));

const bands = [
  { min: 0, max: 0, label: "Sem exposição relatada", severity: "none" as const, description: "Nenhuma experiência adversa relatada neste questionário." },
  { min: 1, max: 3, label: "Exposição intermediária", severity: "moderate" as const, description: "Uma a três experiências adversas. Há relação dose-resposta com desfechos de saúde; vale atenção a fatores de proteção e apoio." },
  { min: 4, max: 10, label: "Exposição elevada", severity: "high" as const, description: "Quatro ou mais experiências adversas — associadas a risco marcadamente maior para desfechos de saúde física e mental ao longo da vida. Apoio profissional é recomendável." },
];

export const ace: Instrument = {
  id: "ace",
  acronym: "ACE",
  name: "Experiências Adversas na Infância",
  originalName: "Adverse Childhood Experiences (Felitti et al., 1998)",
  category: "trauma",
  summary: "Mede a exposição a 10 categorias de adversidade nos primeiros 18 anos de vida.",
  audience: "Adultos (retrospectivo sobre a infância)",
  estMinutes: 3,
  intro:
    "O questionário ACE mede quantas categorias de adversidade você viveu até os 18 anos. A pontuação (0–10) tem relação dose-resposta com desfechos de saúde ao longo da vida. Ele não mede resiliência nem fatores de proteção — que também importam muito.",
  instructions:
    "Pensando nos seus primeiros 18 anos de vida, responda Sim ou Não para cada situação.",
  scaleType: "binary",
  defaultOptions: YES_NO,
  questions,
  interpretationBands: bands,
  primaryMetricLabel: "Pontuação ACE (0–10)",
  references: [
    { label: "Felitti VJ, et al. Relationship of childhood abuse and household dysfunction to many of the leading causes of death in adults (ACE Study). Am J Prev Med. 1998;14(4):245-258." },
  ],
  score: (r: Responses) => {
    const total = sumScore(questions, r, YES_NO);
    const band = bands.find((b) => total >= b.min && total <= b.max) ?? bands[0];
    return { totalScore: total, maxScore: 10, band };
  },
};
