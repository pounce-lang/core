const r = require('ramda');
const parse = require('../dist/index').parse;
const interpreter = require('../dist/index').interpreter;
const preProcessDefs = require('../dist/index').preProcessDefines;
const purr = require('../dist/index').purr;
const coreWords = require('../dist/index').coreWordDictionary;


const runDebug = (p, debugLevel = 10) => {
  const test2 = interpreter(p, { logLevel: debugLevel });
  result2 = test2.next();
  console.error(result2.value);
  while (result2.value && result2.value.active) {
    result2 = test2.next();
    console.error(result2.value);
  }
  return result2.value.stack;
};

const testIt = (p, expected_result) => {
  let pp;
  try {
    pp = parse(p);
  }
  catch (e) {
    console.error("parse error:", p);
    return false;
  }
  if (!pp) {
    console.error("no parse result:", p);
    return false;
  }
  let wd;
  try {
    [pp, wd] = preProcessDefs(pp, coreWords);
  }
  catch (e) {
    console.error("preProcessDefs error:", p);
    return false;
  }
  if (!wd) {
    console.error("no preProcessDefs result:", p);
    return false;
  }
  const itest = interpreter(p);
  let iresult = itest.next();
  while (iresult.value && iresult.value.active) {
    iresult = itest.next();
  }
  const str_exp = JSON.stringify(expected_result);
  const str_res = JSON.stringify(iresult.value ? iresult.value.stack : "error");
  if (str_exp === str_res) {
    try {
      const ptest = purr(pp, wd);
      if (!ptest) {
        console.error("purr null result:", test);
        return false;
      }
      let presult = ptest.next();
      while (presult.value && presult.value.active) {
        presult = ptest.next();
      }
      const str_exp2 = JSON.stringify(expected_result);
      const str_res2 = JSON.stringify(presult.value ? presult.value.stack : "error");
      if (str_exp2 === str_res2) {
        return true;
      }
    }
    catch (e) {
      console.error("purr error:", e, p);
      return false;
    }
  }

  console.error("failed test for:", p);
  console.error("Expected result", str_exp);
  console.error("Erroneously got", str_res);
  console.error("Re running in debug mode:");
  const result2 = runDebug(p, 2);
  console.error(result2 ? result2 : "error", "!=", expected_result);

  return false;
};

