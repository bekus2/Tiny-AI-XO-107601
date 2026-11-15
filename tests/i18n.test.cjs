/**
 * Проект: Tiny AI XO 107601 | Файл: tests/i18n.test.cjs
 * Автор: Beck Sarbassov | Версия: 2.1.0
 * Дата выпуска: 2026-11-15 | Последнее обновление: 2026-11-15
 * Авторские права: © Beck Sarbassov. Все права защищены.
 * EN: Check language selection without touching a real browser or save.
 * RU: Проверка выбора языка без доступа к браузеру и личному опыту.
 */
"use strict";

const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const { createContext, runInContext } = require("node:vm");

const localization = readFileSync(path.join(__dirname, "../web/i18n.js"), "utf8");
const runtimeCopy = readFileSync(path.join(__dirname, "../web/messages.js"), "utf8");
const template = readFileSync(path.join(__dirname, "../web/index.template.html"), "utf8");
const preferenceKey = "tiny-ai-xo-language";
const checkpointKey = "tiny-ai-xo-107601-v2";

function openLanguageSettings(languages, records = new Map(), storageDenied = false) {
  const button = () => ({
    addEventListener() {},
    setAttribute() {},
  });
  const buttons = { "lang-ru": button(), "lang-en": button() };
  const events = [];
  const document = {
    documentElement: { lang: "ru" },
    getElementById: id => buttons[id] ?? null,
    querySelectorAll: () => [],
    dispatchEvent: event => events.push(event),
  };
  const context = createContext({
    document,
    navigator: { languages },
    CustomEvent: class {
      constructor(type, { detail } = {}) { this.type = type; this.detail = detail; }
    },
    localStorage: {
      getItem(key) {
        if (storageDenied) throw new Error("Storage denied");
        return records.get(key) ?? null;
      },
      setItem(key, value) {
        if (storageDenied) throw new Error("Storage denied");
        records.set(key, value);
      },
    },
  });
  runInContext(runtimeCopy, context);
  runInContext(localization, context);
  context.XOText.init();
  return { text: context.XOText, messages: context.XOGameMessages, document, events };
}

test("the first supported browser language is used, with English as fallback", () => {
  assert.equal(openLanguageSettings(["kk-KZ", "ru-KZ", "en-US"]).text.language, "ru");
  assert.equal(openLanguageSettings(["en-GB", "ru"]).text.language, "en");
  assert.equal(openLanguageSettings(["es-ES"]).text.language, "en");
});

test("a manual language change is remembered without altering the saved model", () => {
  const checkpoint = '{"revision":17,"snapshot":{"games":204}}';
  const records = new Map([[checkpointKey, checkpoint]]);
  const { text, document, events } = openLanguageSettings(["en-US"], records);
  text.setLanguage("ru");
  assert.equal(document.documentElement.lang, "ru");
  assert.equal(text.locale, "ru-RU");
  assert.ok(events.some(event => event.type === "xo-language-change"));
  assert.deepEqual([...records], [[checkpointKey, checkpoint], [preferenceKey, "ru"]]);
  assert.equal(openLanguageSettings(["en-US"], records).text.language, "ru");
});

test("manual language switching works if browser storage is unavailable", () => {
  const { text, document } = openLanguageSettings(["ru"], new Map(), true);
  text.setLanguage("en");
  assert.equal(text.language, "en");
  assert.equal(text.locale, "en-US");
  assert.equal(document.documentElement.lang, "en");
});

test("both languages cover template text and the same dynamic message variables", () => {
  const { text, messages } = openLanguageSettings(["en"]);
  const staticKeys = [...template.matchAll(/\bdata-i18n(?:-aria-label|-content)?="([^"]+)"/g)]
    .map(match => match[1]);
  const english = staticKeys.map(key => text.t(key));
  text.setLanguage("ru");
  staticKeys.forEach((key, index) => {
    assert.notEqual(english[index], key, `Missing template text for ${key}`);
    assert.notEqual(english[index], text.t(key), `Missing English translation for ${key}`);
  });

  const variables = message => [...message.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
  assert.deepEqual(Object.keys(messages.en).sort(), Object.keys(messages.ru).sort());
  for (const key of Object.keys(messages.ru)) {
    assert.deepEqual(variables(messages.en[key]), variables(messages.ru[key]), key);
  }
});
