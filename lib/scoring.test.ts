import { describe, it, expect } from "vitest";
import { reverseValue, sumScore, bandFor } from "./scoring";
import type { Question, Responses } from "./types";
import { FREQ_0_3 } from "./instruments/options";

import { phq9 } from "./instruments/phq9";
import { gad7 } from "./instruments/gad7";
import { asrs } from "./instruments/asrs";
import { aq50 } from "./instruments/aq50";
import { mdq } from "./instruments/mdq";
import { hcl32 } from "./instruments/hcl32";
import { pcl5 } from "./instruments/pcl5";
import { ace } from "./instruments/ace";
import { ahsdIndicadores } from "./instruments/ahsd-indicadores";
import { sobreExcitabilidades } from "./instruments/sobre-excitabilidades";
import { impostorAutossabotagem } from "./instruments/impostor-autossabotagem";
import { perfeccionismoAutocritica } from "./instruments/perfeccionismo-autocritica";
import { perfilSensorial } from "./instruments/perfil-sensorial";
import { cincoGrandes } from "./instruments/cinco-grandes";
import { bemEstarContexto } from "./instruments/bem-estar-contexto";
import { raadsR } from "./instruments/raads-r";
import { ders } from "./instruments/ders";

/** Answer every question of an instrument with the same value. */
function answerAll(questions: Question[], value: number): Responses {
  return Object.fromEntries(questions.map((q) => [q.id, value]));
}

/** Answer a 1..5 profile so its scored value is the same after reverse scoring. */
function answerProfile(questions: Question[], scoredValue: number): Responses {
  return Object.fromEntries(
    questions.map((q) => [q.id, q.reverse ? 6 - scoredValue : scoredValue]),
  );
}

describe("engine helpers", () => {
  it("reverses values within a range", () => {
    expect(reverseValue(0, 0, 3)).toBe(3);
    expect(reverseValue(3, 0, 3)).toBe(0);
    expect(reverseValue(1, 1, 5)).toBe(5);
    expect(reverseValue(3, 1, 5)).toBe(3);
  });

  it("applies reverse scoring in sumScore", () => {
    const qs: Question[] = [
      { id: "a", text: "" },
      { id: "b", text: "", reverse: true },
    ];
    // a=0 -> 0; b=0 reversed on 0..3 -> 3
    expect(sumScore(qs, { a: 0, b: 0 }, FREQ_0_3)).toBe(3);
    // a=3 -> 3; b=3 reversed -> 0
    expect(sumScore(qs, { a: 3, b: 3 }, FREQ_0_3)).toBe(3);
  });

  it("finds the containing band", () => {
    const bands = [
      { min: 0, max: 4, label: "a", severity: "none" as const, description: "" },
      { min: 5, max: 9, label: "b", severity: "mild" as const, description: "" },
    ];
    expect(bandFor(3, bands).label).toBe("a");
    expect(bandFor(9, bands).label).toBe("b");
  });
});

describe("PHQ-9", () => {
  it("scores minimal at all zeros", () => {
    const r = phq9.score(answerAll(phq9.questions, 0));
    expect(r.totalScore).toBe(0);
    expect(r.band.label).toBe("Mínimo");
  });
  it("sums correctly and bands 'Leve' at 9", () => {
    const r = phq9.score(answerAll(phq9.questions, 1));
    expect(r.totalScore).toBe(9);
    expect(r.band.label).toBe("Leve");
  });
  it("reaches 27 (Grave) at all threes", () => {
    const r = phq9.score(answerAll(phq9.questions, 3));
    expect(r.totalScore).toBe(27);
    expect(r.band.label).toBe("Grave");
  });
  it("flags item 9 (self-harm) when endorsed", () => {
    const r = phq9.score({ ...answerAll(phq9.questions, 0), q9: 1 });
    expect(r.notes?.some((n) => n.includes("188"))).toBe(true);
  });
});

