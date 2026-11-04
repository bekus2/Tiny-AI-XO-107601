/**
 * Проект: Tiny AI XO 107601 | Файл: web/client.js
 * Автор: Beck Sarbassov | Версия: 2.0.0
 * Дата выпуска: 2026-10-29 | Последнее обновление: 2026-10-29
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Worker bridge with cooperative fallback. RU: Worker и кооперативный запасной режим.
 */
"use strict";
(() => {
  class TrainingClient {
    constructor(source){this.source=source;this.worker=null;this.fallback=null;this.jobs=new Map();this.serial=0;this.mode="worker";}
    request(type,data={},progress=()=>{}){return new Promise((resolve,reject)=>{
      const id=++this.serial;this.jobs.set(id,{resolve,reject,progress});this.worker.postMessage({id,type,...data});});}
    async init(snapshot){
      this.close();
      try {
        const url=URL.createObjectURL(new Blob([this.source],{type:"text/javascript"}));
        this.worker=new Worker(url);this.worker.onmessage=({data})=>{
          const job=this.jobs.get(data.id);if(!job)return;
          if(data.type==="progress"){job.progress(data);return;}
          this.jobs.delete(data.id);if(data.type==="error")job.reject(new Error(data.message));else job.resolve(data);
        };
        this.worker.onerror=event=>{for(const job of this.jobs.values())job.reject(new Error(event.message||"Ошибка фонового обучения."));this.jobs.clear();};
        try {await Promise.race([this.request("init",{snapshot}),new Promise((_,reject)=>{this.startTimer=setTimeout(()=>reject(new Error("Worker не отвечает.")),3500);})]);}
        finally {clearTimeout(this.startTimer);URL.revokeObjectURL(url);}
        this.mode="worker";
      }catch(error){this.close();this.fallback=new XOLearning.Learner(snapshot);this.mode="cooperative";}
    }
    async learn(episode,progress){
      if(this.worker)return this.request("learn",{episode},progress);
      const result=await this.fallback.learn(episode,progress,()=>new Promise(resolve=>setTimeout(resolve,0)));
      return {snapshot:this.fallback.snapshot(),result};
    }
    close(){clearTimeout(this.startTimer);if(this.worker)this.worker.terminate();this.worker=null;this.fallback=null;
      for(const job of this.jobs.values())job.reject(new Error("Обучение перезапущено."));this.jobs.clear();}
  }
  globalThis.XOClient=TrainingClient;
})();
