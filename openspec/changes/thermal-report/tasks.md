## 1. Схема (catalog-schemas)

- [x] 1.1 `components/thermal-report.ts`: zod-схема props + definition
- [x] 1.2 Регистрация: `constants.ts` (CATALOG_COMPONENT_NAMES), `catalog.ts`,
      экспорт из `index.ts`

## 2. Рендерер (catalog-react)

- [x] 2.1 Группа токенов `tr` в `tokens.ts` (INHERITS на общие)
- [x] 2.2 `renderers/thermal-report-styles.ts` + корневой
      `renderers/thermal-report.tsx`
- [x] 2.3 Секции: verdict, checks, layers-table, constructions (+excluded,
      assumptions), inputs, protocol (`<details>`)
- [x] 2.4 Регистрация в `catalog.ts`

## 3. Фикстуры и демо

- [x] 3.1 `fixtures/valid/thermal-report-single.json` и `-multi.json`
- [x] 3.2 Витринные сообщения — `create-thermal-report-messages.ts` из
      valid-фикстур (без дублей props в `fixtures/messages`, прецедент —
      лифтовая группа)
- [x] 3.3 apps/demo: два примера в examples + attachDemoActionLogger

## 4. Тесты и артефакты

- [x] 4.1 tests/ts + tests/react: валидация фикстур схемой, рендер обоих
      наполнений, dispatch действий (217 тестов зелёные)
- [x] 4.2 `pnpm run export:public` — перегенерация артефактов каталога
      (verify:public ✓)
- [x] 4.3 typecheck + test:ts зелёные

## 5. Ревью

- [ ] 5.1 Демо показано пользователю (оба наполнения), собраны правки
- [ ] 5.2 Контракт зафиксирован; черновик `doc/thermal-report-spec.md` в
      spai-teplo-calc ссылается на схему каталога