describe("GAD-7", () => {
  it("is screen-positive at >= 10", () => {
    const r = gad7.score(answerAll(gad7.questions, 2)); // 7*2 = 14
    expect(r.totalScore).toBe(14);
    expect(r.positive).toBe(true);
    expect(r.band.label).toBe("Moderado");
  });
  it("is negative below 10", () => {
    const r = gad7.score(answerAll(gad7.questions, 1)); // 7
    expect(r.positive).toBe(false);
  });
});

describe("ASRS Part A shaded-box rule", () => {
  it("counts items 1-3 at 'Às vezes'(2) but not items 4-6 at 2", () => {
    const r = asrs.score({ q1: 2, q2: 2, q3: 2, q4: 2, q5: 2, q6: 2 });
    expect(r.totalScore).toBe(3); // only items 1-3 counted
    expect(r.positive).toBe(false);
  });
  it("counts items 4-6 only at 'Frequentemente'(3)+", () => {
    const r = asrs.score({ q1: 2, q2: 2, q3: 2, q4: 3, q5: 3, q6: 3 });
    expect(r.totalScore).toBe(6);
    expect(r.positive).toBe(true);
  });
  it("is below threshold when items 1-3 are only 'Raramente'(1)", () => {
    const r = asrs.score({ q1: 1, q2: 1, q3: 1, q4: 2, q5: 2, q6: 2 });
    expect(r.totalScore).toBe(0);
    expect(r.positive).toBe(false);
  });
});

describe("AQ-50 directional scoring", () => {
  it("item 1 is disagree-scored (autistic direction = disagree)", () => {
    // Answer everything neutral except q1
    const base = answerAll(aq50.questions, 2); // 'Concordo um pouco' -> agree
    // In base, all agree => only agree-scored items count = 24
    expect(aq50.score(base).totalScore).toBe(24);
    // q1 answered as disagree (0) should add 1 (item1 disagree-scored)
    expect(aq50.score({ ...base, q1: 0 }).totalScore).toBe(25);
  });
  it("all 'Concordo totalmente' scores the 24 agree-keyed items", () => {
    const r = aq50.score(answerAll(aq50.questions, 3));
    expect(r.totalScore).toBe(24);
    expect(r.positive).toBe(false);
  });
  it("all 'Discordo totalmente' scores the 26 disagree-keyed items", () => {
    const r = aq50.score(answerAll(aq50.questions, 0));
    expect(r.totalScore).toBe(26);
  });
  it("reaches 50 and screen-positive when every item is autistic-direction", () => {
    const AGREE = new Set([2, 4, 5, 6, 7, 9, 12, 13, 16, 18, 19, 20, 21, 22, 23, 26, 33, 35, 39, 41, 42, 43, 45, 46]);
    const r: Responses = {};
    for (let i = 1; i <= 50; i++) r[`q${i}`] = AGREE.has(i) ? 3 : 0;
    const res = aq50.score(r);
    expect(res.totalScore).toBe(50);
    expect(res.positive).toBe(true);
  });
});

describe("MDQ three-criterion algorithm", () => {
  const symptoms7 = () => {
    const r: Responses = {};
    for (let i = 1; i <= 13; i++) r[`q${i}`] = i <= 7 ? 1 : 0;
    return r;
  };
  it("is positive with >=7 symptoms + same period + moderate problem", () => {
    const r = mdq.score({ ...symptoms7(), q14: 1, q15: 2 });
    expect(r.positive).toBe(true);
  });
  it("is negative with only 6 symptoms", () => {
    const r: Responses = {};
    for (let i = 1; i <= 13; i++) r[`q${i}`] = i <= 6 ? 1 : 0;
    expect(mdq.score({ ...r, q14: 1, q15: 3 }).positive).toBe(false);
  });
  it("is negative when problem level is only minor", () => {
    expect(mdq.score({ ...symptoms7(), q14: 1, q15: 1 }).positive).toBe(false);
  });
  it("is negative when not in the same period", () => {
    expect(mdq.score({ ...symptoms7(), q14: 0, q15: 3 }).positive).toBe(false);
  });
});

