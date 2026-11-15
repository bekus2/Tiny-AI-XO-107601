const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../web/core.js');require('../web/tactics.js');
const policy={scores:Array(81).fill(0)};
test('strong mode takes an immediate win and leaves the board unchanged',()=>{
 const b=Array(81).fill(0);[0,1,2,3].forEach(i=>b[i]=1);[9,11,13,15].forEach(i=>b[i]=-1);
 const before=b.slice(),choice=XOTactics.choose(b,policy);assert.equal(choice.move,4);assert.equal(choice.reason,'win');assert.deepEqual(b,before);
});
test('strong mode blocks a unique immediate threat',()=>{
 const b=Array(81).fill(0);[0,1,2,3].forEach(i=>b[i]=1);[20,30,40].forEach(i=>b[i]=-1);
 const choice=XOTactics.choose(b,policy);assert.equal(choice.move,4);assert.equal(choice.reason,'block');
});
test('bounded search returns a legal move without mutating its input',()=>{
 const b=Array(81).fill(0);b[40]=1;const before=b.slice();
 const choice=XOTactics.choose(b,policy,{maxNodes:100,timeMs:20});assert.equal(b[choice.move],0);assert.deepEqual(b,before);assert.ok(choice.nodes<=101);
});
