# FormCard: канонический dispatch action при submit

## Why

FormCard-рендерер (`@ai37/a2ui-catalog-react`) **не шлёт action** при клике на
submit. По канону A2UI v0.9 компонент вызывает преобразованную `props.action()`
(GenericBinder → `() => void`), это долетает до `A2UIProvider.onAction` → агент.
Базовый Button так и делает (`onClick: props.action`).

FormCard вместо этого кладёт `data-action` в атрибут, а `onClick` пустой —
action не диспатчится, значения формы не попадают в `userAction.context`.
Потребителям (spai-ui) приходится **костылить** перехват клика
(`onClickCapture` по `[data-action]`), что нарушает канон «UI знает только
каталог, компонент сам шлёт action».

## What Changes

В рендерере FormCard (`packages/catalog-react/src/renderers/form-card.tsx`):

- submit-кнопка на клик **диспатчит action** со значениями полей через
  `context.dispatchAction` → `userAction.context` долетает агенту.
- Убрать `data-action`-атрибутный путь (он и был причиной костыля — атрибут
  никто не слушает).
- Значения полей собираются рендерером (FormCard самодостаточный: схема несёт
  `submit:{label, action}` строкой, без dataModel/path-биндинга — поэтому
  значения берём локально, не через резолв paths).

## Impact

- Затрагивает только `catalog-react` рендерер FormCard. Схема
  (`catalog-schemas`) не меняется — контракт `submit:{label, action}` тот же.
- **Снимает костыль** в spai-ui (`onClickCapture`) — после фикса submit долетает
  штатно через `onAction`.
- **Non-goals:** другие компоненты (таблицы, LatexFormula); если ChoiceCard имеет
  ту же проблему — отдельно (этот change только про FormCard). Схемы Zod/JSON.
