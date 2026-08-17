## 1. Протокол — одна строка

- [x] 1.1 `thermal-report-protocol.tsx`: заменить `<details>/<summary>` на обычный `<div>`-ряд (лейбл «Протокол расчёта» + meta + «Скачать»), убрать рендер `content`, из обработчика скачивания убрать `preventDefault`/`stopPropagation`
- [x] 1.2 `thermal-report-styles.ts`: стили строки протокола (без cursor:pointer и шеврона), удалить `a2ui-tr__protocol-content` и прочие стили раскрытия

## 2. Кнопки — канон CE

- [x] 2.1 `thermal-report-styles.ts`: добавить блок hover/фокус-переопределений против хоста по образцу `constructions-editor-styles.ts:219-255` (`.a2ui-tr .a2ui-tr-btn:hover` — прозрачный фон + рамка muted; `--solid:hover` — заливка; `--link` и `--link:hover` — без рамки/фона, подчёркивание), при необходимости поднять специфичность до уровня CE
- [x] 2.2 Сверить метрики `a2ui-tr-btn` с `a2ui-ce-btn` (padding, radius, font, цвета solid = `--commit`) и устранить расхождения

## 3. Тесты и проверка

- [x] 3.1 `tests/react/thermal-report.test.tsx`: удалить/переписать сценарий раскрытия протокола, добавить проверки «одна строка: content не рендерится», «Скачать» присутствует только при `downloadFileName`
- [x] 3.2 Прогнать JS-тесты пакета (python-тесты через uv вне скоупа)
- [x] 3.3 Визуальная проверка скриншотами в headless Chrome на demo-приложении под хостовыми правилами (серую пилюлю/капсулу больше не видно; ссылки — как «Свернуть» в CE)
