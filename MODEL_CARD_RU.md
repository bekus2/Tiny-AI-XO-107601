## Release update / Обновление 2026-11-15

**EN:** The current default is the exact **318-game checkpoint from the published Sites release**, plus its optional bounded tactical search (enabled for human games by default). The new RU/EN interface is preserved. Self-play still uses only the neural network. Existing local saves, including intentional zero-game saves, are never silently replaced. Use “Restore the shared starting model” and confirm to replace a personal copy, exporting it first if needed. The original `model/checkpoint-185.json` is retained for reproducible historical comparisons. The older 185-game evaluation numbers below are not measurements of this stronger release. No new performance claims are made. This is a shared fixed starting model, **not cloud-synchronized collective learning**.

**RU:** Теперь по умолчанию поставляется точная **модель с опытом 318 партий из опубликованной Sites-версии** и её отключаемый тактический поиск (включён при игре с человеком). Новый интерфейс RU/EN сохранён. Самоигра по-прежнему использует только нейросеть. Личный сохранённый опыт, включая намеренный старт с нуля, не перезаписывается. Для явной замены есть «Начать с общей модели» с подтверждением; сначала экспортируйте личный опыт, если он нужен. Исходный `model/checkpoint-185.json` сохранён для воспроизводимости прежних сравнений. Приведённые далее старые результаты модели185 не описывают силу новой версии. Новые показатели качества не заявляются. Это общая фиксированная стартовая модель, **не облачное коллективное обучение**.

Older sections below describe the previous185-game release unless stated otherwise. / Старые разделы ниже описывают предыдущую версию с185 партиями, если не указано иное.

# Model card / Карточка модели — Tiny AI XO 107601 v2.1.0

## English

**Intended use:** education, local play, studying learning from outcomes and reproducible experimentation. The model plays 9×9 X/O with five-in-a-row wins and nine-in-a-row super wins. It is not a language model, a general intelligence or an expert game engine.

**Architecture:** 81 relative inputs → 256 tanh → 256 tanh → 81 linear outputs; 512 hidden neurons, 107,601 parameters, 430,404 bytes of float32 inference weights. Parameter sizes: 20,736 + 256 + 65,536 + 256 + 20,736 + 81. Own/opponent/empty inputs are +1/−1/0. Output softmax masks occupied cells. The policy uses argmax with exploration decreasing from 22% to a 5% floor. Optimizer arrays, counters and replay do not count as model parameters. No minimax or tactical fallback is used.

**Origin and distribution:** Xavier uniform initialization, seed 107601 and zero biases. Beck Sarbassov accumulated experience through gameplay from that initialization; no third-party pretrained weights or external AI were used. v2.1.0 includes `model/checkpoint-185.json` and embeds it in `index.html`. Fresh browsers use this partial training; saved user state takes priority, including explicit zero-game resets. The original checkpoint format remains `tiny-ai-xo-online-v2`, with its original internal version 2.0.0. Distribution version and serialization version are separate.

**Included experience (snapshot, not a live counter):**

| Item | Value |
|---|---:|
| Completed games | 185 |
| Self-play / human games | 183 / 2 |
| Adam updates | 1,110 |
| Sampled training examples, including repeats | 8,880 |
| Remembered positions / complete journal games | 2,048 / 185 |
| Changed inference parameters vs initial | 107,601 / 107,601 |

Checkpoint SHA-256: `404d3e64e49f2aaf00ca3a5847497159ea7b02e5a80e17689eb68e3ee17811b7`. Replaying all 185 stored games from the original initialization exactly reproduced weights, both Adam moments, optimizer step, RNG, counters, replay and history. This establishes consistency with real training; it does not establish strong play.

**Learning:** validate a complete trajectory; winner's actions +1, loser's −1, draw 0, discounted by 0.97 per remaining ply. Decisive games produce six updates of eight samples, about 65% from the newest episode and the rest from replay, with rotations/reflections. Outcome-weighted policy gradients, entropy 0.003, Adam learning rate 0.0003 and global norm clipping 1. All three weight matrices and biases participate. Draws are remembered without updates. Interrupted episodes and duplicate recent completion notifications do not train. The algorithm does not explicitly label the defensive alternative to a bad move.

**Evaluation:** fixed custom opponents, both colors, paired opening/random seeds, frozen weights and no exploration in the main comparison; 200 games per model/opponent. Wins: random opponent 91→189; immediate-win/block opponent 1→5; line-scoring opponent 0→0. A supplementary equal 10% exploration comparison and tactical fixtures bring the audit to 2,400 games and 800 positions. On 400 generated immediate-win positions, correct moves5→9; on 400 unique-block positions, 7→38. For ordinary five-cell lines alone, the trained network succeeded in 1/80 win and 1/80 block positions. It failed to correct all 64 historical forced-block mistakes. One additional losing episode on each of 24 isolated copies reduced the particular bad-action probability in 19 cases but produced zero correct blocks. See `evaluation/README.md` and recorded results for details and limits.

