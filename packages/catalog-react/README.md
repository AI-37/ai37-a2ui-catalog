# @ai37/a2ui-catalog-react

**React-рендереры** A2UI-каталога AI37 для [`@a2ui/react`](https://www.npmjs.com/package/@a2ui/react).
Реализует визуальное представление компонентов каталога, включая интерактивные `ChoiceCard` / `FormCard`
(HITL-формы и выбор).

```bash
npm i @ai37/a2ui-catalog-react @ai37/a2ui-catalog-schemas react react-dom
```

```ts
import { ai37Catalog } from "@ai37/a2ui-catalog-react";
```

`react` и `react-dom` — peer-зависимости (используется React приложения-хоста). Состав каталога и схемы
берутся из [`@ai37/a2ui-catalog-schemas`](https://www.npmjs.com/package/@ai37/a2ui-catalog-schemas).

## Темизация

Цвета рендереров заданы через CSS-переменные `--a2ui-*` с дефолтами, поэтому тему можно переопределить без
правок JS — например, тёмную. Токены и пример тёмной темы: [`docs/theming.md`](../../docs/theming.md).

Лицензия: Apache-2.0.
