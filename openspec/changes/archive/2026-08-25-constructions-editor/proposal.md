# ConstructionsEditor: редактор конструкций одним сообщением

## Why

Агент teplo-calc заполняет вложенную структуру (конструкции → слои с
материалом/толщиной/λ) фазовым мастером из маленьких FormCard: каждый клик —
AG-UI-run и новое activity-сообщение, чат фрагментируется. Протокол a2ui
раунд-трипа на правку не требует — FormCard уже держит значения в локальном
state и шлёт один action на submit, — но в каталоге нет компонента со
списками переменной длины (add/remove строк), аккордеоном и вычисляемой
обратной связью. Утверждённый макет («Teplo-calc — формы v2»): весь экран
конструкций — одно сообщение, правки на клиенте, один submit «Рассчитать».

## What Changes

- **Новый компонент каталога `ConstructionsEditor`** (аддитивно, остаёмся в
  `CATALOG_VERSION` v2): карточки-аккордеоны конструкций (тип, subtype,
  название), таблица слоёв с добавлением/удалением строк, lookup материала в
  строке (существующий fetch-канал, `LOOKUP_SUGGEST_ROUTE`), ручная λ для
  материалов вне справочника, паспортное Rпр для типов без слоёв, live-чип
  Rпр против Rнорм на карточке и сводка «проходит N из M», добавление/
  удаление конструкций, один submit с полным массивом в context и кнопка
  возврата.
- **Схема** `packages/catalog-schemas/src/components/constructions-editor.ts`:
  props — `constructions[]` (wire-формат слоёв с `materialKey`/`lambdaA`/
  `lambdaB`/`lambdaManual`), `typeConfigs[]` (label, `hasLayers`, `rnorm?`,
  `alphaV`, `alphaN?` — числом или record по subtype), `condition?` (А/Б),
  `materialsReferenceId`, `minChars?`, лейблы и имена action'ов submit/back.
  Нормативные числа считает агент; компонент — только `1/αв + 1/αн + Σ δ/λ`.
- **Рендерер** `packages/catalog-react/src/renderers/constructions-editor.tsx`
  (+ подфайлы карточки/строки): локальный state, паттерн FormCard. Fetch/
  debounce-логика lookup выносится из `lookup-field-fetch.tsx` в переиспользуемый
  хук `use-lookup-suggest.ts`; `LookupFieldFetchControl` остаётся тонкой
  обёрткой (поведение FormCard не меняется), строки редактора реюзают
  `LookupCombobox` + хук. Выбор опции с полями `lambdaA`/`lambdaB`
  (расширение подсказок на стороне агента) заполняет λ строки.
- **Python-зеркало** `packages/catalog-python` + фикстуры valid/invalid/
  messages + TS/React/Python-тесты + демо-превью в `apps/demo` (fetch-мок
  подсказок).

## Capabilities

### New Capabilities

- `constructions-editor`: контракт компонента — схема props, клиентское
  редактирование без раунд-трипов, per-row lookup материалов fetch-каналом,
  live-расчёт Rпр, submit одним action'ом с полным массивом.

### Modified Capabilities

_(нет — `formFieldSchema`/FormCard и lookup-контракт не меняются; вынос
хука из `lookup-field-fetch.tsx` — внутренний рефактор без изменения
поведения, фиксируется в design.md)_

## Impact

- `catalog-schemas`: новый файл схемы + регистрация в `catalog.ts`
  (`componentDefinitions`), `constants.ts` (`CATALOG_COMPONENT_NAMES`),
  `index.ts` (export). Изменение аддитивное — v2 сохраняется, публикация
  через `pnpm run export:public` (public/ коммитится).
- `catalog-react`: новый рендерер + регистрация в `catalog.ts`
  (`customComponents`); рефактор `lookup-field-fetch.tsx` → хук.
- `catalog-python`: зеркальная модель + экспорт + parity-тест.
- Версия: minor bump синхронно (`pnpm run version:bump`) + CHANGELOG.
- Потребители: spai-ui поднимет `@ai37/a2ui-catalog-{schemas,react}`;
  агент teplo-calc эмитит компонент и обрабатывает submit — связанный change
  `constructions-editor-screen` в spai-teplo-calc (там же — λ в опциях
  подсказок; контракт fetch-ответа уже допускает доп. поля:
  `LookupOption & Record<string, unknown>`).
- **Non-goals**: generic repeating-group для FormCard; dataModel/path-биндинг
  полей; реплика нормативных таблиц СП 50 на клиенте; персист
  незасабмиченных правок при перезагрузке.
