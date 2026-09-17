import type { Cell, Difficulty, Item, Mark } from "./types";
import { mulberry32, pick, shuffle } from "./rng";

// Classificação / exclusão: cinco figuras, quatro compartilham uma propriedade
// abstrata e uma não. Regime de VELOCIDADE (~17 s por item).
//
// A dificuldade vem da propriedade compartilhada ser abstrata (número de lados,
// simetria, presença de curva) em vez de perceptual (cor, tamanho).

// Formas fechadas, retas, com simetria rotacional: 2 convexas e 2 côncavas.
// Só elas entram como "ruído" nos conjuntos — assim nenhuma propriedade
// secundária (única curva, única linha, único preenchimento) divide o conjunto
// em 4-a-1 apontando para outra figura. Era o defeito clássico da versão anterior.
const POOL_SIM: Mark[] = ["square", "diamond", "cross", "star"];
const FILLS2 = ["none", "solid"] as const;

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

  /** 4 membros com preenchimento balanceado (2 vazios, 2 cheios): preenchimento nunca fica 4-a-1. */
  const balanced = (shapes: Mark[]): Cell[] => shapes.map((m, i) => ({ marks: [m], innerFill: FILLS2[i % 2] }));

  switch (rule) {
    case "mesma-forma-um-diferente": {
      const s = pick(POOL_SIM, rand);
      const other = pick(POOL_SIM.filter((x) => x !== s), rand);
      // 2×2 de preenchimento × tamanho: nenhum membro é único em um atributo secundário.
      members = [
        { marks: [s], innerFill: "none", size: 2 }, { marks: [s], innerFill: "solid", size: 2 },
        { marks: [s], innerFill: "none", size: 3 }, { marks: [s], innerFill: "solid", size: 3 },
      ];
      odd = { marks: [other], innerFill: pick([...FILLS2], rand), size: pick([2, 3], rand) as 2 | 3 };
      why = "Quatro figuras têm a mesma forma (variando preenchimento e tamanho); uma tem forma diferente.";
      break;
    }
    case "curva-vs-reta": {
      members = balanced(shuffle(POOL_SIM, rand));
      odd = { marks: ["circle"], innerFill: pick([...FILLS2], rand) };
      why = "Quatro figuras são formadas apenas por linhas retas; uma contém curva.";
      difficulty = "dificil";
      break;
    }
    case "mesmo-preenchimento": {
      const f = pick([...fills], rand);
      const other = pick(fills.filter((x) => x !== f), rand);
      const pool = shuffle(POOL_SIM, rand);
      members = pool.map((m) => ({ marks: [m], innerFill: f }));
      odd = { marks: [pick(pool, rand)], innerFill: other }; // repete uma forma: a forma não fica 4-a-1
      why = "Quatro figuras compartilham o mesmo preenchimento, apesar de formas diferentes; uma destoa.";
      break;
    }
    case "mesma-quantidade": {
      const n = pick([2, 3], rand) as 2 | 3;
      const pool = shuffle(POOL_SIM, rand);
      members = pool.map((m) => ({ marks: [m], count: n }));
      odd = { marks: [pick(pool, rand)], count: (n === 2 ? 3 : 2) as 2 | 3 };
      why = "Quatro figuras repetem o mesmo número de elementos; uma tem quantidade diferente.";
      break;
    }
    case "simetria-rotacional": {
      // Quadrado, losango, cruz e estrela voltam a si mesmos ao girar; o triângulo isósceles, não.
      members = balanced(shuffle(POOL_SIM, rand));
      odd = { marks: ["triangle"], innerFill: pick([...FILLS2], rand) };
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
    "curva-vs-reta", "mesma-quantidade", "mesma-forma-um-diferente", "mesmo-preenchimento",
    "mesma-quantidade", "curva-vs-reta", "mesmo-preenchimento", "simetria-rotacional",
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
