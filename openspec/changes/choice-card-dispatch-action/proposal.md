# ChoiceCard: канонический dispatch action при submit

## Why

ChoiceCard-рендерер (`@ai37/a2ui-catalog-react`) **не шлёт action** при клике на
submit — тот же баг, что был у FormCard (`choice-card.tsx:62`:
`data-action={props.submit.action}` без `dispatchAction`). Выбранное значение
(radio/checkbox) не долетает агенту в `userAction.context`.

Это блокирует интерактивные ChoiceCard (напр. стартовый выбор типа здания):
кнопка «Далее» нажимается, но выбор никуда не уходит. Потребитель вынужден
костылить — нарушает канон «компонент сам шлёт action».

## What Changes

В рендерере ChoiceCard (`packages/catalog-react/src/renderers/choice-card.tsx`):

- submit-кнопка на клик **диспатчит action** через `context.dispatchAction` →
  `userAction.context` долетает агенту.
- Собрать выбранное значение(я): single (radio) → одно value; multiple
  (checkbox) → массив value. Положить в `context`.
- Убрать `data-action`-атрибут (мёртвый — никто не слушает).

## Impact

- Затрагивает только `catalog-react` рендерер ChoiceCard. Схема
  (`catalog-schemas`) не меняется — контракт `choices/submit` тот же.
- Снимает блокер для интерактивных ChoiceCard (welcome-выбор типа в агенте).
- **Non-goals:** FormCard (уже починен — `form-card-dispatch-action`); другие
  компоненты; схемы. Бамп версии каталога.
