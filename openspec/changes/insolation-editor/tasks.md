## 1. Схема (catalog-schemas)

- [x] 1.1 `components/insolation-editor.ts`: zod-схема props (conditions,
      pointTemplate, points, buildingFields, buildings, notices, submit)
- [x] 1.2 Регистрация: `constants.ts`, `catalog.ts`, экспорт из `index.ts`

## 2. Рендерер (catalog-react)

- [x] 2.1 Группа токенов `ie` в `tokens.ts` (INHERITS на общие)
- [x] 2.2 `renderers/insolation-editor-styles.ts` + корневой
      `renderers/insolation-editor.tsx` (локальный state)
- [x] 2.3 Секции: условия (readonly), карточки расчётных точек
      (добавление/удаление), табличные строки застройки
      (добавление/удаление), warning-плашки
- [x] 2.4 Метки источника + счётчик в футере (канон source-note CE/LE)
- [x] 2.5 Регистрация в `catalog.ts`

## 3. Python-зеркало

- [x] 3.1 Pydantic-модель + экспорт + parity-тест

## 4. Фикстуры и демо

- [x] 4.1 `fixtures/valid` + `invalid`: Тюмень, этаж 3, ЮВ 135°, здание
      38/45/60 м; нормативные строки (зона, часы, период, худший день)
      пометить TODO-сверкой с СанПиН 1.2.3685-21 до фиксации
- [x] 4.2 Витрины собираются из `fixtures/valid` через
      `createSurfaceMessages` — отдельных файлов в `fixtures/messages` не
      заводили, иначе те же props жили бы в двух копиях (прецедент
      `createThermalReportMessages`)
- [x] 4.3 apps/demo: пример + attachDemoActionLogger; скриншоты в preview/

## 5. Тесты и артефакты

- [x] 5.1 tests/ts + tests/react: валидация фикстур, добавление
      точек/зданий без dispatch, метки источника при правке, submit
      полного документа
- [x] 5.2 `pnpm run export:public` + verify:public
- [x] 5.3 typecheck + test:ts зелёные; version bump + CHANGELOG

## 6. Ревью

- [ ] 6.1 Демо показано пользователю, собраны правки
- [ ] 6.2 Нормативные строки фикстур сверены с текстом СанПиН 1.2.3685-21
      (период центральной зоны, худший день); единицы высоты здания
      зафиксированы
