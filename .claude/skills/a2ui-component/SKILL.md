---
name: a2ui-component
description: Добавить новый компонент в A2UI-каталог AI37 или изменить существующий — схема Zod, React-рендерер на примитивах, Pydantic-модель, фикстуры, тесты, витрина в demo и артефакты каталога. Использовать, когда просят «новый компонент каталога», «добавить рендерер», «новый экран для агента», «поменять схему компонента», "new a2ui component", "add a renderer".
metadata:
  author: ai37
  version: "0.1"
---

Компонент каталога — это **пять швов в четырёх пакетах плюс артефакты**. Пропущенный
шов не ломает сборку сразу: он ломает валидацию у агента, деплой Pages или CI —
позже и не там, где ошиблись. Поэтому порядок ниже обязателен целиком.

Репозиторий spec-driven: нетривиальный компонент начинается с change в
`openspec/changes/<slug>/` (proposal → design → tasks → specs), а не с кода.

## Швы

**1. Схема — источник правды.** `packages/catalog-schemas/src/components/<slug>.ts`:
Zod-схема props (каждый объект `.strict()`), выведенные типы, `CatalogComponentDefinition`
(`name`, `slug`, `description`). `description` — не комментарий, а **контракт для
агента**: по нему LLM решает, брать ли компонент. Пишется по-английски, говорит
что компонент делает и когда его выбирать.

**2. Регистрация схемы** — три файла, все обязательны:
- `src/index.ts` — реэкспорт;
- `src/constants.ts` — имя в `CATALOG_COMPONENT_NAMES`;
- `src/catalog.ts` — импорт + запись в `componentDefinitions`.

**3. Рендерер.** `packages/catalog-react/src/renderers/<slug>.tsx` через
`createComponentImplementation(definition, …)`; регистрация в `src/catalog.ts` и
`src/index.ts`. Собирается из `src/primitives` (`Card`, `Button`, `Chip`, ступени
текста, `Form`/`Field`, обёртки над Base UI). Своих классов оформления у рендерера
быть не должно — только примитивы и раскладка инлайн-стилями.

**4. Python-зеркало.** `packages/catalog-python/src/ai37_a2ui_catalog/models/<snake>.py`,
запись в `COMPONENT_MODELS` и `__all__` (`models/__init__.py`), реэкспорт в
`ai37_a2ui_catalog/__init__.py`. Без этого агент на Python не провалидирует payload.

**5. Фикстуры и тесты.** `fixtures/valid/<slug>.json` (+ `invalid/` на каждое
ограничение схемы, + `fixtures/messages/<slug>-surface.json`, если нужен превью-тред);
`tests/ts/<slug>-schema.test.ts`, `tests/react/<slug>.test.tsx`, записи в
`tests/python/test_models.py`.

**6. Витрина.** `apps/demo/src/app.tsx` — превью через `createSurfaceMessages(name, props)`;
описание сообщения объясняет, что смотреть глазами.

**7. Артефакты.** `pnpm run export:public` и **закоммитить `public/`** — `verify:public`
стоит гейтом в CI и падает на забытой регенерации. Набор компонентов расширяется
аддитивно, `CATALOG_VERSION` при этом не меняется.

## Грабли, стоившие времени

- **Доставка стилей — строкой, без бандлера.** `<StyleTag href={…hashCss(css)} css={…}>`:
  React 19 дедуплицирует по `href`, хэш в ключе нужен, чтобы правка CSS доходила
  при HMR. `precedence="default"` — чтобы хост мог перекрыть без `!important`.
- **Контейнерный запрос вешать на корень рендерера, а не на внутреннюю сетку.**
  Сетка живёт внутри отступов карточки и её тела — это ~60px, и порог, замеренный
  по ней, отсекает вторую колонку раньше, чем нужно.
- **Примитив, которого нет на `/proba/system`, считается незавершённым.** Добавил
  ось или состояние — покажи их там же, в том же change (спека `proba-design-system`).
- **Прод-рендерер не переписывается на месте.** Новый встаёт рядом, на той же схеме
  props, оба регистрируются одновременно — иначе сравнить «было / стало» нечем
  (прецедент: `ConstructionsEditorNext`).
- **Base UI:** `Autocomplete`, а не `Combobox` (свободный ввод обязателен); выбор
  ловится `onValueChange(value, {reason})`, а не `onClick`; попап — порталом в
  `body` с токенами на нём самом; `aria-controls` у свёрнутого триггера библиотека
  снимает — объявляй сам; у `Accordion` 1.7 нет стрелок между заголовками (APG),
  `NumberField` — не `spinbutton`.
- **Тесты:** клик, который диспатчит action, оборачивается в `await act(async () => …)`;
  меню открывается `pointerdown` перед `click`; панели с `keepMounted` остаются в
  DOM — `getByRole` их не видит, `getByText` видит, а имена якори на `^`.

## Проверка

```bash
pnpm run typecheck
pnpm run test:ts
pnpm run export:public && pnpm run verify:public
pnpm --filter @ai37/a2ui-catalog-react run build
# python: poetry в этой среде нет
cd packages/catalog-python && PYTHONPATH=src uv run --with pydantic --with pytest pytest ../../tests/python -q
```

Вёрстку зелёные тесты не проверяют: посмотреть экран в headless Chrome на двух
ширинах контейнера и приложить скриншоты к change.

## Не делать

- Не заводить новую палитру `--a2ui-<xx>-*` под компонент: набор примитивов уже
  задаёт слои токенов, а копия палитры — начало нового расхождения.
- Не менять `CATALOG_VERSION` ради нового компонента.
- Не трогать чужой рендерер и его тесты «заодно».
