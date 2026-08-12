# Tasks — FormCard lookup-поле

## 1. Схема (`catalog-schemas`)

- [x] Добавить `'lookup'` в `formFieldTypeSchema`.
- [x] Добавить `referenceId` (`string`, optional на уровне схемы) и
      `minChars` (`number`, optional, default 3 в рендерере) в `formFieldSchema`.
- [x] Расширить `defaultValue` union: `{value: string, label: string}` для `lookup`.
- [x] Решить, нужен ли `.refine()` для связи `type: 'lookup' → referenceId обязателен`,
      или проверка остаётся на рендерере/агенте.
      **Решено: `.refine()` в схеме** — ошибка ловится на этапе генерации
      формы агентом, а не молча в рендерере.

## 2. Конвенции контракта (зафиксировать до реализации)

- [x] Имя action-события: `lookup:suggest`; context:
      `{fieldName, referenceId, query}` (см. `design.md` → Data flow).
      Константы контракта экспортированы из `catalog-schemas`
      (`components/form-card-lookup.ts`): `LOOKUP_SUGGEST_ACTION`,
      `LOOKUP_MIN_CHARS_DEFAULT`, `lookupOptionsPath()`, типы
      `LookupOption`/`LookupSuggestData`/`LookupSuggestActionContext`.
- [x] Путь опций в dataModel: **`/lookup/{fieldName}/options` — с ведущим
      слэшем, обязательно**: DataModel ключует Preact-сигналы точной
      строкой пути, `lookup/…` и `/lookup/…` — разные ключи, несовпадение
      молча ломает уведомления. Формат значения:
      `{query, options: [{value, label}]}` — эхо `query` для отбрасывания
      устаревших ответов.
- [ ] Согласовать с владельцем агент-хоста его связанный change:
      детерминированный хендлер `lookup:suggest` (вне LLM) + ответ
      ACTIVITY_SNAPSHOT **с тем же `messageId`, что у исходного снапшота
      формы**, полным самодостаточным набором операций (требование из
      `design.md` → «Проверено»; иначе — `Surface not found` и error-box
      вторым сообщением).
- [ ] Открытый вопрос хосту: как сегодня выбирается `messageId` при эмите
      формы и как переиспользовать его в последующем run.

## 3. Рендерер (`catalog-react`, `form-card.tsx`)

- [x] Ветка `field.type === 'lookup'`: `<input>` + дропдаун подсказок.
      Вынесено в `renderers/lookup-field.tsx` (`LookupFieldControl`) —
      хуки нельзя звать внутри `props.fields.map()`.
- [x] `useState` на поле (query, selectedValue, open) — по набору на каждое
      lookup-поле, не на форму.
- [x] Debounce ~300мс; при `query.length >= minChars` —
      `context.dispatchAction({event: {name: 'lookup:suggest', ...}})`.
- [x] Реактивное чтение `/lookup/{fieldName}/options` из dataModel.
      **Решено: хук `useDataModelValue`** (`renderers/use-data-model-value.ts`):
      `context.dataContext.dataModel` + `getSignal(path).value` как снапшот
      и `subscribe(path, cb)` через `React.useSyncExternalStore` (у
      `subscribe` нет синхронного первого вызова, поэтому не useEffect).
- [x] Скрытый `<input type="hidden" name={field.name}>` с
      `selectedValue.value` — `handleSubmit` не менять.
- [x] Edge cases: `< minChars` → action не шлём; устаревший ответ →
      игнор по эху `query`; ошибка/молчание хоста → тихий fallback;
      без выбора опции → пустое значение поля.

## 4. Сборка и проверка

- [x] `pnpm build` в `catalog-schemas` и `catalog-react` — без ошибок типов.
      Попутно: включён `linkWorkspacePackages: true` в `pnpm-workspace.yaml`
      (pnpm ≥10 по умолчанию не линкует workspace-пакеты по semver — вопреки
      замыслу `fix/catalog-react-publishable-dep` catalog-react собирался
      против реестрового catalog-schemas 0.4.1); версии подняты до 0.5.0.
- [x] Demo-превью в репо: lookup-поле «Город строительства» в
      `fixtures/messages/form-card-surface.json` + локальная имитация хоста
      `apps/demo/src/demo-lookup-host.ts` (подписка на `surface.onAction`,
      ответ `updateDataModel` тем же `MessageProcessor`) — полный цикл
      action → dataModel → дропдаун виден в `pnpm --dir apps/demo dev`.
- [ ] Расширить mock-агент `spai-ui` (`mocks/devAgent/`): сейчас он эмитит
      случайный `messageId` на каждый run — для smoke нужен повторный
      снапшот с тем же `messageId` в ответ на `lookup:suggest`.
- [ ] Smoke на mock-агенте (`AI37_USE_MOCK_AGENT=true` в spai-ui):
      lookup-поле рендерится, debounce работает, опции обновляются без
      второй «Формы» в аккордеоне, выбор попадает в submit `FormCard`,
      введённый в другие поля текст не теряется.

## Non-goals

Отдельный `LookupField`-компонент вне `FormCard`. `ChoiceCard`. Реализация
хендлера на агент-хосте (только контракт + связанный change в его репо).
Общий dataModel/path-биндинг полей формы. Коэрсинг типов на submit.
