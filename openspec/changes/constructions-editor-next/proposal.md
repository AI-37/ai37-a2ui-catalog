## Why

Подход обкатан на `/proba/assembly`: экран `ConstructionsEditor` собран из пяти
примитивов (`Card`, `Button`, `Chip`, текст ступенями, `Form`/`Field`), цвета и
кегли приходят слоями токенов, интерактивность — из `@base-ui/react`. На
`/proba/lookup` замерена разница по клавиатуре: в нынешнем `LookupCombobox`
`↓` не подсвечивает опцию, `Enter` не выбирает, `aria-activedescendant` не
выставляется — выбрать вариант с клавиатуры нельзя вообще; на Base UI
Autocomplete тот же справочник проходится полностью.

Песочница своё дело сделала. Дальше подход надо занести в
`packages/catalog-react`, начав с самого нагруженного экрана.

Переписывать нынешний `ConstructionsEditor` на месте нельзя: он в проде, а
сравнить «было / стало» после переписывания уже не получится. Значит новый
рендерер встаёт **рядом**, старый остаётся нетронутым, и оба показываются в одном
демо-треде на одном наполнении.

## What Changes

- **Новый рендерер `ConstructionsEditorNext`** в `packages/catalog-react`,
  собранный по подходу `/proba/assembly`. Схема props — та же
  `constructionsEditorSchema`, что у нынешнего: наполнение общее, иначе сравнение
  не сравнение.
- **Новое имя компонента** (`ConstructionsEditorNext`) в схемах, чтобы оба
  рендерера регистрировались в каталоге одновременно и агент мог адресовать
  любой из них.
- **Нынешний `ConstructionsEditor` не меняется** — ни разметка, ни стили, ни
  тесты. Он остаётся эталоном сравнения до отдельного решения о выводе из
  обращения.
- **Примитивы переезжают из песочницы в пакет**: токены слоями
  (`--a2ui-text-*`, `--a2ui-btn-*`, `--a2ui-card-*`), `Button`, `Card`,
  `Form`/`Field`, `Chip`; интерактивные — на `@base-ui/react`
  (`Autocomplete`, `Select`, `NumberField`, `Field`, `Collapsible`, `Accordion`,
  `Menu`).
- **`@base-ui/react` становится зависимостью пакета.** Сегодня у пакета из UI
  только `katex`.
- **`/proba/system` объявляется реестром**: всё, что добавляется или меняется в
  примитивах по ходу этой и последующих реализаций, попадает туда же — иначе
  набор снова разъедется по рендерерам.
- **Демо показывает оба рендерера** на одном наполнении, чтобы разницу можно было
  смотреть глазами и проходить клавиатурой.

## Capabilities

### New Capabilities

- `constructions-editor-next` — рендерер на новых примитивах: что из чего
  собрано, что берётся из Base UI, какой у экрана клавиатурный и `aria`-контракт,
  и требование сосуществования со старым.

### Modified Capabilities

- `proba-design-system` — добавляется требование о реестре: примитив, добавленный
  или изменённый в ходе реализации, обязан появиться на `/proba/system`.

## Impact

- `packages/catalog-schemas/src/components/constructions-editor.ts` — добавить
  definition с `name: 'ConstructionsEditorNext'` на той же схеме props; нынешний
  definition не трогать.
- `packages/catalog-react/src/renderers/constructions-editor-next*` — новый
  рендерер и его части.
- `packages/catalog-react/src/primitives/*` — новый каталог примитивов и токенов,
  перенесённых из `apps/demo/src/proba`.
- `packages/catalog-react/src/catalog.ts` — зарегистрировать новый рендерер рядом
  со старым.
- `packages/catalog-react/package.json` — `@base-ui/react` в `dependencies`.
- `apps/demo/src/create-surface-messages.ts` — сообщение с новым рендерером рядом
  с существующим, на том же наполнении.
- `apps/demo/src/proba/*` — примитивы начинают импортироваться из пакета, а не
  дублироваться в песочнице.
- `tests/react/` — тесты нового рендерера; тесты нынешнего **не трогать**.

## Non-goals

- Вывод нынешнего `ConstructionsEditor` из обращения — отдельное решение после
  сравнения.
- Перенос остальных рендереров (`LiftEditor`, отчёты, `FormCard`, `ChoiceCard`) —
  следующими changes, по одному.
- Слияние двух палитр текста пакета (`#1f1f1e` и `#1e293b`) и правка `tokens.ts`
  под старые рендереры.
- Тёмная тема.
