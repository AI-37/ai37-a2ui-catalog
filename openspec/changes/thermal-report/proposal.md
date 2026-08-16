## Why

Агент spai-teplo-calc отдаёт результат расчёта markdown-простынёй — в чате она
не сворачивается, итог и действия тонут. Согласованы макеты карточного вывода
(вердикт, проверки, конструкции с отклонениями, исходные данные, протокол под
катом); в каталоге такого компонента нет. Демо в apps/demo нужно раньше
агентской реализации — для ревью визуала и контракта props.

## What Changes

- Новый доменный компонент каталога **`ThermalReport`** (schemas + react):
  результат теплотехнического расчёта по СП 50.13330. Контракт props —
  черновик `doc/thermal-report-spec.md` в spai-teplo-calc.
- Два наполнения одного компонента: одна конструкция (hero R₀ + проверки +
  таблица слоёв) и список конструкций (вердикт N из M, отклонения, «Подобрать»,
  исключённые). Режим — по наличию секций, без флага.
- Кнопки диспатчат действия агенту (`dispatchAction`, канон `input.action`):
  `report_fix_construction {constructionId}` / `report_edit_inputs` /
  `report_restore_excluded`.
- «Протокол расчёта» — markdown под катом, свёрнут по умолчанию; «Скачать»
  (при `downloadFileName`) — клиентским Blob'ом из props, без участия
  агента/транспорта.
- Фикстуры valid/messages для обоих наполнений + два примера в apps/demo
  с логированием действий в консоль.
- Регистрация: `CATALOG_COMPONENT_NAMES`, catalog.ts обоих пакетов; версия
  каталога остаётся v2 (аддитивное расширение).

## Capabilities

### New Capabilities

- `thermal-report-component`: схема props и поведение рендерера `ThermalReport`
  — состав секций, режимы наполнения, статусные цвета, действия, кат протокола.

### Modified Capabilities

<!-- нет — существующие компоненты не меняются -->

## Impact

- `packages/catalog-schemas`: `components/thermal-report.ts`, регистрация в
  `catalog.ts`, `constants.ts` (+имя), экспорт из `index.ts`; артефакты Pages
  перегенерируются (`export:public`).
- `packages/catalog-react`: `renderers/thermal-report*.tsx/.ts` (по паттерну
  ConstructionsEditor: отдельные файлы секций/стилей), регистрация в
  `catalog.ts`; своя группа токенов `tr` с наследованием общих.
- `fixtures/valid/*` + `fixtures/messages/*` — по два файла (single/multi).
- `apps/demo`: два примера в списке examples + attach action-logger.
- `tests/react`: рендер-тесты обоих наполнений и dispatch действий.
- Потребители: spai-teplo-calc (эмит; парный change `thermal-report` там),
  spai-ui (bump schemas+react после publish).