let allPassing = 1;
allPassing &= testIt("Hello Pounce", ["Hello", "Pounce"]);
allPassing &= testIt("words", [["words", "word", "dup", "swap", "drop", "round", "+", "-", "/", "%", "*", "&", "|", "^", "~", "&&", "||", "!", "E", "LN10", "LN2", "LOG10E", "LOG2E", "PI", "SQRT1_2", "SQRT2", "abs", "acos", "acosh", "asin", "asinh", "atan", "atan2", "atanh", "cbrt", "ceil", "cos", "cosh", "exp", "expm1", "floor", "hypot", "log", "log10", "log1p", "log2", "max", "min", "pow", "seedrandom", "random", "sign", "sin", "sinh", "sqrt", "tan", "tanh", "trunc", "play", "pounce", "dip", "dip2", "rotate", "rollup", "rolldown", "if-else", "ifte", "=", "==", "!=", ">", "<", ">=", "<=", "concat", "cons", "uncons", "push", "pop", "constrec", "linrec", "linrec5", "binrec", "dup2", "times", "map", "map2", "filter", "reduce", "split", "size", "outAt", "inAt", "depth", "stack-copy"]]);
allPassing &= testIt("[dup2] word", [{ "sig": [[{ "type": "A", "use": "observe" }, { "type": "B", "use": "observe" }], [{ "type": "A" }, { "type": "B" }, { "type": "A" }, { "type": "B" }]], "compose": [["dup"], "dip", "dup", ["swap"], "dip"] }]);
allPassing &= testIt("[word] word", [{ "sig": [[{ "type": "list<string>)" }], [{ "type": "record" }]] }]);
allPassing &= testIt("497 seedrandom random", [0.5311601270295587]);
allPassing &= testIt("129 seedrandom random random", [0.5081206358755288, 0.5000708460575135]);
allPassing &= testIt("4 dup drop", [4]);
allPassing &= testIt("[5 8] dup drop pop swap pop swap drop swap +", [13]);
allPassing &= testIt("[5 8] dup pop 2 + push", [[5, 8], [5, 10]]);
allPassing &= testIt("3 2 7 [+] dip -", [-2]);
allPassing &= testIt("3 2 7 rotate", [7, 2, 3]);
allPassing &= testIt('A B C rollup', ['C', 'A', 'B']);
allPassing &= testIt('A B C rolldown', ['B', 'C', 'A']);
allPassing &= testIt("true [5] [7] if-else", [5]);
allPassing &= testIt("false [5] [7] if-else", [7]);
allPassing &= testIt("false [5] [7 3 [+] play] if-else", [10]);
allPassing &= testIt("2 1 [>] [5] [7] ifte", [5]);
allPassing &= testIt("2 2 [>] [5] [7] ifte", [7]);
allPassing &= testIt("z w [>] [5] [7] ifte", [5]);
allPassing &= testIt("a b [>] [5] [7] ifte", [7]);
allPassing &= testIt("a a [>] [5] [7] ifte", [7]);
allPassing &= testIt("2 1 [<] [true] [false] ifte", [false]);
allPassing &= testIt("2 2 [<] [true] [false] ifte", [false]);
allPassing &= testIt("z w [<] [true] [false] ifte", [false]);
allPassing &= testIt("a b [<] [true] [false] ifte", [true]);
allPassing &= testIt("a a [<] [true] [false] ifte", [false]);
allPassing &= testIt("2 1 >=", [true]);
allPassing &= testIt("2 2 >=", [true]);
allPassing &= testIt("z w >=", [true]);
allPassing &= testIt("a b >=", [false]);
allPassing &= testIt("a a >=", [true]);
allPassing &= testIt("2 1 <=", [false]);
allPassing &= testIt("2 2 <=", [true]);
allPassing &= testIt("z w <=", [false]);
allPassing &= testIt("a b <=", [true]);
allPassing &= testIt("a a <=", [true]);
// allPassing &= testIt("a 5 <=", []);
allPassing &= testIt("2 1 [=] [5] [7] ifte", [2, 7]);
allPassing &= testIt("0 0 [=] [5] [7] ifte", [0, 5]);
allPassing &= testIt("2 1 [==] [5] [7] ifte", [7]);
allPassing &= testIt("a b =", ['a', false]);
allPassing &= testIt("5 b =", [5, false]);
allPassing &= testIt("a [a] =", ['a', false]);
allPassing &= testIt("b b =", ['b', true]);
allPassing &= testIt("5.66 dup ==", [true]);
allPassing &= testIt("3 3 ==", [true]);
allPassing &= testIt("a b ==", [false]);
allPassing &= testIt("4 b ==", [false]);
allPassing &= testIt("[a] a ==", [false]);
allPassing &= testIt("b b ==", [true]);
allPassing &= testIt("5.66 dup !=", [false]);
allPassing &= testIt("3 3 !=", [false]);
allPassing &= testIt("a b !=", [true]);
allPassing &= testIt("4 b !=", [true]);
allPassing &= testIt("[a] a !=", [true]);
allPassing &= testIt("b b !=", [false]);
allPassing &= testIt("2 1[<] [5] [7 3 [+] play] ifte", [10]);
allPassing &= testIt("0 1 [dup] dip dup [swap] dip +", [0, 1, 1]);
allPassing &= testIt("0 1 dup2 +", [0, 1, 1]);
allPassing &= testIt("2 5 +", [7]);
allPassing &= testIt(".1 .2 +", [0.3]);
allPassing &= testIt("2 5 -", [-3]);
allPassing &= testIt("1.0 0.9 -", [0.1]);
allPassing &= testIt("2 5 *", [10]);
allPassing &= testIt("2 5 /", [0.4]);
allPassing &= testIt("2 5 %", [2]);
allPassing &= testIt("-2 abs", [2]);
allPassing &= testIt("0.105 2 round", [0.11]);
allPassing &= testIt("0 1 [dup2 +] 5 times", [0, 1, 1, 2, 3, 5, 8]);

// discrete ops
allPassing &= testIt("false false || ", [false]);
allPassing &= testIt("false true || ", [true]);
allPassing &= testIt("true false || ", [true]);
allPassing &= testIt("true true || ", [true]);
allPassing &= testIt("false false && ", [false]);
allPassing &= testIt("false true && ", [false]);
allPassing &= testIt("true false && ", [false]);
allPassing &= testIt("true true && ", [true]);
allPassing &= testIt("false !", [true]);
allPassing &= testIt("true !", [false]);


