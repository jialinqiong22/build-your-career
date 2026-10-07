import { scoreInstrument, hollandQuestions, hollandNames, enneagramNames } from "./instruments.ts";
import { scoreValues } from "./values.ts";
import { scoreBigFive } from "./bigfive/scoring.ts";
import type { BigFiveQuestion } from "./bigfive/types.ts";
import type { Profile, SuiteBanks } from "./positioning.ts";

export type ResultCard = { title: string; headline?: string; rows: {label:string;score:number|null}[]; notes?:string[] };
type Score = {dimension:string;score:number|null};

export function hollandCode(scores: Score[]): string | null {
  if (scores.length !== 6 || scores.some(s=>s.score===null)) return null;
  const sorted = [...scores].sort((a,b)=>b.score!-a.score!);
  if (sorted[0].score! < 50 || sorted.slice(0,3).some((s,i)=>s.score===sorted[i+1].score)) return null;
  return sorted.slice(0,3).map(s=>s.dimension).join("");
}

export function enneagramType(scores: Score[]): string | null {
  if (scores.length !== 9 || scores.some(s=>s.score===null)) return null;
  const sorted = [...scores].sort((a,b)=>b.score!-a.score!);
  if (sorted[0].score! < 50 || sorted[0].score===sorted[1].score) return null;
  const type = Number(sorted[0].dimension);
  const left = type === 1 ? 9 : type-1;
  const right = type === 9 ? 1 : type+1;
  const a = scores.find(s=>s.dimension===String(left))!;
  const b = scores.find(s=>s.dimension===String(right))!;
  if (a.score === b.score) return String(type) + "（翼型未分化）";
  return String(type)+"w"+String(a.score!>b.score! ? left : right);
}

export function bigFiveCard(items:readonly BigFiveQuestion[],answers:Record<string,number|null>):ResultCard {
  const names:Record<string,string>={O:"开放性",C:"尽责性",E:"外向性",A:"宜人性",N:"情绪稳定性"};
  return {title:"大五人格"+items.length+"题",rows:scoreBigFive(items,answers).map(x=>({label:names[x.dimension],score:x.dimension==="N"&&x.score!==null?100-x.score:x.score})),notes:["IPIP中文适配；不是人群百分位。情绪稳定性等于100减去情绪敏感性。"]};
}

export function buildModuleCards(p:Profile,banks:SuiteBanks):ResultCard[] {
  const interest=scoreInstrument(hollandQuestions,p.answers);
  const motive=scoreInstrument(banks.enneagram,p.enneagramAnswers);
  return [
    {title:"职业价值观",rows:scoreValues(p.answers).map(x=>({label:x.dimension,score:x.score})),notes:["当前取舍顺序："+p.priorities.join(" → "),"原创探索题，非标准化职业锚量表。"]},
    {title:"霍兰德职业兴趣",headline:"兴趣代码："+(hollandCode(interest)??"暂未分化"),rows:interest.map(x=>({label:x.dimension+" · "+hollandNames[x.dimension],score:x.score})),notes:["并列或信息不足时，不确定唯一代码。原创RIASEC探索题，兴趣不等于能力。"]},
    bigFiveCard(banks.bigFive,p.answers),
    {title:"九型人格",headline:"探索性类型："+(enneagramType(motive)??"暂未分化"),rows:motive.map(x=>({label:x.dimension+" · "+enneagramNames[x.dimension],score:x.score})),notes:["并列或信息不足时，不确定唯一类型。类型与翼型依据本次原创题得分推导，仅供讨论，不是确定的人格判断。"]}
  ];
}
