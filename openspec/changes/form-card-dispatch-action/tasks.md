# Tasks — FormCard dispatch action при submit

## 1. Сбор значений + dispatch (`form-card.tsx`)

- [ ] Обернуть поля в `<form>` (ref или `onSubmit`), убрать `data-action` с кнопки.
- [ ] На submit собрать значения полей: `name → value` (select/text/number — value;
      boolean — checked). Коэрсить НЕ нужно — отдаём как есть, агент коэрсит.
- [ ] Кнопка submit → `onClick`/`onSubmit` (`type="submit"`) → собрать значения →
      `context.dispatchAction({ event: { name: props.submit.action, context: values } })`.
- [ ] `createComponentImplementation(def, ({props, context}) => ...)` — достать `context`.

## 2. Сверка с web_core

- [ ] Подтвердить точную форму аргумента `dispatchAction` (`{event:{name, context}}`)
      по `@a2ui/web_core` (component-context / surface-model) перед финалом.
- [ ] Убедиться: `context.dispatchAction` доступен в `createComponentImplementation`.

## 3. Сборка + проверка

- [ ] `npm run build` (catalog-react) — без ошибок типов.
- [ ] Smoke: FormCard рендерится, клик submit → `dispatchAction` вызван (лог/тест).

## 4. Снятие костыля у потребителя (отметка)

- [ ] Отметить: после фикса в spai-ui убрать `onClickCapture`-костыль
      (`RenderFormTool`) — submit долетает штатно через `onAction`. Это правка в
      spai-ui (отдельный change/задача), не в каталоге.

## 5. ChoiceCard (опционально, та же болезнь)

- [ ] Если в scope: `choice-card.tsx` имеет тот же `data-action` без dispatch.
      Чинить так же ИЛИ отдельным change. Решить — в этом change или нет.

## Non-goals

Схему FormCard (Zod/JSON) не меняем. Коэрс типов — на агенте. dataModel-binding
не вводим.