// not valid program tests (should not crash)
allPassing &= testIt("/", null);
allPassing &= testIt("2 0 /", null);
allPassing &= testIt("2  /", null);
allPassing &= testIt("- 16", null);
allPassing &= testIt("5 - 16 ", null);
allPassing &= testIt("3 - 16 /", null);
allPassing &= testIt("- 16 /", null);

// compose tests
allPassing &= testIt("[1 +] [add-one] compose 22 add-one", [23]);
allPassing &= testIt("[dup2 +] [fib] compose 0 1 [fib] 5 times", [0, 1, 1, 2, 3, 5, 8]);

//# [dup 1 - dup 0 > [[*] dip fac] [drop drop] ifte] [fac] compose 5 [1 swap] play fac
allPassing &= testIt("[dup 1 - dup 0 > [[*] dip fac] [drop drop] if-else] [fac] compose 5 [1 swap] play fac", [120]);
allPassing &= testIt("5 [1 swap] [dup 1 -] [dup 0 >] [[*] dip] [drop drop] constrec", [120]);
allPassing &= testIt("5 [0 =] [1 +] [dup 1 -] [*] linrec", [120]);

allPassing &= testIt("A [B] cons", [['A', 'B']]);
allPassing &= testIt("[A B] uncons", ['A', ['B']]);
allPassing &= testIt("[1 2] uncons cons", [[1, 2]]);

allPassing &= testIt("[A] B push", [['A', 'B']]);
allPassing &= testIt("[A B] pop", [['A'], 'B']);
allPassing &= testIt("[1 2] pop push", [[1, 2]]);
allPassing &= testIt("[1 2] pop swap cons", [[2, 1]]);

allPassing &= testIt("[1 2] 0 outAt", [[1, 2], 1]);
allPassing &= testIt("[1 2 c] 2 outAt", [[1, 2, 'c'], 'c']);
allPassing &= testIt("[1 2] 5 outAt", null);
allPassing &= testIt("[1 2 3] 2 outAt", [[1, 2, 3], 3]);

allPassing &= testIt("[1 2] 8 0 inAt", [[8, 2]]);
allPassing &= testIt("[1 2 c] d 2 inAt", [[1, 2, 'd']]);
allPassing &= testIt("[1 2] 5 inAt", null);
allPassing &= testIt("[1 88 3] 2 1 inAt", [[1, 2, 3]]);

allPassing &= testIt("[1 66 3] dup 1 outAt 2 - 1 inAt", [[1, 66, 3], [1, 64, 3]]);

allPassing &= testIt("[1 2] [3] 4 depth", [[1, 2], [3], 4, 3]);
allPassing &= testIt("[1 2] [3] 4 stack-copy", [[1, 2], [3], 4, [[1, 2], [3], 4]]);
allPassing &= testIt("[1 2] size", [[1, 2], 2]);

allPassing &= testIt("[1 2] [3] concat", [[1, 2, 3]]);

allPassing &= testIt("6 [3 8 5 7 10 2 9 1] [>] split", [[3, 5, 2, 1, 6], [8, 7, 10, 9]]);
allPassing &= testIt("5 [3 6 8 7 10 5 2 9 1] [>] split", [[3, 2, 1, 5], [6, 8, 7, 10, 5, 9]]);

allPassing &= testIt("[3 8 5 7 10 2 9 1] [2 % 0 ==] map", [[false, true, false, false, true, true, false, false]]);
allPassing &= testIt("[3 8 5 7 10 2 9 1] [2 *] map", [[6, 16, 10, 14, 20, 4, 18, 2]]);
allPassing &= testIt("3 2 1 [1 2 3] [+] map", [[2, 4, 6]]);

allPassing &= testIt("[4 2 5 7 10 2 9 4] [% 0 ==] map2", [[true, false, true, false]]);
allPassing &= testIt("[1 2 3 4 5 6 7 8] [+] map2", [[3, 7, 11, 15]]);
allPassing &= testIt("[[1 2] [3 4] [5 6] [7 8]] [concat] map2", [[[1, 2, 3, 4], [5, 6, 7, 8]]]);
// map2 is not stack safe if you must reach under in your map2 phrase (although map can do this)
// allPassing &= testIt("3 2 [1 2 3 4] [+ +] map2", [[5, 10]]);

allPassing &= testIt("[3 8 5 7 10 2 9 1] [2 % 0 !=] filter", [[3, 5, 7, 9, 1]]);
allPassing &= testIt("[3 8 5 7 10 2 9 1] [3 % 0 ==] filter", [[3, 9]]);
allPassing &= testIt("[3 8 5 7 10 2 9 1] [7 > ] filter", [[8, 10, 9]]);