describe("HCL-32", () => {
  it("is positive at exactly 14 endorsed", () => {
    const r: Responses = {};
    for (let i = 1; i <= 32; i++) r[`q${i}`] = i <= 14 ? 1 : 0;
    const res = hcl32.score(r);
    expect(res.totalScore).toBe(14);
    expect(res.positive).toBe(true);
  });
  it("is negative at 13", () => {
    const r: Responses = {};
    for (let i = 1; i <= 32; i++) r[`q${i}`] = i <= 13 ? 1 : 0;
    expect(hcl32.score(r).positive).toBe(false);
  });
});

describe("PCL-5", () => {
  it("sums 0..80 and flags provisional PTSD >= 33", () => {
    const r = pcl5.score(answerAll(pcl5.questions, 2)); // 20*2 = 40
    expect(r.totalScore).toBe(40);
    expect(r.positive).toBe(true);
  });
  it("computes DSM-5 cluster endorsement", () => {
    const r = pcl5.score(answerAll(pcl5.questions, 2));
    expect(r.notes?.some((n) => n.includes("satisfaz provisoriamente"))).toBe(true);
  });
  it("is negative at all zero", () => {
    expect(pcl5.score(answerAll(pcl5.questions, 0)).positive).toBe(false);
  });
});

describe("ACE", () => {
  it("sums yes answers", () => {
    const r: Responses = {};
    for (let i = 1; i <= 10; i++) r[`q${i}`] = i <= 4 ? 1 : 0;
    const res = ace.score(r);
    expect(res.totalScore).toBe(4);
    expect(res.band.label).toBe("Exposição elevada");
  });
});

describe("AH/SD indicators (profile of strengths)", () => {
  it("cobre as seis áreas e liga todo item a uma delas", () => {
    const keys = ahsdIndicadores.subscales!.map((s) => s.key);
    for (const k of ["intelectual", "criatividade", "motivacao", "lideranca", "artistica", "psicomotora"]) {
      expect(keys, `falta o domínio ${k}`).toContain(k);
    }
    for (const q of ahsdIndicadores.questions) expect(keys).toContain(q.subscale!);
  });

  it("não pergunta por frequência em janela de tempo", () => {
    // O instrumento é de descrição habitual, não de contagem de episódios.
    for (const q of ahsdIndicadores.questions) {
      expect(q.text.toLowerCase(), q.id).not.toContain("últimos 12 meses");
      expect(q.text.toLowerCase(), q.id).not.toContain("quantas vezes");
    }
  });

  it("pontua a média geral 1–5 e as faixas dos extremos", () => {
    const all5 = ahsdIndicadores.score(answerAll(ahsdIndicadores.questions, 5));
    expect(all5.totalScore).toBe(5);
    expect(all5.maxScore).toBe(5);
    expect(all5.metricIsMean).toBe(true);
    expect(all5.band.label).toBe("Indicadores fortes e consistentes");

    const all1 = ahsdIndicadores.score(answerAll(ahsdIndicadores.questions, 1));
    expect(all1.totalScore).toBe(1);
    expect(all1.band.label).toBe("Indicadores pouco presentes");
  });

  it("dá uma média por área e ordena da mais forte para a mais fraca", () => {
    const r: Responses = {};
    for (const q of ahsdIndicadores.questions) {
      r[q.id] = q.subscale === "intelectual" ? 5 : q.subscale === "criatividade" ? 4 : 2;
    }
    const res = ahsdIndicadores.score(r);
    expect(res.subscales).toHaveLength(6);
    const means = res.subscales!.map((s) => s.mean ?? 0);
    expect([...means].sort((a, b) => b - a)).toEqual(means); // já vem ordenado
    expect(res.subscales![0].key).toBe("intelectual");
    expect(res.subscales![0].mean).toBe(5);
    expect(res.subscales![1].key).toBe("criatividade");
  });

  it("destaca as áreas mais fortes nas notas", () => {
    const r: Responses = {};
    for (const q of ahsdIndicadores.questions) {
      r[q.id] = q.subscale === "artistica" ? 5 : 2;
    }
    const joined = (ahsdIndicadores.score(r).notes ?? []).join(" ");
    expect(joined).toContain("Talento artístico");
  });

  it("deixa claro que não é teste de QI nem diagnóstico", () => {
    const res = ahsdIndicadores.score(answerAll(ahsdIndicadores.questions, 5));
    const joined = (res.notes ?? []).join(" ").toLowerCase();
    expect(joined).toContain("não é um teste de qi");
    expect(joined).toContain("diagnóstico");
  });
});

