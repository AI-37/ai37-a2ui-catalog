# Design — FormCard dispatch action при submit

## Approach

FormCard спроектирован **самодостаточным**: схема несёт `submit: {label, action}`
(action — строка-имя) и поля с `name`/`defaultValue` — БЕЗ path/DynamicValue.
То есть это не dataModel-binding компонент (как канонический TextField+Button), а
self-contained форма: сама собирает свои значения и шлёт их с action.

Поэтому фикс — **внутри рендерера**: на submit собрать значения полей и
диспатчить action с ними в `context`, через `ComponentContext.dispatchAction`.
Схему НЕ меняем (контракт `{label, action}` остаётся) — это не ломающее изменение.

## Контекст канона

`dispatchAction(action)` (web_core) принимает `{event: {name, context}}` →
долетает до `A2UIProvider.onAction` как `userAction.context`. Для самодостаточного
компонента значения собираем в рендерере и кладём в `context` напрямую (не через
dataModel/paths — их у FormCard нет).

## Files

| Файл | Действие |
| --- | --- |
| `packages/catalog-react/src/renderers/form-card.tsx` | submit-кнопка: убрать `data-action`; `onClick` → собрать значения полей → `context.dispatchAction({event:{name: submit.action, context: values}})`. Поля собирать через `<form>` + ref (или контролируемый локальный стейт). |
| `packages/catalog-react/src/renderers/choice-card.tsx` | (опционально, та же болезнь) — отдельной задачей, если в scope. |

## Decisions

### 1. Значения собираем в рендерере, не через dataModel

FormCard self-contained (схема без paths). На submit рендерер читает значения
полей и кладёт в `dispatchAction` context. Канонично для компонента, который
владеет своими данными. Не вводим dataModel-binding — это сломало бы схему и
контракт с агентом (`{label, action}` → `{paths…}`).

### 2. Сбор значений — `<form>` + FormData

Обернуть поля в `<form>`, на submit `new FormData(formEl)` → объект значений.
Учесть типы: number → Number, boolean(checkbox) → checked, select → value.
Имена полей = `field.name` (совпадает с тем, что ждёт агент в toolResult).

### 3. dispatchAction со значениями

```tsx
const handleSubmit = (e) => {
  e.preventDefault()
  const values = collectValues(formEl, props.fields)  // {name: typedValue}
  context.dispatchAction({ event: { name: props.submit.action, context: values } })
}
```
`context` — из `createComponentImplementation(def, ({props, context}) => ...)`.
Точная форма аргумента `dispatchAction` — сверить с web_core (`{event:{name,context}}`).

### 4. Убрать `data-action` — это была причина бага

`data-action` атрибут не слушается никем (нет глобального делегата). Заменяем на
честный `onClick`/`onSubmit` → dispatchAction. Снимает костыль `onClickCapture`
у потребителя (spai-ui).

## Edge cases

- **boolean(checkbox)** → `context[name] = el.checked` (не FormData string).
- **number** → привести к Number (или оставить строкой, агент сам коэрсит — у нас
  `coerce-form-values` на агенте уже это делает; решить: коэрсить тут или там).
- **select** → value выбранной опции.
- **Пустое поле** → пустая строка / отсутствует; агент трактует как «не введено».

## Non-goals

Схему FormCard (Zod/JSON) не меняем. dataModel-binding не вводим. ChoiceCard —
отдельно (если та же проблема). Другие компоненты каталога.