allPassing &= testIt("[3 8 5 4 10 2 9 1] 0 [+] reduce", [42]);
allPassing &= testIt("[3 8 5 4 10 2 9 1] 0 [2 * +] reduce", [84]);
allPassing &= testIt("[4 2] false [dup == ||] reduce", [true]);
allPassing &= testIt("[4 2 a] false [dup == ||] reduce", [true]);
allPassing &= testIt("[4 2 'string'] false [dup == ||] reduce", [true]);
allPassing &= testIt("[4 2.1 'string' [4] [a [b]]] false [dup == ||] reduce", [true]);


allPassing &= testIt(`
[5 6 3 8 4 5 7 2 9 1] 
[size 1 <=] [] [uncons [>] split] [concat] binrec
`, [[1, 2, 3, 4, 5, 5, 6, 7, 8, 9]]);
allPassing &= testIt(`
[f d b c a h b j e g] 
[size 1 <=] [] [uncons [>] split] [concat] binrec
`, [["a", "b", "b", "c", "d", "e", "f", "g", "h", "j"]]);

allPassing &= testIt("0 0 [a b] [a b +] pounce", [0]);
allPassing &= testIt("0 [a] [a] pounce", [0]);

allPassing &= testIt("1 2 3 4 [a b c x] [a x x * * b x * c + +] pounce", [27]);
allPassing &= testIt("2 3 4 [slope y-intercept x] [slope x * y-intercept +] pounce", [11]);

allPassing &= testIt(`
210 2 [] 
[[p n fs] [p n fs p 1 <=] pounce]
[[p n fs] [fs] pounce]
[[p n fs] [p n % 0 == [p n / n n fs cons] [p n 1 + fs] if-else] pounce]
[] linrec
`, [[7, 5, 3, 2]]);
allPassing &= testIt(`
3599 
[2 []] 
[[p n fs] [p n fs p 1 <=] pounce]
[[p n fs] [fs] pounce]
[[p n fs] [p n % 0 == [p n / n n fs cons] [p n 1 + fs] if-else] pounce]
[] linrec5
`, [[61, 59]]);


// test custom dictionaries
const program0 = "0 test5 swap";
const parsedProgram0 = parse(program0);
const customWords0 = {
  ...coreWords,
  "test5": {
    compose: (s) => {
      s.push(5);
      return [s];
    },
    // sig: [[], [{ type: 'number' }]],
  }
};
const [preProcessedProgram0, corePlusUserDefinedWords0] = preProcessDefs(parsedProgram0, customWords0); // coreWords);
const runner0 = interpreter(preProcessedProgram0, { wd: corePlusUserDefinedWords0 });
const result0 = runner0.next();
if (!(result0.value.active === false && result0.value.stack[0] === 5)) {
  console.log("hmmm", result0.value.stack);
}
allPassing &= (result0.value.active === false && result0.value.stack[0] === 5);


// set up a production configuration and test purr
const program1 = "0 increment increment decrement [1 +] [increment] compose [1 -] [decrement] compose";
const parsedProgram1 = parse(program1);
const [preProcessedProgram1, corePlusUserDefinedWords1] = preProcessDefs(parsedProgram1, coreWords);
const runner1 = purr(preProcessedProgram1, corePlusUserDefinedWords1);
const result1 = runner1.next();
allPassing &= (result1.value.active === false && result1.value.stack[0] === 1);

const program2 = "0 [ 1 +] 10000 times";
const parsedProgram2 = parse(program2);
const [preProcessedProgram2, corePlusUserDefinedWords2] = preProcessDefs(parsedProgram2, coreWords);
const runner2 = purr(preProcessedProgram2, corePlusUserDefinedWords2, 100);
const result2 = runner2.next();
allPassing &= (result2.value.active === false && result2.value.stack[0] === undefined && result2.value.cyclesConsumed === 100);
// ... a pounce program that did not finish should be ready to be continued (without parsing)
const parsedProgram3 = result2.value.prog;
const [preProcessedProgram3, corePlusUserDefinedWords3] = preProcessDefs(parsedProgram3, coreWords);
const runner3 = purr(preProcessedProgram3, corePlusUserDefinedWords3);
const result3 = runner3.next();
allPassing &= (result3.value.active === false && result3.value.stack[0] === 10000);

console.log("Pounce Tests Pass:", allPassing === 1);

// runDebug(`
// [3 8 5 7 10 2 9 1] [2 % 0 !=] filter
// `, 1);
