# Change history / История Tiny AI XO 107601

## 2026-11-05 — v2.1.0

### Summary / Краткое
Prepared the public educational release with Beck Sarbassov's actual 185-game checkpoint. A new browser starts from the bundled partial training; existing user experience, including zero-game resets, takes priority. The objective is learning about AI through playing, observing, training and experimenting. The owner explicitly requested publication to `bekus2/Tiny-AI-XO-107601`, `main`.

Подготовлена публичная образовательная версия с реальным опытом Beck Sarbassov после 185 партий. Новый браузер получает встроенное частичное обучение; личный опыт, включая нулевой сброс, имеет приоритет. Цель — знакомство с ИИ через игру, наблюдение, обучение и эксперименты. Владелец прямо запросил публикацию в `bekus2/Tiny-AI-XO-107601`, `main`.

### Changed files / Измененные файлы
- `web/app.js`, `web/bootstrap.js`, `web/index.template.html`, `build_demo.py`, `model/manifest.json`, `model/checkpoint-185.json`, `index.html`.
- `tests/engine.test.cjs`, `verification.json`, `SHA256SUMS.txt`, Git publication configuration and evaluation artifacts.
- `README.md`, `HANDOFF.md`, `PROJECT_CONTEXT.md`, `TASK.md`, `AI_RULES.md`, `Codex_History.md`, `MODEL_CARD_RU.md`, `START_HERE.txt`, `LICENSE.txt`, `THIRD_PARTY_NOTICES.md`, `design/README.md`.

### Added / Добавлено
- Offline embedded checkpoint, 185 games (183 self-play, 2 human), 1,110 updates and 8,880 sampled examples; original export preserved byte for byte.
- Bilingual project purpose, controls guide, training explanation, reproducible evaluation, experimental exercises and handoff documentation.
- Explicit permission for educational, personal and noncommercial use, modification, training, forking and attributed sharing.
- Portable evaluation materials documenting strength and tactical limits.

- Встроенный офлайн-чекпоинт: 185 игр (183 самоигры, 2 с человеком), 1 110 обновлений и 8 880 примеров; исходные байты экспорта сохранены.
- Двуязычные цель проекта, управление, объяснение обучения, воспроизводимая оценка, упражнения и передача разработчику.
- Явное разрешение образовательного, личного и некоммерческого использования, изменения, обучения, форков и распространения с авторством.
- Переносимые материалы оценки силы и тактических ограничений.

### Fixed / Исправлено
- Startup descriptions now distinguish bundled training from random initialization and continued local experience.
- Missing startup-state tests now cover fresh185, saved-state priority, explicit zero and corruption blocking.

- Описание запуска теперь различает встроенное обучение, случайную инициализацию и продолжение личного опыта.
- Добавлены проверки первого старта185, приоритета сохранённого опыта, явного нуля и блокировки при повреждении.

### Security / Безопасность
- Preserved local-only computation, checkpoint validation, CSP, bounded memory, confirmed replacement/reset and exportable unsaved state. No account or service credentials are needed.
- Existing browser experience and the owner's original export were not reset or overwritten. Public evaluation artifacts use portable paths.

- Сохранены локальные расчёты, валидация, CSP, ограниченная память, подтверждение замены/сброса и экспорт несохранённого опыта. Аккаунты/ключи не нужны.
- Личный опыт и исходный экспорт автора не сбрасывались и не заменялись. Материалы оценки используют переносимые пути.

### Validation and notes / Проверки и примечания
- 22 Node engine tests passed. Isolated browser verification: fresh185 games/1,110 updates; self-play reached191/1,146; reopening the same origin retained191. No console errors/warnings were observed in that check. See `verification.json` for precise scope and historical checks.
- Portable strength audit reproduced recorded results. Main wins per200: random91→189, immediate win/block1→5, line-scoring0→0; no corrected blocks in64 selected historical positions. The training algorithm is unchanged; defensive learning remains a research limitation.
- GitHub source publication and optional website hosting are separate; remote commit state is the publication evidence. No GitHub Pages availability is implied here.

- Пройдены 22 Node-теста. Изолированная браузерная проверка: старт185/1 110 обновлений, самоигра до191/1 146, повторное открытие того же origin сохраняет191. В этой проверке ошибок/предупреждений консоли не наблюдалось. Точная область и исторические проверки — `verification.json`.
- Переносимый аудит воспроизвёл результаты. Победы из200: случайный91→189, немедленная победа/блокировка1→5, оценка линий0→0; в64 выбранных исторических позициях блокировки не исправлены. Алгоритм обучения не менялся; обучение защите остаётся направлением исследования.
- Исходники GitHub и сайт — разные результаты; публикация подтверждается удалённым коммитом. Доступность GitHub Pages здесь не утверждается.

## Historical releases / Исторические выпуски

The entries below retain the original historical record. v2.0.0 replaced the 3×3 model with random-start9×9 online learning. v1.0.0 described the earlier617-parameter model and its later archive removal. Their “no trained weights”, “not published” and 3×3 strength statements describe those dated releases, not v2.1.0. Obsolete model files are not included.

Ниже сохранены исходные исторические записи. v2.0.0 заменила3×3 на9×9 со случайным стартом и обучением на ходу. v1.0.0 описывала прежнюю сеть617 и последующее удаление архива. Утверждения «нет готовых весов», «не опубликовано» и показатели силы3×3 относятся к тем датированным выпускам, не кv2.1.0. Устаревшие модели в поставку не входят.

## 2026-10-29 — v2.0.0

### Краткое
Полная согласованная замена 3×3 на 9×9 и сеть 81→256→256→81 с 107601 параметром. Случайный старт, без предварительного обучения. Обучение и сохранение опыта после партий прямо в браузере.

