export const shareDimensions = ["O", "C", "E", "A", "N"] as const;
export type ShareScores = Record<(typeof shareDimensions)[number], number | null>;

export type ShareInterpretation = {
  strengths: string;
  watchOuts: string;
  nextStep: string;
};

type ReadableDimension = "O" | "C" | "E" | "A" | "S";

const interpretations: Record<
  ReadableDimension,
  {
    highStrength: string;
    lowStrength: string;
    highWatch: string;
    lowWatch: string;
    highAction: string;
    lowAction: string;
  }
> = {
  O: {
    highStrength: "curious, imaginative, and receptive to unfamiliar ideas",
    lowStrength: "practical, grounded, and comfortable with proven approaches",
    highWatch: "novelty can become more compelling than finishing what already matters",
    lowWatch: "unfamiliar options may be dismissed before they have a fair trial",
    highAction: "choose one promising idea and turn it into a small, dated experiment",
    lowAction: "test one unfamiliar option on a small scale before deciding against it",
  },
  C: {
    highStrength: "structured, dependable, and inclined to follow through",
    lowStrength: "flexible, spontaneous, and able to adapt as conditions change",
    highWatch: "plans and standards can become rigid when circumstances shift",
    lowWatch: "important intentions may need more external structure to become consistent action",
    highAction: "leave one deliberate margin in the plan for new information",
    lowAction: "give one priority a visible next step and a realistic deadline",
  },
  E: {
    highStrength: "energetic in interaction and willing to make ideas visible",
    lowStrength: "thoughtful, independent, and comfortable working with less social stimulation",
    highWatch: "fast interaction can leave too little room for quieter reflection",
    lowWatch: "useful contributions may stay unseen unless you share them deliberately",
    highAction: "pause once before responding and invite a quieter perspective",
    lowAction: "share one prepared thought with one trusted person this week",
  },
  A: {
    highStrength: "considerate, cooperative, and attentive to other people's perspectives",
    lowStrength: "candid, independent-minded, and willing to question consensus",
    highWatch: "keeping harmony can make personal boundaries or disagreement less visible",
    lowWatch: "directness can obscure care unless the reasoning and tone are made explicit",
    highAction: "state one honest preference without over-explaining or apologising for it",
    lowAction: "pair one clear disagreement with a question about the other person's needs",
  },
  S: {
    highStrength: "steady under pressure and less easily pulled around by emotional shifts",
    lowStrength: "sensitive to tension and quick to notice possible risks or changes",
    highWatch: "calmness can sometimes hide signals that deserve attention",
    lowWatch: "stress may consume attention before there is enough time to recover",
    highAction: "check whether one concern is being overlooked simply because it feels manageable",
    lowAction: "name the stressor, reduce it to one controllable step, and plan recovery time",
  },
};

export function buildShareInterpretation(
  scores: ShareScores,
): ShareInterpretation | null {
  if (shareDimensions.some((key) => scores[key] === null)) return null;

  const readable: { key: ReadableDimension; score: number }[] = [
    { key: "O", score: scores.O! },
    { key: "C", score: scores.C! },
    { key: "E", score: scores.E! },
    { key: "A", score: scores.A! },
    { key: "S", score: 100 - scores.N! },
  ];
  const distinctive = [...readable].sort(
    (a, b) => Math.abs(b.score - 50) - Math.abs(a.score - 50),
  );

  if (Math.abs(distinctive[0].score - 50) < 10) {
    return {
      strengths:
        "Your five scores sit relatively close together, suggesting range rather than one dominant style.",
      watchOuts:
        "Context may shape your behaviour more than a single strong preference, so broad labels can miss the point.",
      nextStep:
        "Notice one situation that brings out a different side of you and write down what changed.",
    };
  }

  const selected = distinctive.slice(0, 2);
  const strengths = selected.map(({ key, score }) =>
    score >= 50
      ? interpretations[key].highStrength
      : interpretations[key].lowStrength,
  );
  const focus = selected[0];
  const focusText = interpretations[focus.key];

  return {
    strengths: `You may be ${strengths[0]}, while also being ${strengths[1]}.`,
    watchOuts:
      focus.score >= 50 ? focusText.highWatch : focusText.lowWatch,
    nextStep:
      focus.score >= 50 ? focusText.highAction : focusText.lowAction,
  };
}

export function parseShareScores(value: unknown): ShareScores | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== 5) return null;
  if (!shareDimensions.every((key) => key in record &&
    (record[key] === null || (typeof record[key] === "number" &&
      Number.isInteger(record[key]) && record[key] >= 0 && record[key] <= 100)))) return null;
  return Object.fromEntries(shareDimensions.map((key) => [key, record[key]])) as ShareScores;
}
