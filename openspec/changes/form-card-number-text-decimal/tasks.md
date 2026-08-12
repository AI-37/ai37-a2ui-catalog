# Tasks — FormCard number как text с десятичным вводом

## 1. Рендерер (`form-card.tsx`)

- [ ] number-ветка `<input>`: `type="text"` + `inputMode="decimal"` вместо
      `type="number"`. select/boolean/text — без изменений.
- [ ] Убедиться, что `defaultValue` числа корректно строкуется в инпуте.

## 2. Сборка / версия

- [ ] `pnpm --filter @ai37/a2ui-catalog-react run build` — зелёная.
- [ ] Бамп версии пакета (как у `form-card-dispatch-action`).
- [ ] Подмена/обновление в spai-ui (если тянется как зависимость).

## 3. Проверки

- [ ] Ручной цикл: поле «Vn — скорость» принимает `2,5` и `2.5`; submit долетает
      агенту, `coerceFormValues` → 2.5.
- [ ] select-поля (Q, doorWidth) и boolean — рендерятся как раньше.

## Non-goals

Валидация диапазонов (агент); spinner; другие компоненты; схемы Zod/JSON.
