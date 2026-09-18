import test from "node:test";
import assert from "node:assert/strict";
import { socialView, validScores, validFeedback } from "../lib/social-validation.ts";
const scores={O:80,C:70,E:20,A:45,N:50};
const future=new Date(Date.now()+100000);
test("only both confirmed participants see comparison scores",()=>{
  for(const status of ["pending_assessment","pending_invitee_consent","pending_initiator_consent","active","revoked","declined"]){
    const row={kind:"compare",status,data:{initiatorScores:scores,inviteeScores:scores},expiresAt:future};
    for(const role of ["owner","participant","visitor"]){
      assert.equal(socialView(row,role).initiatorScores,undefined);
      assert.equal(socialView(row,role).inviteeScores,undefined);
    }
  }
  const row={kind:"compare",status:"active",data:{initiatorScores:scores,inviteeScores:scores,initiatorConsentAt:"now",inviteeConsentAt:"now"},expiresAt:future};
  assert.deepEqual(socialView(row,"owner").inviteeScores,scores);
  assert.deepEqual(socialView(row,"participant").initiatorScores,scores);
  assert.equal(socialView(row,"visitor").initiatorScores,undefined);
  assert.equal(socialView({...row,expiresAt:new Date(0)},"owner").initiatorScores,undefined);
  assert.equal(socialView({...row,status:"revoked"},"participant").initiatorScores,undefined);
});
test("feedback visitors see exactly one summary and prompts, never saved responses or receipt hashes",()=>{
  const row={kind:"feedback",status:"submitted",expiresAt:future,data:{summary:"A specific experience",evidenceItemId:"one",answers:["one","two","three"],responseDeleteHash:"secret"}};
  const visitor=socialView(row,"visitor");
  assert.equal(visitor.summary,row.data.summary);
  assert.equal(visitor.answers,undefined);
  assert.equal(visitor.evidenceItemId,undefined);
  assert.equal(visitor.responseDeleteHash,undefined);
  assert.deepEqual(socialView(row,"owner").answers,row.data.answers);
  assert.equal(socialView({...row,status:"revoked"},"owner").answers,undefined);
  assert.equal(socialView({...row,expiresAt:new Date(0)},"visitor").summary,undefined);
});
test("scores and feedback reject malformed, identifying extras and unbounded content",()=>{
  assert.equal(validScores(scores),true);
  for(const bad of [null,[],{...scores,email:"a@example.com"},{...scores,N:NaN},{...scores,N:101},{...scores,N:-1},{O:1}])assert.equal(validScores(bad),false);
  assert.equal(validFeedback(["具体行动","结果帮助","背景条件"]),true);
  for(const bad of [null,[],["ok","ok"],["ok","ok",42],["ok","ok"," ".repeat(10)],["ok","ok","x".repeat(1001)]])assert.equal(validFeedback(bad),false);
});
