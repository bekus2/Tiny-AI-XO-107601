/**
 * Проект: Tiny AI XO 107601 | Файл: web/storage.js
 * Автор: Beck Sarbassov | Версия: 2.0.0
 * Дата выпуска: 2026-10-29 | Последнее обновление: 2026-10-29
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Atomic local checkpoints with revision conflict detection.
 * RU: Атомарные локальные сохранения с проверкой конфликтов версий.
 */
"use strict";
(() => {
  const DB="tiny-ai-xo-107601-v2",KEY="checkpoint";
  class LocalStore {
    constructor(){this.db=null;this.mode="memory";this.revision=0;this.warning="";}
    async open(){
      try {this.db=await new Promise((resolve,reject)=>{
        const request=indexedDB.open(DB,1);const timer=setTimeout(()=>reject(new Error("Хранилище не отвечает.")),2500);
        request.onupgradeneeded=()=>request.result.createObjectStore("state");
        request.onsuccess=()=>{clearTimeout(timer);resolve(request.result);};request.onerror=()=>{clearTimeout(timer);reject(request.error);};
        request.onblocked=()=>{clearTimeout(timer);reject(new Error("Хранилище заблокировано другой вкладкой."));};
      });this.db.onversionchange=()=>this.db.close();this.mode="indexedDB";
      } catch {try{const k=DB+"-probe";localStorage.setItem(k,"1");localStorage.removeItem(k);this.mode="localStorage";}
        catch{this.mode="memory";this.warning="Браузер запретил сохранение. Перед закрытием скачайте свой ИИ.";}}
      return this;
    }
    async load(){let record;
      if(this.mode==="indexedDB")record=await new Promise((resolve,reject)=>{const tx=this.db.transaction("state","readonly"),r=tx.objectStore("state").get(KEY);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      else if(this.mode==="localStorage"){const raw=localStorage.getItem(DB);record=raw?JSON.parse(raw):null;}
      if(record){if(!Number.isSafeInteger(record.revision)||record.revision<1||!record.snapshot)throw new Error("Повреждено сохранение. Импортируйте файл опыта или подтвердите сброс.");
        this.revision=record.revision;return record.snapshot;}return null;
    }
    async save(snapshot){if(this.mode==="memory")return false;
      const expected=this.revision,record={revision:expected+1,snapshot};
      if(this.mode==="indexedDB")await new Promise((resolve,reject)=>{
        const tx=this.db.transaction("state","readwrite"),store=tx.objectStore("state"),read=store.get(KEY);let conflict=false;
        read.onsuccess=()=>{if((read.result?.revision||0)!==expected){conflict=true;tx.abort();}else store.put(record,KEY);};
        tx.oncomplete=()=>resolve();tx.onabort=()=>reject(new Error(conflict?"Прогресс изменён в другой вкладке. Скачайте свой ИИ и перезагрузите страницу.":"Не удалось записать опыт: недостаточно места или доступ запрещён."));
        tx.onerror=()=>{};
      });else {
        const old=localStorage.getItem(DB),revision=old?JSON.parse(old).revision:0;
        if(revision!==expected)throw new Error("Прогресс изменён в другой вкладке. Скачайте свой ИИ и перезагрузите страницу.");
        localStorage.setItem(DB,JSON.stringify(record));
      }
      this.revision=record.revision;return true;
    }
    async reset(){
      // EN: User-confirmed recovery also replaces corrupt data. RU: Подтверждённый сброс восстанавливает повреждённое хранилище.
      if(this.mode==="indexedDB")await new Promise((resolve,reject)=>{const tx=this.db.transaction("state","readwrite");tx.objectStore("state").delete(KEY);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
      else if(this.mode==="localStorage")localStorage.removeItem(DB);this.revision=0;
    }
  }
  globalThis.XOStorage=Object.freeze({LocalStore,DB});
})();
