# Spec — form-card-lookup-fetch-mode (каталог: схема + рендерер)

## ADDED Requirements

### Requirement: Поле lookup объявляет режим подсказок через suggestMode
`formFieldSchema` SHALL принимать опциональное поле
`suggestMode: 'action' | 'fetch'`. При отсутствии `suggestMode` рендерер
SHALL применять режим `'action'` (текущее поведение). Схема SHALL
оставаться не ломающей: все ранее валидные сообщения FormCard валидны и
ведут себя без изменений. Python-модель (`catalog-python`) SHALL
зеркалировать поле (паритет проверяется `test_schema_consistency.py`).

#### Scenario: Сообщение без suggestMode
- **WHEN** агент шлёт lookup-поле без `suggestMode`
- **THEN** схема валидна, рендерер работает в action-режиме
  (`lookup:suggest` + dataModel), `fetch` не вызывается

#### Scenario: Невалидное значение режима
- **WHEN** в `suggestMode` приходит значение вне `['action','fetch']`
  (фикстура `form-card-invalid-suggest-mode.json`)
- **THEN** zod- и pydantic-валидация отклоняют сообщение

### Requirement: Контракт fetch-канала экспортируется из catalog-schemas
Пакет `@ai37/a2ui-catalog-schemas` SHALL экспортировать
`LOOKUP_SUGGEST_ROUTE = '/api/reference-suggest'`,
`LOOKUP_DEBOUNCE_MS = 300` и тип
`LookupSuggestResponse = {options: LookupOption[]}` — единый источник
контракта для рендерера, BFF, оркестратора и агентов.

#### Scenario: Потребитель импортирует контракт
- **WHEN** BFF или роут агента реализует suggest-эндпоинт
- **THEN** путь и тип ответа берутся импортом из пакета, без строковых
  копий

### Requirement: Fetch-режим запрашивает подсказки same-origin GET-запросом
При `suggestMode: 'fetch'` рендерер SHALL: после ввода `>= minChars`
(default 3) и debounce `LOOKUP_DEBOUNCE_MS` выполнять
`GET {LOOKUP_SUGGEST_ROUTE}?referenceId={referenceId}&query={query}`
(относительный same-origin путь); отменять предыдущий in-flight запрос
через `AbortController`; НЕ отправлять `dispatchAction` при вводе.
Выбор опции SHALL попадать в существующий submit-flow через скрытый
`<input name={field.name} value={selected.value}>` без изменения
`handleSubmit`.

#### Scenario: Ввод ниже порога
- **WHEN** пользователь ввёл меньше `minChars` символов
- **THEN** сетевой запрос не выполняется, дропдаун закрыт

#### Scenario: Debounce схлопывает ввод
- **WHEN** несколько keystroke происходят в пределах окна debounce
- **THEN** выполняется ровно один запрос с последним `query`

#### Scenario: Новый ввод отменяет in-flight запрос
- **WHEN** новый запрос стартует до ответа предыдущего
- **THEN** предыдущий запрос abort'ится, отображается только ответ
  последнего

#### Scenario: Выбор опции уходит в submit
- **WHEN** пользователь выбирает опцию `{value: 'msk', label: 'Москва'}`
  и жмёт submit
- **THEN** input показывает `Москва`, а submit-action содержит
  `{[field.name]: 'msk'}`

### Requirement: Ошибки fetch-канала деградируют тихо
При любом сбое канала (не-2xx, сетевая ошибка, malformed-ответ) рендерер
SHALL показывать пустой дропдаун, оставлять поле редактируемым и НЕ
блокировать submit; `AbortError` SHALL игнорироваться как штатная отмена;
ре-логин из компонента каталога НЕ инициируется.

#### Scenario: Роут недоступен или сессия протухла
- **WHEN** запрос возвращает 401/404/500 или отклоняется сетью
- **THEN** дропдаун пуст, ошибок в UI нет, форма отправляется как обычно
  (пустое значение при отсутствии выбора)
