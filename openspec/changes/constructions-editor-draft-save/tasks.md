## 1. Схема (catalog-schemas)

- [x] 1.1 `src/components/constructions-editor.ts`: опциональное поле
      `draftAction: z.string().min(1).max(120).optional()` в
      `constructionsEditorPropsSchema` + комментарий о необязательности
- [x] 1.2 TS-тест схемы: props без `draftAction` валидны, с валидным именем
      валидны, `draftAction: ""` отклоняется

## 2. Рендерер (catalog-react)

- [x] 2.1 `src/renderers/constructions-editor.tsx`: хелпер отправки черновика
      (`props.draftAction` не задан → no-op), вызывается с актуальным массивом
- [x] 2.2 Триггеры add/remove конструкции: `handleAdd` и `handleEntryRemove`
      шлют черновик после обновления state
- [x] 2.3 Триггер add/remove слоя: в `handleEntryChange` сравнить
      `next.layers.length` с длиной у текущей записи; различие → черновик,
      совпадение → ничего (Решение 3 design.md)
- [x] 2.4 Убедиться, что автосейв не трогает `submitAttempted`, `closedIds` и
      рабочую копию конструкций

## 3. Python-зеркало (catalog-python)

- [x] 3.1 `models/constructions_editor.py`: `draft_action` опциональным полем
      1:1 со схемой
- [x] 3.2 Прогнать `test_schema_consistency.py` — parity зелёный
      (poetry в системе нет; прогон в scratch-venv python 3.13 через uv)

## 4. Фикстуры и тесты

- [x] 4.1 `fixtures/valid/constructions-editor.json` — добавить `draftAction`;
      `fixtures/invalid/constructions-editor-empty-draft-action.json`
- [x] 4.2 React-тест `tests/react/constructions-editor.test.tsx`: без пропа
      add/remove не порождает action; с пропом add конструкции шлёт один
      action с полным массивом; remove конструкции и add/remove слоя — тоже;
      правка поля не шлёт ничего; правка поля + add даёт один action с новым
      значением поля; невалидное состояние черновик не блокирует; submit
      после автосейвов работает как раньше
- [x] 4.3 Python round-trip фикстуры

## 5. Демо и публикация

- [x] 5.1 `apps/demo`: `draftAction` в примере + лог отправленного черновика
      (отдельные `with-constructions-draft-action.ts` и
      `attach-demo-draft-logger.ts`, фикстура сообщений остаётся без пропа)
- [x] 5.2 `pnpm run test`, `pnpm run typecheck`, `pnpm run build`
- [x] 5.3 `pnpm run version:bump 0.8.0` + запись в CHANGELOG.md
- [x] 5.4 `pnpm run export:public` — обновлённый
      `public/a2ui/catalogs/ai37-a2ui/v2/…` (коммит за пользователем)
- [x] 5.5 Тарболы schemas+react 0.8.0 в `~/github/ai37/.local-packages`
