## 1. Контракт

- [x] 1.1 `constructionEntrySchema.r` — `z.number().gt(0).max(1).optional()`
- [x] 1.2 Python-зеркало `ConstructionEntry.r`
- [x] 1.3 Фикстуры: valid с r, invalid с r > 1; регистрация в TS- и Python-тестах

## 2. Карточка `*Next`

- [x] 2.1 `NumberField.max`
- [x] 2.2 `ConstructionHeaderFields.r`, `headerFieldsEqual` сравнивает r
- [x] 2.3 Поле «r (однородность)» в форме шапки только для `hasLayers`
      (`constructions-next-r-field.tsx`)
- [x] 2.4 Смена типа на изделие сбрасывает r (`next-header-draft-for-type.ts`)
- [x] 2.5 Коммит снимает ключ r при пустом поле (`with-header-fields.ts`)
- [x] 2.6 Сводка шапки печатает `· r = 0.85`
- [x] 2.7 `computeLiveRpr` × `entry.r ?? 1`
- [x] 2.8 Плейсхолдер «1» (`NumberField.placeholder`), поле на всю колонку —
      правка после ревью на стенде

## 3. Тесты

- [x] 3.1 Схема принимает r ∈ (0; 1], отвергает 1.2
- [x] 3.2 Рендерер: поле в форме шапки; до «Сохранить» чип и действия прежние;
      после — чип × r, `r = …` в шапке, черновик с r
- [x] 3.3 Рендерер: у изделия поля нет
- [x] 3.4 Рендерер: присланный r в чипе и шапке; очистка снимает ключ
- [x] 3.5 Юнит: смена типа сбрасывает r только у изделий

## 4. Гейт

- [x] 4.1 `pnpm run typecheck`, `pnpm run test:ts`
- [x] 4.2 `pnpm run export:public && pnpm run verify:public`, `public/` закоммичен
- [x] 4.3 `pnpm run version:bump 0.35.0` + раздел в `CHANGELOG.md`
- [x] 4.4 `pnpm run install:consumer ../spai-ui`, `../spai-teplo-calc`
- [ ] 4.5 Ревью на стенде (этап 6) — гейт владельца; макет `/proba` пропущен
      (design.md §7)
- [ ] 4.6 Публикация 0.35.0 в реестр, потребители — на версию из реестра
