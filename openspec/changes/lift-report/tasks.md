## 1. Схема (catalog-schemas)

- [x] 1.1 `components/lift-report.ts`: zod-схема props + definition (strict)
- [x] 1.2 Регистрация: `constants.ts` (CATALOG_COMPONENT_NAMES), `catalog.ts`, экспорт из `index.ts`

## 2. Рендерер (catalog-react)

- [x] 2.1 Группа токенов `lr` в `tokens.ts` (INHERITS на общие)
- [x] 2.2 `renderers/lift-report-styles.ts` + корневой `renderers/lift-report.tsx`
- [x] 2.3 Секции: verdict, suggestions («Что изменить»), inputs (реюз паттерна ThermalReport), protocol (`<details>` + «Скачать» по `downloadUrl`)
- [x] 2.4 Регистрация в `catalog.ts`

## 3. Фикстуры и демо

- [x] 3.1 `fixtures/valid/lift-report.json` (по figma: fail-вердикт, 3 варианта «Что изменить», группы inputs, протокол)
- [x] 3.2 Витринное сообщение из valid-фикстуры (прецедент — create-thermal-report-messages)
- [x] 3.3 apps/demo: пример в examples + attachDemoActionLogger

## 4. Тесты и артефакты

- [x] 4.1 tests/ts + tests/react: валидация фикстуры схемой, рендер, dispatch `report_apply_suggestion` / `report_edit_inputs`, отсутствие «Скачать» без `downloadUrl`
- [x] 4.2 `pnpm run export:public` — перегенерация артефактов (verify:public)
- [x] 4.3 typecheck + test:ts зелёные

## 5. Ревью

- [ ] 5.1 Демо показано пользователю, собраны правки
- [ ] 5.2 Контракт зафиксирован; парный change `lift-report-render` в spai-elevator-calc-agent ссылается на схему каталога
