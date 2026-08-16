## Context

Каталог v2 (SimpleTable, FlexTable, LatexFormula, ChoiceCard, FormCard,
ConstructionsEditor, LiftEditor). Паттерн доменного компонента задан
ConstructionsEditor/LiftEditor: zod-схема в catalog-schemas
(`CatalogComponentDefinition`), рендерер в catalog-react
(`createComponentImplementation`), инлайн-стили на токенах `tokens.ts`
(CSS-переменные `--a2ui-*` c fallback), фикстуры valid/messages, пример в
apps/demo (chat-thread на assistant-ui), рендер-тесты в tests/react.
Референс визуала — два макета SP-AI (одна конструкция / 7 конструкций);
палитра макетов совпадает с группами `ce`/`le`.

## Goals / Non-Goals

**Goals:**

- Компонент `ThermalReport` по контракту `doc/thermal-report-spec.md`
  (spai-teplo-calc): read-mostly карточка результата с action-кнопками.
- Демо обоих наполнений в apps/demo — предмет ревью до агентской реализации.
- Действия через `context.dispatchAction` с payload (constructionId).

**Non-Goals:**

- Передача файла протокола через агента/транспорт (A2A artifacts,
  chat-attachments): «Скачать» реализовано чисто клиентским Blob'ом из
  props; серверные варианты — по итогам исследования, отдельным change.
- Кнопка «Посчитать по проекту» — решено не делать.
- Агентская сторона (маппер props, обработчики) — парный change
  `thermal-report` в spai-teplo-calc.
- Изменения существующих компонентов и версии каталога (остаёмся в v2 —
  аддитивно).

## Decisions

1. **Схема повторяет черновик контракта, strict-объекты.** Все строки —
   готовые к показу (форматирует агент, десятичная запятая); единственное
   число — `deviationPct` (знак → цвет чипа, компонент сам рисует «+/− %»
   с запятой). Обязательны `verdict` и `inputs`; режим — по наличию секций
   (`checks`/`layersTable` vs `constructions`/`excluded`), без флага и без
   cross-field refine: наполнение валидирует агент.
2. **Action-объект `{name, label, payload?}`** как у submit ChoiceCard, но с
   payload (`Record<string,string>`); dispatch:
   `{event: {name, context: payload ?? {}}}`. Имена действий в схему не
   зашиваются (агент волен именовать), в фикстурах — канонические
   `report_*`.
3. **Кат протокола — нативный `<details>`.** Не зависит от локального стейта
   React (грабли replace-снапшотов CopilotKit #4676 — открытость `<details>`
   тоже сбросится при пересоздании DOM, но это приемлемо: после replace отчёт
   логично показывать свёрнутым). Контент — markdown моноширинным
   `<pre>`-блоком без markdown-рендера: в каталоге нет md-рендерера, тянуть
   зависимость ради v1 не стоит; вернуться после ревью.
4. **Своя группа токенов `tr`** (`color-tr-surface`, `-accent`, `-danger`,
   `-success`, `-warning`, …) с INHERITS на общие токены — по прецеденту
   `ce`/`le` (правка палитры одного компонента не красит другие; тёмная тема
   хоста наследуется автоматически).
5. **Файлы по паттерну ConstructionsEditor:** `thermal-report.tsx` (корень) +
   `thermal-report-styles.ts` + мелкие секции отдельными файлами
   (`thermal-report-verdict.tsx`, `-checks.tsx`, `-constructions.tsx`,
   `-inputs.tsx`, `-protocol.tsx`); типы из схемы реэкспортом, без дублей.
6. **Демо — два примера** в existing chat-thread demo (single/multi) с
   `attachDemoActionLogger`: клики по «Подобрать»/«Изменить и пересчитать»/
   «Вернуть в расчёт» видны в консоли — ревьюер проверяет и визуал, и payload.

## Risks / Trade-offs

- [Схема без cross-field-инвариантов пропустит «пустой» отчёт (только
  verdict+inputs)] → осознанно: рендерер устойчив к отсутствию секций,
  ответственность за наполнение — на агенте (как у ConstructionsEditor).
- [`<pre>` вместо markdown-рендера протокола — таблицы простыни будут сырыми]
  → пометить в демо; если ревью потребует — отдельное решение о md-рендере
  (зависимость или рендер на стороне spai-ui).
- [Длинный протокол в props раздувает сообщение] → это тот же объём, что
  нынешнее markdown-сообщение агента; лимитов surface не превышает.
- [Дрейф контракта с черновиком в spai-teplo-calc] → источник правды после
  мержа — схема каталога; черновик `doc/thermal-report-spec.md` обновить
  ссылкой на неё.

## Open Questions

- Рендер markdown в протоколе (после ревью демо).
- Работает ли клиентский Blob-download в хосте spai-ui (CSP/sandbox) — вопрос
  исследования; в демо работает.
