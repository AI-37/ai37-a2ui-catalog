## 0. Решения до кода

- [x] 0.1 Рендерер рядом, не вместо (`design.md`, Решение 1)
- [x] 0.2 Схема одна на оба рендерера (Решение 2)
- [x] 0.3 Экран уезжает в пакет, песочница импортирует (Решение 3)
- [x] 0.4 Подписи «Далее» и «Условия» — поля схемы, не константы (Решение 4)
- [x] 0.5 Подпись климата гаснет при правке города, черновик не заводим (Решение 5)
- [x] 0.6 Что делать без `nextLabel` / `conditionsLabel` (открытый вопрос 1) — взят дефолт: кнопка одна, группа условий без заголовка и без раскрывашки
- [x] 0.7 Каким агентам тары (открытый вопрос 2) — закрыто `grep`'ом: `spai-daylight-factor-calc-agent`; `~/github/ai37/keo/` — не агент, а старый клон того же репозитория с материалами
- [x] 0.8 Остаётся ли `advanced` в схеме секции (открытый вопрос 3) — взят дефолт: ключ остаётся, мёртвый рендер удалён; фильтры `advanced !== true` сняты вместе с ним (уточнение к Решению 6)
- [x] 0.9 Когда выводить нынешний `KeoEditor` (открытый вопрос 4) — взят дефолт: не в этом change'е

## 1. Схема

- [x] 1.1 `keoEditorNextDefinition`: `name: 'KeoEditorNext'`, `slug: 'keo-editor-next'`, та же `keoEditorPropsSchema`
- [x] 1.2 `description` по-английски: что делает и **когда выбирать** — по нему LLM решает, брать ли компонент
- [x] 1.3 Аддитивные `nextLabel` и `conditionsLabel`, оба optional
- [x] 1.4 Проверить, что наполнение, валидное до изменения, остаётся валидным

## 2. Регистрация схемы — все три файла

- [x] 2.1 `packages/catalog-schemas/src/index.ts` — реэкспорт
- [x] 2.2 `src/constants.ts` — имя в `CATALOG_COMPONENT_NAMES`
- [x] 2.3 `src/catalog.ts` — импорт и запись в `componentDefinitions`

## 3. Python-зеркало

- [x] 3.1 `models/keo_editor.py` — новые поля подписей
- [x] 3.2 `models/calc_editor_common.py` — сверить с TS после правок прошлого change'а
- [x] 3.3 `COMPONENT_MODELS`, `__all__`, реэкспорт в `ai37_a2ui_catalog/__init__.py`

## 4. Перенос экрана

- [x] 4.1 32 файла `keo-assembly-*` / `use-keo-assembly` / `build-keo-*` / `find-missing-keo-targets` → `packages/catalog-react/src/renderers`, без переверстки; имена по канону лифтов (`keo-next-*`)
- [x] 4.2 `keo-next-screen.tsx` — экран без a2ui-контекста, получатель состояния `sink`'ом
- [x] 4.3 `keo-editor-next.tsx` через `createComponentImplementation(keoEditorNextDefinition, …)`
- [x] 4.4 Удалить `keo-assembly-defaults.tsx`, `KeoDefaultsProps` и ветку поиска `advanced`-секции
- [x] 4.5 Константы подписей заменить на props; `keo-next-label.ts` и `keo-conditions-label.ts` удалить
- [x] 4.6 Правка условия гасит его `note` (Решение 5)
- [x] 4.7 Регистрация: `catalog-react/src/catalog.ts` и `src/index.ts`
- [x] 4.8 `/proba/keo-assembly` импортирует экран из пакета; второго экземпляра не остаётся

## 5. Фикстуры, тесты, витрина

- [x] 5.1 `fixtures/valid/keo-editor.json` — подписи в наполнение
- [x] 5.2 `fixtures/invalid/` — по одной на каждое новое ограничение схемы (`keo-editor-empty-next-label.json`, `keo-editor-empty-conditions-label.json`)
- [x] 5.3 `tests/ts/keo-editor-schema.test.ts` — новые поля, границы длины и обратная совместимость
- [x] 5.4 `tests/react/keo-editor-next.test.tsx` — по списку Решения 7, плюс обе ветки открытого вопроса 1 (12 тестов)
- [x] 5.5 `tests/python/test_models.py` — запись про зеркало и обе невалидные фикстуры
- [x] 5.6 `apps/demo/src/app.tsx` — превью нового рядом со старым, одно наполнение

## 6. Артефакты

- [x] 6.1 `pnpm run export:public` и **закоммитить `public/`**
- [x] 6.2 `pnpm run verify:public` — зелёный
- [x] 6.3 Убедиться, что `CATALOG_VERSION` не изменился (`v2`)

## 7. Проверка

- [x] 7.1 `pnpm run typecheck`
- [x] 7.2 `pnpm run test:ts` — 28 файлов, 360 тестов
- [x] 7.3 `pnpm --filter @ai37/a2ui-catalog-react run build`
- [x] 7.4 Python: `cd packages/catalog-python && PYTHONPATH=src uv run --with pydantic --with pytest pytest ../../tests/python -q` — 47 passed
- [x] 7.5 Скриншоты в двух ширинах контейнера (1180 и 452 px по корню набора) и старый/новый в одном треде демо — `preview/`
- [x] 7.6 Убедиться, что `renderers/calc-*` (9 файлов) не тронуты и тесты `InsolationEditor` зелёные

## 8. Тары потребителям

- [x] 8.1 `pnpm run install:consumer` → `../spai-ui` (рендерит — всегда)
- [x] 8.2 `pnpm run install:consumer` → `../spai-chat-backend` (валидирует схему)
- [x] 8.3 Агент КЕО — `../spai-daylight-factor-calc-agent` (по ответу на задачу 0.7)
- [ ] 8.4 Перезапустить дев-серверы: Next держит старый бандл в `.next`
- [x] 8.5 Версию у потребителя проверять чтением `node_modules/<pkg>/package.json`, не `require`

**Сверка парности с агентом (этап 5 скила).** `spai-daylight-factor-calc-agent`
сегодня собирает только `FormCard` (`src/nodes/critic.ts`, `src/domain/a2ui-nodes.ts`)
— билдера `KeoEditor` у него нет вовсе. Значит переключать env-флагом «было /
стало» пока нечего, и первый экран КЕО в чате — это **change в репозитории
агента**, а не здесь. Тара со схемами всё равно накатана: без неё агент не
увидит ни имени `KeoEditorNext`, ни полей `nextLabel` / `conditionsLabel`.

## 9. Гейт: валидация на стенде

- [ ] 9.1 Экран в настоящем чате на живом агенте, не в витрине
- [ ] 9.2 Проверить реальную ширину сообщения, тему хоста, чужие стили
- [ ] 9.3 Проверить поведение агента на ответном снапшоте: следствие условия возвращается
- [ ] 9.4 Правки по кругу до явного «принято» владельца
