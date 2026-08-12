# Tasks — FormCard lookup fetch-режим e2e

## 1. Согласование (до кода)

- [x] 1.1 Имя роута `/api/reference-suggest` — sign-off команды
      оркестратора (после публикации константы переименование =
      контракт-брейк).
- [x] 1.2 Версии пакетов каталога: bump всех на 0.6.0 (python
      0.3.0→0.6.0) — подтвердить.

## 2. Каталог: схема (`packages/catalog-schemas`)

- [x] 2.1 `suggestMode: z.enum(['action','fetch']).optional()` +
      `lookupSuggestModeSchema` в `src/components/form-card.ts`.
- [x] 2.2 Новые `src/components/form-card-lookup-fetch.ts`
      (`LOOKUP_SUGGEST_ROUTE`, `LOOKUP_DEBOUNCE_MS` — перенос 300мс из
      lookup-field.tsx) и `form-card-lookup-fetch.types.ts`
      (`LookupSuggestResponse`); реэкспорт из `src/index.ts`.
- [x] 2.3 Python-зеркало: `SuggestMode = Literal["action","fetch"]`,
      `suggestMode: SuggestMode = None` в
      `catalog-python/.../models/form_card.py`.
- [x] 2.4 Фикстуры: fetch-поле в `fixtures/valid/form-card.json`;
      `fixtures/invalid/form-card-invalid-suggest-mode.json` +
      регистрация в `tests/ts/catalog-schemas.test.ts` и
      `tests/python/test_models.py`;
      `fixtures/messages/form-card-lookup-fetch-surface.json`.

## 3. Каталог: рендерер (`packages/catalog-react/src/renderers`)

- [x] 3.1 Извлечь общий `lookup-combobox.tsx` + `.types.ts`
      (контролируемый комбобокс: input, hidden input, listbox,
      onMouseDown-выбор, tokens.*).
- [x] 3.2 Перенести action-логику в `lookup-field-action.tsx` (без
      изменений поведения), импорт `LOOKUP_DEBOUNCE_MS` из schemas.
- [x] 3.3 Новый `lookup-field-fetch.tsx`: state опций, debounce,
      `AbortController`, тихий fallback, cleanup на unmount.
- [x] 3.4 `lookup-field.tsx` → диспетчер по `suggestMode ?? 'action'`;
      `form-card.tsx` не трогать.

## 4. Каталог: тесты и артефакты

- [x] 4.1 `tests/react/form-card-lookup-fetch.test.tsx`: minChars-гейт;
      один запрос после debounce (точный URL + signal); схлопывание
      debounce; abort in-flight; рендер опций и выбор → hidden input;
      тихий fallback (не-ok/reject/malformed); submit-интеграция
      (выбрано/пусто); unmount при in-flight.
- [x] 4.2 Регресс action-режима: без `suggestMode` уходит
      `lookup:suggest`, `fetch` не вызывается.
- [x] 4.3 `pnpm run test` + `pnpm run test:python` (паритет схем) зелёные.
- [x] 4.4 `pnpm run export:public`, коммит `public/`,
      `pnpm run verify:public`.
- [x] 4.5 `CHANGELOG.md` + `pnpm run version:bump 0.6.0`.
- [x] 4.6 (Опционально) vite-middleware `/api/reference-suggest` в
      `apps/demo` + fetch-поле в демо для ручной проверки.

## 5. spai-teplo-calc: REST-ручки справочников (топорно, по одной на справочник)

- [x] 5.1 В `src/app.ts` перехватить app из `createAgentHost`, до
      `listen` смонтировать `GET /api/suggest/cities` и
      `GET /api/suggest/materials-m` (только `query`) c `jwtGuard`;
      внутри — `suggestCities`/`suggestMaterials`; ответ —
      `LookupSuggestResponse`. Без диспетчеризации и 404 на агенте.
- [x] 5.2 Тест паритета каналов: action-хендлер и REST-ручка дают
      одинаковые опции на один справочник+query.
- [x] 5.3 Smoke curl'ом напрямую в агент (Bearer): 200 на обе ручки,
      пустой query → `{options: []}`.

## 6. spai-chat-backend: маршрутизация

- [x] 6.1 Мапа `referenceSuggest: {referenceId: путь ручки}` в
      `remote-a2a.config.ts` (+ валидация уникальности referenceId между
      агентами при загрузке конфига) и `config/remote-a2a.json` (teplo:
      `{"cities": "/api/suggest/cities", "materials-m":
      "/api/suggest/materials-m"}`).
- [x] 6.2 Роут-форвардер `GET /api/reference-suggest` в `src/main.ts`
      рядом с `/api/projects`, тот же `apiGuard`: referenceId → айтем
      мапы → `origin(agentCardUrl) + путь + ?query=` с входящим Bearer,
      passthrough ответа; неизвестный id → 404 `unknown_reference`.
- [x] 6.3 Тесты: известный/неизвестный referenceId, 401 без токена,
      дубликат referenceId в конфиге → ошибка старта.

## 7. spai-ui: BFF-роут

- [x] 7.1 `app/api/reference-suggest/route.ts` — зеркало
      `app/api/threads/route.ts`: GET, passthrough `search` через
      `proxyChatBackend`, `runtime='nodejs'`, `dynamic='force-dynamic'`.
- [x] 7.2 Обновить `@ai37/a2ui-catalog-react`/`-schemas` до 0.6.0.
- [x] 7.3 e2e smoke: lookup-поле с `suggestMode:'fetch'` от teplo-агента —
      подсказки приходят, выбор попадает в submit; при остановленном
      агенте — тихий fallback, форма работает.

## 8. Финализация

- [x] 8.1 Пометить `openspec/changes/form-card-lookup-field-fetch/` как
      superseded этим change (заметка в его proposal.md).
- [x] 8.2 Кросс-ссылка в `openspec/changes/form-card-lookup-field/design.md`:
      fetch-режим наслаивается через `suggestMode` (см. этот change).
- [ ] 8.3 (Опционально, `ai37-agent-sdk`) хук `AgentHostOptions.routes` —
      отдельным PR, не блокирует.
