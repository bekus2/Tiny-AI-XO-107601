# Evaluation / Оценка силы

Author / Автор: Beck Sarbassov · 2026-11-05  
© Beck Sarbassov. All rights reserved / Все права защищены.

## English

This is a reproducible, fixed-opponent evaluation of the shared **185-game checkpoint**, not a promise of strength against humans. `results.json` records the 2026-11-05 audit; `tactical-fixtures.json` contains its 800 independently generated legal test positions. Private machine paths have been replaced with repository-relative paths. No game histories or weights were changed.

Each model played 200 games per opponent (100 as X, 100 as O), with paired seeds and initial positions of 0/2/4/6 moves. The primary run uses greedy neural decisions, with no learning during matches. Wins before → after learning: random opponent **91 → 189**, immediate win/block opponent **1 → 5**, line-scoring opponent **0 → 0**. An additional equally exploratory 10% run produced 91 → 189, 2 → 11, and 0 → 0 wins. There were 2,400 evaluation games in total. These custom opponents are not optimal players. The random-opponent gain was 49 percentage points (95% paired-seed bootstrap interval 41–56.5); the primary win/block gain was only 2 points (interval 0–4.5).

On 400 immediate-win fixtures the models chose a winning move 5 → 9 times; on 400 unique forced-block fixtures they blocked 7 → 38 times. Fixtures balance players, four directions and resulting line lengths 5–9. On the ordinary length-five subset the trained model solved only 1/80 wins and 1/80 blocks. Improvement against random play does not mean mastery of basic tactics.

The current network failed to correct all 64 uniquely preventable final blunders found in its own history: 11 repeated the exact move, 53 selected another losing move. In 24 independent in-memory copies, one additional training episode reduced the bad move's probability in 19 cases, but no copy selected the required block afterwards. These seen-history tests are separate from the generated tactical cases. Full isolated replay of all 185 games exactly reproduced weights, Adam state, RNG, statistics and memory. Test-trained copies were discarded.

Run with Node.js 18+ from the repository root:

```sh
node evaluation/audit.cjs
# Optional input checkpoint and NEW output directory:
node evaluation/audit.cjs model/checkpoint-185.json /absolute/path/new-audit
```

The script reads the checkpoint, reconstructs the original random baseline, freezes both models for matches, and trains only isolated copies for error probes. It prints the result path, writes to a new temporary directory by default, refuses to overwrite existing output files, and checks the input SHA-256 again at the end. It never accesses browser storage. Runtime and exact floating-point reproduction can vary across JavaScript engines. This full evaluation is optional; ordinary integrity/engine tests are faster.

## Русский

Это воспроизводимая проверка опубликованного **чекпоинта с опытом 185 партий** на фиксированных соперниках, а не обещание силы против людей. В `results.json` записаны результаты проверки от 2026-11-05, в `tactical-fixtures.json` — 800 независимо созданных допустимых позиций. Личные пути компьютера заменены путями относительно репозитория. История и веса не изменены.

Каждая сеть сыграла по 200 партий против каждого соперника: 100 за X и 100 за O, с одинаковыми начальными состояниями генераторов и расстановками из 0/2/4/6 ходов. В основном сравнении сеть выбирает ход с максимальной оценкой; во время матчей обучение выключено. Победы до → после обучения: случайный соперник **91 → 189**, соперник с немедленной победой/блокировкой **1 → 5**, соперник с оценкой линий **0 → 0**. Дополнительное сравнение с одинаковыми 10% случайных ходов дало 91 → 189, 2 → 11 и 0 → 0 побед. Всего — 2 400 тестовых партий. Эти тестовые соперники не играют оптимально. Прирост против случайного соперника составил 49 процентных пунктов (95% парный bootstrap-интервал 41–56,5), против победы/блокировки в основном тесте — только 2 пункта (интервал 0–4,5).

В 400 позициях с немедленной победой сети выбрали выигрышный ход 5 → 9 раз; в 400 позициях с единственной обязательной защитой — 7 → 38 раз. Сбалансированы цвета, четыре направления и итоговые линии длиной 5–9. В подвыборке обычных линий длиной пять обученная сеть решила лишь 1/80 задач на победу и 1/80 на защиту. Рост силы против случайных ходов не означает освоения базовой тактики.

В собственной истории обнаружены 64 последние ошибки с единственным спасительным блокирующим ходом. Текущая сеть не исправила ни одну: в 11 случаях повторила ход, в 53 выбрала другой проигрывающий ход. На 24 отдельных копиях в памяти дополнительная партия снизила вероятность плохого хода в 19 случаях, но ни одна копия не выбрала нужную блокировку. Проверка уже знакомой истории отделена от новых тактических позиций. Изолированное повторение всех 185 партий точно воспроизвело веса, Adam, генератор, счётчики и память. Обученные в тесте копии отброшены.

Команды запуска приведены выше. Требуется Node.js 18+, запуск из корня репозитория. Скрипт читает файл, создаёт исходную случайную сеть для сравнения, замораживает веса на время матчей и обучает только копии при разборе ошибок. По умолчанию результаты записываются в новую временную папку; её путь выводится в терминал. Существующие результаты не перезаписываются, контрольная сумма исходного файла проверяется повторно. Доступа к памяти браузера нет. Время выполнения и точное совпадение вычислений могут зависеть от JavaScript-движка. Полная оценка необязательна; обычные проверки целостности и движка быстрее.
