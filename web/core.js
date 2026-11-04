/**
 * Проект: Tiny AI XO 107601 | Файл: web/core.js
 * Автор: Beck Sarbassov | Версия: 2.0.0
 * Дата выпуска: 2026-10-29 | Последнее обновление: 2026-10-29
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Bounded 9x9 rules and episode validation. RU: Правила 9x9 и проверка партий.
 */
"use strict";
(() => {
  const SIZE=9, CELLS=81, MIN_RUN=5, DIRECTIONS=[[0,1],[1,0],[1,1],[1,-1]];
  function outcome(board) {
    let best={winner:0,length:0,cells:[],super:false};
    for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) {
      const player=board[r*SIZE+c]; if(!player) continue;
      for(const [dr,dc] of DIRECTIONS) {
        const pr=r-dr,pc=c-dc;
        if(pr>=0&&pr<SIZE&&pc>=0&&pc<SIZE&&board[pr*SIZE+pc]===player) continue;
        const cells=[]; let y=r,x=c;
        while(y>=0&&y<SIZE&&x>=0&&x<SIZE&&board[y*SIZE+x]===player) {cells.push(y*SIZE+x); y+=dr; x+=dc;}
        if(cells.length>=MIN_RUN) {
          if(best.winner&&best.winner!==player) throw new Error("Обе стороны не могут победить одновременно.");
          if(cells.length>best.length) best={winner:player,length:cells.length,cells,super:cells.length===9};
        }
      }
    }
    return {...best,done:best.winner!==0||!board.includes(0)};
  }
  const turn=b=>b.reduce((a,v)=>a+v,0)===0?1:-1;
  function validateBoard(b,active=true) {
    if(!Array.isArray(b)||b.length!==CELLS||b.some(v=>!Number.isInteger(v)||![-1,0,1].includes(v))) throw new Error("Нужна доска из 81 клетки: −1, 0 или 1.");
    const x=b.filter(v=>v===1).length,o=b.filter(v=>v===-1).length;
    if(x!==o&&x!==o+1) throw new Error("Нарушен порядок ходов: X начинает.");
    const result=outcome(b);
    if((result.winner===1&&x!==o+1)||(result.winner===-1&&x!==o)) throw new Error("Неверный победитель для числа ходов.");
    if(active&&result.done) throw new Error("Партия завершена.");
    return result;
  }
  const encode=b=>b.map(v=>v===1?"X":v===-1?"O":".").join("");
  function decode(text) {
    if(typeof text!=="string"||text.length!==CELLS||/[^XO.]/.test(text)) throw new Error("Неверная запись доски.");
    return Array.from(text,c=>c==="X"?1:c==="O"?-1:0);
  }
  function episodeRecords(episode) {
    if(!episode||typeof episode.id!=="string"||!episode.id.length||episode.id.length>100||
       !Array.isArray(episode.moves)||episode.moves.length<1||episode.moves.length>CELLS||
       ![1,-1,0].includes(episode.ai)||!Number.isInteger(episode.ai)||
       ![1,-1,0].includes(episode.winner)||!Number.isInteger(episode.winner)) throw new Error("Некорректная партия.");
    const b=Array(CELLS).fill(0),records=[];
    for(const action of episode.moves) {
      if(outcome(b).done||!Number.isInteger(action)||action<0||action>=CELLS||b[action]) throw new Error("В партии есть недопустимый ход.");
      records.push({state:encode(b),action,player:turn(b)}); b[action]=turn(b);
    }
    const result=outcome(b);
    if(!result.done||result.winner!==episode.winner) throw new Error("Учитываются только законченные партии с верным исходом.");
    // EN: Credit later decisions more strongly. RU: Поздние решения получают больший вес.
    const last=records.length-1;
    return {records:records.map((r,i)=>({state:r.state,action:r.action,
      reward:result.winner===0?0:(r.player===result.winner?1:-1)*Math.pow(.97,last-i)})),result};
  }
  function transform(state,action,symmetry) {
    const source=typeof state==="string"?decode(state):state, target=Array(CELLS).fill(0);
    const index=i=>{let r=Math.floor(i/SIZE),c=i%SIZE;if(symmetry>=4)c=SIZE-1-c;
      for(let k=0;k<symmetry%4;k++){const q=r;r=c;c=SIZE-1-q;} return r*SIZE+c;};
    source.forEach((v,i)=>{target[index(i)]=v;});
    return {board:target,action:index(action)};
  }
  globalThis.XORules=Object.freeze({SIZE,CELLS,MIN_RUN,DIRECTIONS,outcome,turn,validateBoard,encode,decode,episodeRecords,transform});
})();
