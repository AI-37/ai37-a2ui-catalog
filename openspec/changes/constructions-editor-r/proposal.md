## Why

Теплотехнический агент умеет `Rпр = r·Rусл` (Г.4 СП 50.13330.2024), но ввести
r по конструкции пользователю негде: в карточке редактора поля нет, в контракте
`constructionEntrySchema` — тоже. Единственный путь r в расчёт — заявленный
проверяемым документом. Обычный расчёт всегда идёт с r = 1 `(доп)`, и для
вентфасада это завышает Rпр: в эталоне `Состав_конструкции_для_расчета.docx`
стены с вентзазором сходятся с эталонным Rпр только при r ≈ 0,90.

План: `AI-37/docs` `plans/thermal-r-uniformity-sp230.md` (PR #373), этап A —
«r как ввод по конструкции». Этап B (элементы неоднородности по СП 230) —
отдельный, больший инкремент каталога.

- **1 поле** контракта: `ConstructionEntry.r`, опциональное, (0; 1].
- **1 форма**, в которой поле живёт: форма шапки карточки (тип, разновидность,
  название) — там же «Сохранить», тот же коммит. Нового паттерна формы нет.
- **1 множитель** в live-Rпр: `entry.r ?? 1`. Канон по-прежнему на сервере.
- **0 новых примитивов**: `NumberField` получает ось `max` (у него уже есть
  `min`), поле собирается из `Field` + `NumberField compact`.
- **2 семейства рендереров** делят схему; поле добавляется только `*Next` —
  старая шапка не трогается (канон).

## What Changes

- `constructionEntrySchema.r: z.number().gt(0).max(1).optional()` + зеркало
  Pydantic `r: float = Field(default=None, gt=0, le=1)`.
- `ConstructionHeaderFields` получает `r`; `headerFieldsEqual` сравнивает его.
- Форма шапки `*Next`: поле «r (однородность)» для типов с `hasLayers`; смена
  типа на изделие сбрасывает r (как разновидность — при смене типа).
- Сводка шапки `*Next`: `· r = 0.85` в строке типа, когда r задан.
- Коммит формы шапки: очищенное r снимает ключ с конструкции
  (`with-header-fields.ts`) — payload черновика равен состоянию.
- `computeLiveRpr` умножает сумму на `entry.r ?? 1` у слоистых типов.
- `NumberField.max`.

## Impact

- `packages/catalog-schemas/src/components/constructions-editor.ts`,
  `packages/catalog-python/.../constructions_editor.py` — контракт.
- `packages/catalog-react/src/primitives/number-field*` — ось `max`.
- `packages/catalog-react/src/renderers/constructions-next-header-form.tsx`,
  `constructions-next-r-field.tsx`, `next-header-draft-for-type.ts`,
  `with-header-fields.ts`, `constructions-next-header-summary.tsx`,
  `constructions-next-body.tsx`, `compute-live-rpr.ts`, `header-fields-equal.ts`,
  `constructions-editor.types.ts`.
- `fixtures/valid/constructions-editor-r.json`,
  `fixtures/invalid/constructions-editor-r-above-one.json`, `tests/`.
- `public/` перегенерирован; версия пакетов → 0.35.0 (minor: поле контракта).
- **Потребители:** `spai-ui` (рендерит), `spai-teplo-calc` (схемы, парный
  change `construction-r` в репозитории агента — round-trip r, приоритет над
  r документа, метка `(п)` в отчёте). `spai-chat-backend` props редактора не
  валидирует (`A2uiComponentBuilder` знает пять своих компонентов) — бамп ему
  не нужен.
