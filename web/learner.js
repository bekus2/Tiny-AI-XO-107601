/**
 * Проект: Tiny AI XO 107601 | Файл: web/learner.js
 * Автор: Beck Sarbassov | Версия: 2.0.0
 * Дата выпуска: 2026-10-29 | Последнее обновление: 2026-10-29
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Outcome-driven online learning and bounded replay. RU: Обучение по исходам и память.
 */
"use strict";
(() => {
  const FORMAT="tiny-ai-xo-online-v2",MAX_REPLAY=2048,MAX_HISTORY=200,BATCH=8,UPDATES=6;
  const STAT_KEYS=["games","humanGames","selfGames","aiWins","humanWins","humanDraws","draws","winsX","winsO","superWins","examples"];
  const newStats=()=>Object.fromEntries(STAT_KEYS.map(k=>[k,0]));
  class Learner {
    constructor(snapshot=null){this.network=new XONeural.Network();this.optimizer=new XONeural.Adam();
      this.rng=XONeural.randomSource(107602);this.stats=newStats();this.replay=[];this.history=[];
      if(snapshot)this.load(snapshot);}
    load(s){
      if(!s||s.format!==FORMAT||String(s.architecture)!=="81,256,256,81"||s.parameter_count!==XONeural.COUNT||s.encoding!=="float32-le-base64"||
         !s.optimizer||!Number.isInteger(s.rng)||s.rng<0||s.rng>4294967295||
         !s.stats||STAT_KEYS.some(k=>!Number.isSafeInteger(s.stats[k])||s.stats[k]<0)||
         !Array.isArray(s.replay)||s.replay.length>MAX_REPLAY||!Array.isArray(s.history)||s.history.length>MAX_HISTORY)throw new Error("Несовместимый или повреждённый файл опыта.");
      if(s.stats.games!==s.stats.humanGames+s.stats.selfGames||s.stats.games!==s.stats.winsX+s.stats.winsO+s.stats.draws||
         s.stats.humanGames!==s.stats.aiWins+s.stats.humanWins+s.stats.humanDraws||s.stats.superWins>s.stats.games||
         s.stats.examples!==s.optimizer.step*BATCH||s.optimizer.step>s.stats.games*UPDATES||s.history.length>s.stats.games)throw new Error("Неверные счётчики партий.");
      const weights=XONeural.unpack(s.weights);XONeural.validateWeights(weights);
      const optimizer=new XONeural.Adam(XONeural.unpack(s.optimizer.first),XONeural.unpack(s.optimizer.second),s.optimizer.step);
      const replay=s.replay.map(r=>{if(!r||!Number.isInteger(r.action)||r.action<0||r.action>=81||!Number.isFinite(r.reward)||Math.abs(r.reward)>1)throw new Error("Некорректная память позиции.");
        const board=XORules.decode(r.state);XORules.validateBoard(board);if(board[r.action]!==0)throw new Error("В памяти занятая клетка.");
        return {state:r.state,action:r.action,reward:r.reward};});
      const ids=new Set(),history=s.history.map(h=>{if(!h||ids.has(h.id)||typeof h.date!=="string"||h.date.length>40||!Number.isFinite(Date.parse(h.date)))throw new Error("Неверный журнал партий.");
        const {result}=XORules.episodeRecords(h);ids.add(h.id);return {id:h.id,moves:h.moves.slice(),winner:h.winner,ai:h.ai,date:h.date,length:result.length,super:result.super};});
      this.network=new XONeural.Network(weights);this.optimizer=optimizer;this.replay=replay;this.history=history;
      this.stats=Object.fromEntries(STAT_KEYS.map(k=>[k,s.stats[k]]));this.rng.state=s.rng;
    }
    snapshot(){return {format:FORMAT,name:"Tiny AI XO 107601",version:"2.0.0",author:"Beck Sarbassov",architecture:[81,256,256,81],parameter_count:XONeural.COUNT,
      encoding:"float32-le-base64",weights:XONeural.pack(this.network.weights),
      optimizer:{first:XONeural.pack(this.optimizer.first),second:XONeural.pack(this.optimizer.second),step:this.optimizer.step},rng:this.rng.state,
      stats:{...this.stats},replay:this.replay.map(r=>({...r})),history:this.history.map(h=>({...h,moves:h.moves.slice()}))};}
    async learn(episode,progress=()=>{},yieldStep=()=>Promise.resolve()) {
      if(this.history.some(h=>h.id===episode.id))return {duplicate:true,updates:0,examples:0};
      const {records,result}=XORules.episodeRecords(episode);
      const date=typeof episode.date==="string"&&Number.isFinite(Date.parse(episode.date))?episode.date:new Date().toISOString();
      const trainable=records.filter(r=>r.reward!==0);
      this.replay.push(...records);this.replay=this.replay.slice(-MAX_REPLAY);
      const pool=this.replay.filter(r=>r.reward!==0);let loss=0,examples=0,updates=0;
      if(trainable.length)for(let batch=0;batch<UPDATES;batch++) {
        const gradients=new Float64Array(XONeural.COUNT);
        for(let i=0;i<BATCH;i++) {
          const source=this.rng.next()<.65?trainable:pool,sample=source[Math.floor(this.rng.next()*source.length)];
          const transformed=XORules.transform(sample.state,sample.action,Math.floor(this.rng.next()*8));
          loss+=this.network.gradient(transformed.board,transformed.action,sample.reward,.003,gradients).loss;examples++;
        }
        this.optimizer.apply(this.network.weights,gradients,BATCH);updates++;progress({updates,examples});await yieldStep();
      }
      const s=this.stats;s.games++;s[episode.ai===0?"selfGames":"humanGames"]++;
      if(result.winner===0){s.draws++;if(episode.ai!==0)s.humanDraws++;}else {s[result.winner===1?"winsX":"winsO"]++;
        if(episode.ai!==0)s[result.winner===episode.ai?"aiWins":"humanWins"]++;if(result.super)s.superWins++;}
      s.examples+=examples;
      this.history.push({id:episode.id,moves:episode.moves.slice(),winner:result.winner,ai:episode.ai,date,length:result.length,super:result.super});
      this.history=this.history.slice(-MAX_HISTORY);
      return {duplicate:false,updates,examples,loss:examples?loss/examples:0,winner:result.winner,length:result.length};
    }
  }
  globalThis.XOLearning=Object.freeze({Learner,FORMAT,MAX_REPLAY,MAX_HISTORY,BATCH,UPDATES,STAT_KEYS});
})();
