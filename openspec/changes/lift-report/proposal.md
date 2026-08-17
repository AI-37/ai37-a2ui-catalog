## Why

Агент elevator-calc отдаёт результат расчёта markdown-простынёй — итог и действия тонут. По figma согласован карточный вывод: вердикт с бейджем («Интервал движения — 220 с», НЕ СООТВЕТСТВУЕТ ГОСТ), блок «Что изменить» с пересчётом вариантов, «Исходные данные» с группами «введено вами» / «принято системой — проверьте», строка «Протокол расчёта … Скачать». В каталоге есть `ThermalReport` (тот же жанр, teplo) и `LiftEditor` (форма ввода), карточки результата для лифтов нет.

## What Changes

- Новый доменный компонент каталога **`LiftReport`** (schemas + react): результат расчёта лифтов по ГОСТ Р 52941-2008 / ГОСТ 34758-2021.
- Секции: `verdict` (бейдж/статус, headline, summary), `suggestions` («Что изменить»: варианты с предвычисленным результатом, действие «Пересчитать» или статус-лейбл), `inputs` (группы чипов по источнику — контракт как у ThermalReport), `protocol` (строка с meta, краткий вывод под катом, «Скачать»).
- «Скачать» — по `downloadUrl` (относительный href на `/api/agent-resource?resource=lift-report&…`; download-заголовки ставит ручка агента — spec `report-download` elevator-агента). Клиентского Blob-варианта (как ранний `downloadContent` ThermalReport) не заводим.
- Действия (канон `input.action` через `dispatchAction`): `report_apply_suggestion {suggestionId}`, `report_edit_inputs`.
- Фикстуры valid/messages, пример в apps/demo с action-logger, регистрация в `CATALOG_COMPONENT_NAMES` / `catalog.ts` обоих пакетов (аддитивно, версия каталога не меняется).

## Capabilities

### New Capabilities

- `lift-report-component`: схема props и поведение рендерера `LiftReport` — состав секций, статусные цвета, действия, кат протокола и скачивание по URL.

### Modified Capabilities

<!-- нет — существующие компоненты не меняются -->

## Impact

- `packages/catalog-schemas`: `components/lift-report.ts`, регистрация, экспорт; перегенерация артефактов (`export:public`).
- `packages/catalog-react`: `renderers/lift-report*.tsx` (по паттерну ThermalReport: файлы секций/стилей, своя группа токенов с наследованием общих), регистрация.
- `fixtures/valid/lift-report.json` + витринное сообщение; apps/demo; tests/ts + tests/react.
- Потребители: spai-elevator-calc-agent (эмит; парный change `lift-report-render` там), spai-ui (bump schemas+react после publish).
