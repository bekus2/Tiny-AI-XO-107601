/**
 * Проект: Tiny AI XO 107601 | Файл: web/app.js
 * Автор: Beck Sarbassov | Версия: 2.1.0
 * Дата выпуска: 2026-10-29 | Последнее обновление: 2026-11-05
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Play, learn, persist and transfer local experience. RU: Игра, обучение и локальный опыт.
 */
"use strict";
(() => {
  const $=id=>document.getElementById(id),R=XORules;
  const client=new XOClient($("worker-source").textContent),store=new XOStorage.LocalStore();
  let checkpoint=null,network=null,ready=false,busy=false,dirty=false,blocked=false;
  let board=Array(81).fill(0),moves=[],human=1,last=-1,timer=null,generation=0,completed=false,auto=false,showScores=false;
  let imported=null,confirmAction=null,session=0,dialogPaused=false;
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
  function message(text,error=false){$("notice").hidden=!text;$("notice").textContent=text;$("notice").classList.toggle("error",error);}
  const n=value=>Number(value).toLocaleString("ru-RU");
  function metrics(){if(!checkpoint)return;const s=checkpoint.stats;
    $("games-count").textContent=n(s.games);$("updates-count").textContent=n(checkpoint.optimizer.step);$("memory-count").textContent=`${n(checkpoint.replay.length)} / 2 048`;
    $("score-human").textContent=n(s.humanWins);$("score-ai").textContent=n(s.aiWins);$("score-draw").textContent=n(s.humanDraws);
    $("self-count").textContent=n(s.selfGames);$("example-count").textContent=n(s.examples);
    $("learning-level").textContent=s.games===0?"Начинающая сеть":`Опыт: ${n(s.games)} партий`;
    $("storage-state").textContent=dirty?"Есть несохранённый опыт":store.mode==="memory"?"Только до закрытия вкладки":`Опыт сохранён на устройстве · ${store.mode==="indexedDB"?"IndexedDB":"резервное хранилище"}`;
    $("retry-save").hidden=!dirty||store.mode==="memory";
    const list=$("history");list.replaceChildren();
    if(!checkpoint.history.length){const p=document.createElement("p");p.className="muted";p.textContent="Пока нет законченных партий. Первая игра станет первым опытом.";list.append(p);}
    for(const h of checkpoint.history.slice(-12).reverse()){
      const item=document.createElement("li"),title=document.createElement("span"),detail=document.createElement("small");
      const winner=h.winner===1?"X":"O";
      title.textContent=h.winner===0?"Ничья":h.super?`Суперпобеда ${winner} — 9 подряд`:`${winner} победил — ${h.length} подряд`;
      detail.textContent=`${h.ai===0?"Сам с собой":h.winner===0?"Игра с человеком":h.winner===h.ai?"Победил ИИ":"Победил человек"} · ${h.moves.length} ходов · ${new Date(h.date).toLocaleString("ru-RU",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}`;
      item.append(title,detail);list.append(item);
    }
  }
  function render(){const result=R.outcome(board),thinking=ready&&!busy&&!blocked&&!result.done&&(auto||R.turn(board)!==human);
    const p=ready&&!result.done&&network?network.policy(board):null,winning=new Set(result.cells);
    cells.forEach((button,i)=>{const mark=button.firstChild,symbol=board[i]===1?"X":board[i]===-1?"O":"";
      mark.textContent=symbol;mark.className="mark"+(symbol?(board[i]===1?" x":" o"):"");
      button.disabled=!ready||busy||blocked||dialogPaused||result.done||thinking||board[i]!==0;
      button.classList.toggle("winning",winning.has(i));button.classList.toggle("last-move",i===last);
      button.setAttribute("aria-label",`Строка ${Math.floor(i/9)+1}, столбец ${i%9+1}: ${symbol||"пусто"}`);
      const score=button.lastChild;score.hidden=!showScores||!p||board[i]!==0;score.textContent=p?`${Math.round(p.scores[i]*100)}%`:"";
    });
    $("choose-x").setAttribute("aria-pressed",String(human===1));$("choose-o").setAttribute("aria-pressed",String(human===-1));
    $("board").setAttribute("aria-busy",String(thinking||busy));
    $("status").classList.toggle("thinking",thinking||busy);
    $("status-text").textContent=!ready?"Загрузка…":blocked?"Нужно восстановить опыт":busy?"Учусь на этой партии…":dialogPaused?"Пауза":result.done?
      result.winner===0?"Ничья":result.super?`Суперпобеда ${result.winner===1?"X":"O"}!`:`${result.winner===1?"X":"O"} победил: ${result.length} подряд`:
      auto?`Автоигра: ход ${R.turn(board)===1?"X":"O"}`:thinking?"ИИ выбирает ход…":"Твой ход";
    for(const id of ["new-game","choose-x","choose-o","toggle-scores"])$(id).disabled=!ready||busy||blocked;
    $("auto-play").disabled=!ready||blocked;$("auto-play").textContent=auto?"Остановить автоигру":"ИИ играет сам";$("auto-play").setAttribute("aria-pressed",String(auto));
    for(const id of ["export-model","import-model","reset-model"])$(id).disabled=busy||(!ready&&!blocked);
    $("toggle-scores").setAttribute("aria-pressed",String(showScores));$("toggle-scores").textContent=showScores?"Скрыть оценки":"Оценки на поле";
    $("move-count").textContent=`Ход ${moves.length} / 81`;
    const top=$("top-moves");top.replaceChildren();
    if(p){const ranked=Array.from(p.scores,(score,i)=>({score,i})).filter(v=>!board[v.i]).sort((a,b)=>b.score-a.score).slice(0,5);
      for(const item of ranked){const row=document.createElement("div"),label=document.createElement("span"),value=document.createElement("b");row.className="rating";
        label.textContent=`${String.fromCharCode(65+item.i%9)}${Math.floor(item.i/9)+1}`;value.textContent=`${(item.score*100).toFixed(1)}%`;
        const bar=document.createElement("span");bar.className="rating-bar";const fill=document.createElement("i");fill.style.width=`${item.score*100}%`;bar.append(fill);row.append(label,bar,value);top.append(row);}
    }else{const p=document.createElement("p");p.className="muted";p.textContent="Оценки появятся в новой партии.";top.append(p);}
    $("policy-label").textContent=p?`Предпочтения для ${R.turn(board)===1?"X":"O"}. Не вероятность победы.`:"Партия завершена.";
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
      if(!saved)message(store.warning||"Опыт пока только в памяти. Скачайте свой ИИ перед закрытием.",true);return saved;
    }catch(error){dirty=true;auto=false;message(error.message+" Текущий опыт можно скачать.",true);return false;}}
  async function finish(result){if(completed)return;completed=true;busy=true;render();
    const episode={id:`${Date.now()}-${++session}-${Math.random().toString(36).slice(2,9)}`,date:new Date().toISOString(),moves:moves.slice(),winner:result.winner,ai:auto?0:-human};
    try{const trained=await client.learn(episode,p=>{$("learning-note").textContent=`Обновление ${p.updates} / 6 · разобрано ${p.examples} примеров`;});
      checkpoint=trained.snapshot;network=new XONeural.Network(XONeural.unpack(checkpoint.weights));
      $("learning-note").textContent=trained.result.updates?`Партия разобрана: ${trained.result.examples} примеров, ${trained.result.updates} обновлений весов.`:"Ничья учтена. Награда 0 — веса не изменены.";
      await persist();
    }catch(error){auto=false;message(`Не удалось обучиться на партии: ${error.message}`,true);await client.init(checkpoint);}
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
    try{if(file.size>6*1024*1024)throw new Error("Файл должен быть не больше 6 МБ.");
      const parsed=JSON.parse(await file.text());new XOLearning.Learner(parsed);imported=parsed;confirmAction="import";
      $("confirm-title").textContent="Заменить текущий опыт?";$("confirm-text").textContent=`Будет загружен опыт из файла: ${file.name}. Текущие веса и память заменятся. Сначала скачайте свой ИИ, если хотите их сохранить.`;$("confirm-dialog").showModal();
    }catch(error){message(`Файл не загружен: ${error.message}`,true);resumeDialog();}
  });
  $("reset-model").addEventListener("click",()=>{pauseDialog();confirmAction="reset";$("confirm-title").textContent="Начать обучение с нуля?";
    $("confirm-text").textContent="Все сохранённые веса, партии и опыт на этом устройстве будут заменены новой случайной сетью. Это действие не отменяется без экспортированного файла.";$("confirm-dialog").showModal();});
  $("confirm-cancel").addEventListener("click",()=>{$("confirm-dialog").close();imported=null;resumeDialog();});
  $("confirm-dialog").addEventListener("cancel",()=>{imported=null;resumeDialog();});
  $("confirm-yes").addEventListener("click",async()=>{
    $("confirm-dialog").close();auto=false;cancel();busy=true;render();
    try{const next=confirmAction==="import"?imported:new XOLearning.Learner().snapshot();await client.init(next);
      if(confirmAction==="reset")await store.reset();checkpoint=next;network=new XONeural.Network(XONeural.unpack(next.weights));blocked=false;ready=true;
      board=Array(81).fill(0);moves=[];completed=false;last=-1;message("");$("learning-note").textContent=confirmAction==="reset"?"Новая случайная сеть. Пока нет опыта.":"Ваш ИИ и опыт загружены.";await persist();
    }catch(error){message(`Не удалось заменить опыт: ${error.message}`,true);if(checkpoint)await client.init(checkpoint);}
    finally{busy=false;imported=null;dialogPaused=false;render();schedule();}
  });
  window.addEventListener("beforeunload",event=>{if(busy||dirty){event.preventDefault();event.returnValue="";}});
  window.xoApp=Object.freeze({state:()=>({board:board.slice(),moves:moves.slice(),human,auto,busy,ready,blocked,dirty,storage:store.mode,training:client.mode,stats:checkpoint?{...checkpoint.stats}:null,updates:checkpoint?.optimizer.step}),snapshot:()=>checkpoint?structuredClone(checkpoint):null});
  async function boot(){render();await store.open();try{
      const startup=XOBootstrap.resolve(await store.load(),()=>$("bundled-checkpoint").textContent);
      checkpoint=startup.checkpoint;network=startup.learner.network;
      await client.init(checkpoint);
      // EN: Seed only a new browser; saved zero-game resets also take precedence.
      // RU: Начальный опыт только для нового браузера; личный сброс до нуля имеет приоритет.
      if(startup.source==="bundled")await persist();
      ready=true;$("learning-note").textContent=startup.source==="saved"?"Продолжаю обучение с сохранённого опыта.":`Загружен учебный опыт: ${n(checkpoint.stats.games)} партий. Продолжайте обучение своей копии.`;
      if(store.warning)message(store.warning,true);else if(!dirty&&client.mode!=="worker")message("Фоновое обучение недоступно: используется совместимый режим.");
      render();
    }catch(error){blocked=true;message(`Сохранённый опыт не заменён: ${error.message}`,true);render();}}
  void boot();
})();
