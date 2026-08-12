# Design — ChoiceCard dispatch action при submit

## Approach

Как у FormCard (`form-card-dispatch-action`): ChoiceCard самодостаточен (схема
несёт `choices`+`submit:{label,action}`, value у каждого choice). На submit
рендерер собирает выбранное value(я) из radio/checkbox и диспатчит action со
значением в `context` через `context.dispatchAction`. Схему не меняем.

## Текущее состояние (choice-card.tsx)

- `<input type={multiple?'checkbox':'radio'} name={groupName} value={choice.value}>`
  — неуправляемые, `groupName = choice-<action|title>`.
- submit: `<button type="button" data-action={props.submit.action}>` — **баг**,
  action не диспатчится.

## Files

| Файл | Действие |
| --- | --- |
| `packages/catalog-react/src/renderers/choice-card.tsx` | Обернуть в `<form>` (ref); собрать выбор по `name=groupName`; submit → `context.dispatchAction({event:{name, context:{value | values[]}}})`; убрать `data-action`. |

## Decisions

### 1. Сбор выбора — ref-scoped по groupName

Обернуть `<section>` → `<form ref>`. На submit: `formRef.querySelectorAll(
`input[name="${groupName}"]:checked`)`.
- **single (radio)**: одно value → `context = { value: <выбранное> }`.
- **multiple (checkbox)**: массив → `context = { values: [<...>] }`.
Ключ в context — согласовать с тем, что ждёт агент (предлагаю `value` для single,
`values` для multiple). Коэрс — на агенте (как у FormCard).

### 2. dispatchAction со значением

```tsx
const { props, context } = ...
const handleSubmit = (e) => {
  e.preventDefault()
  const checked = [...formRef.current.querySelectorAll(`input[name="${groupName}"]:checked`)]
  const vals = checked.map((el) => el.value)
  const ctx = multiple ? { values: vals } : { value: vals[0] }
  context.dispatchAction({ event: { name: props.submit.action, context: ctx } })
}
```
Форма аргумента `{event:{name, context}}` — канон web_core (как в FormCard-фиксе).

### 3. `createComponentImplementation(def, ({props, context}) => ...)`

Достать `context` из второго аргумента (сейчас только `{props}`).

## Edge cases

- **Ничего не выбрано** → `value: undefined` / `values: []`. Агент трактует как
  «не выбрано» (можно не диспатчить, если пусто — на усмотрение реализации).
- **submit отсутствует** (`props.submit` null) → кнопки нет, dispatch не нужен
  (выбор без явной кнопки — вне этого change).

## Non-goals

Схема ChoiceCard; FormCard (починен); другие компоненты; стилизация.
