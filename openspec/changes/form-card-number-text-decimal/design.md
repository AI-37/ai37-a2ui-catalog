# Design — FormCard number как text с десятичным вводом

## Approach

В `form-card.tsx` ветка ввода сейчас:

```tsx
<input
  type={field.type === 'number' ? 'number' : 'text'}
  name={field.name}
  placeholder={field.placeholder}
  defaultValue={...}
  style={inputStyle}
/>
```

Меняем на текстовый ввод с десятичной клавиатурой для number-полей:

```tsx
<input
  type="text"
  inputMode={field.type === 'number' ? 'decimal' : undefined}
  name={field.name}
  placeholder={field.placeholder}
  defaultValue={...}
  style={inputStyle}
/>
```

Источник истины по числу — **агент** (`coerceFormValues`): принимает `'2,5'` и
`'2.5'`, непарсимое → null. Рендер остаётся «глупым»: шлёт строку, не валидирует.

## Files

| Файл | Действие |
| --- | --- |
| `packages/catalog-react/src/renderers/form-card.tsx` | number-ветка `<input>`: `type="text"` + `inputMode="decimal"`. select/boolean/text не трогаем. |

## Decisions

### 1. text вместо number+step="any"

`step="any"` починил бы точку, но **не запятую** (number-input её не принимает в
принципе). Пользователи-локали РФ вводят запятую. `type=text` + агентский коэрс
принимает оба разделителя. Это и был выбор пользователя (number→text, число
собирает агент).

### 2. Нормализацию делает агент, не рендер

Рендер не парсит/не валидирует — это нарушило бы «UI знает только каталог».
`coerceFormValues` (агент) уже нормализует `,`→`.` и приводит к Number. Дублировать
в рендере не нужно.

### 3. inputMode="decimal"

На мобильных даёт цифровую клавиатуру с разделителем, не ломая десктоп. Только
для number-полей; для text — undefined.

## Edge cases

- **Пустой ввод** → агент коэрсит в null (= «не введено»), mergeDraft пропускает.
- **Мусор («abc»)** → агент → null; поле считается незаполненным.
- **Ведущее число в label** (Vн-select 52941) — не про этот change (это select,
  не number-input).

## Non-goals

Валидация диапазонов ГОСТ (на агенте); spinner-стрелки; другие компоненты; схемы.