describe("Overexcitabilities (profile)", () => {
  it("produces five subscale means", () => {
    const r = sobreExcitabilidades.score(answerAll(sobreExcitabilidades.questions, 4));
    expect(r.subscales?.length).toBe(5);
    expect(r.subscales?.every((s) => s.mean === 4)).toBe(true);
    expect(r.totalScore).toBe(4);
  });
});

describe("AH/SD complementary profiles", () => {
  it("scores impostor/autossabotagem across four balanced dimensions", () => {
    expect(impostorAutossabotagem.questions).toHaveLength(16);
    expect(impostorAutossabotagem.questions.filter((q) => q.reverse)).toHaveLength(4);

    const high = impostorAutossabotagem.score(answerProfile(impostorAutossabotagem.questions, 5));
    const low = impostorAutossabotagem.score(answerProfile(impostorAutossabotagem.questions, 1));
    expect(high.totalScore).toBe(5);
    expect(high.band.label).toBe("Presença muito elevada");
    expect(high.subscales).toHaveLength(4);
    expect(low.totalScore).toBe(1);
  });

  it("separates high standards from rigid perfectionism costs", () => {
    expect(perfeccionismoAutocritica.questions).toHaveLength(20);
    const responses: Responses = {};
    for (const question of perfeccionismoAutocritica.questions) {
      const target = question.subscale === "padroes" ? 5 : 1;
      responses[question.id] = question.reverse ? 6 - target : target;
    }
    const result = perfeccionismoAutocritica.score(responses);
    expect(result.totalScore).toBe(1);
    expect(result.band.label).toBe("Baixa carga rígida");
    expect(result.subscales?.find((s) => s.key === "padroes")?.mean).toBe(5);
  });

  it("maps six sensory dimensions without a diagnostic cutoff", () => {
    expect(perfilSensorial.questions).toHaveLength(24);
    const result = perfilSensorial.score(answerProfile(perfilSensorial.questions, 4));
    expect(result.totalScore).toBe(4);
    expect(result.band.label).toBe("Sensibilidade elevada");
    expect(result.subscales).toHaveLength(6);
    expect(result.positive).toBeUndefined();
  });

  it("keeps the five personality factors separate and descriptive", () => {
    expect(cincoGrandes.questions).toHaveLength(30);
    const responses: Responses = {};
    for (const question of cincoGrandes.questions) {
      const target = question.subscale === "abertura" ? 5 : 3;
      responses[question.id] = question.reverse ? 6 - target : target;
    }
    const result = cincoGrandes.score(responses);
    expect(result.band.label).toBe("Perfil dimensional");
    expect(result.subscales).toHaveLength(5);
    expect(result.subscales?.find((s) => s.key === "abertura")?.mean).toBe(5);
    expect(result.subscales?.every((s) => s.band === undefined)).toBe(true);
  });

  it("reads higher well-being scores as stronger contextual resources", () => {
    expect(bemEstarContexto.questions).toHaveLength(20);
    const high = bemEstarContexto.score(answerProfile(bemEstarContexto.questions, 5));
    const low = bemEstarContexto.score(answerProfile(bemEstarContexto.questions, 1));
    expect(high.band.label).toBe("Recursos fortes");
    expect(high.band.severity).toBe("none");
    expect(low.band.label).toBe("Recursos fragilizados");
    expect(low.band.severity).toBe("high");
  });
});

