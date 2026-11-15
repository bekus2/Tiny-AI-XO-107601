# Technical specification / Техническое задание — v2.1.0

## English

**Goal:** publish an accessible educational X/O project with the owner's partially trained 185-game checkpoint. Anyone should be able to download the repository, open the game, continue learning, inspect the algorithm and conduct their own experiments under the included license. Stable publication target: `bekus2/Tiny-AI-XO-107601`, branch `main`, explicitly requested by the owner.

**Required behavior:** 9×9 board, X first, legal empty-cell moves; five or more contiguous marks in horizontal, vertical or either diagonal direction ends play; nine is a super win. Track full line length and allow gap-closing wins. Full board without a winner is a draw. Prevent duplicate and post-terminal moves.

**Model/training:** 81→256 tanh→256 tanh→81 linear, exactly 107,601 parameters and 512 hidden neurons. Keep the existing learning algorithm: outcome rewards, discount, bounded replay, D4 augmentation and Adam. All weights/biases update after decisive completed games; draws have no fabricated updates. Interrupted, illegal and duplicate recent episodes do not train. No external AI, hidden tactical teacher or long background pretraining. Publish the actual reviewed checkpoint, not synthetic test results.

**Modules/pages/roles:** one responsive game page; player chooses X or O; optional self-play uses one network on both sides. Modules: rules, neural math, learning, bootstrap, storage, Worker/client, UI, builder, tests and evaluation. No administrator role, backend/API, authentication, SQL, forms collecting personal data, email or notification delivery is required.

**Startup/storage:** existing saved state takes priority over the bundled checkpoint, including an intentional zero-game reset. Fresh state uses `model/checkpoint-185.json` embedded offline. Invalid saved data blocks play without replacement. Keep format `tiny-ai-xo-online-v2`; retain export/import and confirmed reset. Persist weights/Adam/RNG/counters, at most 2,048 positions and 200 games; display 12 recent games. IndexedDB atomic revision checks, localStorage fallback, RAM warning and exportable unsaved progress remain required. Import cap 6 MiB with exact numeric, shape, counter and trajectory checks.

**UI/content:** responsive from 320px, semantic HTML, keyboard/touch/mouse access, reduced motion, clear status, real counters and preference labels that do not claim win probabilities. Describe the bundled experience honestly. README and release descriptions must explain purpose, actual measured strength, limitations, installation, use, experimentation and author in English and Russian. Game controls remain Russian in this release, with English label guidance in README. Title/meta description and appropriate Open Graph must reflect the educational release.

**Performance/security/deployment:** offline standalone HTML; no runtime dependencies, secrets or network requests. Worker learning with cooperative fallback. CSP, safe text output, validated inputs, limited memory/import sizes and confirmation before user-state replacement. Static UTF-8/HTTPS hosting only; no DB migrations. Reproducible Python builder and Node tests. GitHub Actions in `.github/workflows/checks.yml` must verify, then publish only generated `index.html` from `main` to `https://bekus2.github.io/Tiny-AI-XO-107601/`. Retain offline ZIP access and link the website in both README languages. Keep the original 185-game checkpoint and personal browser experience intact; document separate file/HTTPS storage, explicit export/import, backup before replacement and absence of cloud sync. Verify the Pages run and public URL separately from the source push.

**Acceptance:** exact architecture and checkpoint digest; fresh launch uses185; saved/zero checkpoints are preserved; corrupt saved state never silently falls back; reset/import work consistently. Existing rules/gradients/serialization/learning tests remain valid, with bootstrap coverage. Generated HTML matches source, checksums validate and the public files exclude unrelated personal data. Include portable audit artifacts, bilingual docs and explicit educational-use permissions. Record actual checks in `verification.json`; distinguish local, browser, remote publication and hosting evidence. Do not claim undefeated play or improvement after every game.

## Русский

