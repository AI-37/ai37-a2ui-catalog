## ADDED Requirements

### Requirement: Схема props компонента KeoReport

Каталог SHALL предоставлять компонент `KeoReport` со strict-схемой props:
обязательные `verdict` ({status: 'pass'|'fail', badge, headline, summary?})
и `inputs` ({action?, groups: [{label, tone: 'normal'|'warning',
chips: [{label, value}], note?}]}); опциональные `recommendations`
([{title, detail, tone: 'success'|'neutral'|'fail', action?}]), `rooms`
([{id, name, value, norm, status: 'pass'|'fail', action?}]), `assumptions`
(string[]), `protocol` ({meta?, content, downloadFileName?,
downloadContent?}). Действие — объект {name, label, payload?}. Все
значения — готовые строки; нормативная логика (сравнение с e_н, допуск
−10 % по СП 367 п. А.2.12, источник нормы) — на агенте.

#### Scenario: Валидная фикстура fail-наполнения

- **WHEN** props содержат verdict fail («КЕО — 0,42 % при норме 0,50 %»),
  три рекомендации, inputs и protocol
- **THEN** схема принимает объект, компонент попадает в артефакт каталога

#### Scenario: Лишнее поле

- **WHEN** в props передан не описанный схемой ключ
- **THEN** strict-схема отклоняет объект

### Requirement: Карточки рекомендаций с тоном и действием

Секция `recommendations` («что изменить») SHALL рендерить карточки:
tone 'success' — акцентная success-рамка, tone 'fail' — detail
danger-цветом, tone 'neutral' — обычная рамка. Кнопка действия SHALL
рендериться только при заданном `action` и по клику диспатчить
`{event: {name: action.name, context: action.payload ?? {}}}`.

#### Scenario: Рекомендация с пересчётом

- **WHEN** карточка «Окно 1,8 × 1,5 м» имеет tone 'success' и action
  `{name: 'report_recalc', payload: {window: '1.8x1.5'}}`
- **THEN** рендерится success-рамка и кнопка, клик диспатчит
  `report_recalc` с `context.window === '1.8x1.5'`

#### Scenario: Отвергнутый вариант

- **WHEN** карточка «Светлее отделка» имеет tone 'fail' и не имеет action
- **THEN** detail показан danger-цветом, кнопки нет

### Requirement: Вердикт и результаты по помещениям

Вердикт SHALL показывать бейдж со статусной точкой (pass — success,
fail — danger), крупный headline и summary. Опциональная секция `rooms`
SHALL рендерить строку на помещение: имя, расчётное значение, норма,
статусная точка и кнопка действия при заданном `action`.

#### Scenario: Сводный мультипомещенный результат

- **WHEN** rooms содержит «Жилая комната — 0,42 % / 0,50 % · fail» и
  «Кухня — 0,61 % / 0,50 % · pass»
- **THEN** обе строки рендерятся со статусными цветами и значениями

### Requirement: Группы исходных данных различаются тоном

Группа `inputs.groups` с tone 'warning' («принято системой — проверьте»)
SHALL визуально отличаться от 'normal' (пунктирные чипы, предупреждающий
заголовок) и показывать note под чипами; при заданном `inputs.action`
SHALL рендериться кнопка («Изменить и пересчитать»), диспатчащая действие.

#### Scenario: Допущение затенения

- **WHEN** warning-группа содержит чип «Затенение — нет» и note о принятом
  открытом горизонте
- **THEN** чип пунктирный, заголовок warning-цветом, note под чипами

### Requirement: Протокол — одна строка со скачиванием

Секция `protocol` SHALL рендериться неразворачиваемой строкой: лейбл
«Протокол расчёта», meta и кнопка «Скачать» (при `downloadFileName`),
отдающая клиентским Blob'ом `downloadContent ?? content`. Содержимое в UI
SHALL NOT показываться. Кнопки отчёта SHALL соответствовать канону
CE-кнопок и не перекрашиваться хостовыми hover/фокус-стилями.

#### Scenario: Скачивание протокола

- **WHEN** пользователь нажимает «Скачать» при заданных downloadFileName и
  downloadContent
- **THEN** браузер сохраняет downloadContent файлом с этим именем;
  содержимое протокола на экране не появляется