**Limits:** modest initial experience, sparse outcome credit, weak tactical generalization, no monotonic improvement/convergence/undefeated guarantee. Self-play with a weak policy may reinforce weaknesses. A changed preference does not prove a corrected error; seen historical positions are not an independent holdout. Opponents here are not optimal. The model is suitable for observing these limitations as part of learning about AI.

**Persistence/privacy:** local IndexedDB with revisions, fallback localStorage or warned RAM; full state exports as JSON. Memory is bounded at 2,048 positions/200 games, with 12 visible; old records are replaced. Browser clearing or origin changes can lose/isolate progress. The public checkpoint intentionally shares move histories/timestamps; subsequent users' play is not uploaded. Import/reset is explicit and confirmed. Runtime remains offline without credentials or telemetry. Use the license in `LICENSE.txt` and preserve author attribution.

## Русский

**Назначение:** обучение людей, локальная игра, изучение награды по исходу и воспроизводимые эксперименты. Модель играет X/O 9×9: пять подряд — победа, девять — суперпобеда. Это не языковая модель, универсальный интеллект или экспертный игровой движок.

**Архитектура:** 81 относительный вход → 256 tanh → 256 tanh → 81 linear; 512 скрытых нейронов, 107 601 параметр, 430 404 байта float32. Размеры: 20 736 + 256 + 65 536 + 256 + 20 736 + 81. Своя/чужая/пустая клетка: +1/−1/0. Softmax исключает занятые клетки; максимум оценки со случайным исследованием от 22% до 5%. Adam, счётчики и память не входят в параметры. Минимакса и тактической подстраховки нет.

**Происхождение:** случайные Xavier uniform веса,seed 107601, нулевые смещения. Beck Sarbassov накопил опыт играми, без чужих готовых моделей и внешнего ИИ. В v2.1.0 включён `model/checkpoint-185.json`, встроенный также вHTML. Новый браузер получает частичный опыт; сохранённая модель важнее, включая нулевой подтверждённый сброс. Формат опыта `tiny-ai-xo-online-v2`, внутренняя версия исходного файла 2.0.0; версия поставки отдельная.

**Опыт на момент снимка:**185 игр,183 самоигры и2 с человеком ; 1 110 обновлений Adam; 8 880 примеров с повторами; 2 048 позиций, 185 полных партий. Все 107 601 параметр отличаются от исходных. SHA-256 указан выше. Воспроизведение всех 185 игр в точности восстановило веса, оба момента Adam, шаг, RNG, счётчики, память и журнал. Это подтверждает работу обучения, но не сильную игру.

**Обучение:** после проверки всей траектории ходы победителя +1, проигравшего −1, ничья 0; дисконт 0.97 за оставшийся ход. На решающую игру шесть обновлений по восемь примеров, примерно 65% из последней партии, остальные из памяти; повороты/отражения. Градиент по награде, энтропия 0.003, Adam 0.0003, ограничение нормы 1. Обучаются три матрицы и смещения. Ничьи запоминаются без обновлений; прерывания и повторные недавние уведомления не обучают. Правильная защитная альтернатива плохому ходу явно не размечается.

**Оценка:** фиксированные тестовые соперники, оба цвета, одинаковые начальные позиции/seed, замороженные веса и отсутствие случайных ходов в основном сравнении; по 200 игр на модель/соперника. Победы: случайный 91→189; немедленная победа/блокировка 1→5; оценка линий 0→0. Дополнительное сравнение с одинаковыми 10% исследования и тактические проверки: всего 2 400 игр и 800 позиций. Немедленная победа 5→9 из 400; единственная блокировка 7→38 из 400. Для обычной линии из пяти обученная модель успешна лишь в 1/80 выигрышных и 1/80 защитных позиций. Все 64 исторические обязательные блокировки остались неисправленными. Дополнительная проигранная партия на 24 отдельных копиях уменьшила вероятность конкретной ошибки в 19 случаях, но правильных блокировок 0. Подробности — `evaluation/README.md` и результаты.

**Ограничения:** небольшой опыт, слабое определение причины исхода, плохой перенос тактики. Нет гарантии роста силы, сходимости и непобедимости. Самоигра может закреплять слабости. Другой ход не обязательно исправляет ошибку; позиции из истории не независимый holdout. Тестовые соперники не оптимальны. Наблюдение этих ограничений — часть образовательной цели.

**Хранение/приватность:** локальный IndexedDB с ревизиями, localStorage или RAM с предупреждением; полный JSON-экспорт. Лимит 2 048 позиций/200 партий, видны 12, старое вытесняется. Очистка браузера или другой origin могут лишить прогресса/отделить его. Публичная модель намеренно включает ходы/время игр; дальнейшие партии пользователей не отправляются. Импорт/сброс явные и подтверждаемые. Работа офлайн без ключей/телеметрии. Условия — `LICENSE.txt`, авторство сохраняется.

Автор: Beck Sarbassov  
Дата создания: 2026-10-29  
Последнее обновление: 2026-11-05  
Авторские права: © Beck Sarbassov. Все права защищены.
