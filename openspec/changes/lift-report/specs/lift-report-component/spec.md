# lift-report-component

Карточный вывод результата расчёта лифтов: компонент `LiftReport` каталога A2UI.

## ADDED Requirements

### Requirement: Схема props компонента LiftReport

Каталог SHALL предоставлять компонент `LiftReport` со strict-схемой props: обязательные `verdict` ({status: 'pass'|'fail', badge, headline, summary?}) и `inputs` (контракт идентичен `ThermalReport.inputs`: {action?, groups: [{label, tone: 'normal'|'warning', chips: [{label, value}], note?}]}); опциональные `suggestions` ({title?, items: [{id, title, detail?, tone: 'pass'|'fail'|'neutral', action?, statusLabel?}]}) и `protocol` ({meta?, content, downloadUrl?}). Действие — объект {name, label, payload?}. Все значения — готовые строки.

#### Scenario: Валидная фикстура по figma

- **WHEN** props содержат fail-вердикт, три варианта «Что изменить», группы inputs и протокол
- **THEN** схема принимает объект, компонент попадает в артефакт каталога вместе с JSON-схемой

#### Scenario: Лишнее поле

- **WHEN** в props передан не описанный схемой ключ
- **THEN** strict-схема отклоняет объект

### Requirement: Рендер вердикта

Рендерер SHALL показывать бейдж со статусной точкой (pass — success, fail — danger), крупный headline и summary под ним.

#### Scenario: Не соответствует ГОСТ

- **WHEN** `verdict` = {status: 'fail', badge: 'НЕ СООТВЕТСТВУЕТ ГОСТ', headline: 'Интервал движения — 220 с', summary: 'Норма для жилых зданий — не более 100 с…'}
- **THEN** рендерится danger-бейдж, headline и summary

### Requirement: Блок «Что изменить»

Элемент `suggestions.items` с `action` SHALL рендерить кнопку, клик по которой вызывает `dispatchAction` c `{event: {name: action.name, context: action.payload ?? {}}}`; элемент без `action` SHALL показывать `statusLabel`, окрашенный тоном (`fail` — danger). Элемент с `tone: 'pass'` SHALL визуально выделяться как рекомендуемый (акцентная рамка).

#### Scenario: Рекомендуемый вариант с пересчётом

- **WHEN** элемент {tone: 'pass', title: '3 лифта в группе', detail: 'Интервал 73 с — проходит с запасом', action: {name: 'report_apply_suggestion', label: 'Пересчитать', payload: {suggestionId: 'n3'}}}
- **THEN** рендерится выделенная строка с кнопкой «Пересчитать»; клик диспатчит `report_apply_suggestion` с `context.suggestionId === 'n3'`

#### Scenario: Непроходящий вариант без действия

- **WHEN** элемент {tone: 'fail', title: '2 лифта в группе', statusLabel: 'не проходит'} без action
- **THEN** рендерится статус-лейбл danger-цветом, кнопки нет

### Requirement: Исходные данные с действием и тонами групп

Секция `inputs` SHALL рендериться как у `ThermalReport`: кнопка `action` в заголовке (диспатч через `dispatchAction`), группа `tone: 'warning'` — пунктирные чипы, предупреждающий заголовок, `note` под чипами.

#### Scenario: Изменить и пересчитать

- **WHEN** `inputs.action` = {name: 'report_edit_inputs', label: 'Изменить и пересчитать'}
- **THEN** клик по кнопке диспатчит `report_edit_inputs`

#### Scenario: Принято системой

- **WHEN** группа {label: 'Принято системой — проверьте', tone: 'warning', chips: […], note: 'Интенсивность… принята 8 %…'}
- **THEN** чипы пунктирные, заголовок warning-цветом, note под чипами

### Requirement: Протокол свёрнут, «Скачать» — по URL

Секция `protocol` SHALL рендериться свёрнутой (нативный `<details>`) со строкой-сводкой (`meta`) и раскрывать `content` — краткий вывод расчёта (полная markdown-простыня в props не передаётся). При заданном `downloadUrl` в строке-сводке SHALL быть ссылка «Скачать» (`<a href>` на относительный URL, download-заголовки ставит сервер агента), не раскрывающая протокол; без `downloadUrl` ссылки нет.

#### Scenario: Скачивание протокола

- **WHEN** `protocol.downloadUrl` = '/api/agent-resource?resource=lift-report&taskId=t1' и пользователь нажимает «Скачать»
- **THEN** браузер переходит по href (сервер отвечает attachment), протокол не раскрывается

#### Scenario: Ссылки нет до готовности цепочки

- **WHEN** props без `downloadUrl`
- **THEN** строка протокола рендерится без «Скачать»
