## Release update / Обновление 2026-11-15

**EN:** The current default is the exact **318-game checkpoint from the published Sites release**, plus its optional bounded tactical search (enabled for human games by default). The new RU/EN interface is preserved. Self-play still uses only the neural network. Existing local saves, including intentional zero-game saves, are never silently replaced. Use “Restore the shared starting model” and confirm to replace a personal copy, exporting it first if needed. The original `model/checkpoint-185.json` is retained for reproducible historical comparisons. The older 185-game evaluation numbers below are not measurements of this stronger release. No new performance claims are made. This is a shared fixed starting model, **not cloud-synchronized collective learning**.

**RU:** Теперь по умолчанию поставляется точная **модель с опытом 318 партий из опубликованной Sites-версии** и её отключаемый тактический поиск (включён при игре с человеком). Новый интерфейс RU/EN сохранён. Самоигра по-прежнему использует только нейросеть. Личный сохранённый опыт, включая намеренный старт с нуля, не перезаписывается. Для явной замены есть «Начать с общей модели» с подтверждением; сначала экспортируйте личный опыт, если он нужен. Исходный `model/checkpoint-185.json` сохранён для воспроизводимости прежних сравнений. Приведённые далее старые результаты модели185 не описывают силу новой версии. Новые показатели качества не заявляются. Это общая фиксированная стартовая модель, **не облачное коллективное обучение**.

Older sections below describe the previous185-game release unless stated otherwise. / Старые разделы ниже описывают предыдущую версию с185 партиями, если не указано иное.

# Tiny AI XO 107601 — v2.1.0

**Play. Train. Experiment. Learn how a small neural network works.**  
**Играй. Обучай. Экспериментируй. Узнай, как работает небольшая нейросеть.**

