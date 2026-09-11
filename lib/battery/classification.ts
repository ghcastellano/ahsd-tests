import type { Cell, Difficulty, Item, Mark } from "./types";
import { mulberry32, pick, shuffle } from "./rng";

// Classificação / exclusão: cinco figuras, quatro compartilham uma propriedade
// abstrata e uma não. Regime de VELOCIDADE (~17 s por item).
//
// A dificuldade vem da propriedade compartilhada ser abstrata (número de lados,
// simetria, presença de curva) em vez de perceptual (cor, tamanho).

const CURVED: Mark[] = ["circle", "dot"];
const STRAIGHT: Mark[] = ["square", "triangle", "diamond", "cross", "hbar", "vbar"];
const THREE_SIDED: Mark[] = ["triangle"];
const FOUR_SIDED: Mark[] = ["square", "diamond"];

type ClassRule =
  | "mesma-forma-um-diferente"
  | "curva-vs-reta"
  | "mesmo-preenchimento"
  | "mesma-quantidade"
  | "simetria-rotacional";

interface Built {
  set: Cell[];
  oddIndex: number;
  why: string;
  difficulty: Difficulty;
}

function build(rule: ClassRule, seed: number): Built {
  const rand = mulberry32(seed);
  const fills = ["none", "half", "solid"] as const;

  let members: Cell[] = [];
  let odd: Cell;
  let why = "";
  let difficulty: Difficulty = "media";

  switch (rule) {
    case "mesma-forma-um-diferente": {
      const s = pick(STRAIGHT, rand);
      const other = pick(STRAIGHT.filter((x) => x !== s), rand);
      members = [0, 1, 2, 3].map((i) => ({ marks: [s], innerFill: fills[i % 3] }));
      odd = { marks: [other], innerFill: fills[1] };
      why = "Quatro figuras têm a mesma forma (variando só o preenchimento); uma tem forma diferente.";
      break;
    }
    case "curva-vs-reta": {
      members = [0, 1, 2, 3].map((i) => ({ marks: [STRAIGHT[i % STRAIGHT.length]] }));
      odd = { marks: [pick(CURVED, rand)] };
      why = "Quatro figuras são formadas apenas por linhas retas; uma contém curva.";
      difficulty = "dificil";
      break;
    }
    case "mesmo-preenchimento": {
      const f = pick([...fills], rand);
      const other = pick(fills.filter((x) => x !== f), rand);
      const shapes = shuffle([...STRAIGHT, ...CURVED], rand);
      members = [0, 1, 2, 3].map((i) => ({ marks: [shapes[i]], innerFill: f }));
      odd = { marks: [shapes[4]], innerFill: other };
      why = "Quatro figuras compartilham o mesmo preenchimento, apesar de formas diferentes; uma destoa.";
      break;
    }
    case "mesma-quantidade": {
      const n = pick([2, 3], rand) as 2 | 3;
      const shapes = shuffle([...STRAIGHT, ...CURVED], rand);
      members = [0, 1, 2, 3].map((i) => ({ marks: [shapes[i]], count: n }));
      odd = { marks: [shapes[4]], count: (n === 2 ? 3 : 2) as 2 | 3 };
      why = "Quatro figuras repetem o mesmo número de elementos; uma tem quantidade diferente.";
      break;
    }
    case "simetria-rotacional": {
      // Quadrado, losango, círculo e cruz voltam a si mesmos ao girar;
      // o triângulo isósceles, não.
      const sym: Mark[] = ["square", "diamond", "circle", "cross"];
      members = sym.map((m) => ({ marks: [m] }));
      odd = { marks: ["triangle"] };
      why = "Quatro figuras têm simetria rotacional (giradas, coincidem consigo mesmas); o triângulo não.";
      difficulty = "extrema";
      break;
    }
  }

  const all = shuffle([...members, odd], rand);
  return { set: all, oddIndex: all.findIndex((c) => c === odd), why, difficulty };
}

export function classificationItems(seed = 0): Item[] {
  const k = (seed >>> 0) * 1_000_003;
  const rules: ClassRule[] = [
    "mesma-forma-um-diferente", "mesmo-preenchimento", "mesma-quantidade",
    "curva-vs-reta", "mesma-forma-um-diferente", "mesmo-preenchimento",
    "curva-vs-reta", "mesma-quantidade", "curva-vs-reta", "mesmo-preenchimento",
    "simetria-rotacional", "mesma-quantidade", "curva-vs-reta", "simetria-rotacional",
  ];
  return rules.map((rule, i) => {
    const { set, oddIndex, why, difficulty } = build(rule, 8000 + i * 67 + k);
    return {
      id: `cl${String(i + 1).padStart(2, "0")}`,
      difficulty,
      set,
      answerIndex: oddIndex,
      explanation: why,
    };
  });
}
