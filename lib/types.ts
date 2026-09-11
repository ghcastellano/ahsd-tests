// Core domain types for the rastreio (screening) platform.
// Every instrument is data-driven: questions + options + a pure scoring function.

export type Category =
  | "altas-habilidades"
  | "tdah"
  | "autismo"
  | "humor"
  | "ansiedade"
  | "trauma"
  | "regulacao-emocional";

export type Severity =
  | "info"
  | "none"
  | "low"
  | "mild"
  | "moderate"
  | "high"
  | "severe";

export interface QuestionOption {
  label: string;
  value: number;
}

export interface Question {
  id: string;
  text: string;
  /** Overrides the instrument's default option set for this question. */
  options?: QuestionOption[];
  /** Reverse-scored within its (sub)scale. */
  reverse?: boolean;
  /** Subscale key this item belongs to. */
  subscale?: string;
}

export interface Subscale {
  key: string;
  name: string;
  description?: string;
}

/** A band on the primary metric used to interpret a result. */
export interface InterpretationBand {
  /** Inclusive lower bound on the metric. */
  min: number;
  /** Inclusive upper bound on the metric. */
  max: number;
  label: string;
  severity: Severity;
  description: string;
}

export interface SubscaleResult {
  key: string;
  name: string;
  raw: number;
  max: number;
  /** Mean per-item score, when relevant (e.g. overexcitabilities). */
  mean?: number;
  description?: string;
  band?: InterpretationBand;
}

export interface InstrumentResult {
  /** The headline number shown to the user. */
  totalScore: number;
  maxScore: number;
  /** Primary qualitative interpretation. */
  band: InterpretationBand;
  /** For screen-positive/negative instruments. */
  positive?: boolean;
  positiveLabel?: string;
  /** Texto do estado negativo quando "abaixo do limiar" não descreve (ex.: BSCS, onde positivo = baixo). */
  negativeLabel?: string;
  /** Menor total alcançável quando não é 0 (BIS-11 = 30, BSCS = 13, DERS = 36): a barra parte daqui. */
  minScore?: number;
  /** "O que fazer agora", em uma frase, mostrado dentro do card principal. Se ausente, a tela deriva da gravidade. */
  nextStep?: string;
  /** Esconde o número principal quando ele não significa nada (MDQ: 0/1). */
  hideScore?: boolean;
  /** True when totalScore is a per-item mean (1–5) rather than a summed total. */
  metricIsMean?: boolean;
  subscales?: SubscaleResult[];
  /** Extra human-readable detail lines shown in the report. */
  notes?: string[];
}

export type Responses = Record<string, number>;

export interface Reference {
  label: string;
  url?: string;
}

export interface Instrument {
  /** URL slug, e.g. "phq-9". */
  id: string;
  acronym: string;
  /** Full name in PT-BR. */
  name: string;
  originalName?: string;
  category: Category;
  /** One-line summary for cards. */
  summary: string;
  audience: string;
  estMinutes: number;
  intro: string;
  instructions: string;
  scaleType: "likert" | "binary" | "custom";
  /** Default answer options (may be overridden per question). */
  defaultOptions: QuestionOption[];
  questions: Question[];
  subscales?: Subscale[];
  /** Pure function: responses -> result. */
  score: (r: Responses) => InstrumentResult;
  /** Bands shown as a reference legend in the UI. */
  interpretationBands: InterpretationBand[];
  primaryMetricLabel: string;
  references: Reference[];
}

export interface CategoryMeta {
  key: Category;
  name: string;
  description: string;
  accent: string; // tailwind color name segment
}
