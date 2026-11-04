# Contributor and agent rules / Правила разработчиков и агентов — v2.1.0

## English

1. Before changes, read README.md, HANDOFF.md, PROJECT_CONTEXT.md, Codex_History.md, TASK.md and AI_RULES.md. Understand the current task, branch, affected files, risk and rollback. The owner authorized publishing this partially trained educational release to `main` on 2026-11-05.
2. Preserve the 81→256→256→81 architecture, 107,601 parameter layout, checkpoint format and modular separation. Coordinate incompatible changes explicitly and validate migration. Do not restore obsolete Tiny AI 302 or 617 artifacts.
3. The shared public seed is `model/checkpoint-185.json`, SHA-256 `404d3e64e49f2aaf00ca3a5847497159ea7b02e5a80e17689eb68e3ee17811b7`. Keep its original bytes. Do not overwrite it with audit/test training. Browser-saved state takes priority even at zero games. Corrupt state must block rather than reset/fall back. User experience is replaced only by an explicit confirmed import/reset.
4. Keep rules, network math, learning, bootstrap, persistence and UI separate. Use the same numerical engine in browser/Worker/Node. Avoid unnecessary frameworks, hidden tactical teachers, external services and long automatic training runs. Self-play is opt-in. Do not claim monotonic improvement, infinite memory or unbeatable play.
5. Source headers preserve Beck Sarbassov, version, release/update dates and copyright. Use concise EN/RU comments for non-obvious logic. Preserve author attribution and license conditions in copies and derivatives.
6. Keep CSP, input/checkpoint validation, finite-number checks, legal trajectories, size limits, safe text rendering and storage conflict handling. No eval, remote fonts/telemetry or secrets. No admin credentials apply to this project. Exclude unrelated personal files, local paths and unapproved checkpoint exports from public commits.
7. Use feature/fix/docs branches and reviewed PRs for subsequent work; stable `main` is the public baseline. Do not force-push or erase unrelated work. The owner's current explicit request authorizes the initial release directly in `main`; this is not permanent permission for unrelated publication.
8. Test the behavior affected: rules/lines/symmetries, gradients across layers, reward direction, actual updates, draws/duplicates, exact serialization, bootstrap priority and zero/reset/corrupt state. Browser checks cover Worker/fallback, storage/import/export, confirmation, reload, responsiveness and offline use as relevant. Run isolated experiments, preserve original checkpoints, and separate strength evaluation from training. Record actual results and remaining unverified layers.
9. Update affected parts of the six root documents and model/evaluation notes. Rebuild `index.html`, refresh integrity metadata/checksums and validate before publishing. Do not describe an older browser run as a current one. Public descriptions are English/Russian and distinguish partial training from strong play.
10. Final report: what changed, files, run/test steps, security preserved/added, documentation, outstanding work and risks/limits. Distinguish local checks, GitHub publication and website hosting. Do not leave unexplained placeholders or claim deployment before verifying it.

## Русский

1. До изменений прочитать README.md, HANDOFF.md, PROJECT_CONTEXT.md, Codex_History.md, TASK.md, AI_RULES.md. Понять задачу, ветку, файлы, риск и откат. 2026-11-05 владелец разрешил публикацию этой частично обученной образовательной версии в `main`.
2. Сохранить архитектуру 81→256→256→81, раскладку 107 601 параметра, формат опыта и разделение модулей. Несовместимые изменения согласовывать и проверять миграцию. Не возвращать устаревшие артефакты Tiny AI 302/617.
3. Публичный исходный опыт — `model/checkpoint-185.json`, сумма указана выше. Сохранять исходные байты, не заменять результатами тестового обучения. Опыт браузера важнее даже при нуле партий. Повреждение блокирует игру, не сбрасывает/подменяет модель. Замена личного состояния — только явный подтверждённый импорт/сброс.
4. Разделять правила, математику, обучение, bootstrap, хранение и UI. Общий движок браузер/Worker/Node. Без ненужных фреймворков, скрытого тактического учителя, внешних сервисов и длинных автоматических тренировок. Самоигра добровольная. Не обещать постоянный прогресс, бесконечную память и непобедимость.
5. Заголовки: Beck Sarbassov, версия, даты, права. Короткие EN/RU комментарии важной логики. Сохранять авторство и лицензию в копиях и производных работах.
6. Сохранять CSP, валидацию входов/модели, конечность чисел, легальность траекторий, лимиты, безопасный текст и обработку конфликтов. Без eval, внешних шрифтов/телеметрии/секретов. Админских данных нет. Не публиковать посторонние личные файлы, локальные пути и неразрешённые экспорты.
7. Для следующих изменений — feature/fix/docs и проверяемые PR; `main` стабильная. Не делать force-push и не стирать чужую работу. Текущий запрос разрешает прямую первую публикацию в `main`, но не даёт бессрочного разрешения на посторонние публикации.
8. Проверять затронутую логику: линии/симметрии, градиенты, знак награды, реальные обновления, ничьи/повторы, точную сериализацию, приоритет bootstrap/ноль/сброс/повреждение. Браузер: Worker/fallback, хранение/перенос, подтверждения, reload, адаптивность/offline по ситуации. Эксперименты изолировать, оригиналы сохранять, проверку силы отделять от обучения. Записывать факты и непроверенные уровни.
9. Обновлять затронутые части шести документов, карточки/оценки. Пересобирать HTML, актуализировать целостность и проверять перед публикацией. Старую браузерную проверку не выдавать за новую. Публичные описания EN/RU отличают частичное обучение от сильной игры.
10. Итог: изменения, файлы, запуск/тесты, безопасность, документы, незавершённое, риски/ограничения. Разделять локальную проверку, GitHub и хостинг. Не оставлять необъяснённые заглушки и не заявлять размещение без проверки.

Автор: Beck Sarbassov  
Дата создания: 2026-10-27  
Последнее обновление: 2026-11-05  
Авторские права: © Beck Sarbassov. Все права защищены.
