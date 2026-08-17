## 1. Схема (catalog-schemas)

- [x] 1.1 `components/insolation-report.ts`: zod-схема props + definition
      (+ refine непересечения сегментов таймлайна)
- [x] 1.2 Регистрация: `constants.ts`, `catalog.ts`, экспорт из `index.ts`

## 2. Рендерер (catalog-react)

- [x] 2.1 Группа токенов `ir` в `tokens.ts` (включая `-sun`/`-shadow`,
      INHERITS на общие)
- [x] 2.2 `renderers/insolation-report-styles.ts` + корневой
      `renderers/insolation-report.tsx`
- [x] 2.3 `renderers/insolation-report-timeline.tsx`: пропорциональные
      сегменты, засечки, нейтральные промежутки, минимальная ширина
- [x] 2.4 Секции: verdict, checks (со status/action), inputs, assumptions,
      protocol-строка со «Скачать» (Blob); кнопки по канону CE
- [x] 2.5 Регистрация в `catalog.ts`

## 3. Python-зеркало

- [x] 3.1 Pydantic-модель + экспорт + parity-тест

## 4. Фикстуры и демо

- [x] 4.1 `fixtures/valid`: pass-наполнение (2 ч 40 мин, прерывистая,
      таймлайн с тенью здания) и fail-наполнение; нормативные строки
      пометить TODO-сверкой с СанПиН 1.2.3685-21
- [x] 4.2 Витрины собираются из `fixtures/valid` через
      `createSurfaceMessages` — отдельных файлов в `fixtures/messages` не
      заводили, иначе те же props жили бы в двух копиях (прецедент
      `createThermalReportMessages`)
- [x] 4.3 apps/demo: оба наполнения + attachDemoActionLogger; скриншоты в
      preview/

## 5. Тесты и артефакты

- [x] 5.1 tests/ts + tests/react: валидация фикстур (включая отклонение
      пересекающихся сегментов), пропорции таймлайна, dispatch действий,
      скачивание
- [x] 5.2 `pnpm run export:public` + verify:public
- [x] 5.3 typecheck + test:ts зелёные; version bump + CHANGELOG

## 6. Ревью

- [ ] 6.1 Демо показано пользователю, собраны правки
- [ ] 6.2 Зафиксирована система координат таймлайна (минуты от полуночи)
      и поведение при мультиточечном расчёте
