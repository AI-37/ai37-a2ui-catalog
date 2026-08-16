# Tasks: lift-editor-sections-responsive

## 1. Схема и Python-зеркало

- [x] 1.1 `catalog-schemas/src/components/lift-editor.ts`: `headerTitle`,
      `headerContext`, `pendingLabel`, `buildingSources`, `liftSources`,
      `methodConfigs[].buildingKindLabel`, `field.shortLabel` — все
      опциональные; схема источника поля (`project|question|suggested|default`,
      `note` ≤200)
- [x] 1.2 Схемные тесты: валидные/невалидные источники, пустой `pendingLabel`
      отвергается, обратная совместимость старых props
- [x] 1.3 `catalog-python/models/lift_editor.py`: зеркала новых полей +
      parity-тест

## 2. CSS-слой и адаптив

- [x] 2.1 `catalog-react/src/renderers/lift-editor-styles.ts`: константа CSS
      (`a2ui-le-*`, токены `--a2ui-*`, группа `--a2ui-color-le-*`), инжекция
      общим `style-tag.tsx`
- [x] 2.2 Корень: `container-type: inline-size; container-name: a2ui-le;
      width: 100%; min-width: 0`; сетки 1→2 колонки от 560px по `@container`
- [x] 2.3 Удалить инлайновые стили из всех `lift-editor-*` рендереров; снять
      применение `FIELD_COLUMN_WIDTH`
- [x] 2.4 Тест: один тег стилей при двух редакторах; базовая одноколоночная
      раскладка без `@container`

## 3. Секции вместо вкладок

- [x] 3.1 Новый `lift-editor-section.tsx`: баннер (шеврон · заголовок ·
      сводка · «Показать») ↔ раскрытая сетка + «Свернуть» / «Удалить лифт»
- [x] 3.2 Сводка из живых значений (`shortLabel ?? name` + значение, join
      « · », пустые опускаются) — общий хелпер для секций и блока дефолтов
- [x] 3.3 Корневой state `openSections`; начальное состояние: первая секция с
      незаполненными обязательными, иначе всё свёрнуто; пересчёт на новом
      снапшоте props; сдвиг ключей после удаления лифта
- [x] 3.4 Удалить `lift-editor-tabs.tsx` и `pick-initial-lift-tab.ts`;
      добавление лифта раскрывает новую секцию и сворачивает остальные
- [x] 3.5 `lift-editor-advanced.tsx`: баннер со сводкой значений вместо
      экспандера; прежние правила (required-пустое не прячется, <3 полей —
      без блока)
- [x] 3.6 Тесты секций: локальность toggle, сохранность значений, сводки,
      начальное состояние, перенумерация лифтов

## 4. Шапка с переключателем методики

- [x] 4.1 `lift-editor-header.tsx`: `headerTitle` слева; справа
      `headerContext` + переключатель методики (текст
      `gostLabel · {buildingType | buildingKindLabel}`, select по
      `methodConfigs[].label`)
- [x] 4.2 `methodField` больше не рендерится в секции «Здание»; fallback без
      `headerTitle` — переключатель над секциями
- [x] 4.3 Живое обновление текста шапки при правке `buildingType` (34758)
- [x] 4.4 Тесты шапки: состав текста, смена методики из шапки, fallback

## 5. Двухрежимная кнопка

- [x] 5.1 `pendingLabel`-режим: навигация к первой секции с незаполненными
      обязательными (single-open + scroll), без dispatch
- [x] 5.2 Режим `submitLabel` при полном документе; без `pendingLabel` —
      прежняя блокировка
- [x] 5.3 Пометка незаполненных секций (в том числе свёрнутых)
- [x] 5.4 Тесты: «Далее» здание→лифт, ровно одна раскрытая, переход кнопки в
      «Рассчитать», submit-payload не изменился

## 6. Live-draft

- [x] 6.1 Экспортируемая константа задержки (500 мс); debounce правок полей,
      payload из ref в момент срабатывания; очистка таймера на unmount
- [x] 6.2 Немедленные структурные триггеры (add/remove, методика, «Далее») с
      отменой отложенного; submit отменяет отложенный черновик
- [x] 6.3 Удалить blur-триггер; дедуп по содержимому сохранить
- [x] 6.4 Тесты с фейковыми таймерами: схлопывание серии правок, submit гасит
      черновик, дедуп

## 7. Provenance

- [x] 7.1 Вынести словарь словоформ из `constructions-editor-*` в
      shared-хелпер; подпись под контролом (`note` | словоформа), оформление
      контролов от источника не меняется
- [x] 7.2 `touched` снимает provenance по факту правки; сброс на новом
      снапшоте props
- [x] 7.3 Тесты: подписи, снятие при правке, отсутствие источников в payload,
      регресс-тест ConstructionsEditor после выноса хелперов

## 8. Фикстуры, демо, публикация

- [x] 8.1 Обновить `fixtures/valid/lift-editor-{group,per-lift}.json` и
      `fixtures/messages/lift-editor-surface.json` (шапка, источники,
      `pendingLabel`, `shortLabel`); добавить invalid-фикстуры источников
- [x] 8.2 `apps/demo`: превью обеих методик с шапкой, provenance и
      live-draft-логгером; проверка на ширинах 390 и >560
- [x] 8.3 `pnpm run test` (ts + react + python), `pnpm run build`,
      `pnpm run export:public` + `verify:public`
- [x] 8.4 `pnpm run version:bump` (minor) + CHANGELOG