### Измененные файлы
- Новые web/neural.js, learner.js, storage.js, worker.js, client.js и tests/engine.test.cjs.
- Обновлены web/core.js, app.js, app.css, index.template.html, build_demo.py, tests.py, index.html, model/manifest.json, verification.json и контрольные суммы.
- Обновлены шесть корневых документов, MODEL_CARD_RU.md, START_HERE.txt, LICENSE.txt, THIRD_PARTY_NOTICES.md, design/README.md и Git-правила.
- Удалены прежние Python runtime/обучение, готовые веса/позиции/отчёт, audit.js, зависимости NumPy и старый графический концепт. Прежние модели не архивируются.

### Добавлено
- Правила ≥5 подряд в четырёх направлениях, полная длина до 9, суперпобеда 9.
- Реальные reward-weighted gradients, replay2048/история 200, D4-симметрии, Adam, Worker/fallback.
- Локальный checkpoint/ревизии, сообщения об ошибках, экспорт/импорт/подтверждаемый сброс и добровольная автоигра.

### Исправлено
- Отмена устаревших ходов, пауза при замене модели, сохранение после reload, защита от ошибочных/повторных партий.
- Счётчики обучения отражают реальные действия; ничья не создаёт вымышленных обновлений.

### Безопасность
- Нет внешнего сервиса/секретов/телеметрии. CSP, проверка импортов/траекторий/чисел/лимитов, атомарный IndexedDB и обнаружение конфликтов вкладок.
- Ошибка хранения не сбрасывает личный прогресс молча; RAM-чекпоинт экспортируется.

### Примечания
- Сила новой модели не оценивалась; прежние метрики 3×3 ниже являются историческими и к 9×9 не относятся.
- Длительное обучение не проводилось. Короткие тесты изолированы и не поставляются как готовые веса. Итоговая верификация — verification.json.
- Начальная сеть слабая; нет гарантии улучшения/побед, память ограничена, другие браузеры кроме Chrome отдельно не проверены.

## 2026-10-27 — v1.0.0 (очистка поставки)

### Краткое
По прямому указанию пользователя удалена предыдущая модель и её архивная копия. В проекте и ZIP остаётся только Tiny AI XO 617 с обучением со случайных весов и браузерной игрой.

### Измененные файлы
- Удалён каталог legacy/ с предыдущей программой, данными и весами.
- Обновлены README.md, HANDOFF.md, PROJECT_CONTEXT.md, TASK.md, AI_RULES.md, MODEL_CARD_RU.md, START_HERE.txt, LICENSE.txt, THIRD_PARTY_NOTICES.md, .gitattributes.
- tests.py проверяет поставку только текущей игровой модели; обновлены verification.json, index.html, SHA256SUMS.txt и переносимый ZIP.

### Добавлено
- Явное правило поставки только текущей игровой модели.

### Исправлено
- Отменено сохранение предыдущей версии: это уточнённое требование пользователя.

### Безопасность
- Офлайн-работа, валидация, CSP и отсутствие внешних сервисов сохранены.

### Примечания
- Веса, архитектура и игровой алгоритм не изменялись. Историческая запись ниже описывает первоначальную сборку; архив из неё теперь удалён.

## 2026-10-27 — v1.0.0

### Краткое
Основное приложение переименовано из Tiny AI 302 в Tiny AI XO 617 и заменено на готовую игру против собственной сети из 617 параметров. Прежняя версия сохранена целиком без изменения.

### Измененные файлы
- index.html, train.py, build_demo.py, tests.py, requirements-training.txt, verification.json, SHA256SUMS.txt, START_HERE.txt, LICENSE.txt, THIRD_PARTY_NOTICES.md.
- Новые tiny_xo.py, game_rules.py, tests_training.py, web/, model/, design/, .gitignore, .gitattributes.
- README.md, HANDOFF.md, PROJECT_CONTEXT.md, Codex_History.md, TASK.md, AI_RULES.md, MODEL_CARD_RU.md.
- Прежние исходники/данные/веса/документы перенесены в legacy/tiny-ai-302/ и проверены оригинальными SHA256.

### Добавлено
- Игра за X/O, новые партии, реальные оценки, локальный счёт/сброс, клавиатура/касания/мышь.
- Сеть 9→32 tanh→9; собственные Adam/backpropagation и обучение случайных весов seed 617.
- Разметка 4520 активных состояний, float32/JSON экспорт, CLI и браузерный полный аудит.
- Оптимальны 4501/4520 действий; все продолжения с пустой доски дают 0 поражений за обе стороны.

### Исправлено
- Отменяются устаревшие отложенные ходы при смене стороны/новой партии.
- Заблокированы занятые клетки/завершённые игры, нет двойных ходов и переполнения от 320px.
- Скрытые элементы имеют приоритетный CSS, старый дефект скрытия не перенесён.

### Безопасность
- Офлайн без внешнего ИИ, секретов, аккаунтов и телеметрии.
- Валидация весов/доски/счёта, CSP, textContent; оригинальные лицензии архива сохранены.

### Примечания
- Полное игровое пространство используется и в обучении, и в аудите; это не holdout-оценка.
- В 19 произвольных позициях выбор неоптимален; не обещать идеальную игру с произвольной доски.
- Прямо проверен Chrome file:// без сети. Python/JS ходы совпадают на всех 4520 позициях.
- Проверены 617 численных производных; подробные результаты в verification.json.
- Safari/Firefox и удалённая публикация не входили в эту задачу.

Автор: Beck Sarbassov  
Дата создания: 2026-10-27  
Последнее обновление: 2026-11-05  
Авторские права: © Beck Sarbassov. Все права защищены.
