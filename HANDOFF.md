# Developer handoff / Передача разработчику — v2.1.0

## English

Tiny AI XO 107601 teaches neural-network learning through an offline 9×9 X/O game. Five or more in a line wins; nine is a super win. The shared JavaScript engine implements an 81→256→256→81 network with 107,601 parameters. The release includes a validated 185-game checkpoint; an existing browser checkpoint always has priority. Explicit reset creates and saves a zero-game model.

**Run:** open [the hosted game](https://bekus2.github.io/Tiny-AI-XO-107601/) or downloaded `index.html`. **Build:** `python3 -B -S build_demo.py`. **Check:** `python3 -B -S tests.py` with Node 18+ on PATH or `XO_NODE` set; engine tests directly: `node --test tests/engine.test.cjs`. Python 3.10+ is used only for building/checking. There are no browser/npm dependencies.

**Pages deployment:** `.github/workflows/checks.yml` (Integrity and engine tests) verifies the project, then publishes only generated `index.html` from `main` on push or manual dispatch from `main` in this repository. Keep the offline ZIP available. Verify the workflow deployment and public HTTPS address after changes. Browser experience is not part of the deployment: a fresh address starts at 185, while existing state at that address takes priority. To move personal experience from a local file or another address, export there and import on Pages; first back up any existing Pages model. Import replaces, not merges. No cloud synchronization is provided.

`web/core.js` owns rules and trajectory validation; `neural.js` owns matrix layout, gradients, Adam and float32 encoding; `learner.js` owns outcome rewards, replay, journal and checkpoint validation; `storage.js` owns persistence/conflicts; `worker.js`/`client.js` own serialized learning jobs; `bootstrap.js` selects local or bundled state without silently replacing corrupt data; `app.js` owns interaction and startup. `web/i18n.js` owns static translations and the RU/EN selector; `web/messages.js` owns dynamic messages. Template/CSS define the UI. `build_demo.py` embeds runtime code, styles and `model/checkpoint-185.json`. `model/manifest.json` describes architecture and release metadata. Shared engine code is used by browser, Worker and Node tests. Settings are code constants rather than a server configuration file.

A checkpoint contains weights, both Adam moments, optimizer step, training RNG, counters, at most 2,048 positions and 200 games. Keep the `tiny-ai-xo-online-v2` format compatible. The bundled JSON is the original export; do not replace it with test-training output. Preserve its SHA-256: `404d3e64e49f2aaf00ca3a5847497159ea7b02e5a80e17689eb68e3ee17811b7`.

Do not change parameter ordering, relative board encoding, masks, tanh derivatives, reward signs, batch/Adam consistency or storage conflict handling without understanding and tests. Never silently replace saved progress, including a deliberate zero-game reset. Corruption must block play rather than fall back to bundled weights. Schema changes need compatible migration/import. Export/import transfers the full learning state, but not an unfinished board.

**Language:** RU/EN changes presentation without restarting the board, timers or learning. The `tiny-ai-xo-language` preference is stored separately from the checkpoint. Startup uses a saved supported preference, otherwise the first supported browser language, otherwise English. If preference storage is blocked, selection lasts until the current page is reloaded or closed. Model imports/exports and saved learning do not depend on the UI language.

The audit in `evaluation/` establishes improved play against random moves and poor tactical defense, not expert strength. More training does not guarantee improvement. See `verification.json` for release checks and their scope; numerical tests and browser tests do not substitute for strength evaluation. Historical v2.0 browser evidence must not be described as fresh v2.1 testing. Outstanding research: defensive alternatives, diverse opponents and independent test positions; additional interface languages remain a possible enhancement. No backend/admin/API work is required.

Use reviewed feature/fix/docs branches against stable `main`; update affected documentation, rebuild and refresh checksums before publishing. The initial publication to `main` is explicitly requested by the project owner. Preserve author attribution and the educational-use license. Keep unrelated personal files and exports out of commits.

## Русский

Tiny AI XO 107601 объясняет обучение нейросети через офлайн-игру X/O 9×9. Пять и больше подряд — победа, девять — суперпобеда. Общий JavaScript-движок содержит сеть 81→256→256→81 с 107 601 параметром. В поставке есть проверенный опыт 185 партий; уже сохранённая модель браузера всегда важнее. Подтверждённый сброс создаёт и сохраняет модель с нулевым опытом.

**Запуск:** открыть [сайт игры](https://bekus2.github.io/Tiny-AI-XO-107601/) или скачанный `index.html`. **Сборка:** `python3 -B -S build_demo.py`. **Проверка:** `python3 -B -S tests.py`, Node 18+ в PATH или через `XO_NODE`; напрямую: `node --test tests/engine.test.cjs`. Python 3.10+ нужен только для сборки/проверки. Зависимостей браузера/npm нет.

**Размещение Pages:** `.github/workflows/checks.yml` (Integrity and engine tests) сначала проверяет проект, затем публикует только сгенерированный `index.html` из `main` при push или ручном запуске из `main` этого репозитория. Офлайн-ZIP сохраняется. После изменений проверять результат workflow и публичный HTTPS-адрес. Опыт браузера не входит в размещение: новый адрес начинает с 185, а существующее состояние этого адреса важнее. Для переноса личного опыта экспортировать его по старому адресу и импортировать на Pages, предварительно скачав имеющийся там опыт. Импорт заменяет, не объединяет модели. Облачной синхронизации нет.

`web/core.js` — правила и проверка партий; `neural.js` — матрицы, градиенты, Adam, float32; `learner.js` — награды, память и валидация; `storage.js` — сохранения и конфликты; `worker.js`/`client.js` — последовательные фоновые задания; `bootstrap.js` — выбор локального/встроенного состояния без тихой замены повреждения; `app.js` — UI и запуск. `web/i18n.js` — статические переводы и переключатель RU/EN; `web/messages.js` — динамические сообщения. Шаблон/CSS задают оформление. Сборщик встраивает код, стили и `model/checkpoint-185.json`; manifest содержит метаданные. Один движок используется браузером, Worker и Node-тестами. Настройки заданы константами в коде, серверной конфигурации нет.

Чекпоинт включает веса, оба момента Adam, шаг, RNG, счётчики, до 2 048 позиций и 200 игр. Сохранять совместимость `tiny-ai-xo-online-v2`. Встроенный JSON — исходный экспорт: не заменять его результатами тестовых тренировок. Его контрольная сумма указана выше.

Без понимания и проверок не менять порядок параметров, относительное кодирование, маску, производные tanh, знак награды, batch/Adam и обработку конфликтов. Не подменять личный опыт, даже нулевой после сброса. Повреждение должно блокировать игру, а не включать встроенную сеть. Изменение схемы требует миграции/совместимого импорта. Незавершённая доска не переносится экспортом.

**Язык:** RU/EN меняет отображение без перезапуска доски, таймеров или обучения. Настройка `tiny-ai-xo-language` хранится отдельно от чекпоинта. При старте используется сохранённый поддерживаемый выбор, иначе первый поддерживаемый язык браузера, иначе английский. Если хранение настройки запрещено, выбор действует до перезагрузки или закрытия текущей страницы. Импорт/экспорт модели и обученный опыт не зависят от языка UI.

Оценка в `evaluation/` показывает рост силы против случайных ходов и слабую защиту. Это не модель экспертного уровня. Дополнительное обучение не гарантирует прогресс. Актуальные проверки и их границы — `verification.json`; исторические браузерные проверки v2.0 не считать новыми проверками v2.1. Дальнейшая работа: защитные альтернативы, разные соперники, независимые позиции, дополнительные языки UI. Бэкэнд, админка и API не требуются.

Для изменений — feature/fix/docs и проверяемые PR в стабильную `main`, актуальные документы, пересборка и контрольные суммы. Первую публикацию в `main` прямо запросил автор. Сохранять авторство и образовательную лицензию; не коммитить посторонние личные файлы/экспорты.

Автор: Beck Sarbassov  
Дата создания: 2026-10-27  
Последнее обновление: 2026-11-15  
Авторские права: © Beck Sarbassov. Все права защищены.