**Цель:** опубликовать доступную образовательную игру X/O с частично обученной моделью автора после 185 партий. Любой пользователь сможет скачать репозиторий, открыть игру, продолжить обучение, изучить код и проводить эксперименты по условиям лицензии. Целевая стабильная ветка: `main` репозитория `bekus2/Tiny-AI-XO-107601`; публикацию прямо запросил владелец.

**Поведение:** поле 9×9, X начинает, ходы в свободные клетки. Непрерывные ≥5 по горизонтали, вертикали или диагоналям завершают игру; девять — суперпобеда. Учитывать полную длину, соединение цепочек, ничью на полном поле. Запрещать повторные и послепобедные ходы.

**Модель/обучение:** 81→256 tanh→256 tanh→81 linear, ровно 107 601 параметр и 512 скрытых нейронов. Сохранить награды по исходу, дисконт, ограниченную память, D4 и Adam. Все веса/смещения обучаются после решающих партий; ничья без выдуманных обновлений. Прерванные, нелегальные и повторные недавние эпизоды не обучают. Без внешнего ИИ, скрытого учителя и длительной фоновой предтренировки. Поставлять реальный проверенный опыт, не тестовые тренировки.

**Страницы/роли/модули:** одна адаптивная игровая страница, человек X/O, добровольная самоигра одной сетью. Правила, математика, обучение, bootstrap, хранение, Worker/client, UI, сборка, тесты и оценка. Админка, бэкэнд/API, авторизация, SQL, персональные формы, email и доставка уведомлений не требуются.

**Старт/хранение:** сохранённая модель важнее встроенной, включая намеренный нулевой сброс. Новый пользователь получает встроенный офлайн `model/checkpoint-185.json`. Повреждённое состояние блокирует игру без замены. Формат `tiny-ai-xo-online-v2`, экспорт/импорт, подтверждаемый сброс. Веса/Adam/RNG/счётчики, до 2 048 позиций и 200 игр; видны 12. Атомарный IndexedDB с ревизиями, localStorage, RAM-предупреждение, экспорт несохранённого состояния. Импорт до 6 МиБ с проверкой чисел/схемы/счётчиков/партий.

**Интерфейс/тексты:** от 320px, семантика, клавиатура/касания/мышь, reduced motion, понятные статусы и настоящие метрики; предпочтения не обозначать вероятностью победы. Честно описать встроенный опыт. README и описания релиза EN/RU: цель, результаты, ограничения, установка, игра, эксперименты, автор. UI русский, в README есть перевод кнопок. Title/meta/OG отражают образовательное назначение.

**Скорость/защита/публикация:** автономный HTML без runtime-зависимостей, секретов и сетевых запросов; Worker и совместимый режим; CSP, безопасный вывод, валидация, лимиты, подтверждение замены опыта. Статический UTF-8/HTTPS, без миграций. Воспроизводимые Python-сборка и Node-тесты. GitHub Actions в `.github/workflows/checks.yml` сначала проверяет, затем размещает только сгенерированный `index.html` из `main` по адресу `https://bekus2.github.io/Tiny-AI-XO-107601/`. Сохранить офлайн-ZIP и добавить ссылку на сайт в обе языковые части README. Сохранить исходный опыт 185 и личный прогресс; описать отдельную память файла/HTTPS, явный экспорт/импорт, резервную копию перед заменой и отсутствие облачной синхронизации. Результат Pages и публичный URL проверять отдельно от push исходников.

**Приёмка:** точная архитектура и сумма опыта; первый старт185; сохранённый/нулевой опыт имеет приоритет; повреждение не включает другую модель; сброс/импорт согласованы. Проверки правил/градиентов/сериализации/обучения и bootstrap; HTML соответствует исходникам, суммы верны, посторонние личные данные не публикуются. Переносимые материалы оценки, двуязычные документы и явное разрешение образовательного использования. Фактические проверки — `verification.json`, разделять локальные, браузерные, публикацию и хостинг. Не обещать непобедимость или улучшение каждой партией.

Автор: Beck Sarbassov  
Дата создания: 2026-10-27  
Последнее обновление: 2026-11-15  
Авторские права: © Beck Sarbassov. Все права защищены.
