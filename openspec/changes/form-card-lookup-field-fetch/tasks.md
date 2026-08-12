# Tasks — FormCard lookup-поле через fetch (вариант 1)

## 1. Согласовать до реализации

- [ ] Имя роута (`/api/reference-suggest` в спеке; финальное — с командой
      агент-хоста) и контракт ответа (`design.md` → «Контракт роута
      агент-хоста»).
- [ ] Владелец задачи на роут в репо агента (справочники — при агенте).

## 2. Схема (`catalog-schemas`)

- [ ] Добавить `'lookup'` в `formFieldTypeSchema`.
- [ ] Добавить `referenceId`, `minChars` в `formFieldSchema`.
- [ ] Расширить `defaultValue` union: `{value, label}`.
- [ ] Решить: `.refine()` для `type: 'lookup' → referenceId обязателен`
      или проверка в рендерере.

## 3. Рендерер (`catalog-react`, `form-card.tsx`)

- [ ] Ветка `field.type === 'lookup'`: `<input>` + дропдаун под `tokens.*`.
- [ ] `useState` на поле (query, options, selectedValue, open).
- [ ] Debounce ~300мс; `fetch('/api/reference-suggest?...')` c
      `referenceId`, `query`; `AbortController` на предыдущий запрос.
- [ ] Скрытый `<input type="hidden" name={field.name}>` — `handleSubmit`
      не менять.
- [ ] Edge cases: `< minChars`; ошибка/404/401 → тихий fallback; без
      выбора → пустое значение.

## 4. Связанные задачи в других репозиториях

- [ ] `spai-ui`: роут `app/api/reference-suggest/route.ts` — тонкий прокси
      по образцу `proxyChatBackend.ts` (cookie → Bearer → форвард на
      агент-хост, как `/api/projects`).
- [ ] Репо агента: REST-роут `/api/reference-suggest` на агент-хосте,
      резолв `referenceId` → источник, скоуп по claims (контракт —
      `design.md`).

## 5. Сборка и проверка

- [ ] `pnpm build` в `catalog-schemas` и `catalog-react` — без ошибок типов.
- [ ] Smoke в `spai-ui` с застабленным роутом `/api/reference-suggest`
      (фиксированный список опций): lookup-поле рендерится, debounce
      работает, отмена in-flight запроса, выбор попадает в submit
      `FormCard`.
- [ ] Проверить поведение при 401/500 от роута — форма остаётся рабочей.

## Non-goals

Отдельный `LookupField` вне `FormCard`. `ChoiceCard`. Реализация роута на
агент-хосте и BFF-роута (только контракты). dataModel/path-биндинг.
Коэрсинг типов на submit.
