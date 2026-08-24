> Порядок — ритуал песочницы (`apps/demo/src/proba/README.md`, п. 3 и 6):
> сначала блок собирается и правится глазами на `/proba/lift-assembly` без сети
> и без схемы, и только принятая сборка переезжает в `packages/`. Разделы 1–2
> закрываются до того, как начнётся раздел 3.

## 1. Песочница: сборка блока на `/proba/lift-assembly`

- [x] 1.1 `apps/demo/src/proba/recommend-fixture.ts` — стаб-варианты в форме
  `RecommendResourceVariant` (design.md, Решение 4): 5 вариантов 52941
  (`title`/`subtitle`/`notes`/`apply`), из них один `tone: 'near'`
- [x] 1.2 `apps/demo/src/proba/recommend-block.tsx` — блок на примитивах пакета
  (`Card`, `Chip`, `Button`, `Select`): заголовок, топ-2 карточками, селект с
  остальными; **экран не копируем** — блок стоит на странице рядом с
  `LiftAssembly` (второй экземпляр `LiftNextScreen` в песочнице запрещён)
- [x] 1.3 Переключатель состояний на странице: загрузка, список, пусто,
  устарело (приглушённый список) — все четыре видно без сети
- [x] 1.4 Клик по карточке и выбор из селекта пишут в консоль применяемый
  `apply` (получатель — консоль, как у черновиков витрины)
- [x] 1.5 Примитив, который придётся завести или изменить ради блока, добавить
  на `/proba/system` тем же change (правило реестра) — не понадобилось:
  блок собран из `Card`, `Chip` (тон `warning` уже в наборе), `Button`,
  `Field` и `Select`, все пять на витрине есть
- [x] 1.6 Мобильная ширина: убедиться, что две карточки в ряд не ломаются
  (иначе — одна карточка + селект, open question design.md)

## 2. Гейт: приёмка глазами

- [ ] 2.1 Пройти `/proba/lift-assembly` вживую: блок между «Зданием» и лифтами
  не спорит с секциями по плотности и фону
- [ ] 2.2 Зафиксировать правки сборки и внести их здесь же, в песочнице
- [ ] 2.3 Ответить на open questions design.md (топ-2 против одной карточки,
  показывать ли `nearMisses`, нужен ли «свернуть») — ответы дописать в design.md
- [ ] 2.4 Только после этого начинать раздел 3

## 3. Контракт в `catalog-schemas`

- [ ] 3.1 `src/components/lift-editor-recommend.ts`: константы
  `AGENT_RESOURCE_ROUTE = '/api/agent-resource'` и `RECOMMEND_DEBOUNCE_MS = 300`;
  `LOOKUP_SUGGEST_ROUTE` (`form-card-lookup-fetch.ts`) переводится на
  `AGENT_RESOURCE_ROUTE`, чтобы путь жил в одном месте
- [ ] 3.2 Там же: `liftEditorRecommendParamSchema` (`{name, scope?, required?}`,
  `scope` — существующий `liftEditorFieldScopeSchema`) и
  `liftEditorRecommendSchema` (`resource`, `taskId?`, `params` 1…24, `title`,
  `applyLabel`, `moreLabel`, `loadingLabel`, `emptyLabel`, `topCount?` 1…4) —
  `.strict()`
- [ ] 3.3 Типы ответа `RecommendResourceVariant` / `RecommendResourceResponse`
  + терпимый к лишним ключам рантайм-парсер; экспорт из индекса пакета — агент
  импортирует их, а не копирует
- [ ] 3.4 Опциональный `recommend` в `liftEditorPropsSchema` (аддитивно,
  `CATALOG_VERSION` остаётся `v2`)
- [ ] 3.5 Тесты схемы (`tests/ts/lift-editor-schema.test.ts`): props без
  `recommend` валиден; полный `recommend` валиден; пустой `resource`, пустой
  `params`, лишний ключ — отвергаются
- [ ] 3.6 Фикстуры: валидная `lift-editor-recommend.json` (52941: `params` из
  N, A + H0/Nn со `scope: 'lift'`); невалидные
  `lift-editor-recommend-empty-resource.json`,
  `lift-editor-recommend-empty-params.json`; существующие валидные фикстуры
  остаются без `recommend` — это и есть путь отката

## 4. Перенос в пакет: данные

- [ ] 4.1 `build-recommend-query.ts`: `params` + черновик → `URLSearchParams`
  (пустые необязательные пропускаются) и ключ актуальности; `scope: 'lift'`
  берётся из первой лифтовой секции
- [ ] 4.2 `parse-recommend-variants.ts`: `unknown` → `RecommendResourceVariant[]`
  (вариант без `apply.values` отбрасывается)
- [ ] 4.3 `is-recommend-echo-stale.ts`: сверка `echo` с отправленным query,
  числа сравниваются числами (design.md, Решение 6)
