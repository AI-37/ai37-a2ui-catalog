## 1. Схема (catalog-schemas)

- [x] 1.1 `components/keo-report.ts`: zod-схема props + definition
- [x] 1.2 Регистрация: `constants.ts`, `catalog.ts`, экспорт из `index.ts`

## 2. Рендерер (catalog-react)

- [x] 2.1 Группа токенов `kr` в `tokens.ts` (INHERITS на общие)
- [x] 2.2 `renderers/keo-report-styles.ts` + корневой
      `renderers/keo-report.tsx`
- [x] 2.3 Секции: verdict, recommendations (tone-карточки с action),
      rooms, inputs (группы с тонами + action), assumptions,
      protocol-строка со «Скачать» (Blob)
- [x] 2.4 Кнопки по канону CE (hover-переопределения против хоста)
- [x] 2.5 Регистрация в `catalog.ts`

## 3. Python-зеркало

- [x] 3.1 Pydantic-модель + экспорт + parity-тест

## 4. Фикстуры и демо

- [x] 4.1 `fixtures/valid`: fail-наполнение (0,42 % при норме 0,50 %,
      3 рекомендации) и pass-наполнение; подпись протокола — «формулы
      СП 367.1325800»
- [x] 4.2 Витрины собираются из `fixtures/valid` через
      `createSurfaceMessages` — отдельных файлов в `fixtures/messages` не
      заводили, иначе те же props жили бы в двух копиях (прецедент
      `createThermalReportMessages`)
- [x] 4.3 apps/demo: оба наполнения + attachDemoActionLogger; скриншоты в
      preview/

## 5. Тесты и артефакты

- [x] 5.1 tests/ts + tests/react: валидация фикстур, tone-карточки,
      dispatch действий (рекомендация, inputs, rooms), скачивание без
      раскрытия
- [x] 5.2 `pnpm run export:public` + verify:public
- [x] 5.3 typecheck + test:ts зелёные; version bump + CHANGELOG

## 6. Ревью

- [ ] 6.1 Демо показано пользователю, собраны правки
- [ ] 6.2 Решён вопрос секции checks и состава скачиваемого протокола
      (А.1+Б.1+Б.2 или только Б.2)
