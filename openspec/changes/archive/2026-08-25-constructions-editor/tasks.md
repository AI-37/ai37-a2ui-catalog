## 1. Схема (catalog-schemas)

- [x] 1.1 `src/components/constructions-editor.ts` — Zod-схемы слоя,
      конструкции, `typeConfigs`, props (эскиз в design.md, Решение 2) +
      `constructionsEditorDefinition`
- [x] 1.2 Регистрация: `catalog.ts` (`componentDefinitions`), `constants.ts`
      (`CATALOG_COMPONENT_NAMES` + union), `index.ts` (export)
- [x] 1.3 TS-тесты схемы: валидная фикстура принимается, invalid-варианты
      отклоняются, strict режет неизвестные ключи

## 2. Рефактор lookup под реюз

- [x] 2.1 Вынести fetch/debounce/abort из `lookup-field-fetch.tsx` в хук
      `src/renderers/use-lookup-suggest.ts`; `LookupFieldFetchControl` —
      тонкая обёртка
- [x] 2.2 Прогнать существующие тесты FormCard-lookup (fetch) — зелёные без
      правок

## 3. Рендерер (catalog-react)

- [x] 3.1 `src/renderers/constructions-editor.tsx` + подфайлы карточки
      (`constructions-editor-card.tsx`) и строки слоя
      (`constructions-editor-layer-row.tsx`): локальный state из props,
      аккордеон, правка типа/subtype/названия
- [x] 3.2 Таблица слоёв: add/remove строк, толщина, lookup материала через
      `LookupCombobox` + `use-lookup-suggest`, заполнение
      `materialKey`/λ из опции, ручная `lambdaManual` для опций без λ
- [x] 3.3 Ветка `hasLayers: false` — поле `rprPassport` вместо таблицы
- [x] 3.4 Live Rпр + чипы: формула с выбором λ (condition, дефолт λБ),
      спец-кейсы `pol_po_gruntu` (без 1/αн) и зазоров (слагаемое
      пропускается), чип «—» без `rnorm`, сводка «проходит N из M»
- [x] 3.5 Submit: клиентская валидация с подсветкой → один `dispatchAction`
      с полным массивом; back — без валидации
- [x] 3.6 Регистрация в `src/catalog.ts` (`customComponents`)

## 4. Python-зеркало (catalog-python)

- [x] 4.1 `models/constructions_editor.py` (StrictModel 1:1 со схемой) +
      экспорт в `__init__.py`
- [x] 4.2 Включить `ConstructionsEditor` в `test_schema_consistency.py`

## 5. Фикстуры и тесты

- [x] 5.1 `fixtures/valid/constructions-editor.json` (2–3 конструкции, все
      ветки: слои, окно с rprPassport, pol_po_gruntu),
      `fixtures/invalid/…` (без referenceId, отрицательная толщина,
      неизвестный тип), `fixtures/messages/constructions-editor-surface.json`
- [x] 5.2 React-тест `tests/react/constructions-editor.test.tsx`: рендер из
      фикстуры; add/remove слоя и конструкции; mock fetch подсказок и выбор
      опции с λ; live-чип на изменение толщины; λ-дефолт Б (значение
      синхронизировано с фикстурой teplo-calc); pol_po_gruntu; блокировка
      невалидного submit; один action с полным payload
- [x] 5.3 Python-тест round-trip фикстуры

## 6. Демо и публикация

- [x] 6.1 Превью в `apps/demo`: пример из фикстуры + fetch-мок подсказок
      (действующий `demo-lookup-host.ts` отвечает только action-каналу —
      добавить мок `fetch` для `LOOKUP_SUGGEST_ROUTE`)
- [x] 6.2 `pnpm run test`, `pnpm run typecheck`, `pnpm run build`
- [x] 6.3 `pnpm run version:bump <minor>` + запись в CHANGELOG.md
- [x] 6.4 `pnpm run export:public` — закоммитить обновлённый
      `public/a2ui/catalogs/ai37-a2ui/v2/…`
- [x] 6.5 Тарболы schemas+react в `~/github/ai37/.local-packages` для
      стендов teplo-calc/spai-ui (прод — publish пакетов)
