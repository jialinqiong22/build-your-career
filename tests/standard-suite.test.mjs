import test from 'node:test';
import assert from 'node:assert/strict';
import {blank, finished, report, validProfile} from '../lib/positioning.ts';
import {questions50} from '../lib/bigfive/data50.ts';
import {questions120} from '../lib/bigfive/data120.ts';
import {valueQuestions,valueNames} from '../lib/values.ts';
import {hollandQuestions,enneagramQuestions} from '../lib/instruments.ts';
test('standard full suite computes 50-item report without paid 120 facets',()=>{
  const banks={bigFive:questions50,enneagram:enneagramQuestions};
  const p=blank();p.priorities=valueNames.slice(0,3);p.enneagramChoice='skip';p.evidence=p.evidence.map(e=>({...e,status:'none'}));
  for(const q of [...questions50,...valueQuestions,...hollandQuestions])p.answers[q.id]=3;
  assert.equal(finished(p,banks),true);
  assert.equal(validProfile(p,{...banks,bigFive:questions120}),false);
  const result=report(p,banks);assert.equal(result.coreTotal,108);assert.equal(result.traits.length,5);
  for(const trait of result.traits)assert.equal(trait.facets.length,0);
});
