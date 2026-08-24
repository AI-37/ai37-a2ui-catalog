## 1. Схема и регистрация

- [x] 1.1 `packages/catalog-schemas/src/components/thermal-report.ts`:
      `thermalReportNextDefinition` с `name: 'ThermalReportNext'`, `slug:
      'thermal-report-next'` на той же `thermalReportPropsSchema`; нынешний
      definition не трогать
- [x] 1.2 `packages/catalog-schemas/src/components/lift-report.ts`:
      `liftReportNextDefinition` с `name: 'LiftReportNext'`, `slug:
      'lift-report-next'` на той же `liftReportPropsSchema`
- [x] 1.3 `packages/catalog-schemas/src/catalog.ts`: оба definition'а рядом со
      старыми
- [x] 1.4 `packages/catalog-schemas/src/constants.ts`: `'ThermalReportNext'` и
      `'LiftReportNext'` в `CATALOG_COMPONENT_NAMES`
- [x] 1.5 `description` каждого нового definition пишет, чем он отличается и
      что props те же — по образцу `constructionsEditorNextDefinition`

## 2. Общий слой примитивов отчёта

- [x] 2.1 Перенести в `packages/catalog-react/src/primitives` примитивы,
      заведённые в `proba-report-assembly`: строка списка, двухчастный чип,
      статусная пилюля с точкой, serif-заголовок, таблица с итоговой строкой,
      заметка на утопленном фоне, карточка протокола, меню «Скачать ⌄»
- [x] 2.2 Таблица отчёта — примитив набора со своим горизонтальным скроллом и
      итоговой строкой; `renderers/simple-table` не переиспользуется
      (Решение 3 `design.md`)
- [x] 2.3 Литералов цвета и кегля не оставить — только токены слоями; своего
      листа стилей у новых рендереров нет
- [x] 2.4 `/proba/system`: перенесённые примитивы показаны с осями и
      состояниями (правило реестра); в `primitives` не осталось ничего, чего
      нет на витрине

## 3. Рендерер `ThermalReportNext`

- [x] 3.1 Перенести `apps/demo/src/proba/thermal-report-assembly.tsx` и общие
      части `report-*` в `packages/catalog-react/src/renderers/thermal-report-next*`
- [x] 3.2 Источник наполнения — props компонента вместо фикстуры;
      `createComponentImplementation(thermalReportNextDefinition, …)`
- [x] 3.3 Оба наполнения: одна конструкция и список конструкций
- [x] 3.4 Кнопка роли «Подобрать» — `outline` (Решение 6 песочницы)
- [x] 3.5 Слова статуса зашиты в рендерер; `statusLabel` — только вне
      перечисления (Решение 12)

## 4. Рендерер `LiftReportNext`

- [x] 4.1 Перенести `apps/demo/src/proba/lift-report-assembly.tsx` в
      `packages/catalog-react/src/renderers/lift-report-next*`
- [x] 4.2 Кнопка «Пересчитать» — `outline`, тот же примитив, что у теплотеха
- [x] 4.3 Протокол: `<details>` с `<pre>` не переносится — одна строка без
      раскрытия (Решение 15)

## 5. Канон, общий для обоих

- [x] 5.1 Протокол — лейбл, мета, «Скачать ⌄»; шеврона нет;
      `protocol.content` на экране не выводится и идёт только в Blob
      (`downloadContent ?? content`)
- [x] 5.2 «Скачать ⌄» — один триггер рамкой в акцентном тоне; список форматов:
      `.md` + `.docx` при `downloadUrl`, один `.md` при Blob'е; нечего
      скачивать — триггера нет
- [x] 5.3 Меню «Скачать» раскрывается вверх (Решение 16)
- [x] 5.4 Статус строки и вердикт — одна пилюля, не две (Решение 7)
- [x] 5.5 Тон рамки — только у рекомендованного варианта (Решение 13)
- [x] 5.6 Отклонение и тон считаются из значения, а не приходят строкой
- [x] 5.7 Контракт действий не меняется: имена и контекст те же, что у старых
      рендереров
- [x] 5.8 `packages/catalog-react/src/catalog.ts` и `index.ts`: регистрация и
      экспорт обоих рядом со старыми

## 6. Публичные артефакты

- [x] 6.1 `pnpm run export:public` — `catalog.json` и схемы
      `thermal-report-next` / `lift-report-next` перегенерированы
- [x] 6.2 `pnpm run verify:public` — зелёный
- [x] 6.3 Проверить, что обе записи в `catalog.json` ссылаются на существующие
      схемы

## 7. Демо и песочница

- [x] 7.1 `apps/demo/src/create-surface-messages.ts`: старый и новый на одном
      наполнении для всех трёх фикстур (`thermal-report-single`,
      `thermal-report-multi`, `lift-report`); сообщения подписаны
- [x] 7.2 `apps/demo/src/proba/report-assembly-page.tsx` импортирует части из
      пакета; копии в песочнице удалены
- [x] 7.3 `apps/demo/src/proba/README.md` — дерево сборки указывает на пакет

## 8. Тесты

- [x] 8.1 `tests/react/thermal-report-next.test.tsx`: одна конструкция и
      список, состав экрана, действие кнопки роли
- [x] 8.2 `tests/react/lift-report-next.test.tsx`: состав экрана, действие
      кнопки роли, отсутствие раскрытия у протокола
- [x] 8.3 «Скачать»: два формата при `downloadUrl`, один при Blob'е,
      отсутствие триггера когда скачивать нечего
- [x] 8.4 Слова статуса: одинаковое состояние в обоих отчётах печатается
      одинаково независимо от `statusLabel`
- [x] 8.5 Убедиться, что тесты нынешних `ThermalReport` / `LiftReport` не
      тронуты и зелёные
- [x] 8.6 `pnpm run test:ts` и `pnpm run typecheck` — зелёные

## 9. Приёмка

- [x] 9.1 Проход клавиатурой: `Tab` по действиям в порядке чтения,
      `↓`/`Enter` открывает меню «Скачать», `Escape` возвращает фокус на
      триггер; некликабельные части в табуляцию не попадают
- [x] 9.2 `aria-label` у icon-only действий, `aria-expanded`/`aria-controls` у
      триггера меню
- [x] 9.3 Меню не срезается краем карточки и растёт вверх
- [x] 9.4 Узкий контейнер: таблица скроллится внутри карточки, страница — нет
- [x] 9.5 Скриншоты трёх наполнений в двух ширинах, старый и новый рядом
- [x] 9.6 Проверить под хостовыми стилями (`.a2ui-surface button:hover` и
      т.п.), что хост не перекрашивает кнопки и не ставит капсулы ссылкам
- [ ] 9.7 Живой прогон на стенде — **требует переключателей имени в
      `spai-teplo-calc` и `spai-elevator-calc-agent`** (отдельные изменения,
      см. `proposal.md`); локально: `pnpm run install:consumer ../spai-ui`
- [x] 9.8 CHANGELOG: запись в `## [Unreleased]` про оба рендерера и общий слой
      примитивов отчёта
