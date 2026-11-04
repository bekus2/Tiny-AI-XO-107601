/**
 * Проект: Tiny AI XO 107601 | Файл: web/bootstrap.js
 * Автор: Beck Sarbassov | Версия: 2.1.0
 * Дата выпуска: 2026-11-05 | Последнее обновление: 2026-11-05
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Choose validated personal experience before the packaged educational checkpoint.
 * RU: Проверенный личный опыт имеет приоритет над учебным опытом из поставки.
 */
"use strict";
(() => {
  /**
   * EN: null means no stored checkpoint; even a zero-game save must be preserved.
   * RU: Только null означает отсутствие опыта; сохранённый старт с нуля тоже сохраняется.
   * @param {object|null} saved LocalStore.load() result / результат LocalStore.load().
   * @param {function():string} readBundled Lazily reads inert JSON / отложенное чтение JSON.
   * @returns {{checkpoint:object, learner:object, source:string}} Validated startup state.
   */
  function resolve(saved,readBundled){
    const source=saved===null?"bundled":"saved";
    const checkpoint=source==="saved"?saved:JSON.parse(readBundled());
    if(!checkpoint||typeof checkpoint!=="object"||Array.isArray(checkpoint))throw new Error("Некорректный сохранённый опыт.");
    // EN: Validation errors deliberately propagate; never replace corrupt personal data.
    // RU: Ошибки проверки передаются выше; повреждённый личный опыт не заменяется молча.
    return {checkpoint,learner:new XOLearning.Learner(checkpoint),source};
  }
  globalThis.XOBootstrap=Object.freeze({resolve});
})();
