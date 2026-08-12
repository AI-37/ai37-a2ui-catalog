# Spec — reference-suggest-bff-route (spai-ui)

## ADDED Requirements

### Requirement: BFF проксирует suggest-запросы на REST оркестратора
`spai-ui` SHALL предоставлять роут `GET /api/reference-suggest`
(`app/api/reference-suggest/route.ts`) — тонкий прокси по образцу
`app/api/threads/route.ts`: passthrough query-строки (`referenceId`,
`query`) через `proxyChatBackend` на `getChatBackendRestUrl()`, с
`export const runtime = 'nodejs'` и `export const dynamic =
'force-dynamic'`. Роут SHALL NOT содержать бизнес-логики (резолв
`referenceId`, кэширование — не его забота).

#### Scenario: Авторизованный запрос проксируется
- **WHEN** браузер с валидной сессией вызывает
  `GET /api/reference-suggest?referenceId=cities&query=мос`
- **THEN** BFF получает access token из сессии, форвардит запрос на
  `{REST оркестратора}/api/reference-suggest?referenceId=cities&query=мос`
  с `Authorization: Bearer` и возвращает статус и тело ответа как есть

#### Scenario: Нет валидной сессии
- **WHEN** запрос приходит без валидной сессии (токен не получен)
- **THEN** BFF отвечает `401 {error: "unauthenticated"}`, не обращаясь к
  оркестратору

#### Scenario: Оркестратор недоступен
- **WHEN** форвард на REST оркестратора завершается сетевой ошибкой
- **THEN** BFF отвечает `502 {error: "chat_backend_unavailable"}`
  (поведение `proxyChatBackend`)
