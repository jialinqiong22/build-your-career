export type BigFiveDomain = "E" | "A" | "C" | "N" | "O";

export interface BigFiveQuestion {
  id: string;
  text: string;
  domain: BigFiveDomain;
  reverse: boolean;
  facet?: number;
  sourceEnglish: string;
}

export interface BigFiveScore {
  answered: number;
  expected: number;
  /** Sum of valid keyed answers only; not prorated for missing responses. */
  raw: number;
  /** Linear 0–100 response scale; NOT a percentile or diagnostic score. */
  score: number | null;
}

export interface BigFiveDomainScore extends BigFiveScore {
  dimension: BigFiveDomain;
  facets: (BigFiveScore & { id: string; name: string })[];
}
