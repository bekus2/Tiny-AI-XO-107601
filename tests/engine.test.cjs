/**
 * Проект: Tiny AI XO 107601 | Файл: tests/engine.test.cjs
 * Автор: Beck Sarbassov | Версия: 2.1.0
 * Дата выпуска: 2026-10-29 | Последнее обновление: 2026-11-05
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Rules, learning, preservation and published checkpoint checks.
 * RU: Проверки правил, обучения, сохранения опыта и опубликованной модели.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
require('../web/core.js');require('../web/neural.js');require('../web/learner.js');
require('../web/bootstrap.js');require('../web/storage.js');
const R=XORules,N=XONeural,L=XOLearning;
const empty=()=>Array(81).fill(0);
const win={id:'test-win',moves:[0,72,1,74,2,76,3,78,4],winner:1,ai:-1,date:'2026-10-29T10:00:00.000Z'};
const superWin={...win,id:'test-super',moves:[0,9,1,11,2,13,3,15,5,17,6,27,7,29,8,31,4]};
const fingerprint=w=>Buffer.from(w.buffer,w.byteOffset,w.byteLength).toString('base64');
test('81→256→256→81 has exactly 107601 parameters and 430404 float32 bytes',()=>{
 assert.equal(N.COUNT,81*256+256+256*256+256+256*81+81);assert.equal(N.LAYERS.length,3);
 const w=N.initialWeights();assert.equal(w.byteLength,430404);assert(w.every(Number.isFinite));
 assert.equal(fingerprint(w),fingerprint(N.initialWeights()));assert.notEqual(fingerprint(w),fingerprint(N.initialWeights(42)));
});
test('all four directions recognize every length 5–9 without stopping at five',()=>{
 for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]])for(let length=5;length<=9;length++){
  const b=empty();for(let k=0;k<length;k++)b[k*dr*9+(dc<0?8:0)+k*dc]=1;
  const result=R.outcome(b);assert.equal(result.winner,1);assert.equal(result.length,length);assert.equal(result.super,length===9);
 }
});
test('lines cannot wrap rows or skip empty cells',()=>{
 for(const indices of [[7,8,9,10,11],[0,1,2,4,5],[0,10,20,40,50]]){
  const b=empty();indices.forEach(i=>b[i]=1);assert.equal(R.outcome(b).winner,0);
 }
});
test('a valid final gap-closing move can create a nine-in-a-row super win',()=>{
 const {records,result}=R.episodeRecords(superWin);assert.equal(records.length,17);assert.equal(result.length,9);assert.equal(result.super,true);
 const b=empty();superWin.moves.slice(0,-1).forEach(i=>{b[i]=R.turn(b);});assert.equal(R.outcome(b).done,false);
});
test('strict board counts, dimensions and simultaneous winners',()=>{
 for(const b of [[],Array(80).fill(0),[true,...Array(80).fill(0)],[-1,...Array(80).fill(0)]])assert.throws(()=>R.validateBoard(b));
 const b=empty();for(let i=0;i<5;i++){b[i]=1;b[72+i]=-1;}assert.throws(()=>R.outcome(b));
});
test('finished positions cannot be sent to the neural policy',()=>{
 const b=empty();win.moves.forEach(i=>{b[i]=R.turn(b);});assert.throws(()=>new N.Network().policy(b));
});
test('unfinished, occupied-cell, false-outcome and post-win episodes are rejected',()=>{
 for(const e of [{...win,moves:[0,72]},{...win,moves:[0,0]},{...win,winner:-1},{...win,moves:[...win.moves,10,11]}])assert.throws(()=>R.episodeRecords(e));
});
test('each of eight symmetries preserves occupancy and transforms the selected move',()=>{
 const b=empty();b[0]=1;b[72]=-1;
 for(let s=0;s<8;s++){const x=R.transform(R.encode(b),1,s);assert.equal(x.board.filter(v=>v===1).length,1);assert.equal(x.board.filter(v=>v===-1).length,1);assert.equal(x.board[x.action],0);}
});
test('occupied cells have zero probability; free probabilities sum to one',()=>{
 const b=empty();b[0]=1;b[72]=-1;const p=new N.Network().policy(b);
 assert.equal(p.scores[0],0);assert.equal(p.scores[72],0);assert(Math.abs(p.scores.reduce((a,b)=>a+b,0)-1)<1e-12);assert.equal(b[p.move],0);
});
test('gradient finite differences cover weights and biases of all three layers',()=>{
 const net=new N.Network(),b=empty();b[0]=1;b[72]=-1;
 const g=net.gradient(b,1,.8,.003).gradient;let maxError=0;
 const indices=N.LAYERS.flatMap(l=>[l.weights,l.weights+1,l.weights+l.output-1,l.weights+l.input*l.output-1,l.bias,l.bias+l.output-1]);
 for(const i of indices){const old=net.weights[i];net.weights[i]=old+.001;const high=net.weights[i],hi=net.gradient(b,1,.8,.003).loss;
  net.weights[i]=old-.001;const low=net.weights[i],lo=net.gradient(b,1,.8,.003).loss;net.weights[i]=old;
  maxError=Math.max(maxError,Math.abs((hi-lo)/(high-low)-g[i]));}
 assert(maxError<1e-5,`finite-difference error ${maxError}`);
});
test('positive reward increases selected probability; negative reward decreases it',()=>{
 for(const reward of [1,-1]){const net=new N.Network(),opt=new N.Adam(),b=empty();b[0]=1;b[72]=-1;
  const before=net.policy(b).scores[1];opt.apply(net.weights,net.gradient(b,1,reward,0).gradient,1);
  const after=net.policy(b).scores[1];assert(reward>0?after>before:after<before);}
});
test('a completed loss changes real weights, records both players, and increments true metrics',async()=>{
 const agent=new L.Learner(),before=fingerprint(agent.network.weights);const result=await agent.learn(win);
 assert.notEqual(fingerprint(agent.network.weights),before);assert.equal(result.updates,6);assert.equal(agent.optimizer.step,6);
 assert.equal(agent.stats.examples,48);assert.equal(agent.stats.games,1);assert.equal(agent.stats.humanWins,1);
 assert(agent.replay.some(r=>r.reward>0));assert(agent.replay.some(r=>r.reward<0));assert.equal(agent.history.length,1);
});
test('duplicate notifications and aborted games do not modify weights or counters',async()=>{
 const agent=new L.Learner();await assert.rejects(agent.learn({...win,moves:[0]}));assert.equal(agent.stats.games,0);
 await agent.learn(win);const before=JSON.stringify(agent.snapshot());const r=await agent.learn(win);assert.equal(r.duplicate,true);assert.equal(JSON.stringify(agent.snapshot()),before);
});
test('a draw is remembered with zero reward and no invented weight updates',async()=>{
 const b=Array.from({length:81},(_,i)=>(Math.floor(i/9)+2*(i%9))%4<2?1:-1);
 assert.equal(R.outcome(b).winner,0);const x=b.flatMap((v,i)=>v===1?[i]:[]),o=b.flatMap((v,i)=>v===-1?[i]:[]),moves=[];
 for(let i=0;i<x.length;i++){moves.push(x[i]);if(o[i]!==undefined)moves.push(o[i]);}
 const agent=new L.Learner(),before=fingerprint(agent.network.weights),r=await agent.learn({...win,id:'draw',moves,winner:0});
 assert.equal(r.updates,0);assert.equal(fingerprint(agent.network.weights),before);assert.equal(agent.stats.draws,1);assert.equal(agent.stats.humanDraws,1);assert.equal(agent.replay.length,81);
});
test('export/import restores exact float32 weights, Adam, RNG, replay and metrics',async()=>{
 const a=new L.Learner();await a.learn(superWin);const s=a.snapshot(),b=new L.Learner(JSON.parse(JSON.stringify(s)));
 assert.deepEqual(b.snapshot(),s);assert.equal(b.stats.superWins,1);assert.equal(b.history[0].length,9);
});
test('corrupt vector, schema, counters and excessive memory are rejected without partial mutation',()=>{
 const a=new L.Learner(),s=a.snapshot(),before=fingerprint(a.network.weights);
 for(const bad of [{...s,parameter_count:617},{...s,weights:'bad'},{...s,stats:{...s.stats,games:1}},
  {...s,replay:Array(L.MAX_REPLAY+1).fill({})},{...s,history:Array(L.MAX_HISTORY+1).fill({})}])assert.throws(()=>a.load(bad));
 assert.equal(fingerprint(a.network.weights),before);
 const nan=N.initialWeights();nan[0]=NaN;assert.throws(()=>a.load({...s,weights:N.pack(nan)}));
});
test('checkpoint validation rejects occupied replay moves and illegal history',async()=>{
 const a=new L.Learner();await a.learn(win);const s=a.snapshot();
 assert.throws(()=>new L.Learner({...s,replay:[{state:'X'+'.'.repeat(80),action:0,reward:1}]}));
 assert.throws(()=>new L.Learner({...s,history:[{...win,moves:[0],length:5,super:false}]}));
});
test('published checkpoint is the exact Sites 318-game export and contains no previous model artifacts',()=>{
 const root=path.resolve(__dirname,'..'),m=JSON.parse(fs.readFileSync(path.join(root,'model/manifest.json'),'utf8'));
 assert.equal(m.pretrained,true);assert.equal(m.preliminary_training_performed,false);assert.equal(m.starting_games,318);assert.equal(m.parameter_count,N.COUNT);
 const bytes=fs.readFileSync(path.join(root,m.bundled_checkpoint.path));
 const digest=require('node:crypto').createHash('sha256').update(bytes).digest('hex');
 assert.equal(digest,'eb1d3df7e1fd1a1d6dd5db890cf79959da604e8f7e2b7289ff11b99a2a190863');
 assert.equal(digest,m.bundled_checkpoint.sha256);
 const a=new L.Learner(JSON.parse(bytes.toString('utf8')));
 assert.equal(a.stats.games,318);assert.equal(a.stats.selfGames,316);assert.equal(a.stats.humanGames,2);
 assert.equal(a.optimizer.step,1908);assert.equal(a.stats.examples,15264);
 assert.equal(a.replay.length,2048);assert.equal(a.history.length,200);
 for(const file of ['legacy','model/weights.f32','model/positions.json','tiny_xo.py','train.py'])assert.equal(fs.existsSync(path.join(root,file)),false);
});
const bundledText=()=>fs.readFileSync(path.join(__dirname,'../model/checkpoint-318.json'),'utf8');
test('fresh startup uses all bundled weights, optimizer state and remembered experience',()=>{
 const startup=XOBootstrap.resolve(null,bundledText);
 assert.equal(startup.source,'bundled');assert.equal(startup.learner.stats.games,318);
 assert.deepEqual(startup.learner.snapshot(),JSON.parse(bundledText()));
});
test('personal experience wins without even reading the bundled model',async()=>{
 const a=new L.Learner();await a.learn(win);const personal=a.snapshot();
 const startup=XOBootstrap.resolve(personal,()=>{throw new Error('Seed must not be read');});
 assert.equal(startup.source,'saved');assert.deepEqual(startup.learner.snapshot(),personal);
});
test('a corrupt personal checkpoint fails rather than silently loading the bundled model',()=>{
 for(const bad of [false,undefined,{},[],{...new L.Learner().snapshot(),weights:'broken'}]){
  let read=false;assert.throws(()=>XOBootstrap.resolve(bad,()=>{read=true;return bundledText();}));assert.equal(read,false);
 }
});
test('a confirmed zero-game reset survives save and reload instead of reverting to 185 games',async()=>{
 const previous=globalThis.localStorage,records=new Map();
 globalThis.localStorage={getItem:key=>records.get(key)??null,setItem:(key,value)=>records.set(key,value),removeItem:key=>records.delete(key)};
 try{
  const store=new XOStorage.LocalStore();store.mode='localStorage';
  await store.save(XOBootstrap.resolve(await store.load(),bundledText).checkpoint);
  const zero=new L.Learner().snapshot();await store.reset();await store.save(zero);
  const reloaded=new XOStorage.LocalStore();reloaded.mode='localStorage';
  const startup=XOBootstrap.resolve(await reloaded.load(),()=>{throw new Error('Reset must survive reload');});
  assert.equal(startup.source,'saved');assert.equal(startup.learner.stats.games,0);
  assert.deepEqual(startup.learner.snapshot(),zero);
 }finally{if(previous===undefined)delete globalThis.localStorage;else globalThis.localStorage=previous;}
});
