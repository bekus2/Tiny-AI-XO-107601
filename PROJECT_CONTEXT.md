# Project context / Контекст проекта — v2.1.0

## English

**Purpose and audience.** An educational browser game for curious players, students, teachers and developers who want to see how a small AI learns. Players can download, play, train, save and modify their own copies. The current release shares the owner's partially trained 185-game state. Earlier releases started exclusively from random initialization; that restriction is superseded for this authorized public checkpoint release.

**Rules.** A 9×9 board; X first; empty-cell moves only; a contiguous run of at least five in any of four directions ends the game. Nine is a super win, including a single move joining shorter chains. Full board without a winner is a draw. Completed episodes are replayed from empty board; illegal sequences, false outcomes and post-win moves are rejected.

**Model.** 81 relative inputs (+1 self, −1 opponent, 0 empty), 256 tanh, 256 tanh, 81 linear outputs. Layout: W1 20,736; b1 256; W2 65,536; b2 256; W3 20,736; b3 81, total 107,601 parameters. Initial seed 107601, Xavier uniform, zero biases. Softmax is masked to empty cells; argmax plus exploration decreasing from 22% to a 5% floor. One network serves both players; there is no tactical/minimax fallback.

**Learning.** Winner actions get +1 and loser actions −1, discounted by 0.97 to the remaining ply count; draws get zero and no updates. A decisive episode yields six batches of eight samples, approximately 65% current episode and otherwise replay, with D4 transforms. Outcome-weighted policy gradients use entropy 0.003, Adam learning rate 0.0003 and gradient norm clip 1. This experimental replay objective does not guarantee convergence or improvement. It does not supply a correct alternative for every failed action.

**Startup and state.** Prefer a valid local checkpoint, even one with zero games. With no local state, load the bundled `model/checkpoint-185.json` embedded in `index.html`; no network fetch is needed. Invalid saved state must not trigger fallback or overwrite. Confirmed reset uses random zero-game state and saves it. Imports require confirmation. The published checkpoint retains format `tiny-ai-xo-online-v2` and its original internal version 2.0.0; the distribution version is 2.1.0.

**Flow.** UI validates turn/move → terminal episode → Worker/shared learner → updated checkpoint → inference network and local persistence. New games and model replacement wait for learning/save completion. Worker failure uses cooperative computation between batches. Generation tokens cancel stale delayed moves; modal replacement pauses play. Self-play is opt-in and is off on opening.

**Persistence and safety.** A checkpoint holds float32 little-endian/base64 weights and Adam arrays, RNG, step, counters, replay up to 2,048 and journal up to 200 games (12 visible). Optimizer/history are not inference parameters. IndexedDB writes atomically with revisions; localStorage is a weaker optimistic fallback; unavailable storage produces a RAM warning. No silent reset on quota, conflict or corruption. Export/import is the backup and transfer mechanism; active boards are excluded. Browser/origin storage can be cleared independently of files.

No server, admin roles, login, backend API, SQL, SMTP or personal-data form exists. No credentials are needed. CSP blocks external resources/network, allowing bundled inline code/styles and Blob Worker. Imports up to 6 MiB validate schema, numbers, counters and trajectories. Output uses safe text rendering. The public checkpoint intentionally shares game moves/timestamps, not device secrets. Later user experience stays local unless exported/shared intentionally.

**Evidence and next steps.** The bundled state contains 185 games (183 self, 2 human), 1,110 updates and 8,880 sampled examples. Its entire history exactly reproduces the weights and optimizer. Against fixed opponents, wins per 200 increased 91→189 for random moves, 1→5 for immediate win/block and stayed 0→0 for a line-scoring bot. None of 64 historical forced blocks was corrected. See `evaluation/` for scope/reproduction. The current objective is education and experimentation, not unbeatable play. Future changes may add explicit defense teaching, diverse opponents, localization and broader evaluation while preserving existing experience. Architecture/rules changes need renewed checks and migration decisions.

## Русский

**Цель и аудитория.** Образовательная игра для любознательных игроков, учащихся, преподавателей и разработчиков. Проект позволяет скачать, играть, обучать, сохранять и изменять свою копию. Текущая поставка делится частично обученным состоянием автора после 185 партий. Прежнее требование только случайного старта заменено разрешённой публикацией этого опыта.

