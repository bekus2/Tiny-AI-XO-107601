/**
 * Проект: Tiny AI XO 107601 | Файл: web/i18n.js
 * Автор: Beck Sarbassov | Версия: 2.1.0
 * Дата выпуска: 2026-11-15 | Последнее обновление: 2026-11-15
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Local interface translations and an independent language preference.
 * RU: Локальные переводы интерфейса и отдельная языковая настройка.
 */
"use strict";
(() => {
  const KEY="tiny-ai-xo-language";
  const dictionaries={
  "ru": {
    "page.title": "Tiny AI XO 107601 — 9×9, ИИ учится с вами",
    "page.description": "Tiny AI XO 107601: крестики-нолики 9×9. Учебная нейросеть с опытом 185 партий продолжает обучение в браузере. Играйте, исследуйте и сохраняйте свою копию.",
    "page.ogTitle": "Tiny AI XO 107601 — играй и обучай свой ИИ",
    "page.ogDescription": "9×9. Пять подряд — победа. Девять — суперпобеда. Обучение из ваших партий, без облака.",
    "nav.label": "Навигация",
    "language.label": "Язык интерфейса",
    "nav.play": "Играть",
    "nav.learn": "Обучение",
    "intro.title": "Сыграй. Научи. Попробуй снова.",
    "intro.description": "Исследуй ИИ через игру: начни с опыта 185 партий и обучай свою копию дальше.",
    "board.section": "Крестики-нолики 9 на 9",
    "controls.side": "Ты играешь",
    "controls.x": "Играть за X",
    "controls.o": "Играть за O",
    "board.caption": "5–8 подряд — победа · 9 — суперпобеда",
    "board.label": "Поле 9 на 9. Побеждает линия от пяти фигур.",
    "controls.new": "Новая партия",
    "scores.label": "Накопленные результаты модели против людей",
    "scores.human": "Человек",
    "scores.draws": "Ничьи",
    "scores.ai": "ИИ",
    "board.rules": "Пять или больше в непрерывной линии: по горизонтали, вертикали или диагонали. X начинает.",
    "model.title": "Сеть учится с тобой",
    "model.diagram": "81 вход, два скрытых слоя по 256 нейронов и 81 выход",
    "model.cells": "клетка",
    "model.neurons": "нейронов",
    "model.moves": "ход",
    "model.parameters": "параметр",
    "model.hidden": "512 скрытых нейронов · 2 слоя",
    "model.experience": "В поставке — опыт 185 партий. ИИ лучше случайной игры, но часто пропускает угрозы. Больше опыта не гарантирует победу.",
    "model.games": "партий опыта",
    "model.updates": "обновлений весов",
    "model.memory": "Память позиций",
    "controls.retry": "Повторить сохранение",
    "controls.export": "Скачать мой ИИ",
    "controls.import": "Загрузить мой ИИ из файла",
    "controls.file": "Файл опыта ИИ",
    "model.preferences": "Какие ходы предпочитает сеть",
    "details.summary": "Как сохраняется и растёт опыт",
    "details.title": "Каждая законченная партия — новый опыт",
    "details.reward": "Сеть получает награду +1 за ходы победителя и −1 за ходы проигравшего. По этому сигналу меняются настоящие веса всех трёх соединяющих слоёв. У поздних ходов больше вес. При ничьей награда 0: исход запоминается, веса не меняются.",
    "details.memory": "Сохраняются веса, состояние обучения, последние 200 партий и до 2048 позиций. Старые позиции постепенно уступают место новым, а накопленные изменения остаются в весах. Это ограниченная память, а не бесконечная база всех комбинаций.",
    "details.updates": "После партии выполняется шесть небольших обновлений по восемь примеров из нового и прежнего опыта. Повороты и отражения доски помогают переносить выученное на похожие ситуации. Незавершённая партия не обучает. Учебные веса получены с нуля в этой игре; сторонних моделей и внешнего ИИ нет.",
    "details.selfplay": "«ИИ играет сам» запускает партии и обучение прямо на поле. Нажмите снова, чтобы остановить; незавершённая партия сбросится. Автоигра сама при открытии не включается. В начале сеть слаба; опыт может помогать, но отдельные партии не гарантируют улучшение и сильную стратегию.",
    "details.storage": "Опыт хранится только в этом браузере для этого адреса. В новом браузере загружается учебная копия с опытом 185 партий. Сохранённый личный опыт всегда имеет приоритет. Очистка данных браузера удаляет личный прогресс. Чтобы перенести её, скачайте свой ИИ и загрузите файл в другом месте. При запрете сохранения появится предупреждение; вкладку можно использовать с ручным экспортом.",
    "details.selfCount": "Сыграно с собой:",
    "details.exampleCount": "Использовано обучающих примеров:",
    "details.metricsLimit": "Эти числа описывают опыт, а не качество игры. Непобедимость для 9×9 не заявляется.",
    "details.reset": "Хотите сравнить с необученной сетью? Сначала скачайте свой ИИ, затем подтвердите «Удалить опыт и начать с нуля». Для возврата к учебному опыту импортируйте model/checkpoint-185.json из проекта. Начальные две игры с человеком и их результаты входят в общий счёт модели.",
    "details.recent": "Последние партии",
    "details.history": "Журнал исходов",
    "controls.reset": "Удалить опыт и начать с нуля",
    "footer.tagline": "Собственный ИИ · Локальное обучение · Без облака",
    "controls.cancel": "Отмена",
    "controls.confirm": "Подтвердить замену"
  },
  "en": {
    "page.title": "Tiny AI XO 107601 — 9×9, learn AI through play",
    "page.description": "Tiny AI XO 107601: an educational 9×9 X/O game. Continue training a neural network with 185 games of experience. Play, experiment and save your own AI.",
    "page.ogTitle": "Tiny AI XO 107601 — play and train your own AI",
    "page.ogDescription": "9×9. Five in a row wins. Nine is a super win. Learn from your games, on your device.",
    "nav.label": "Main navigation",
    "language.label": "Interface language",
    "nav.play": "Play",
    "nav.learn": "Learning",
    "intro.title": "Play. Train. Try again.",
    "intro.description": "Explore AI through play: start with 185 games of experience and keep training your own copy.",
    "board.section": "9 by 9 X/O game",
    "controls.side": "You play",
    "controls.x": "Play as X",
    "controls.o": "Play as O",
    "board.caption": "5–8 in a row wins · 9 is a super win",
    "board.label": "9 by 9 board. A line of five or more marks wins.",
    "controls.new": "New game",
    "scores.label": "Accumulated results against human players",
    "scores.human": "Human",
    "scores.draws": "Draws",
    "scores.ai": "AI",
    "board.rules": "Five or more contiguous marks horizontally, vertically or diagonally wins. X moves first.",
    "model.title": "The network learns with you",
    "model.diagram": "81 inputs, two hidden layers of 256 neurons each and 81 outputs",
    "model.cells": "cells",
    "model.neurons": "neurons",
    "model.moves": "moves",
    "model.parameters": "parameters",
    "model.hidden": "512 hidden neurons · 2 layers",
    "model.experience": "Includes 185 games of experience. The AI outperforms random play, but often misses threats. More experience does not guarantee a win.",
    "model.games": "games of experience",
    "model.updates": "weight updates",
    "model.memory": "Remembered positions",
    "controls.retry": "Retry saving",
    "controls.export": "Export my AI",
    "controls.import": "Import my AI",
    "controls.file": "AI experience file",
    "model.preferences": "Which moves the network prefers",
    "details.summary": "How experience is saved and grows",
    "details.title": "Every completed game adds experience",
    "details.reward": "The network receives +1 for the winner’s moves and −1 for the loser’s moves. This signal updates the actual weights in all three connecting layers. Later moves carry more weight. A draw gives zero reward: the result is remembered, but the weights do not change.",
    "details.memory": "The app saves weights, training state, the last 200 games and up to 2,048 positions. New positions gradually replace old ones, while accumulated changes remain in the weights. This is bounded memory, not an unlimited database of every combination.",
    "details.updates": "After a decisive game, training performs six small updates using eight examples each from new and earlier experience. Board rotations and reflections help transfer learning to related situations. Unfinished games do not train the model. The included weights were trained from scratch in this game, without third-party models or external AI.",
    "details.selfplay": "“Start self-play” runs games and learning on the visible board. Click again to stop; the unfinished game is discarded. Self-play does not start automatically when you open the app. The network starts weak; experience may help, but individual games do not guarantee improvement or a strong strategy.",
    "details.storage": "Experience stays in this browser for this address. A new browser loads the educational copy with 185 games. Existing personal experience always takes priority. Clearing browser data removes your personal progress. To transfer it, export your AI and import the file elsewhere. If saving is unavailable, the app warns you; you can still export manually.",
    "details.selfCount": "Self-play games:",
    "details.exampleCount": "Sampled training examples:",
    "details.metricsLimit": "These numbers describe experience, not playing strength. The 9×9 model is not claimed to be unbeatable.",
    "details.reset": "Want to compare against an untrained network? Export your AI first, then confirm “Delete experience and start from zero”. To restore the educational model, import model/checkpoint-185.json from the project. The first two human games and their results are included in the model’s overall score.",
    "details.recent": "Recent games",
    "details.history": "Game results history",
    "controls.reset": "Delete experience and start from zero",
    "footer.tagline": "Your own AI · Local learning · No cloud",
    "controls.cancel": "Cancel",
    "controls.confirm": "Confirm replacement"
  }
};
  let language="ru",initialized=false;
  const supported=value=>value==="ru"||value==="en";

  // EN: The first supported browser preference wins; unavailable storage is harmless.
  // RU: Берём первый поддерживаемый язык браузера; запрет хранения не мешает игре.
  function preferredLanguage(){
    try{const saved=globalThis.localStorage.getItem(KEY);if(supported(saved))return saved;}catch{}
    const nav=globalThis.navigator||{};
    const preferences=Array.isArray(nav.languages)&&nav.languages.length?nav.languages:[nav.language];
    for(const value of preferences){const base=typeof value==="string"?value.toLowerCase().split(/[-_]/)[0]:"";if(supported(base))return base;}
    return "en";
  }
  /** EN: Translate text with safe string variables. RU: Перевод с текстовыми переменными. */
  function t(key,variables={}){
    const runtime=globalThis.XOGameMessages||{};
    const message=runtime[language]?.[key]??dictionaries[language][key]??runtime.ru?.[key]??dictionaries.ru[key]??key;
    return String(message).replace(/\{([A-Za-z0-9_]+)\}/g,(token,name)=>Object.prototype.hasOwnProperty.call(variables,name)?String(variables[name]):token);
  }
  function refresh(){
    document.documentElement.lang=language;
    for(const element of document.querySelectorAll("[data-i18n]"))element.textContent=t(element.getAttribute("data-i18n"));
    for(const attribute of ["aria-label","content"]){
      const marker="data-i18n-"+attribute;
      for(const element of document.querySelectorAll("["+marker+"]"))element.setAttribute(attribute,t(element.getAttribute(marker)));
    }
    for(const code of ["ru","en"])document.getElementById("lang-"+code)?.setAttribute("aria-pressed",String(code===language));
  }
  function init(){
    if(initialized)return;initialized=true;language=preferredLanguage();
    for(const code of ["ru","en"])document.getElementById("lang-"+code)?.addEventListener("click",()=>setLanguage(code));
    refresh();
  }
  /**
   * EN: Changes presentation only; never reads or writes the model or current board.
   * RU: Меняет только оформление; не читает и не записывает модель или текущую доску.
   */
  function setLanguage(next){
    if(!supported(next))return false;
    init();language=next;
    try{globalThis.localStorage.setItem(KEY,language);}catch{}
    refresh();
    document.dispatchEvent(new CustomEvent("xo-language-change",{detail:{language}}));
    return true;
  }
  globalThis.XOText=Object.freeze({t,init,setLanguage,get language(){return language;},get locale(){return language==="ru"?"ru-RU":"en-US";}});
})();
