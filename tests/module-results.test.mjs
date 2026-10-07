import test from 'node:test';
import assert from 'node:assert/strict';
import {hollandCode,enneagramType,buildModuleCards,bigFiveCard} from '../lib/module-results.ts';
import {blank,finished,withoutExperience} from '../lib/positioning.ts';
import {questions50} from '../lib/bigfive/data50.ts';
import {hollandQuestions,enneagramQuestions} from '../lib/instruments.ts';
import {valueQuestions,valueNames} from '../lib/values.ts';
const scores=(keys,values)=>keys.map((dimension,i)=>({dimension,score:values[i]}));
test('interest code follows scores and leaves ties or missing information unresolved',()=>{
 assert.equal(hollandCode(scores(['R','I','A','S','E','C'],[100,90,80,70,60,50])),'RIA');
 assert.equal(hollandCode(scores(['R','I','A','S','E','C'],[100,90,80,80,60,50])),null);
 assert.equal(hollandCode(scores(['R','I','A','S','E','C'],[100,100,80,70,60,null])),null);
});
test('enneagram checks adjacent wings including the circular endpoints and does not force ties',()=>{
 assert.equal(enneagramType(scores(['1','2','3','4','5','6','7','8','9'],[30,40,30,40,50,80,100,60,30])),'7w6');
 assert.equal(enneagramType(scores(['1','2','3','4','5','6','7','8','9'],[80,40,30,40,50,50,30,60,100])),'9w1');
 assert.equal(enneagramType(scores(['1','2','3','4','5','6','7','8','9'],[50,50,50,50,50,50,50,50,50])),null);
});
test('all four modules required, experience absent, four result cards, no forced evidence collection',()=>{
 const p=blank(),banks={bigFive:questions50,enneagram:enneagramQuestions};
 p.priorities=valueNames.slice(0,3);
 for(const q of [...valueQuestions,...hollandQuestions,...questions50])p.answers[q.id]=3;
 assert.equal(finished(p,banks),false);
 for(const q of enneagramQuestions)p.enneagramAnswers[q.id]=3;
 assert.equal(finished(p,banks),true);
 assert.equal('evidence' in p,false);
 assert.equal(buildModuleCards(p,banks).length,4);
 assert.equal(finished({...p,enneagramChoice:'skip',enneagramAnswers:{}},banks),false);
 const old={...p,evidence:[{context:'private historical experience'}]};
 assert.equal('evidence' in withoutExperience(old),false);
 assert.equal(old.evidence[0].context,'private historical experience');
});
test('big five image uses emotional stability with null preserved',()=>{
 const answers=Object.fromEntries(questions50.map(q=>[q.id,q.domain==='N'?(q.reverse?1:5):3]));
 assert.equal(bigFiveCard(questions50,answers).rows.find(x=>x.label==='情绪稳定性').score,0);
 assert.equal(bigFiveCard(questions50,{}).rows.find(x=>x.label==='情绪稳定性').score,null);
});
