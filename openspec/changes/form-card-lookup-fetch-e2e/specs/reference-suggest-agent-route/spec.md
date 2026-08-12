# Spec — reference-suggest-agent-route (spai-teplo-calc, образец для агентов-владельцев)

## ADDED Requirements

### Requirement: Агент-владелец отдаёт справочники per-справочник REST-ручками
Агент-владелец справочников (первый — `spai-teplo-calc`) SHALL монтировать
по одной конкретной REST-ручке на справочник — `GET /api/suggest/cities` и
`GET /api/suggest/materials-m`, только параметр `query` — на Express app,
возвращаемом `createAgentHost` (в `src/app.ts`, до `listen`), под
`jwtGuard` из `@ai37/agent-host` — тем же guard'ом, что agent-surface.
Ручки SHALL переиспользовать существующие
`suggestCities`/`suggestMaterials` — ту же доменную логику, что
action-канал (`handleLookupSuggest`). Диспетчеризации по `referenceId` и
404 `unknown_reference` на агенте NOT required — их делает реестр
оркестратора; пути ручек публикуются в его `referenceSuggest`-мапе. Ответ
SHALL соответствовать `LookupSuggestResponse` из
`@ai37/a2ui-catalog-schemas`. Изменения `ai37-agent-sdk` NOT required.

#### Scenario: Поиск по справочнику городов
- **WHEN** приходит авторизованный запрос `GET /api/suggest/cities?query=мос`
- **THEN** ручка отвечает `200 {options: [{value, label, ...}, ...]}` с
  результатами `suggestCities('мос')`

#### Scenario: Поиск по справочнику материалов
- **WHEN** приходит авторизованный запрос
  `GET /api/suggest/materials-m?query=бетон`
- **THEN** ручка отвечает `200 {options: [...]}` с результатами
  `suggestMaterials('бетон')`

#### Scenario: Пустой query
- **WHEN** `query` пуст или отсутствует
- **THEN** ручка отвечает `200 {options: []}` (тихий fallback, паритет с
  action-каналом)

#### Scenario: Паритет каналов подсказок
- **WHEN** один и тот же справочник+`query` запрошен через action-канал
  (`lookup:suggest`) и через REST-ручку
- **THEN** списки опций идентичны (оба канала — обёртки над одними
  suggest-функциями)
