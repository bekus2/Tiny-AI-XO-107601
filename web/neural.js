/**
 * Проект: Tiny AI XO 107601 | Файл: web/neural.js
 * Автор: Beck Sarbassov | Версия: 2.0.0
 * Дата выпуска: 2026-10-29 | Последнее обновление: 2026-10-29
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Exact MLP, gradients and Adam. RU: Точная MLP, градиенты и Adam.
 */
"use strict";
(() => {
  const DIMS=[81,256,256,81], COUNT=107601, LAYERS=[];
  let offset=0;
  for(let i=0;i<3;i++){const input=DIMS[i],output=DIMS[i+1],weights=offset;offset+=input*output;
    const bias=offset;offset+=output;LAYERS.push({input,output,weights,bias});}
  if(offset!==COUNT) throw new Error("Parameter layout mismatch");
  function randomSource(seed=107601){let state=seed>>>0;return {next(){state=(state+0x6D2B79F5)>>>0;
    let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;},
    get state(){return state;},set state(v){state=v>>>0;}};}
  function initialWeights(seed=107601){const rng=randomSource(seed),w=new Float32Array(COUNT);
    for(const l of LAYERS){const limit=Math.sqrt(6/(l.input+l.output));
      for(let i=0;i<l.input*l.output;i++)w[l.weights+i]=(rng.next()*2-1)*limit;} return w;}
  function validateWeights(w){if(!(w instanceof Float32Array)||w.length!==COUNT||w.some(v=>!Number.isFinite(v)||Math.abs(v)>100))throw new Error("Нужны 107601 конечных весов в допустимом диапазоне.");}
  class Network {
    constructor(weights=initialWeights()){validateWeights(weights);this.weights=weights.slice();}
    forward(input){if(input.length!==81||Array.from(input).some(v=>![-1,0,1].includes(v))) throw new Error("Неверный вход сети.");
      const activations=[Float64Array.from(input)];
      for(let k=0;k<LAYERS.length;k++){const l=LAYERS[k],prev=activations[k],next=new Float64Array(l.output);
        for(let j=0;j<l.output;j++)next[j]=this.weights[l.bias+j];
        for(let i=0;i<l.input;i++){const v=prev[i],start=l.weights+i*l.output;if(!v)continue;
          for(let j=0;j<l.output;j++)next[j]+=v*this.weights[start+j];}
        if(k<2)for(let j=0;j<l.output;j++)next[j]=Math.tanh(next[j]);activations.push(next);}
      return {activations,logits:activations[3]};
    }
    policy(board,validate=true){if(validate)XORules.validateBoard(board);
      const player=XORules.turn(board),pass=this.forward(board.map(v=>v*player));
      let move=-1,maximum=-Infinity;
      board.forEach((v,i)=>{if(v===0&&pass.logits[i]>maximum){maximum=pass.logits[i];move=i;}});
      if(move<0)throw new Error("Нет свободных клеток.");
      const scores=new Float64Array(81);let total=0;
      board.forEach((v,i)=>{if(v===0){scores[i]=Math.exp(pass.logits[i]-maximum);total+=scores[i];}});
      for(let i=0;i<81;i++)scores[i]/=total;
      return {...pass,scores,move,player};
    }
    select(board,exploration=.15,rng=Math.random){const p=this.policy(board);
      const legal=board.map((v,i)=>v===0?i:-1).filter(i=>i>=0);
      if(rng()<exploration)return {move:legal[Math.floor(rng()*legal.length)],explored:true};
      return {move:p.move,explored:false};
    }
    gradient(board,action,reward,entropy=.003,accumulator=new Float64Array(COUNT)) {
      if(!Number.isInteger(action)||board[action]!==0||!Number.isFinite(reward)||Math.abs(reward)>1)throw new Error("Неверный обучающий пример.");
      const pass=this.policy(board),probs=pass.scores;
      let expectedLog=0;for(let i=0;i<81;i++)if(probs[i]>0)expectedLog+=probs[i]*Math.log(probs[i]);
      let delta=Float64Array.from(probs,(p,i)=>p>0?reward*(p-(i===action?1:0))+entropy*p*(Math.log(p)-expectedLog):0);
      const loss=-reward*Math.log(Math.max(1e-300,probs[action]))+entropy*expectedLog;
      // EN: Backpropagate through both tanh layers, using pre-update weights.
      // RU: Обратный проход через оба tanh-слоя до обновления весов.
      for(let k=2;k>=0;k--){const l=LAYERS[k],previous=pass.activations[k],back=k?new Float64Array(l.input):null;
        for(let j=0;j<l.output;j++)accumulator[l.bias+j]+=delta[j];
        for(let i=0;i<l.input;i++){const start=l.weights+i*l.output;let sum=0;
          for(let j=0;j<l.output;j++){accumulator[start+j]+=previous[i]*delta[j];if(back)sum+=this.weights[start+j]*delta[j];}
          if(back)back[i]=sum*(1-previous[i]*previous[i]);}delta=back;}
      return {loss,gradient:accumulator};
    }
  }
  class Adam {
    constructor(first=new Float32Array(COUNT),second=new Float32Array(COUNT),step=0){
      if(first.length!==COUNT||second.length!==COUNT||!Number.isSafeInteger(step)||step<0||first.some(v=>!Number.isFinite(v)||Math.abs(v)>1000)||second.some(v=>!Number.isFinite(v)||v<0||v>1000))throw new Error("Неверное состояние Adam.");
      this.first=first;this.second=second;this.step=step;}
    apply(weights,gradient,count,rate=.0003){let norm=0;for(let i=0;i<COUNT;i++){const v=gradient[i]/count;norm+=v*v;}
      const scale=Math.min(1,1/Math.sqrt(norm||1))/count;
      this.step++;const c1=1-Math.pow(.9,this.step),c2=1-Math.pow(.999,this.step);
      for(let i=0;i<COUNT;i++){const g=gradient[i]*scale;this.first[i]=.9*this.first[i]+.1*g;this.second[i]=.999*this.second[i]+.001*g*g;
        weights[i]-=rate*(this.first[i]/c1)/(Math.sqrt(this.second[i]/c2)+1e-8);}
      validateWeights(weights);
    }
  }
  function pack(vector){const bytes=new Uint8Array(COUNT*4),view=new DataView(bytes.buffer);
    for(let i=0;i<COUNT;i++)view.setFloat32(i*4,vector[i],true);
    let binary="";for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
  function unpack(text){if(typeof text!=="string"||text.length!==4*Math.ceil(COUNT*4/3)||!/^[A-Za-z0-9+/]*={0,2}$/.test(text))throw new Error("Неверный блок float32.");
    const binary=atob(text);if(binary.length!==COUNT*4)throw new Error("Неверное число параметров.");
    const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0)),view=new DataView(bytes.buffer),result=new Float32Array(COUNT);
    for(let i=0;i<COUNT;i++)result[i]=view.getFloat32(i*4,true);return result;}
  globalThis.XONeural=Object.freeze({DIMS:Object.freeze(DIMS),COUNT,LAYERS,randomSource,initialWeights,validateWeights,Network,Adam,pack,unpack});
})();
