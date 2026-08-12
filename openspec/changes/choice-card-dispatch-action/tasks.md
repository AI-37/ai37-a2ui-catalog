# Tasks — ChoiceCard dispatch action при submit

## 1. Фикс рендерера (`choice-card.tsx`)

- [ ] `createComponentImplementation(def, ({props, context}) => ...)` — достать `context`.
- [ ] Обернуть `<section>` в `<form ref>` (или onSubmit).
- [ ] На submit собрать `input[name=groupName]:checked` → value(s).
- [ ] single (radio) → `context={value}`; multiple (checkbox) → `context={values:[]}`.
- [ ] `context.dispatchAction({event:{name: props.submit.action, context}})`.
- [ ] Убрать `data-action` с кнопки; `type="submit"`/onClick.

## 2. Сверка с web_core

- [ ] Подтвердить форму `dispatchAction({event:{name, context}})` (как в FormCard-фиксе).

## 3. Сборка

- [ ] `pnpm --filter @ai37/a2ui-catalog-react run build` — без ошибок (pnpm-монорепо!).
- [ ] Бамп версии catalog-react + CHANGELOG.

## 4. Доставка

- [ ] Подмена dist в node_modules потребителя (spai-ui) для локалки.

## Non-goals

Схема ChoiceCard; FormCard (починен); стилизация; другие компоненты.