**Правила.** Доска 9×9; X начинает; ходы только в свободные клетки. Непрерывная линия ≥5 по четырём направлениям завершает игру; девять — суперпобеда. Можно соединить две цепочки одним ходом. Полная доска без победителя — ничья. Эпизод проверяется с пустого поля: неверные исходы, нелегальные и послепобедные ходы отклоняются.

**Модель.** 81 относительный вход (+1 своя, −1 чужая, 0 пусто), 256 tanh, 256 tanh, 81 linear. Размеры W1/b1/W2/b2/W3/b3: 20 736/256/65 536/256/20 736/81, всего 107 601. Исходный seed 107601, Xavier uniform, нулевые смещения. Softmax по свободным клеткам; максимум оценки плюс исследование от 22% до минимальных 5%. Сеть общая для X/O, скрытого минимакса или тактической подстраховки нет.

**Обучение.** Ходы победителя +1, проигравшего −1, дисконт 0.97 за оставшийся ход; ничья 0 без обновлений. Решающая партия: шесть пакетов по восемь примеров, около 65% текущая игра, остальные из памяти, D4-преобразования. Градиент по награде, энтропия 0.003, Adam 0.0003, ограничение нормы 1. Это экспериментальный алгоритм без гарантии сходимости/роста силы; правильная альтернатива ошибочному ходу явно не задаётся.

**Запуск и состояние.** Сохранённый корректный чекпоинт всегда имеет приоритет, даже с нулевым опытом. Только при отсутствии локальных данных загружается встроенный `model/checkpoint-185.json`, без сети. Повреждённый опыт не заменяется. Подтверждённый сброс создаёт и сохраняет случайную нулевую модель. Импорт с подтверждением. Формат опыта остаётся `tiny-ai-xo-online-v2`, внутренняя версия исходного JSON — 2.0.0; версия поставки — 2.1.0.

**Поток.** UI проверяет ход → полный эпизод передаётся Worker → общий learner меняет веса → новый чекпоинт становится игровой моделью и сохраняется. До конца обновления/записи новая игра и замена модели блокируются. При запрете Worker — кооперативный расчёт. Generation-токены отменяют старые отложенные действия; модальные окна ставят игру на паузу. Самоигра включается только пользователем.

**Хранение и защита.** Веса/Adam float32 little-endian/base64, RNG, шаг, счётчики, до 2 048 позиций и 200 игр; видны 12. Оптимизатор и история не входят в параметры. IndexedDB атомарный с ревизиями; localStorage — менее строгий резерв; RAM — с предупреждением. Конфликт/квота/повреждение не сбрасывают опыт молча. Экспорт/импорт переносит состояние без текущей незавершённой доски. Браузерный origin может очищаться независимо от файлов.

Сервера, админки, авторизации, API, SQL, SMTP и форм персональных данных нет. Ключи/пароли не нужны. CSP ограничивает сеть/ресурсы, разрешая встроенный код и Blob Worker. Импорт до 6 МиБ с проверкой схемы, чисел, счётчиков и партий. Вывод — безопасный текст. Публичный чекпоинт намеренно раскрывает ходы/время игр, не секреты устройства. Дальнейший опыт пользователей остаётся локальным до явного экспорта/передачи.

**Проверка и развитие.** В поставке 185 игр (183 самоигры, 2 с человеком), 1 110 обновлений, 8 880 примеров. Вся история точно воспроизводит веса/Adam. Победы из 200 выросли 91→189 против случайных ходов, 1→5 против немедленной победы/блокировки, остались 0→0 против оценки линий. Ни одна из 64 исторических обязательных блокировок не исправлена. Методика — `evaluation/`. Цель — обучение людей и эксперименты, не непобедимость. Развитие: явное обучение защите, разные соперники, локализация, новые тесты с сохранением опыта. Изменение архитектуры/правил требует проверок и решения о миграции.

Автор: Beck Sarbassov  
Дата создания: 2026-10-27  
Последнее обновление: 2026-11-05  
Авторские права: © Beck Sarbassov. Все права защищены.
