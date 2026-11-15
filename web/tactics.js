/**
 * Проект: Tiny AI XO 107601 | Файл: web/tactics.js
 * Автор проекта: Beck Sarbassov | Последнее обновление: 2026-11-09
 * © Beck Sarbassov. Все права защищены.
 * EN: Bounded tactical search with neural move ordering.
 * RU: Ограниченный поиск с учётом оценок нейросети.
 */
"use strict";
(() => {
  const {SIZE, CELLS, MIN_RUN, DIRECTIONS, turn}=XORules;
  const windows=[], containing=Array.from({length:CELLS},()=>[]);
  for(let row=0;row<SIZE;row++) for(let col=0;col<SIZE;col++) {
    for(const [dy,dx] of DIRECTIONS) {
      const endRow=row+(MIN_RUN-1)*dy,endCol=col+(MIN_RUN-1)*dx;
      if(endRow<0||endRow>=SIZE||endCol<0||endCol>=SIZE) continue;
      const line=Array.from({length:MIN_RUN},(_,i)=>(row+i*dy)*SIZE+col+i*dx);
      for(const cell of line) containing[cell].push(windows.length);
      windows.push(line);
    }
  }
  const VALUE=[0,3,19,115,770,40000],WIN=1000000;
  const center=(SIZE-1)/2;
  const centrality=Array.from({length:CELLS},(_,i)=>SIZE-Math.abs(Math.floor(i/SIZE)-center)-Math.abs(i%SIZE-center));
  function scan(board,side,policy){
    const own=new Uint8Array(windows.length),other=new Uint8Array(windows.length);
    let value=0;
    for(let i=0;i<windows.length;i++) {
      for(const cell of windows[i]) {
        const v=board[cell]*side;
        own[i]+=v===1;other[i]+=v===-1;
      }
      if(!other[i]) value+=VALUE[own[i]];
      if(!own[i]) value-=VALUE[other[i]];
    }
    const wins=[],blocks=[],moves=[];
    for(let cell=0;cell<CELLS;cell++) {
      if(board[cell]) continue;
      let gain=centrality[cell]+(policy?.scores[cell]||0)*22;
      for(const i of containing[cell]) {
        if(!other[i]) {
          gain+=VALUE[own[i]+1]-VALUE[own[i]];
          if(own[i]===MIN_RUN-1&&wins.at(-1)!==cell) wins.push(cell);
        }
        if(!own[i]) {
          gain+=1.02*(VALUE[other[i]+1]-VALUE[other[i]]);
          if(other[i]===MIN_RUN-1&&blocks.at(-1)!==cell) blocks.push(cell);
        }
      }
      moves.push({cell,gain});
    }
    moves.sort((a,b)=>b.gain-a.gain);
    return {wins,blocks,moves,value};
  }
  function choose(board,policy,{maxNodes=360,timeMs=45}={}){
    const position=board.slice(),player=turn(position),deadline=performance.now()+timeMs;
    let nodes=0,aborted=false;
    function evaluate(side,depth,alpha,beta,ply){
      if(++nodes>maxNodes||performance.now()>deadline){aborted=true;return 0;}
      const {wins,blocks,moves,value}=scan(position,side);
      if(wins.length) return WIN-ply;
      if(!moves.length) return 0;
      if(blocks.length>1) return -WIN+ply+1;
      if(depth===0) return value-250*blocks.length;
      const options=blocks.length?blocks:moves.slice(0,6).map(move=>move.cell);
      let best=-Infinity;
      for(const cell of options) {
        position[cell]=side;
        const score=-evaluate(-side,depth-1,-beta,-alpha,ply+1);
        position[cell]=0;
        if(aborted) return 0;
        best=Math.max(best,score);
        alpha=Math.max(alpha,score);
        if(alpha>=beta) break;
      }
      return best;
    }
    const {wins,blocks,moves}=scan(position,player,policy);
    if(wins.length) return {move:wins.reduce((a,b)=>policy.scores[b]>policy.scores[a]?b:a),reason:"win",nodes};
    if(blocks.length===1) return {move:blocks[0],reason:"block",nodes};
    if(!moves.length) throw new Error("Нет свободных клеток.");
    const options=moves.slice(0,10);
    let move=options[0].cell;
    for(let depth=1;depth<=3;depth++) {
      let best=-Infinity,next=move;
      // Evaluate the previous iteration's best move first to sharpen pruning.
      const ordered=options.slice().sort((a,b)=>Number(b.cell===move)-Number(a.cell===move));
      for(const option of ordered) {
        position[option.cell]=player;
        const score=-evaluate(-player,depth-1,-Infinity,-best,1);
        position[option.cell]=0;
        if(aborted) break;
        if(score>best){best=score;next=option.cell;}
      }
      // Keep the best move from the last fully evaluated depth if the budget expires.
      if(aborted) break;
      move=next;
      if(best>=WIN-4) break;
    }
    return {move,reason:"search",nodes};
  }
  globalThis.XOTactics=Object.freeze({choose});
})();