describe("RAADS-R reverse scoring and cutoff", () => {
  const REVERSE = [1, 6, 11, 18, 23, 26, 33, 37, 43, 47, 48, 53, 58, 62, 68, 72, 77];

  it("has 80 items split 39/7/20/14 across subscales", () => {
    expect(raadsR.questions.length).toBe(80);
    const count = (key: string) => raadsR.questions.filter((q) => q.subscale === key).length;
    expect(count("social")).toBe(39);
    expect(count("linguagem")).toBe(7);
    expect(count("sensorial")).toBe(20);
    expect(count("interesses")).toBe(14);
  });

  it("flags exactly the 17 normative items as reverse-scored", () => {
    const flagged = raadsR.questions.filter((q) => q.reverse).map((q) => Number(q.id.slice(1)));
    expect(flagged.sort((a, b) => a - b)).toEqual(REVERSE);
  });

  it("scores 51 when everything is 'never true' (only reverse items score)", () => {
    const r = raadsR.score(answerAll(raadsR.questions, 0));
    expect(r.totalScore).toBe(17 * 3); // 51
    expect(r.positive).toBe(false);
    expect(r.band.label).toBe("Abaixo do limiar");
  });

  it("scores 189 when everything is 'true now and when young'", () => {
    const r = raadsR.score(answerAll(raadsR.questions, 3));
    expect(r.totalScore).toBe(63 * 3); // reverse items contribute 0
    expect(r.positive).toBe(true);
  });

  it("crosses the cutoff at exactly 65+", () => {
    const base = answerAll(raadsR.questions, 0); // 51
    for (const id of ["q2", "q3", "q4", "q5", "q7"]) base[id] = 3; // +15 => 66
    const r = raadsR.score(base);
    expect(r.totalScore).toBe(66);
    expect(r.positive).toBe(true);
  });
});

describe("DERS reverse scoring and reference bands", () => {
  it("has 36 items in 6 subscales summing 36, with 11 reverse items", () => {
    expect(ders.questions.length).toBe(36);
    const bySub = new Map<string, number>();
    for (const q of ders.questions) bySub.set(q.subscale!, (bySub.get(q.subscale!) ?? 0) + 1);
    expect([...bySub.values()].reduce((a, b) => a + b, 0)).toBe(36);
    expect(bySub.get("estrategias")).toBe(8);
    expect(bySub.get("consciencia")).toBe(6);
    expect(ders.questions.filter((q) => q.reverse).length).toBe(11);
  });

  it("scores 80 at all 'quase nunca' (reverse items score 5 each)", () => {
    const r = ders.score(answerAll(ders.questions, 1));
    expect(r.totalScore).toBe(25 * 1 + 11 * 5); // 80
    expect(r.band.label).toBe("Acima da média");
  });

  it("scores 136 at all 'quase sempre'", () => {
    const r = ders.score(answerAll(ders.questions, 5));
    expect(r.totalScore).toBe(25 * 5 + 11 * 1); // 136
    expect(r.band.label).toBe("Bem acima da média");
  });

  it("reaches the true minimum 36 with ideal answers", () => {
    const r: Responses = {};
    for (const q of ders.questions) r[q.id] = q.reverse ? 5 : 1;
    expect(ders.score(r).totalScore).toBe(36);
    expect(ders.score(r).band.label).toBe("Faixa típica");
  });
});

describe("instrument integrity", () => {
  const all = [
    phq9,
    gad7,
    asrs,
    aq50,
    mdq,
    hcl32,
    pcl5,
    ace,
    ahsdIndicadores,
    sobreExcitabilidades,
    impostorAutossabotagem,
    perfeccionismoAutocritica,
    perfilSensorial,
    cincoGrandes,
    bemEstarContexto,
    raadsR,
    ders,
  ];
  it("every question id is unique within an instrument", () => {
    for (const inst of all) {
      const ids = inst.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("subscale keys referenced by questions exist in the subscale list", () => {
    for (const inst of all) {
      if (!inst.subscales) continue;
      const keys = new Set(inst.subscales.map((s) => s.key));
      for (const q of inst.questions) {
        if (q.subscale) expect(keys.has(q.subscale)).toBe(true);
      }
    }
  });
});
