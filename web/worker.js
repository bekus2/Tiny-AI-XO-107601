/**
 * Проект: Tiny AI XO 107601 | Файл: web/worker.js
 * Автор: Beck Sarbassov | Версия: 2.0.0
 * Дата выпуска: 2026-10-29 | Последнее обновление: 2026-10-29
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Dedicated, serialized learning jobs. RU: Последовательные задания обучения.
 */
"use strict";
(() => {
  let learner=null,busy=false;
  self.onmessage=async event=>{
    const {id,type,snapshot,episode}=event.data;
    if(busy){self.postMessage({id,type:"error",message:"Предыдущее обучение ещё не завершено."});return;}
    busy=true;
    try {
      if(type==="init"){learner=new XOLearning.Learner(snapshot);self.postMessage({id,type:"ready"});}
      else if(type==="learn"&&learner){const result=await learner.learn(episode,p=>self.postMessage({id,type:"progress",...p}));
        self.postMessage({id,type:"complete",snapshot:learner.snapshot(),result});}
      else throw new Error("Неверное задание обучения.");
    } catch(error){self.postMessage({id,type:"error",message:error.message});}
    finally{busy=false;}
  };
})();
