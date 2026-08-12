# Spec — reference-suggest-orchestrator-routing (spai-chat-backend)

## ADDED Requirements

### Requirement: Оркестратор маршрутизирует referenceId на ручку агента-владельца
Оркестратор SHALL монтировать `GET /api/reference-suggest` в
`src/main.ts` рядом с `/api/projects`, под тем же `apiGuard`
(`jwtGuard`). Запись агента в реестре (`remote-a2a.config.ts`,
`config/remote-a2a.json`) SHALL расширяться опциональной мапой
`referenceSuggest: {referenceId: путь REST-ручки агента}`. Роут SHALL
резолвить `referenceId` по мапам реестра и форвардить запрос
`GET {origin(agentCardUrl)}{referenceSuggest[referenceId]}?query={q}` с
входящим Bearer-токеном, возвращая статус и тело ответа passthrough.

#### Scenario: Известный referenceId форвардится на ручку владельца
- **WHEN** приходит авторизованный запрос с `referenceId=materials-m`, и
  у агента `teplo-calc` в реестре
  `referenceSuggest: {"cities": "/api/suggest/cities", "materials-m":
  "/api/suggest/materials-m"}`
- **THEN** запрос форвардится на
  `{origin agentCardUrl}/api/suggest/materials-m?query=...` с тем же
  Bearer, и ответ `{options: [...]}` возвращается клиенту как есть

#### Scenario: Неизвестный referenceId
- **WHEN** `referenceId` не найден ни в одной мапе реестра
- **THEN** оркестратор отвечает `404 {error: "unknown_reference"}`, не
  обращаясь к агентам

#### Scenario: Запрос без валидного токена
- **WHEN** запрос приходит без валидного Bearer (при включённом auth)
- **THEN** `apiGuard` отвечает 401, форвард не выполняется

### Requirement: Коллизии referenceId — ошибка конфигурации
Валидация конфига реестра SHALL отклонять (при старте) конфигурацию, в
которой один `referenceId` объявлен в `referenceSuggest` более чем одного
агента.

#### Scenario: Дубликат referenceId в конфиге
- **WHEN** два агента в `remote-a2a.json` объявляют `referenceSuggest` с
  одним и тем же ключом
- **THEN** загрузка конфига завершается ошибкой с указанием конфликта
