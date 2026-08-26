## 1. Схема (catalog-schemas)

- [x] 1.1 `src/components/constructions-editor.ts` — `constructionsGeneralSchema`
      (`buildingType`, `city` как `{value,label}`, `tot`, `zot`, `tn`, `tv`,
      `condition`; незаполненное — `null`), strict
- [x] 1.2 Props: `general`, `buildingTypeOptions`, `cityReferenceId`, лейблы
      вкладок; `backLabel`/`backAction` → `.optional()`; `condition`
      помечен deprecated в комментарии
- [x] 1.3 TS-тесты схемы: пустой `general` валиден; неизвестный ключ в
      `general` отклоняется; props без `backLabel`/`backAction` валидны

## 2. Вкладка общих данных (catalog-react)

- [x] 2.1 `src/renderers/constructions-editor-general.tsx` — форма блока
      `general`: select типа здания, числовые поля климата, select условия
- [x] 2.2 Поле города: `LookupCombobox` + `use-lookup-suggest` по
      `cityReferenceId`
- [x] 2.3 Подстановка климата из опции: `tot`/`zot`/`tn` в поля, значения
      остаются редактируемыми (аналог `read-option-lambda.ts` — вынести
      `read-option-climate.ts`)

## 3. Табы и state (catalog-react)

- [x] 3.1 `constructions-editor.tsx` — состояние активной вкладки и `general`,
      переключение без action'ов
- [x] 3.2 Снимок `general` из props + функция «климат тронут» (Решение 4
      design.md); чипы без сравнения и скрытая сводка при `dirty`
- [x] 3.3 λ в `computeLiveRpr` берёт `condition` из state вкладки, fallback —
      top-level проп, затем λБ
- [x] 3.4 `handleSubmit` — всегда `dispatchAction` с `{general, constructions}`;
      удалить `submitAttempted`, подсветку и `validate-constructions.ts`
      (вместе с его тестами)
- [x] 3.5 Кнопка возврата рисуется только при заданных `backLabel`/`backAction`
- [x] 3.6 `draftAction` шлёт `{general, constructions}`

## 4. Python-зеркало (catalog-python)

- [x] 4.1 `models/constructions_editor.py` — модель `general` + новые props,
      опциональность `back_label`/`back_action`
- [x] 4.2 `test_schema_consistency.py` — parity зелёный

## 5. Фикстуры и тесты

- [x] 5.1 `fixtures/valid/constructions-editor.json` — `general`,
      `buildingTypeOptions`, `cityReferenceId`, без `backAction`;
      `fixtures/invalid/constructions-editor-unknown-general-key.json`
- [x] 5.2 React-тесты: переключение вкладок без action'ов и без потери ввода;
      выбор города заполняет tот/zот/tн и они правятся руками; опция без
      климата; submit пустой формы уходит одним action'ом с `{general,
      constructions}`; чипы скрывают сравнение после правки климата и
      возвращаются на новых props; смена условия пересчитывает Rпр; кнопка
      возврата отсутствует без пропов
- [x] 5.3 Python round-trip фикстуры

## 6. Демо и публикация

- [x] 6.1 `apps/demo` — превью объединённого экрана + мок подсказок городов с
      климатом в опциях
- [x] 6.2 `pnpm run test`, `pnpm run typecheck`, `pnpm run build`
- [x] 6.3 `pnpm run version:bump <minor>` + CHANGELOG.md
- [x] 6.4 `pnpm run export:public` — обновлённый
      `public/a2ui/catalogs/ai37-a2ui/v2/…`
- [x] 6.5 Тарболы schemas+react в `~/github/ai37/.local-packages`
