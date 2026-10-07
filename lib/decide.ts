export const DECIDE_STORAGE_KEY = "career-decide-mvp-v1";

export const axes = [
  {
    id: "growth",
    tradeLeft: "成长空间",
    tradeRight: "稳定可预期",
    taskLeft: "做一件做完能明显学会新东西的小事",
    taskRight: "做一件安排得清、做完样子差不多的事",
    experimentLeft:
      "挑一个公开案例拆开看，或者找一个正在做的人，问三个你真的好奇的问题。",
    experimentRight:
      "写下未来三个月里你能看见的三件事：时间怎么过、谁会给你反馈、你的底线在哪。",
  },
  {
    id: "income",
    tradeLeft: "收入底线",
    tradeRight: "自己决定做法",
    taskLeft: "先问清入门阶段的时间与报酬",
    taskRight: "先自己做一版，报酬以后再说",
    experimentLeft:
      "找一个正在做的人，问问入门这几个月时间怎么过、报酬大概是什么样。",
    experimentRight:
      "自己先做一版很小的东西。开始之前，先别问标准答案。",
  },
  {
    id: "rhythm",
    tradeLeft: "做成对他人有用的事",
    tradeRight: "保住自己的生活节奏",
    taskLeft: "帮一个具体的人解决眼前的问题",
    taskRight: "只做这周放得下的那一部分",
    experimentLeft:
      "找一件已经有人需要、一个下午就能参与的小事。",
    experimentRight:
      "先标出这周不能让出的时间，再看哪件事放得进去。",
  },
  {
    id: "craft",
    tradeLeft: "被看见、被认可",
    tradeRight: "把一件事做到自己满意",
    taskLeft: "讲给一个能给具体反馈的人听",
    taskRight: "自己做完，先不给别人看",
    experimentLeft:
      "把一件做过的小事讲给一个能说出具体看法的人听。",
    experimentRight:
      "把一件小事做到你自己愿意再看一遍。先别给别人看。",
  },
  {
    id: "people",
    tradeLeft: "和人一起推进",
    tradeRight: "独自把问题想透",
    taskLeft: "和别人一起把一件事推进一步",
    taskRight: "独自把问题写成一页",
    experimentLeft:
      "约一次短谈话，或者加入一次已经在发生的讨论，把一件事往前推进一步。",
    experimentRight:
      "留一个安静的下午，把问题写成一页：它是什么，你怎么看，还缺哪一个事实。",
  },
  {
    id: "focus",
    tradeLeft: "先多试几个方向",
    tradeRight: "先在一个方向上做深",
    taskLeft: "用两段时间各碰一种做法",
    taskRight: "把时间留给同一种做法",
    experimentLeft:
      "用两个片段，分别碰一下两种做法，看看哪一种还想再碰。",
    experimentRight:
      "把一个下午留给同一件事，先不另开一个新的。",
  },
] as const;

export type AxisId = (typeof axes)[number]["id"];
export type Side = "left" | "right";
export type DecideMode = "named" | "none";

export type DecideInput = {
  mode: DecideMode;
  directions: [string, string, string];
  choices: Record<AxisId, { trade: Side | null; task: Side | null }>;
  stuck: AxisId | null;
  experience: "some" | "none" | null;
  experienceNote: string;
};

export type DecideBrief = {
  conflict: string;
  experiment: string;
};

const axisIds = new Set<string>(axes.map((axis) => axis.id));

export function blankInput(): DecideInput {
  return {
    mode: "named",
    directions: ["", "", ""],
    choices: {
      growth: { trade: null, task: null },
      income: { trade: null, task: null },
      rhythm: { trade: null, task: null },
      craft: { trade: null, task: null },
      people: { trade: null, task: null },
      focus: { trade: null, task: null },
    },
    stuck: null,
    experience: null,
    experienceNote: "",
  };
}

export function cleanDirection(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 40);
}

export function cleanNote(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 600);
}

export function namedDirections(input: DecideInput) {
  if (input.mode !== "named") return [];
  return input.directions.map(cleanDirection).filter((item) => item.length >= 2);
}

function isSide(value: unknown): value is Side {
  return value === "left" || value === "right";
}

export function ready(input: DecideInput) {
  if (input.mode !== "named" && input.mode !== "none") return false;
  if (input.mode === "named" && namedDirections(input).length === 0) return false;
  for (const axis of axes) {
    const choice = input.choices[axis.id];
    if (!choice || !isSide(choice.trade) || !isSide(choice.task)) return false;
  }
  if (!input.stuck || !axisIds.has(input.stuck)) return false;
  if (input.experience === "none") return true;
  return input.experience === "some" && cleanNote(input.experienceNote).length >= 8;
}