[Play in browser / Играть в браузере](https://bekus2.github.io/Tiny-AI-XO-107601/) · [Download ZIP / Скачать ZIP](https://github.com/bekus2/Tiny-AI-XO-107601/archive/refs/heads/main.zip) · [Model card / Карточка модели](MODEL_CARD_RU.md) · [Evaluation / Проверка силы](evaluation/README.md) · [License / Лицензия](LICENSE.txt)

## English

### What is this project?

Tiny AI XO 107601 is an educational, offline **9×9 X/O game** with a small neural network written in plain JavaScript. Its purpose is to make AI understandable through play: watch decisions, finish games, see real weight updates, save your own model, and experiment with training. It is a game-playing model, not a chatbot or a general-purpose AI.

This release includes **Beck Sarbassov's partially trained checkpoint after 185 games**. A fresh browser starts from that experience. Existing local experience takes priority, including a model deliberately reset to zero. You can continue training the included model or export your progress and explicitly start a new random model. All computation happens on your device; no AI service, API key or account is needed. The downloaded copy can be played without an internet connection.

### Play online

Open **[Tiny AI XO 107601 in your browser](https://bekus2.github.io/Tiny-AI-XO-107601/)**. No download or installation is required. The first visit with no saved experience at this web address uses the bundled **185-game model**; later visits continue that address's saved model. Loading the website requires an internet connection; learning and storage happen on your device, with no cloud synchronization.

### Download and play

1. Download the ZIP above, or choose **Code → Download ZIP** on GitHub.
2. Extract the whole archive and open **`index.html`** in a modern browser with JavaScript enabled. No installation or build is required.
3. Choose X or O and click an empty cell. X moves first. Finish a game to produce a learning result.
4. Use **“Start self-play”** to let the same network play both sides and learn from completed games. Self-play is off until you start it.
5. Use **“Export my AI”** to download your current experience as JSON before moving to another browser/device or starting a fresh experiment.

Use the **RU / EN** buttons in the page header to switch the interface between Russian and English. A saved choice takes priority; otherwise the first supported browser language is used, with English as fallback. The language preference is saved separately from your AI experience. If browser storage for this preference is blocked, your choice remains until the current page is reloaded or closed. Switching languages keeps the current board, pending moves and learning progress.

**“New game”** discards an unfinished board without training. **“Show move scores”** displays move preferences; **“Delete experience and start from zero”** requires confirmation and replaces the current model with a random zero-game model. Export your experience first when you want to keep it.

A continuous line of **five or more** horizontally, vertically or diagonally wins immediately. Five–eight is a win; nine is a **super win**. A single move can join two shorter chains. A full board without a winning line is a draw. Use mouse, touch, Tab, Enter/Space or arrow navigation. Stopping self-play discards the unfinished game; an update already running finishes. Percentages shown on cells are preferences, **not probabilities of winning**.

### Continue your existing experience on the website

The downloaded `index.html` and the HTTPS website have separate browser storage. Publishing or opening the website does not transfer or erase the experience at your old address.

1. Open the local game or address where your latest experience is saved and click **“Export my AI”** (**«Скачать мой ИИ»** in Russian) to save its JSON checkpoint.
2. Open the [website](https://bekus2.github.io/Tiny-AI-XO-107601/). If you already trained a model there, export that model too before replacing it.
3. Click **“Import my AI”**, choose the checkpoint you want to continue and confirm the replacement. Import replaces the current model; it does not merge two histories.
4. Check the experience counter, continue playing and export backups regularly. Your original export and the experience at the old address remain available.

### What has the included AI learned?

The bundled file is [`model/checkpoint-185.json`](model/checkpoint-185.json). It contains **185 games: 183 self-play and 2 against a human**, **1,110 weight updates**, **8,880 sampled training examples** including repeats, and **2,048 remembered positions**. Its complete journal contains all 185 games. All 107,601 parameters differ from the initial random model. Replaying the journal in an isolated copy reproduced the weights and optimizer state exactly.

A fixed evaluation compared the initial and trained network under the same conditions, playing both X and O. The main comparison used the highest-scoring move without random exploration; weights were frozen during evaluation.

| Opponent | Initial model: wins / 200 games | After 185 games: wins / 200 games |
|---|---:|---:|
| Random legal moves | 91 | **189** |
| Takes immediate wins and blocks immediate threats; otherwise random | 1 | **5** |
| Also scores building and defending five-cell lines | 0 | **0** |

The network became much stronger against random moves. It remains weak against tactical opponents. In **64 positions from its own history**, it still missed the required defensive block. On 24 independent copies, one additional losing episode reduced the probability of the particular bad move in 19 cases, but none selected the correct block afterwards. The algorithm reacts to losses; it has not reliably learned the necessary alternative action.

The audit ran 2,400 games in total, including a second comparison with equal 10% exploration, plus 800 generated tactical positions. These are measured results for fixed custom opponents and test positions, not a promise against any person. See [evaluation](evaluation/README.md) for methods, data and reproduction. More games do not guarantee stronger play, and self-play can reinforce weak strategies.

### How the neural network works

**81 → 256 tanh → 256 tanh → 81 linear**: 512 hidden neurons in two layers and exactly **107,601 trainable parameters**.

```text
81×256 + 256 + 256×256 + 256 + 256×81 + 81 = 107601
```

Each input cell is +1 for the current player's mark, −1 for the opponent and 0 for empty. Outputs are masked to legal cells and normalized with softmax. Gameplay chooses the highest preference with occasional exploration: initially 22%, decreasing with experience to a minimum of 5%. There is no minimax, hidden tactical fallback or external AI. Float32 inference weights occupy 430,404 bytes; optimizer arrays and history are additional storage.

The original model starts from Xavier uniform random weights, zero biases and seed 107601. The included experience was accumulated through play from that initialization, without imported third-party model weights. After each completed decisive game, winner actions receive positive rewards and loser actions negative rewards, discounted by 0.97 per remaining move. Six Adam updates each use eight examples, approximately 65% from the latest game and the rest from replay, with random rotations/reflections. Learning rate is 0.0003, entropy coefficient 0.003 and gradient norm limit 1. All matrices and biases are trained. A draw is recorded without weight updates; interrupted games and repeated recent completion notifications do not train.

This is an experimental outcome-weighted policy learner. It does not explicitly determine which alternative move would have prevented a loss. Weight changes, training counters and winning strength are different things.

### Try an educational experiment

Export a starting checkpoint, play a fixed number of complete games, export again, then compare both checkpoints on the same opponents and positions. Keep test games separate from training. Compare human play with self-play, inspect a missed block, or change one training setting in your own copy. Record the seed, opponent, number of games and whether exploratory moves were enabled. The included checkpoint offers everyone the same reproducible starting experience.

To study learning from random initialization, export your current experience first and use the confirmed reset control. To restore the distributed 185-game model, import `model/checkpoint-185.json`. Existing local progress is never automatically replaced with the bundled checkpoint.

### Storage, privacy and safety

Experience is stored locally in **IndexedDB**, with atomic writes and revision checks. If unavailable, localStorage is a fallback with weaker cross-tab protection; otherwise the app warns that experience is only in RAM. Use one learning tab at a time. Storage errors and corrupt checkpoints do not silently create a new model; export remains available for unsaved valid state.

A checkpoint includes weights, Adam moments and step, training random state, counters, up to **2,048 positions** and the last **200 complete games**. The interface shows 12 recent games. Old records are replaced; this is bounded memory, not an infinite database of combinations. The unfinished board is not exported.

Experience belongs to the browser and address, not to the HTML file. Clearing browser data, private browsing or changing browser/device/origin can lose or isolate it. Export/import is the transfer and backup mechanism. Imports are local, limited to 6 MiB, strictly validated and confirmed before replacement. The public bundled checkpoint intentionally shares its game records; your subsequent games are not uploaded.

No backend, administrator panel, authentication, remote database, SMTP, personal-data form or remote API is needed. No default credentials apply. CSP blocks external resources and network connections; the app uses local scripts/styles and an embedded Blob Worker, with a cooperative fallback if workers are unavailable. Text is rendered safely and imported values, games and numeric arrays are checked. These measures are not a security certification.

### Source, build, tests and deployment

Playing requires only a modern browser. Rebuilding requires **Python 3.10+**; automated tests and the evaluation script require **Node.js 18+**. There are no npm/runtime dependencies.

```sh
python3 -B -S build_demo.py
python3 -B -S tests.py
# Engine tests directly:
node --test tests/engine.test.cjs
```

Set `XO_NODE` to your Node executable if it is not on PATH. On Windows, use `py -3` instead of `python3`. Optional local serving: `python3 -m http.server 8618 --bind 127.0.0.1`, then open `http://127.0.0.1:8618/`; Ctrl+C stops the server. File and HTTP origins have separate experience.

| Path | Purpose |
|---|---|
| `index.html` | Ready-to-play standalone game with the embedded 185-game checkpoint |
| `web/` | Interface, rules, neural network, learning, persistence and Worker source |
| `web/bootstrap.js` | Validated startup selection that preserves existing local experience |
| `web/i18n.js`, `web/messages.js` | RU/EN selection, static translations and dynamic messages |
| `model/manifest.json` | Architecture and release/checkpoint metadata |
| `model/checkpoint-185.json` | Original partially trained state, also available for manual import |
| `build_demo.py` | Embeds sources, styles and the checkpoint; refreshes checksums; never trains |
| `tests/engine.test.cjs`, `tests.py` | Numerical, rules, checkpoint and build/integrity checks |
| `evaluation/` | Reproducible strength audit and its recorded results |
| `verification.json`, `SHA256SUMS.txt` | Release verification evidence and file integrity |
| `HANDOFF.md`, `PROJECT_CONTEXT.md`, `TASK.md`, `AI_RULES.md`, `Codex_History.md` | Handoff, architecture, requirements, contributor rules and history |
| `design/README.md` | Existing visual and responsive design decisions |

GitHub Pages deployment uses **GitHub Actions from `main`**, publishing only the generated **`index.html`** at [the game URL](https://bekus2.github.io/Tiny-AI-XO-107601/). The workflow configuration is in `.github/workflows/checks.yml`; the offline ZIP remains available. All runtime assets and the shared checkpoint are embedded. No database migrations or server secrets are necessary. Rebuild after source changes and verify the Pages deployment run and public URL after publishing. Keep personal checkpoint exports out of public commits unless you intend to share them; deployment does not upload or synchronize browser experience.

For further development, use feature/fix/docs branches and reviewed pull requests against stable `main`, preserve checkpoint compatibility and document new measurements. Future work could teach explicit defensive alternatives, diversify opponents, add more evaluation positions and support additional interface languages. Changed rules or architecture require new compatibility and strength checks. See [HANDOFF](HANDOFF.md).

The [license](LICENSE.txt) permits free educational/personal/noncommercial use, training, modification, forking and sharing with attribution. Other rights are reserved. A public repository is not a claim of an unrestricted OSI open-source license. Author: **Beck Sarbassov**; created 2026-10-27, updated 2026-11-15.

## Русский

### Что это за проект?

Tiny AI XO 107601 — образовательная офлайн-игра **крестики-нолики 9×9** с небольшой нейросетью на обычном JavaScript. Цель — объяснять ИИ через увлекательную игру: наблюдать решения, завершать партии, видеть реальные обновления весов, сохранять свою модель и экспериментировать с обучением. Это игровая сеть, а не чатбот или универсальный ИИ.

В поставку входит **частично обученная модель Beck Sarbassov с опытом 185 партий**. Новый браузер начинает с этого опыта. Уже сохранённая локальная модель имеет приоритет, в том числе модель после осознанного сброса до нуля. Можно продолжать обучение поставляемой сети либо экспортировать свой прогресс и начать со случайных весов. Расчёты выполняются на вашем устройстве; аккаунт, ключи API или внешний ИИ не нужны. Скачанная копия работает без интернета.

### Играть онлайн

Откройте **[Tiny AI XO 107601 в браузере](https://bekus2.github.io/Tiny-AI-XO-107601/)**. Скачивание и установка не требуются. При первом посещении без сохранённого опыта для этого адреса используется встроенная **модель после 185 партий**; следующие посещения продолжают сохранённую модель этого адреса. Для загрузки сайта нужен интернет; обучение и хранение выполняются на вашем устройстве, без облачной синхронизации.

### Скачать и начать играть

1. Скачайте ZIP по ссылке в начале README или через **Code → Download ZIP** на GitHub.
2. Распакуйте архив и откройте **`index.html`** в современном браузере с JavaScript. Установка и сборка для игры не нужны.
3. Выберите X или O и нажимайте свободные клетки. X ходит первым. Завершите партию, чтобы получить новый обучающий опыт.
4. Кнопка **«ИИ играет сам»** запускает одну сеть за обе стороны и обучение по исходам. Автоигра сама при открытии не включается.
5. **«Скачать мой ИИ»** сохраняет ваш опыт в JSON перед переносом на другое устройство или новым экспериментом.

Кнопки **RU / EN** вверху страницы переключают интерфейс между русским и английским. Сохранённый выбор имеет приоритет; иначе используется первый поддерживаемый язык браузера, а если его нет — английский. Язык сохраняется отдельно от опыта ИИ. При запрете хранения этой настройки выбор действует до перезагрузки или закрытия текущей страницы. Смена языка сохраняет доску, отложенные ходы и прогресс обучения.

«Новая партия» отменяет незавершённую доску без обучения; «Остановить автоигру» останавливает самоигру, но уже начатое обновление завершится. «Загрузить мой ИИ из файла» переносит сохранённое состояние после подтверждения. «Удалить опыт и начать с нуля» осознанно заменяет локальную модель случайной сетью с нулевым опытом.

Победа — **пять или больше подряд** по горизонтали, вертикали или любой диагонали. Пять–восемь — победа, девять — **суперпобеда**. Длинная линия может появиться одним ходом при соединении двух частей. Полная доска без выигрышной линии — ничья. Поддерживаются мышь, касания, Tab, Enter/Space и стрелки. Проценты в клетках обозначают предпочтения сети, **не вероятность победы**.

### Продолжить свой накопленный опыт на сайте

У скачанного `index.html` и HTTPS-сайта разные хранилища браузера. Публикация или открытие сайта не переносит и не удаляет опыт по прежнему адресу.

1. Откройте локальную игру или адрес с вашим последним опытом и нажмите **«Скачать мой ИИ»**, чтобы сохранить JSON-чекпоинт.
2. Откройте [сайт](https://bekus2.github.io/Tiny-AI-XO-107601/). Если там уже обучалась другая модель, перед заменой скачайте и её.
3. Нажмите **«Загрузить мой ИИ из файла»**, выберите нужный чекпоинт и подтвердите замену. Импорт заменяет текущую модель, а не объединяет две истории.
4. Проверьте счётчик опыта, продолжайте играть и регулярно скачивайте резервные копии. Исходный экспорт и опыт по прежнему адресу останутся доступными.

### Какой опыт накоплен и чему ИИ научился?

Файл [`model/checkpoint-185.json`](model/checkpoint-185.json) содержит **185 партий: 183 самоигры и 2 с человеком**, **1 110 обновлений весов**, **8 880 обучающих примеров** с повторами и **2 048 записей позиций**. Сохранён полный журнал всех 185 игр. Все 107 601 параметр отличаются от исходной сети. Воспроизведение журнала на отдельной копии в точности восстановило веса и состояние оптимизатора.

Исходная и обученная сеть проверялись в одинаковых условиях за X и O. В основном сравнении использовался ход с максимальной оценкой без случайного исследования; во время тестовых матчей веса не обучались.

| Соперник | Исходная сеть: побед из 200 | После 185 партий: побед из 200 |
|---|---:|---:|
| Случайные допустимые ходы | 91 | **189** |
| Завершает победу и блокирует немедленную угрозу; остальные ходы случайные | 1 | **5** |
| Дополнительно оценивает построение и защиту линий из пяти клеток | 0 | **0** |

Против случайных ходов сеть стала заметно сильнее. Против тактических соперников она остаётся слабой. В **64 позициях из собственной истории** ИИ снова пропустил обязательную блокировку. На 24 отдельных копиях дополнительная проигранная партия уменьшила вероятность конкретного плохого хода в 19 случаях, однако правильную блокировку не выбрала ни одна копия. Алгоритм реагирует на проигрыш, но нужную альтернативу пока не освоил надёжно.

Всего проведено 2 400 тестовых партий, включая сравнение с одинаковыми 10% случайных ходов, и 800 сгенерированных тактических позиций. Это результаты данной выборки и конкретных тестовых соперников, а не обещание побед против любого человека. Методика и воспроизведение — в [evaluation](evaluation/README.md). Большее число игр не гарантирует улучшение; самоигра способна закреплять слабые стратегии.

### Как устроено обучение

Архитектура **81 → 256 tanh → 256 tanh → 81 linear**: 512 скрытых нейронов в двух слоях, ровно **107 601 обучаемый параметр**. Формула: `81×256 + 256 + 256×256 + 256 + 256×81 + 81`. Веса занимают 430 404 байта float32; оптимизатор и история требуют дополнительной памяти.

Вход от лица текущего игрока: +1 — своя фигура, −1 — чужая, 0 — пусто. Выходы ограничиваются свободными клетками и нормализуются softmax. Обычно выбирается максимальная оценка; иногда исследуется случайный ход. Вероятность исследования уменьшается с 22% до минимальных 5% по мере роста опыта. Минимакса, скрытой тактической подстраховки и внешнего ИИ нет.

Исходная инициализация — Xavier uniform, seed 107601, смещения нулевые. Поставляемый опыт получен играми начиная с этой сети, без чужих готовых весов. После решающей партии ходы победителя получают положительную награду, проигравшего — отрицательную, с дисконтом 0.97 за оставшийся ход. Выполняются шесть обновлений Adam по восемь примеров: около 65% из последней партии, остальные из памяти, с поворотами и отражениями. Скорость обучения 0.0003, коэффициент энтропии 0.003, ограничение нормы градиента 1. Меняются все матрицы и смещения. Ничья сохраняется без обновления весов; прерванные игры и повторные недавние уведомления не обучают.

Это экспериментальное обучение по исходу. Оно явно не вычисляет, какой альтернативный ход предотвращал проигрыш. Изменение весов, число тренировок и сила игры — разные показатели.

### Образовательный эксперимент

Экспортируйте начальное состояние, сыграйте фиксированное число полных партий, экспортируйте снова и сравните обе модели на одинаковых соперниках и позициях. Отделяйте проверку от обучения. Сравните игры с человеком и самоигру, разберите пропущенную блокировку или измените один параметр обучения в своей копии. Записывайте seed, соперника, число игр и наличие случайных ходов. Встроенные 185 партий дают всем одинаковую воспроизводимую исходную точку.

Для изучения обучения с нуля сначала скачайте текущий опыт, затем используйте подтверждаемый сброс. Для возврата к поставляемой модели импортируйте `model/checkpoint-185.json`. Существующий локальный прогресс не заменяется встроенной моделью автоматически.

### Хранение и безопасность

Опыт хранится локально в **IndexedDB** с атомарной записью и проверкой ревизий. Резервное хранилище — localStorage с менее строгой защитой между вкладками; если хранение недоступно, появляется предупреждение о работе в памяти. Используйте одну обучающую вкладку. Ошибка сохранения или повреждённая модель не приводят к тихому созданию новой сети; корректный несохранённый опыт остаётся доступен для экспорта.

Чекпоинт содержит веса, состояние Adam, генератор случайных чисел, счётчики, до **2 048 позиций** и **200 последних партий**. В интерфейсе показаны 12 последних игр. Старые записи вытесняются: память ограничена. Незавершённая доска в экспорт не входит.

Опыт относится к браузеру и адресу, а не к файлу HTML. Очистка данных, приватный режим, другой браузер/устройство/адрес могут удалить или отделить прогресс. Перенос и резервирование выполняются через экспорт/импорт. Импорт локальный, до 6 МиБ, со строгой проверкой и подтверждением замены. Публичный встроенный чекпоинт намеренно содержит журнал игр; ваши дальнейшие партии никуда не отправляются.

Нет бэкэнда, админки, авторизации, серверной БД, SMTP, форм персональных данных или удалённого API. Стандартные пароли не применяются. CSP запрещает внешние ресурсы и сеть; вычисления выполняет встроенный Blob Worker, а при его запрете — совместимый режим. Данные безопасно выводятся, входные числа, массивы и партии проверяются. Это меры безопасной разработки, не сертификация.

### Исходники, сборка, тесты и публикация

Для игры достаточно браузера. Для сборки нужен **Python 3.10+**, для тестов и оценки силы — **Node.js 18+**. Зависимостей npm нет.

```sh
python3 -B -S build_demo.py
python3 -B -S tests.py
node --test tests/engine.test.cjs
```

Если Node не в PATH, задайте `XO_NODE`. В Windows используйте `py -3` вместо `python3`. Локальный сервер при желании: `python3 -m http.server 8618 --bind 127.0.0.1`; адрес `http://127.0.0.1:8618/`, остановка Ctrl+C. У файла и HTTP-адреса разный опыт.

Структура: `web/` — исходники интерфейса, правил, модели, обучения и хранения; `model/` — метаданные и исходный чекпоинт; `index.html` — готовая автономная игра; `build_demo.py` — сборка без обучения; `tests/` и `tests.py` — проверки; `evaluation/` — воспроизводимая оценка силы; `verification.json` и `SHA256SUMS.txt` — результаты верификации и целостность; шесть корневых Markdown-документов — передача проекта, требования и история; `design/README.md` — принципы оформления.

Публикация GitHub Pages выполняется через **GitHub Actions из `main`**: на [адрес игры](https://bekus2.github.io/Tiny-AI-XO-107601/) размещается только сгенерированный **`index.html`**. Конфигурация workflow находится в `.github/workflows/checks.yml`; офлайн-ZIP остаётся доступным. Ресурсы и общий чекпоинт встроены, миграции БД и серверные секреты не нужны. После правок пересобирайте HTML, а после публикации проверяйте выполнение Pages workflow и публичный адрес. Личные экспорты не добавляйте в коммиты без намерения поделиться ими: размещение сайта не загружает и не синхронизирует опыт браузера.

Для развития используйте ветки feature/fix/docs, проверку PR и стабильную `main`, сохраняйте совместимость опыта и документируйте новые измерения. Дальнейшие направления: обучение конкретным защитным альтернативам, разные соперники, новые проверки и дополнительные языки интерфейса. Изменение правил/архитектуры требует новых проверок. Инструкции разработчику — [HANDOFF](HANDOFF.md).

[Лицензия](LICENSE.txt) разрешает бесплатное образовательное/личное/некоммерческое использование, обучение, изменение, форки и распространение с сохранением авторства. Остальные права сохраняются. Публичность репозитория не означает неограниченную открытую лицензию OSI.

Автор: Beck Sarbassov  
Дата создания: 2026-10-27  
Последнее обновление: 2026-11-15  
Авторские права: © Beck Sarbassov. Все права защищены.