- [ ] 4.4 `use-recommend-variants.ts` по образцу `use-lookup-suggest.ts`:
  дебаунс, `AbortController`, отмена на unmount, состояния
  `hidden|loading|shown|empty|stale`, тихий fallback

## 5. Перенос в пакет: разметка и применение

- [ ] 5.1 `lift-next-recommend-card.tsx` и `lift-next-recommend-block.tsx` —
  принятая в песочнице сборка, без стаб-состояний (состояния приходят хуком)
- [ ] 5.2 `apply-recommend-variant.ts`: чистая функция
  `(draft, config, variant) → draft` — `per-lift`: `count` секций с клампом по
  `maxLifts`; `group`: одна секция; имён доменных полей функция не знает
- [ ] 5.3 `use-lift-editor-next.ts`: `applyRecommendation(variant)` в control —
  применяет черновик, помечает поля `touched` (иначе `dependentRules` перетрут),
  снимает подписи источников, отменяет отложенный черновик и шлёт немедленный,
  раскрывает первую лифтовую секцию
- [ ] 5.4 `lift-next-screen.tsx`: блок между секцией «Здание» и лифтовыми
  секциями, вне навигации «Далее» и вне счёта просмотренных секций
- [ ] 5.5 `lift-editor-next.tsx`: без пропа `recommend` хук не поднимается и
  сеть не трогается
- [ ] 5.6 Песочницу перевести на компонент пакета и удалить её копию блока —
  иначе первая же правка их разведёт (правило `/proba/README.md`); стаб-варианты
  остаются наполнением страницы

## 6. Тесты рендерера (`tests/react/`)

- [ ] 6.1 Без `recommend` — блока нет, `fetch` не вызывался (регресс нынешнего
  поведения)
- [ ] 6.2 Заполнение обязательных полей → ровно один GET на
  `/api/agent-resource` с ожидаемым query (включая `taskId`), после дебаунса
- [ ] 6.3 Быстрая правка: один запрос по последнему значению, предыдущий отменён
- [ ] 6.4 Ответ на устаревший ввод не отрисовывается; нормализованное `echo`
  (число вместо строки) протухшим не считается
- [ ] 6.5 404 / сетевая ошибка / мусорное тело → блок скрыт, форма работает,
  ошибок на экране нет
- [ ] 6.6 Разрез топ/остальные при `topCount` 2 и 5 вариантах; пустой `variants`
  → `emptyLabel`
- [ ] 6.7 Применение варианта `count: 3` в `per-lift`: три секции, значения во
  всех, один немедленный черновик наружу
- [ ] 6.8 Применение в `group`: секция одна, число лифтов пришло полем
- [ ] 6.9 `dependentRules` не перетирают подставленное (`h`/`t123` при `Vn` из
  варианта); подпись источника с перезаписанного поля снята
- [ ] 6.10 Кламп по `maxLifts`; «Далее» ходит по секциям так же, как без блока
- [ ] 6.11 Регресс-прогон `lift-editor.test.tsx` (старый рендерер) без изменений

## 7. Python-зеркало

- [ ] 7.1 `recommend` в `models/lift_editor.py` + parity-тест TS ↔ Python
- [ ] 7.2 Невалидные фикстуры из 3.6 в python-тестах

## 8. Витрина demo (a2ui-путь)

- [ ] 8.1 `apps/demo/src/with-lift-recommend.ts` — проп `recommend` в витрине
  `LiftEditorNext`
- [ ] 8.2 `apps/demo/src/demo-recommend-fetch.ts` — стаб `/api/agent-resource`
  (задержка + те же варианты), чтобы блок работал без агента
- [ ] 8.3 Пройти вручную: ввод N/A поднимает блок, правка гасит и обновляет,
  клик перестраивает лифтовые секции, в логе action'ов один черновик

## 9. Публикация

- [ ] 9.1 `pnpm run export:public` + `pnpm run verify:public`, закоммитить
  артефакты (`catalog.json`, схемы компонентов)
- [ ] 9.2 `pnpm run version:bump minor` + CHANGELOG
- [ ] 9.3 Полный прогон: TS + Python тесты, lint, typecheck

## 10. Кросс-репо (зеркальные changes, вне этого репо)

- [ ] 10.1 `spai-elevator-calc-agent`: привести формат вариантов change'а
  `recommend-resource` к `RecommendResourceVariant`
  (`title`/`subtitle`/`notes`/`apply`), реализовать `GET /api/recommend`,
  добавить `recommend` в props формы (`form-args.ts`)
- [ ] 10.2 `spai-chat-backend`: `"lift-recommend": "/api/recommend"` в реестре
  remote-a2a агента elevator-calc
- [ ] 10.3 `spai-ui`: бамп версии каталога
