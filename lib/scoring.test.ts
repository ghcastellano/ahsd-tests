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

/** Answer every question of an instrument with the same value. */
function answerAll(questions: Question[], value: number): Responses {
  return Object.fromEntries(questions.map((q) => [q.id, value]));
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

describe("AH/SD indicators (profile-based mean)", () => {
  it("returns a mean of 5 when all max", () => {
    const r = ahsdIndicadores.score(answerAll(ahsdIndicadores.questions, 5));
    expect(r.totalScore).toBe(5);
    expect(r.metricIsMean).toBe(true);
    expect(r.band.label).toBe("Indicadores fortes e consistentes");
    expect(r.subscales?.every((s) => s.mean === 5)).toBe(true);
  });
  it("returns low band at all ones", () => {
    const r = ahsdIndicadores.score(answerAll(ahsdIndicadores.questions, 1));
    expect(r.totalScore).toBe(1);
    expect(r.band.label).toBe("Indicadores pouco presentes");
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

describe("instrument integrity", () => {
  const all = [phq9, gad7, asrs, aq50, mdq, hcl32, pcl5, ace, ahsdIndicadores, sobreExcitabilidades];
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
