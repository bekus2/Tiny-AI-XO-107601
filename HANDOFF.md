# Developer handoff / Передача разработчику — v2.1.0

## English

Tiny AI XO 107601 teaches neural-network learning through an offline 9×9 X/O game. Five or more in a line wins; nine is a super win. The shared JavaScript engine implements an 81→256→256→81 network with 107,601 parameters. The release includes a validated 185-game checkpoint; an existing browser checkpoint always has priority. Explicit reset creates and saves a zero-game model.

**Run:** open `index.html`. **Build:** `python3 -B -S build_demo.py`. **Check:** `python3 -B -S tests.py` with Node 18+ on PATH or `XO_NODE` set; engine tests directly: `node --test tests/engine.test.cjs`. Python 3.10+ is used only for building/checking. There are no browser/npm dependencies. Deploy `index.html` to static UTF-8/HTTPS hosting; GitHub source publication does not enable hosting by itself.

`web/core.js` owns rules and trajectory validation; `neural.js` owns matrix layout, gradients, Adam and float32 encoding; `learner.js` owns outcome rewards, replay, journal and checkpoint validation; `storage.js` owns persistence/conflicts; `worker.js`/`client.js` own serialized learning jobs; `bootstrap.js` selects local or bundled state without silently replacing corrupt data; `app.js` owns interaction and startup. Template/CSS define the UI. `build_demo.py` embeds runtime code, styles and `model/checkpoint-185.json`. `model/manifest.json` describes architecture and release metadata. Shared engine code is used by browser, Worker and Node tests. Settings are code constants rather than a server configuration file.

A checkpoint contains weights, both Adam moments, optimizer step, training RNG, counters, at most 2,048 positions and 200 games. Keep the `tiny-ai-xo-online-v2` format compatible. The bundled JSON is the original export; do not replace it with test-training output. Preserve its SHA-256: `404d3e64e49f2aaf00ca3a5847497159ea7b02e5a80e17689eb68e3ee17811b7`.

Do not change parameter ordering, relative board encoding, masks, tanh derivatives, reward signs, batch/Adam consistency or storage conflict handling without understanding and tests. Never silently replace saved progress, including a deliberate zero-game reset. Corruption must block play rather than fall back to bundled weights. Schema changes need compatible migration/import. Export/import transfers the full learning state, but not an unfinished board.

The audit in `evaluation/` establishes improved play against random moves and poor tactical defense, not expert strength. More training does not guarantee improvement. See `verification.json` for release checks and their scope; numerical tests and browser tests do not substitute for strength evaluation. Historical v2.0 browser evidence must not be described as fresh v2.1 testing. Outstanding research: defensive alternatives, diverse opponents and independent test positions; UI translation is also a useful enhancement. No backend/admin/API work is required.

Use reviewed feature/fix/docs branches against stable `main`; update affected documentation, rebuild and refresh checksums before publishing. The initial publication to `main` is explicitly requested by the project owner. Preserve author attribution and the educational-use license. Keep unrelated personal files and exports out of commits.

## Русский

Tiny AI XO 107601 объясняет обучение нейросети через офлайн-игру X/O 9×9. Пять и больше подряд — победа, девять — суперпобеда. Общий JavaScript-движок содержит сеть 81→256→256→81 с 107 601 параметром. В поставке есть проверенный опыт 185 партий; уже сохранённая модель браузера всегда важнее. Подтверждённый сброс создаёт и сохраняет модель с нулевым опытом.

**Запуск:** открыть `index.html`. **Сборка:** `python3 -B -S build_demo.py`. **Проверка:** `python3 -B -S tests.py`, Node 18+ в PATH или через `XO_NODE`; напрямую: `node --test tests/engine.test.cjs`. Python 3.10+ нужен только для сборки/проверки. Зависимостей браузера/npm нет. На статический хостинг достаточно `index.html`, UTF-8/HTTPS. Публикация исходников GitHub сама по себе не включает хостинг.

`web/core.js` — правила и проверка партий; `neural.js` — матрицы, градиенты, Adam, float32; `learner.js` — награды, память и валидация; `storage.js` — сохранения и конфликты; `worker.js`/`client.js` — последовательные фоновые задания; `bootstrap.js` — выбор локального/встроенного состояния без тихой замены повреждения; `app.js` — UI и запуск. Шаблон/CSS задают оформление. Сборщик встраивает код, стили и `model/checkpoint-185.json`; manifest содержит метаданные. Один движок используется браузером, Worker и Node-тестами. Настройки заданы константами в коде, серверной конфигурации нет.

Чекпоинт включает веса, оба момента Adam, шаг, RNG, счётчики, до 2 048 позиций и 200 игр. Сохранять совместимость `tiny-ai-xo-online-v2`. Встроенный JSON — исходный экспорт: не заменять его результатами тестовых тренировок. Его контрольная сумма указана выше.

Без понимания и проверок не менять порядок параметров, относительное кодирование, маску, производные tanh, знак награды, batch/Adam и обработку конфликтов. Не подменять личный опыт, даже нулевой после сброса. Повреждение должно блокировать игру, а не включать встроенную сеть. Изменение схемы требует миграции/совместимого импорта. Незавершённая доска не переносится экспортом.

Оценка в `evaluation/` показывает рост силы против случайных ходов и слабую защиту. Это не модель экспертного уровня. Дополнительное обучение не гарантирует прогресс. Актуальные проверки и их границы — `verification.json`; исторические браузерные проверки v2.0 не считать новыми проверками v2.1. Дальнейшая работа: защитные альтернативы, разные соперники, независимые позиции, перевод UI. Бэкэнд, админка и API не требуются.

Для изменений — feature/fix/docs и проверяемые PR в стабильную `main`, актуальные документы, пересборка и контрольные суммы. Первую публикацию в `main` прямо запросил автор. Сохранять авторство и образовательную лицензию; не коммитить посторонние личные файлы/экспорты.

Автор: Beck Sarbassov  
Дата создания: 2026-10-27  
Последнее обновление: 2026-11-05  
Авторские права: © Beck Sarbassov. Все права защищены.
