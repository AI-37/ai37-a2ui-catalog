## ADDED Requirements

### Requirement: Схема props компонента VerificationReport

Каталог SHALL предоставлять компонент `VerificationReport` со strict-схемой props: обязательные `verdict` ({status: 'pass'|'fail'|'warning', badge, headline, summary?}) и `checks` ([{id, label, status: 'pass'|'fail'|'warning'|'error'|'skipped', summary?, details?: [{label, value}], sources?: [{label, url?}]}], не более 30), опциональный `note`. Все значения — готовые строки от агента.

#### Scenario: Спорный случай

- **WHEN** props содержат вердикт `warning` и восемь проверок, часть с `details` и `sources`
- **THEN** схема принимает объект, компонент есть в артефакте каталога

#### Scenario: Неизвестный статус проверки

- **WHEN** у проверки `status: 'passed'`
- **THEN** схема отклоняет объект

#### Scenario: Пустой список деталей

- **WHEN** у проверки `details: []`
- **THEN** схема отклоняет объект

### Requirement: Раскрытие строки проверки

Строка с `details` или `sources` SHALL быть кнопкой-раскрывашкой с `aria-expanded` и `aria-controls`, указывающим на панель с парами «подпись — значение» и строкой источников. Строка без них SHALL рендериться без кнопки. Несколько строк MAY быть раскрыты одновременно.

#### Scenario: Раскрытие ОКВЭД

- **WHEN** пользователь нажимает на строку «Профильный ОКВЭД»
- **THEN** `aria-expanded` становится `true`, панель показывает основной ОКВЭД с расшифровкой и источник

#### Scenario: Строка без деталей

- **WHEN** у проверки нет ни `details`, ни `sources`
- **THEN** у строки нет кнопки, основание показано под названием

### Requirement: Ссылки источников

Источник SHALL становиться ссылкой только при URL со схемой `http` или `https`, с `target="_blank"` и `rel="noopener noreferrer"`; иначе он MUST выводиться подписью без ссылки.

#### Scenario: Небезопасная схема

- **WHEN** `url` источника — `javascript:alert(1)`
- **THEN** ссылки нет, подпись показана текстом
