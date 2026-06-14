# Темизация каталога (`@ai37/a2ui-catalog-react`)

Рендереры каталога не хардкодят цвета. Каждый цвет берётся из CSS-переменной с
fallback'ом:

```ts
color: 'var(--a2ui-color-text-muted, #475569)'
```

Отсюда два следствия:

1. **Дефолтная (светлая) тема работает из коробки** — fallback'и внутри `var(...)`
   и есть значения по умолчанию. Ничего подключать не нужно.
2. **Кастомная тема подключается без правок JS** — достаточно объявить нужные
   переменные `--a2ui-*` на любом родителе превью. Инлайн-стили рендереров читают
   эти переменные, поэтому специфичность больше не мешает.

Источник правды для дефолтных значений — `packages/catalog-react/src/renderers/tokens.ts`.

## Токены

| Переменная                       | Назначение                              | Дефолт (светлая)          |
| -------------------------------- | --------------------------------------- | ------------------------- |
| `--a2ui-color-text-strong`       | Заголовочный/акцентный текст            | `#0f172a`                 |
| `--a2ui-color-text`              | Основной текст (ячейки)                 | `#1e293b`                 |
| `--a2ui-color-text-muted`        | Подписи, описания, caption              | `#475569`                 |
| `--a2ui-color-text-subtle`       | Второстепенный приглушённый текст       | `#64748b`                 |
| `--a2ui-color-surface`           | Основной фон таблиц/карточек            | `#ffffff`                 |
| `--a2ui-color-surface-muted`     | Зебра строк (striped)                   | `#f8fafc`                 |
| `--a2ui-color-surface-warm`      | Тёплый фон карточек (`ChoiceCard`)      | `#fffdf8`                 |
| `--a2ui-color-surface-header`    | Фон шапки таблиц                        | `#eef2f7`                 |
| `--a2ui-color-border`            | Базовый бордер контейнеров              | `rgba(15, 23, 42, 0.12)`  |
| `--a2ui-color-border-strong`     | Бордер полей ввода                      | `rgba(15, 23, 42, 0.18)`  |
| `--a2ui-color-border-soft`       | Бордер под шапкой                       | `rgba(15, 23, 42, 0.1)`   |
| `--a2ui-color-border-subtle`     | Бордер строк тела                       | `rgba(15, 23, 42, 0.08)`  |
| `--a2ui-color-border-faint`      | Самые лёгкие разделители ячеек          | `rgba(15, 23, 42, 0.05)`  |
| `--a2ui-color-accent`            | Фон кнопок                              | `#1e293b`                 |
| `--a2ui-color-accent-contrast`   | Текст на акцентном фоне                 | `#ffffff`                 |
| `--a2ui-color-danger`            | Индикатор обязательного поля (`*`)      | `#dc2626`                 |
| `--a2ui-color-formula-from`      | Начало градиента `LatexFormula`         | `#f8fafc`                 |
| `--a2ui-color-formula-to`        | Конец градиента `LatexFormula`          | `#eef2ff`                 |

## Пример: тёмная тема

Объявите переменные на обёртке вокруг превью каталога:

```css
.a2ui-theme-dark {
  --a2ui-color-text-strong: #f1f5f9;
  --a2ui-color-text: #e2e8f0;
  --a2ui-color-text-muted: #94a3b8;
  --a2ui-color-text-subtle: #94a3b8;

  --a2ui-color-surface: #0f172a;
  --a2ui-color-surface-muted: #1e293b;
  --a2ui-color-surface-warm: #1c2536;
  --a2ui-color-surface-header: #1e293b;

  --a2ui-color-border: rgba(226, 232, 240, 0.16);
  --a2ui-color-border-strong: rgba(226, 232, 240, 0.28);
  --a2ui-color-border-soft: rgba(226, 232, 240, 0.14);
  --a2ui-color-border-subtle: rgba(226, 232, 240, 0.1);
  --a2ui-color-border-faint: rgba(226, 232, 240, 0.06);

  --a2ui-color-accent: #3b82f6;
  --a2ui-color-accent-contrast: #ffffff;
  --a2ui-color-danger: #f87171;

  --a2ui-color-formula-from: #1e293b;
  --a2ui-color-formula-to: #172554;
}
```

```tsx
import {A2uiSurface} from '@a2ui/react/v0_9';

<div className="a2ui-theme-dark">
  <A2uiSurface surface={surface} />
</div>;
```

Переопределять можно частично — задайте только те переменные, которые меняете;
остальные останутся дефолтными. Тема, привязанная к системным настройкам:

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* те же --a2ui-color-* значения, что и в .a2ui-theme-dark */
  }
}
```

Живой переключатель светлая/тёмная — в demo-приложении (`apps/demo`, кнопки
«Светлая / Тёмная»): он меняет только токены у превью, не трогая сами рендереры.

## Программный доступ

Пакет экспортирует значения и заготовку CSS дефолтной темы:

```ts
import {tokens, defaultThemeCss, A2UI_THEME_STYLE_ID} from '@ai37/a2ui-catalog-react';

// tokens.textMuted === 'var(--a2ui-color-text-muted, #475569)'
// defaultThemeCss — строка ':root { --a2ui-color-...: ...; }' для явной инъекции
```
