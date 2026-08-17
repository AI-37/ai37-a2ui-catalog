## ADDED Requirements

### Requirement: Схема props компонента InsolationReport

Каталог SHALL предоставлять компонент `InsolationReport` со strict-схемой
props: обязательные `verdict` ({status: 'pass'|'fail', badge, headline,
summary?}) и `inputs` (группы чипов с tone 'normal'|'warning' и note, как
у отчётного канона); опциональные `timeline` ({title, axisStart, axisEnd,
ticks: [{at, label}], segments: [{from, to, kind: 'sun'|'shadow',
label?}]}), `checks` ([{title, detail?, status: 'pass'|'fail'|'info',
action?}]), `assumptions` (string[]), `protocol` ({meta?, content,
downloadFileName?, downloadContent?}). Числа — только координаты таймлайна
(минуты); все показываемые длительности и нормы — готовые строки от
агента.

#### Scenario: Валидная фикстура

- **WHEN** props содержат verdict pass («2 ч 40 мин суммарно»), timeline с
  двумя sun-сегментами и shadow-сегментом, три проверки и protocol
- **THEN** схема принимает объект, компонент попадает в артефакт каталога

#### Scenario: Пересекающиеся сегменты

- **WHEN** timeline содержит сегменты с перекрывающимися интервалами
- **THEN** схема отклоняет объект (refine непересечения)

### Requirement: Таймлайн солнце/тень с пропорциональными сегментами

Секция `timeline` SHALL рендерить горизонтальную полосу от axisStart до
axisEnd: ширина каждого сегмента пропорциональна его длительности,
kind 'sun' — success-тон, kind 'shadow' — приглушённый тон с label
(например «тень · здание 1»); засечки `ticks` подписываются под полосой.
Интервалы без сегментов SHALL рендериться нейтральным фоном.

#### Scenario: Прерывистая инсоляция

- **WHEN** timeline 8:00–16:00 содержит sun 9:20–10:40, shadow
  10:40–12:00 («тень · здание 1») и sun 12:00–13:20
- **THEN** полоса показывает три пропорциональных сегмента в правильном
  порядке с нейтральными краями и подписью тени

### Requirement: Проверки со статусами и действием

Секция `checks` SHALL рендерить карточки проверок со статусной точкой
(pass — success, fail — danger, info — нейтральная) и detail; при заданном
`action` SHALL рендериться кнопка/ссылка, диспатчащая
`{event: {name: action.name, context: action.payload ?? {}}}`.

#### Scenario: Проверка продолжительности

- **WHEN** проверка «Продолжительность инсоляции» имеет status 'pass' и
  detail «суммарно 2 ч 40 мин ≥ 2 ч 30 мин — ветвь прерывистой»
- **THEN** рендерится success-точка и detail-строка

#### Scenario: Переход к расчёту по проекту

- **WHEN** проверка «По квартире» имеет status 'info' и action
  `{name: 'insolation_project_calc', label: 'Посчитать по проекту'}`
- **THEN** клик диспатчит `insolation_project_calc`

### Requirement: Исходные данные и допущения по канону отчётов

Группы `inputs.groups` с tone 'warning' SHALL визуально отличаться
(пунктирные чипы, предупреждающий заголовок, note под чипами); при
`inputs.action` SHALL рендериться кнопка «Изменить и пересчитать».
`assumptions` SHALL рендериться предупреждающими плашками.

#### Scenario: Принято системой

- **WHEN** warning-группа содержит чипы «Модель застройки — прямоугольные
  экраны» и «Отметка окна +8,3 м»
- **THEN** чипы пунктирные, заголовок warning-цветом

### Requirement: Протокол — одна строка со скачиванием

Секция `protocol` SHALL рендериться неразворачиваемой строкой (лейбл, meta
«солнечная геометрия · N шагов», кнопка «Скачать» при `downloadFileName`,
отдающая Blob'ом `downloadContent ?? content`); содержимое в UI SHALL NOT
показываться. Кнопки отчёта SHALL соответствовать канону CE-кнопок.

#### Scenario: Скачивание протокола

- **WHEN** пользователь нажимает «Скачать»
- **THEN** браузер сохраняет файл, протокол на экране не раскрывается
