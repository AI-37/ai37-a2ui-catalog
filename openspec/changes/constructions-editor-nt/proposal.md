## Why

Карточка конструкции знает одну температуру на весь документ — ту, что в блоке
«Условия». Для лестничной клетки (16 °C), тёплого чердака, тамбура и
перекрытия над неотапливаемым подвалом норма считается как для жилой комнаты
при 20 °C, потому что поправку nt по формуле (5.3) СП 50.13330.2024 задать
негде.

План: `AI-37/docs` `plans/thermal-nt-room-temperature.md` (PR #372). Парный
change агента — `construction-nt`.

- **2 поля** контракта: `tvRoom`, `totRoom`, оба опциональные.
- **1 формула**: `nt = (tв* − tот*) / (tв − tот)`; незаданное поле берётся
  общим по зданию, поэтому одна введённая температура уже даёт поправку.
- **1 чип** рядом с чипом Rпр: `nt 0.82`.
- **0 новых примитивов**: поля собираются из `Field` + `NumberField`, чип из
  `Chip`. Ось `placeholder` у `NumberField` уже есть (change
  `constructions-editor-r`).
- **Норма сравнения** в чипе и в счётчике «проходит N из M» — базовое `rnorm`
  типа, умноженное на nt конструкции.

## What Changes

- `constructionEntrySchema`: `tvRoom: z.number().optional()`,
  `totRoom: z.number().optional()` + зеркало Pydantic. Диапазона нет:
  температуры бывают любого знака, осмысленность пары проверяет агент.
- `compute-nt.ts` — чистая функция, `null` когда поправки нет: обе температуры
  не заданы, климат здания неполон, пара негодна.
- `effective-rnorm.ts` — `Rнорм = Rтр · nt`; применяется в чипе карточки и в
  счётчике футера.
- Форма шапки `*Next`: два поля температур у ЛЮБОГО типа, включая изделия —
  nt правит базовое Rтр таблицы 3, а не Rпр. Плейсхолдер — значение здания,
  поэтому пустое поле читается как «как у здания».
- Сводка шапки печатает заданные температуры: `· t в +16 °C`.
- Климат (`tv`, `tot`) прокинут из состояния редактора в список и карточку
  типом `ConstructionsClimateBase`.

## Impact

- `packages/catalog-schemas/src/components/constructions-editor.ts`,
  `packages/catalog-python/.../constructions_editor.py`.
- `packages/catalog-react/src/renderers/`: `compute-nt.ts`,
  `effective-rnorm.ts`, `constructions-next-nt-chip.tsx`,
  `constructions-next-room-temp-field.tsx` (новые);
  `constructions-next-header-form.tsx`, `constructions-next-header-summary.tsx`,
  `constructions-next-card.tsx`, `constructions-next-body.tsx`,
  `constructions-next-list.tsx`, `constructions-editor-next.tsx`,
  `constructions-next.types.ts`, `constructions-editor.types.ts`,
  `header-fields-equal.ts`, `with-header-fields.ts`,
  `next-header-draft-for-type.ts`.
- `fixtures/valid/constructions-editor-nt.json`,
  `fixtures/invalid/constructions-editor-tv-room-null.json`, `tests/`.
- `public/` перегенерирован; версия → 0.36.0 (minor: поля контракта).
- **Потребители:** `spai-ui` (рендерит), `spai-teplo-calc` (схемы, парный
  change `construction-nt`). `spai-chat-backend` props редактора не валидирует.
