## 1. Схема (catalog-schemas)

- [x] 1.1 `components/keo-editor.ts`: zod-схема props (conditions,
      roomTemplate, rooms, computedNotes, validationRules, submit) +
      definition; поля — расширение `formFieldBaseSchema`
- [x] 1.2 Регистрация: `constants.ts` (CATALOG_COMPONENT_NAMES),
      `catalog.ts`, экспорт из `index.ts`

## 2. Рендерер (catalog-react)

- [x] 2.1 Группа токенов `ke` в `tokens.ts` (INHERITS на общие)
- [x] 2.2 `renderers/keo-editor-styles.ts` + корневой
      `renderers/keo-editor.tsx` (вкладки помещений, локальный state)
- [x] 2.3 Секции помещения: условия, назначение (+ вычисляемая подпись
      плоскости/точки), геометрия, светопроём, затенение (`revealBy`),
      экспандер умолчаний
- [x] 2.4 Метки источника + счётчик в футере (переиспользовать канон
      source-note CE/LE)
- [x] 2.5 Предупреждающие валидации из `validationRules[]`
- [x] 2.6 Регистрация в `catalog.ts`

## 3. Python-зеркало

- [x] 3.1 Pydantic-модель + экспорт + parity-тест

## 4. Фикстуры и демо

- [x] 4.1 `fixtures/valid` + `fixtures/invalid`: жилая комната Тюмени
      (группа светового климата 1, MF 0,83, точка на полу) с затенением и
      без; сверить τ₁/τ₂ по табл. А.8/А.9 СП 367 до фиксации значений
- [x] 4.2 Витрины собираются из `fixtures/valid` через
      `createSurfaceMessages` — отдельных файлов в `fixtures/messages` не
      заводили, иначе те же props жили бы в двух копиях (прецедент
      `createThermalReportMessages`)
- [x] 4.3 apps/demo: пример с attachDemoActionLogger; скриншоты в preview/

## 5. Тесты и артефакты

- [x] 5.1 tests/ts + tests/react: валидация фикстур, вкладки/добавление
      помещений без dispatch, пересчёт computedNotes, revealBy, метки
      источника, предупреждения, submit полного документа
- [x] 5.2 `pnpm run export:public` + verify:public
- [x] 5.3 typecheck + test:ts зелёные; version bump + CHANGELOG

## 6. Ревью

- [ ] 6.1 Демо показано пользователю, собраны правки
- [ ] 6.2 Открытые вопросы закрыты по PDF СП 367 (h₀₁ в правиле п. 9.1.1;
      τ-значения фикстур)
