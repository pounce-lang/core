// purr is the core interpreter for Pounce, thanks EL for naming that.
import * as r from 'ramda';
import { ValueStack, ProgramList } from './types';
import { WordDictionary } from "./WordDictionary";
import { coreWords } from './words/core';
import { pinna } from './parser/Pinna';

export const parser = pinna;
export function* purr(programList: ProgramList,
  wd: WordDictionary = coreWords,
  opt: { debug?: boolean } = { debug: true }) {
  let pl = programList || [];
  let vstack: ValueStack = [];
  yield opt?.debug ? [vstack, pl] : null;
  let w;
  const maxWordsProcessed = 10000;
  let wordsProcessed = 0;
  while (wordsProcessed < maxWordsProcessed && (w = pl.shift())) {
    wordsProcessed += 1;
    let wds = !r.is(Array, w) ? wd[w as string | number] : null;
    while (wds) {
      if (typeof wds === 'function') {
        wds(vstack);
      }
      else {
        pl.unshift(...wds);
      }
      yield opt?.debug ? [vstack, pl] : null;
      w = pl.shift();
      wds = !r.is(Array, w) ? wd[w as string | number] : [];
    }
    // console.log('*** not in dictionary w ***', w);
    if (w || r.is(Array, w)) {
      if (r.is(Array, w)) {
        // console.log('*** w ***', w);
        vstack.push([].concat(w));
      }
      else {
        // console.log('*** w2 ***', w);
        //      vstack.push(JSON.parse(JSON.stringify(w)));
        vstack.push(w);
      }
      yield opt?.debug ? [vstack, pl] : null;
    }
    else {
      console.log("*** no sure what word is", w);
    }
  }
  if (wordsProcessed >= maxWordsProcessed) {
    yield [[vstack, pl], "maxWordsProcessed exceeded: this may be an infinite loop "];
  }
  else {
    // yield [vstack, pl];
  }
}

