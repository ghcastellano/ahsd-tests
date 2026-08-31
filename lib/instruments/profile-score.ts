import { bandFor, optionRange, scoreSubscales, sumScore } from "../scoring";
import type {
  InstrumentResult,
  InterpretationBand,
  Question,
  QuestionOption,
  Responses,
  Subscale,
  SubscaleResult,
} from "../types";

interface ProfileScoreOptions {
  questions: Question[];
  responses: Responses;
  defaultOptions: QuestionOption[];
  subscales: Subscale[];
  bands: InterpretationBand[];
  /** Restrict the headline mean to these dimensions; all dimensions remain visible. */
  primarySubscaleKeys?: string[];
  attachSubscaleBands?: boolean;
  sortSubscales?: boolean;
  notes?: (subscales: SubscaleResult[]) => string[];
}

/** Shared scoring for original profile-based modules (descriptive means, not cutoffs). */
export function scoreProfile({
  questions,
  responses,
  defaultOptions,
  subscales,
  bands,
  primarySubscaleKeys,
  attachSubscaleBands = true,
  sortSubscales = true,
  notes,
}: ProfileScoreOptions): InstrumentResult {
  const scored = scoreSubscales(questions, responses, defaultOptions, subscales).map((subscale) => ({
    ...subscale,
    band: attachSubscaleBands ? bandFor(subscale.mean ?? 0, bands) : undefined,
  }));
  const visibleSubscales = sortSubscales
    ? [...scored].sort((a, b) => (b.mean ?? 0) - (a.mean ?? 0))
    : scored;

  const primaryKeys = primarySubscaleKeys ? new Set(primarySubscaleKeys) : undefined;
  const primaryQuestions = primaryKeys
    ? questions.filter((question) => question.subscale && primaryKeys.has(question.subscale))
    : questions;
  const answered = primaryQuestions.filter((question) => responses[question.id] !== undefined);
  const mean = answered.length
    ? sumScore(answered, responses, defaultOptions) / answered.length
    : 0;
  const rounded = Math.round(mean * 100) / 100;

  return {
    totalScore: rounded,
    maxScore: optionRange(defaultOptions).max,
    band: bandFor(rounded, bands),
    metricIsMean: true,
    subscales: visibleSubscales,
    notes: notes?.(visibleSubscales),
  };
}
