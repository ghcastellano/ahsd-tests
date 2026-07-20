import type { QuestionOption } from "../types";

/** 0..3 frequency scale used by PHQ-9 and GAD-7 (últimas 2 semanas). */
export const FREQ_0_3: QuestionOption[] = [
  { label: "Nenhuma vez", value: 0 },
  { label: "Vários dias", value: 1 },
  { label: "Mais da metade dos dias", value: 2 },
  { label: "Quase todos os dias", value: 3 },
];

/** 0..4 frequency scale (Nunca..Muito frequentemente) — ASRS, PCL-5-like. */
export const FREQ_0_4: QuestionOption[] = [
  { label: "Nunca", value: 0 },
  { label: "Raramente", value: 1 },
  { label: "Às vezes", value: 2 },
  { label: "Frequentemente", value: 3 },
  { label: "Muito frequentemente", value: 4 },
];

/** PCL-5 distress scale 0..4. */
export const PCL_0_4: QuestionOption[] = [
  { label: "Nem um pouco", value: 0 },
  { label: "Um pouco", value: 1 },
  { label: "Moderadamente", value: 2 },
  { label: "Bastante", value: 3 },
  { label: "Extremamente", value: 4 },
];

/** 4-point agree/disagree (AQ). Values assigned per-item by the scoring fn. */
export const AGREE_4: QuestionOption[] = [
  { label: "Concordo totalmente", value: 3 },
  { label: "Concordo um pouco", value: 2 },
  { label: "Discordo um pouco", value: 1 },
  { label: "Discordo totalmente", value: 0 },
];

/** Sim/Não binary (value 1 = Sim). */
export const YES_NO: QuestionOption[] = [
  { label: "Sim", value: 1 },
  { label: "Não", value: 0 },
];

/** 5-point Likert 1..5 (concordância) — overexcitabilities, indicators. */
export const LIKERT_1_5: QuestionOption[] = [
  { label: "Discordo totalmente", value: 1 },
  { label: "Discordo", value: 2 },
  { label: "Neutro / às vezes", value: 3 },
  { label: "Concordo", value: 4 },
  { label: "Concordo totalmente", value: 5 },
];

/** DERS 5-point frequency 1..5. */
export const DERS_1_5: QuestionOption[] = [
  { label: "Quase nunca (0–10%)", value: 1 },
  { label: "Às vezes (11–35%)", value: 2 },
  { label: "Cerca de metade (36–65%)", value: 3 },
  { label: "Na maioria das vezes (66–90%)", value: 4 },
  { label: "Quase sempre (91–100%)", value: 5 },
];