function axisById(id: AxisId) {
  const axis = axes.find((item) => item.id === id);
  if (!axis) throw new Error("unknown decide axis");
  return axis;
}

function listNames(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]}和${items[1]}`;
  return `${items.slice(0, -1).join("、")}和${items[items.length - 1]}`;
}

function opening(input: DecideInput) {
  const directions = namedDirections(input);
  if (input.mode === "none" || directions.length === 0) {
    return "你还没写下具体方向。";
  }
  if (directions.length === 1) return `你在看${directions[0]}。`;
  return `你同时在看${listNames(directions)}。`;
}

export function brief(input: DecideInput): DecideBrief {
  if (!ready(input) || !input.stuck) throw new Error("decide input incomplete");
  const axis = axisById(input.stuck);
  const choice = input.choices[axis.id];
  if (!isSide(choice.trade) || !isSide(choice.task)) {
    throw new Error("decide input incomplete");
  }
  const chosen = choice.trade === "left" ? axis.tradeLeft : axis.tradeRight;
  const other = choice.trade === "left" ? axis.tradeRight : axis.tradeLeft;
  const acted = choice.task === "left" ? axis.tradeLeft : axis.tradeRight;
  const mismatch = choice.trade !== choice.task;
  const evidence =
    input.experience === "some"
      ? "你写过一段经历，可以拿它和这件事对一下。"
      : "你还没写过一件真正做过的事，所以先从一件小事开始看。";
  const conflict = mismatch
    ? `${opening(input)}你更放不下${chosen}，真要动手时却更靠近${acted}。`
    : `${opening(input)}你更放不下${chosen}，而不是${other}。${evidence}`;
  const directions = namedDirections(input);
  const scope =
    input.mode === "none" || directions.length === 0
      ? "先不急着定方向。"
      : directions.length === 1
        ? `先只碰${directions[0]}。`
        : `${listNames(directions)}里，先只挑一个。`;
  const action = choice.task === "left" ? axis.experimentLeft : axis.experimentRight;
  const gap = mismatch ? `你心里更想要${chosen}，这件事按你真会做的来。` : "";
  const close =
    input.experience === "some"
      ? "做完可以回头看你写的那段经历。"
      : "做完问自己一句：还想再做一次吗。";
  return { conflict, experiment: `${scope}${gap}${action}${close}` };
}

function sampleChoices(
  patch: Partial<Record<AxisId, { trade: Side; task: Side }>> = {},
): DecideInput["choices"] {
  const choices = blankInput().choices;
  for (const axis of axes) {
    choices[axis.id] = patch[axis.id] ?? { trade: "left", task: "left" };
  }
  return choices;
}

export const landingSamples = {
  named: brief({
    ...blankInput(),
    mode: "named",
    directions: ["咨询", "研究", ""],
    choices: sampleChoices(),
    stuck: "growth",
    experience: "none",
  }),
  open: brief({
    ...blankInput(),
    mode: "none",
    directions: ["", "", ""],
    choices: sampleChoices({ people: { trade: "right", task: "right" } }),
    stuck: "people",
    experience: "none",
  }),
};

export function parseStored(raw: string): { input: DecideInput; step: number } | null {
  try {
    const data = JSON.parse(raw) as {
      version?: unknown;
      step?: unknown;
      input?: DecideInput;
    };
    if (data.version !== 1 || !data.input) return null;
    const input = data.input;
    if (input.mode !== "named" && input.mode !== "none") return null;
    if (!Array.isArray(input.directions) || input.directions.length !== 3) return null;
    if (input.directions.some((item) => typeof item !== "string")) return null;
    for (const axis of axes) {
      const choice = input.choices?.[axis.id];
      if (!choice) return null;
      if (choice.trade !== null && !isSide(choice.trade)) return null;
      if (choice.task !== null && !isSide(choice.task)) return null;
    }
    if (input.stuck !== null && !axisIds.has(input.stuck)) return null;
    if (
      input.experience !== null &&
      input.experience !== "some" &&
      input.experience !== "none"
    ) {
      return null;
    }
    if (typeof input.experienceNote !== "string") return null;
    const step = data.step;
    if (step !== 0 && step !== 1 && step !== 2 && step !== 3 && step !== 4) return null;
    if (step === 4 && !ready(input)) return null;
    return {
      step,
      input: {
        ...input,
        directions: input.directions.map(cleanDirection) as [string, string, string],
        experienceNote: cleanNote(input.experienceNote),
      },
    };
  } catch {
    return null;
  }
}
