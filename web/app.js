/**
 * Проект: Tiny AI XO 107601 | Файл: web/app.js
 * Автор: Beck Sarbassov | Версия: 2.1.0
 * Дата выпуска: 2026-10-29 | Последнее обновление: 2026-11-15
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Play, learn, persist and transfer local experience. RU: Игра, обучение и локальный опыт.
 */
"use strict";
(() => {
  const $=id=>document.getElementById(id),R=XORules;
  XOText.init();
  const n=value=>Number(value).toLocaleString(XOText.locale);
  const t=(key,variables={})=>XOText.t(key,Object.fromEntries(Object.entries(variables).map(([name,value])=>[name,typeof value==="number"?n(value):value])));
  const writeText=(id,value)=>{const element=$(id);if(element.textContent!==value)element.textContent=value;};
  const client=new XOClient($("worker-source").textContent),store=new XOStorage.LocalStore();
  let checkpoint=null,network=null,ready=false,busy=false,dirty=false,blocked=false;
  let board=Array(81).fill(0),moves=[],human=1,last=-1,timer=null,generation=0,completed=false,auto=false,showScores=false;
  let imported=null,confirmAction=null,session=0,dialogPaused=false,importFilename="";
  let notice=null,learningNote={key:"runtime.learning.initial",variables:{}};
  // EN: Keep message identities, not rendered strings, so switching languages preserves live state.
  // RU: Храним ключи сообщений, а не готовый текст: язык меняется без сброса состояния.
  const errorKeys=new Map(Object.entries(XOGameMessages.ru).filter(([key])=>key.startsWith("runtime.error.")).map(([key,text])=>[text,key]));
  errorKeys.set("Parameter layout mismatch","runtime.error.layout");
  function errorText(error){
    if(error?.localeKey&&Object.hasOwn(XOGameMessages.ru,error.localeKey))return t(error.localeKey);
    const key=errorKeys.get(typeof error==="string"?error:error?.message);
    if(key)return t(key);
    const native={SyntaxError:"json",QuotaExceededError:"quota",SecurityError:"access",NotAllowedError:"access",InvalidStateError:"unavailable",AbortError:"cancelled"};
    return t(`runtime.error.${native[error?.name]||"unknown"}`);
  }
  function renderNotice(){
    $("notice").hidden=!notice;writeText("notice",notice?t(notice.key,{...notice.variables,...(notice.reason?{reason:errorText(notice.reason)}:{})}):"");
    $("notice").classList.toggle("error",Boolean(notice?.error));
  }
  function message(key,error=false,variables={},reason=null){notice=key?{key,error,variables,reason}:null;renderNotice();}
  function setLearning(key,variables={}){learningNote={key,variables};writeText("learning-note",t(key,variables));}
  function renderDialog(){
    if(!confirmAction)return;
    writeText("confirm-title",t(`runtime.dialog.${confirmAction}Title`));
    writeText("confirm-text",t(`runtime.dialog.${confirmAction}Text`,{filename:importFilename}));
  }
  const cells=[];
  for(let i=0;i<81;i++){
    const b=document.createElement("button");b.type="button";b.className="cell";b.dataset.cell=String(i);
    const mark=document.createElement("span");mark.className="mark";mark.setAttribute("aria-hidden","true");
    const score=document.createElement("span");score.className="cell-score";score.hidden=true;score.setAttribute("aria-hidden","true");b.append(mark,score);
    b.addEventListener("click",()=>humanMove(i));
    b.addEventListener("keydown",e=>{if(!["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key))return;e.preventDefault();
      const d={ArrowUp:-9,ArrowDown:9,ArrowLeft:-1,ArrowRight:1}[e.key];let index=i;
      for(let n=0;n<81;n++){index=(index+d+81)%81;if(!cells[index].disabled){cells[index].focus();break;}}});
    cells.push(b);$("board").append(b);
  }
  function metrics(){if(!checkpoint)return;const s=checkpoint.stats;
    $("games-count").textContent=n(s.games);$("updates-count").textContent=n(checkpoint.optimizer.step);$("memory-count").textContent=`${n(checkpoint.replay.length)} / ${n(2048)}`;
    $("score-human").textContent=n(s.humanWins);$("score-ai").textContent=n(s.aiWins);$("score-draw").textContent=n(s.humanDraws);
    $("self-count").textContent=n(s.selfGames);$("example-count").textContent=n(s.examples);
    $("learning-level").textContent=s.games===0?t("runtime.experience.zero"):t("runtime.experience.games",{games:s.games});
    $("storage-state").textContent=dirty?t("runtime.storage.unsaved"):store.mode==="memory"?t("runtime.storage.memory"):t("runtime.storage.saved",{storage:store.mode==="indexedDB"?"IndexedDB":t("runtime.storage.fallback")});
    $("retry-save").hidden=!dirty||store.mode==="memory";
    const list=$("history");list.replaceChildren();
    if(!checkpoint.history.length){const p=document.createElement("p");p.className="muted";p.textContent=t("runtime.history.empty");list.append(p);}
    for(const h of checkpoint.history.slice(-12).reverse()){
      const item=document.createElement("li"),title=document.createElement("span"),detail=document.createElement("small");
      const winner=h.winner===1?"X":"O";
      title.textContent=h.winner===0?t("runtime.result.draw"):t(h.super?"runtime.history.super":"runtime.history.win",{winner,length:h.length});
      const kind=t(h.ai===0?"runtime.history.self":h.winner===0?"runtime.history.human":h.winner===h.ai?"runtime.history.aiWin":"runtime.history.humanWin");
      detail.textContent=t("runtime.history.detail",{kind,moves:h.moves.length,date:new Date(h.date).toLocaleString(XOText.locale,{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})});
      item.append(title,detail);list.append(item);
    }
  }
  function render(){const result=R.outcome(board),thinking=ready&&!busy&&!blocked&&!result.done&&(auto||R.turn(board)!==human);
    const p=ready&&!result.done&&network?network.policy(board):null,winning=new Set(result.cells);
    cells.forEach((button,i)=>{const mark=button.firstChild,symbol=board[i]===1?"X":board[i]===-1?"O":"";
      mark.textContent=symbol;mark.className="mark"+(symbol?(board[i]===1?" x":" o"):"");
      button.disabled=!ready||busy||blocked||dialogPaused||result.done||thinking||board[i]!==0;
      button.classList.toggle("winning",winning.has(i));button.classList.toggle("last-move",i===last);
      button.setAttribute("aria-label",t("runtime.cell",{row:Math.floor(i/9)+1,column:i%9+1,mark:symbol||t("runtime.cell.empty")}));
      const score=button.lastChild;score.hidden=!showScores||!p||board[i]!==0;score.textContent=p?`${n(Math.round(p.scores[i]*100))}%`:"";
    });
    $("choose-x").setAttribute("aria-pressed",String(human===1));$("choose-o").setAttribute("aria-pressed",String(human===-1));
    $("board").setAttribute("aria-busy",String(thinking||busy));
    $("status").classList.toggle("thinking",thinking||busy);
    $("status-text").textContent=blocked?t("runtime.status.blocked"):!ready?t("runtime.status.loading"):busy?t("runtime.status.learning"):dialogPaused?t("runtime.status.paused"):result.done?
      result.winner===0?t("runtime.result.draw"):t(result.super?"runtime.status.super":"runtime.status.win",{winner:result.winner===1?"X":"O",length:result.length}):
      auto?t("runtime.status.auto",{player:R.turn(board)===1?"X":"O"}):thinking?t("runtime.status.thinking"):t("runtime.status.yourTurn");
    for(const id of ["new-game","choose-x","choose-o","toggle-scores"])$(id).disabled=!ready||busy||blocked;
    $("auto-play").disabled=!ready||blocked;$("auto-play").textContent=t(auto?"runtime.auto.stop":"runtime.auto.start");$("auto-play").setAttribute("aria-pressed",String(auto));
    for(const id of ["export-model","import-model","reset-model"])$(id).disabled=busy||(!ready&&!blocked);
    $("toggle-scores").setAttribute("aria-pressed",String(showScores));$("toggle-scores").textContent=t(showScores?"runtime.scores.hide":"runtime.scores.show");
    $("move-count").textContent=t("runtime.moves",{moves:moves.length});
    const top=$("top-moves");top.replaceChildren();
    if(p){const ranked=Array.from(p.scores,(score,i)=>({score,i})).filter(v=>!board[v.i]).sort((a,b)=>b.score-a.score).slice(0,5);
      for(const item of ranked){const row=document.createElement("div"),label=document.createElement("span"),value=document.createElement("b");row.className="rating";
        label.textContent=`${String.fromCharCode(65+item.i%9)}${Math.floor(item.i/9)+1}`;value.textContent=`${(item.score*100).toLocaleString(XOText.locale,{minimumFractionDigits:1,maximumFractionDigits:1})}%`;
        const bar=document.createElement("span");bar.className="rating-bar";const fill=document.createElement("i");fill.style.width=`${item.score*100}%`;bar.append(fill);row.append(label,bar,value);top.append(row);}
    }else{const p=document.createElement("p");p.className="muted";p.textContent=t("runtime.policy.wait");top.append(p);}
    $("policy-label").textContent=p?t("runtime.policy.preferences",{player:R.turn(board)===1?"X":"O"}):t("runtime.policy.finished");
    metrics();
  }
  function cancel(){generation++;clearTimeout(timer);timer=null;}
  function newGame(side=human){if(!ready||busy||blocked||dialogPaused)return;cancel();human=side;board=Array(81).fill(0);moves=[];last=-1;completed=false;render();schedule();}
  function schedule(){if(!ready||busy||blocked||dialogPaused||R.outcome(board).done||(!auto&&R.turn(board)===human))return;
    const token=generation;timer=setTimeout(()=>{timer=null;if(token!==generation||busy||blocked)return;
      const exploration=Math.max(.05,.22/Math.sqrt(1+checkpoint.stats.games/40));const chosen=network.select(board,exploration);
      place(chosen.move);},auto?65:260);
  }
  function humanMove(i){if(!ready||busy||blocked||auto||completed||R.turn(board)!==human||board[i]!==0)return;place(i);}
  function place(i){if(R.outcome(board).done||board[i]!==0)return;board[i]=R.turn(board);moves.push(i);last=i;
    const result=R.outcome(board);render();if(result.done)void finish(result);else schedule();}
  async function persist(){try{const saved=await store.save(checkpoint);dirty=!saved;
      if(!saved)message(store.warning?"runtime.notice.reason":"runtime.notice.memory",true,{},store.warning||null);return saved;
    }catch(error){dirty=true;auto=false;message("runtime.notice.saveFailed",true,{},error);return false;}}
  async function finish(result){if(completed)return;completed=true;busy=true;render();
    const episode={id:`${Date.now()}-${++session}-${Math.random().toString(36).slice(2,9)}`,date:new Date().toISOString(),moves:moves.slice(),winner:result.winner,ai:auto?0:-human};
    try{const trained=await client.learn(episode,p=>setLearning("runtime.learning.progress",{updates:p.updates,examples:p.examples}));
      checkpoint=trained.snapshot;network=new XONeural.Network(XONeural.unpack(checkpoint.weights));
      setLearning(trained.result.updates?"runtime.learning.complete":"runtime.learning.draw",{examples:trained.result.examples,updates:trained.result.updates});
      await persist();
    }catch(error){auto=false;message("runtime.notice.learnFailed",true,{},error);await client.init(checkpoint);}
    finally{busy=false;render();if(auto){const token=generation;timer=setTimeout(()=>{if(auto&&token===generation)newGame();},600);}}
  }
  $("choose-x").addEventListener("click",()=>{auto=false;newGame(1);});$("choose-o").addEventListener("click",()=>{auto=false;newGame(-1);});
  $("new-game").addEventListener("click",()=>newGame());
  $("auto-play").addEventListener("click",()=>{auto=!auto;if(!busy)newGame();else render();});
  $("toggle-scores").addEventListener("click",()=>{showScores=!showScores;render();});
  $("about-link").addEventListener("click",()=>{$("learning-details").open=true;});
  $("retry-save").addEventListener("click",async()=>{await persist();render();});
  $("export-model").addEventListener("click",()=>{if(!checkpoint)return;const blob=new Blob([JSON.stringify(checkpoint)],{type:"application/json"}),url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`Tiny-AI-XO-107601-${checkpoint.stats.games}-games.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);});
  function pauseDialog(){dialogPaused=true;cancel();render();}
  function resumeDialog(){dialogPaused=false;if(auto&&R.outcome(board).done&&!busy)newGame();else{render();schedule();}}
  $("import-model").addEventListener("click",()=>{pauseDialog();$("import-file").click();});
  $("import-file").addEventListener("cancel",resumeDialog);
  $("import-file").addEventListener("change",async event=>{const file=event.target.files[0];event.target.value="";if(!file){resumeDialog();return;}pauseDialog();
    try{if(file.size>6*1024*1024){const error=new Error();error.localeKey="runtime.error.fileSize";throw error;}
      const parsed=JSON.parse(await file.text());new XOLearning.Learner(parsed);imported=parsed;confirmAction="import";importFilename=file.name;
      renderDialog();$("confirm-dialog").showModal();
    }catch(error){message("runtime.notice.importFailed",true,{},error);resumeDialog();}
  });
  $("reset-model").addEventListener("click",()=>{pauseDialog();confirmAction="reset";renderDialog();$("confirm-dialog").showModal();});
  $("confirm-cancel").addEventListener("click",()=>{$("confirm-dialog").close();imported=null;resumeDialog();});
  $("confirm-dialog").addEventListener("cancel",()=>{imported=null;resumeDialog();});
  $("confirm-yes").addEventListener("click",async()=>{
    $("confirm-dialog").close();auto=false;cancel();busy=true;render();
    try{const next=confirmAction==="import"?imported:new XOLearning.Learner().snapshot();await client.init(next);
      if(confirmAction==="reset")await store.reset();checkpoint=next;network=new XONeural.Network(XONeural.unpack(next.weights));blocked=false;ready=true;
      board=Array(81).fill(0);moves=[];completed=false;last=-1;message("");setLearning(confirmAction==="reset"?"runtime.learning.reset":"runtime.learning.imported");await persist();
    }catch(error){message("runtime.notice.replaceFailed",true,{},error);if(checkpoint)await client.init(checkpoint);}
    finally{busy=false;imported=null;dialogPaused=false;render();schedule();}
  });
  window.addEventListener("beforeunload",event=>{if(busy||dirty){event.preventDefault();event.returnValue="";}});
  // EN: Repaint only: no new game, timer restart, training or checkpoint write on language change.
  // RU: Только перерисовка: смена языка не запускает игру, таймер, обучение или запись опыта.
  document.addEventListener("xo-language-change",()=>{
    render();renderNotice();renderDialog();writeText("learning-note",t(learningNote.key,learningNote.variables));
  });
  window.xoApp=Object.freeze({state:()=>({board:board.slice(),moves:moves.slice(),human,auto,busy,ready,blocked,dirty,storage:store.mode,training:client.mode,stats:checkpoint?{...checkpoint.stats}:null,updates:checkpoint?.optimizer.step}),snapshot:()=>checkpoint?structuredClone(checkpoint):null});
  async function boot(){render();await store.open();try{
      const startup=XOBootstrap.resolve(await store.load(),()=>$("bundled-checkpoint").textContent);
      checkpoint=startup.checkpoint;network=startup.learner.network;
      await client.init(checkpoint);
      // EN: Seed only a new browser; saved zero-game resets also take precedence.
      // RU: Начальный опыт только для нового браузера; личный сброс до нуля имеет приоритет.
      if(startup.source==="bundled")await persist();
      ready=true;setLearning(startup.source==="saved"?"runtime.learning.saved":"runtime.learning.bundled",{games:checkpoint.stats.games});
      if(store.warning)message("runtime.notice.reason",true,{},store.warning);else if(!dirty&&client.mode!=="worker")message("runtime.notice.cooperative");
      render();
    }catch(error){blocked=true;message("runtime.notice.bootFailed",true,{},error);render();}}
  setLearning(learningNote.key,learningNote.variables);void boot();
})();
