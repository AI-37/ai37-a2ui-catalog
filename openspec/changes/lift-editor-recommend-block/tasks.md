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
- [x] 2.2 Зафиксировать правки сборки и внести их здесь же, в песочнице —
  снята кнопка подтверждения у списка выбора (design.md, Решение 10; спека
  «Презентация вариантов» и «Применение варианта» приведены к ней)
- [ ] 2.3 Ответить на open questions design.md (топ-2 против одной карточки,
  показывать ли `nearMisses`, нужен ли «свернуть») — ответы дописать в design.md
- [ ] 2.4 Только после этого начинать раздел 3 — **порядок нарушен по прямому
  указанию**: разделы 3–8 сделаны до того, как закрыты 2.1 и 2.3. Живой проход
  и два open questions (`nearMisses`, «свернуть») остаются за пользователем;
  ответы на них разметку блока не меняют, только состав вариантов

## 3. Контракт в `catalog-schemas`

- [x] 3.1 `src/components/lift-editor-recommend.ts`: константы
  `AGENT_RESOURCE_ROUTE = '/api/agent-resource'` и `RECOMMEND_DEBOUNCE_MS = 300`;
  `LOOKUP_SUGGEST_ROUTE` (`form-card-lookup-fetch.ts`) переводится на
  `AGENT_RESOURCE_ROUTE`, чтобы путь жил в одном месте
- [x] 3.2 Там же: `liftEditorRecommendParamSchema` (`{name, scope?, required?}`,
  `scope` — существующий `liftEditorFieldScopeSchema`) и
  `liftEditorRecommendSchema` (`resource`, `taskId?`, `params` 1…24, `title`,
  `applyLabel`, `moreLabel`, `loadingLabel`, `emptyLabel`, `topCount?` 1…4) —
  `.strict()`
- [x] 3.3 Типы ответа `RecommendResourceVariant` / `RecommendResourceResponse`
  + терпимый к лишним ключам рантайм-парсер; экспорт из индекса пакета — агент
  импортирует их, а не копирует
- [x] 3.4 Опциональный `recommend` в `liftEditorPropsSchema` (аддитивно,
  `CATALOG_VERSION` остаётся `v2`)
- [x] 3.5 Тесты схемы (`tests/ts/lift-editor-schema.test.ts`): props без
  `recommend` валиден; полный `recommend` валиден; пустой `resource`, пустой
  `params`, лишний ключ — отвергаются
- [x] 3.6 Фикстуры: валидная `lift-editor-recommend.json` (52941: `params` из
  N, A + H0/Nn со `scope: 'lift'`); невалидные
  `lift-editor-recommend-empty-resource.json`,
  `lift-editor-recommend-empty-params.json`; существующие валидные фикстуры
  остаются без `recommend` — это и есть путь отката

## 4. Перенос в пакет: данные

- [x] 4.1 `build-recommend-query.ts`: `params` + черновик → `URLSearchParams`
  (пустые необязательные пропускаются) и ключ актуальности; `scope: 'lift'`
  берётся из первой лифтовой секции
- [x] 4.2 `parse-recommend-variants.ts`: `unknown` → `RecommendResourceVariant[]`
  (вариант без `apply.values` отбрасывается)
- [x] 4.3 `is-recommend-echo-stale.ts`: сверка `echo` с отправленным query,
  числа сравниваются числами (design.md, Решение 6)
- [x] 4.4 `use-recommend-variants.ts` по образцу `use-lookup-suggest.ts`:
  дебаунс, `AbortController`, отмена на unmount, состояния
  `hidden|loading|shown|empty|stale`, тихий fallback

## 5. Перенос в пакет: разметка и применение

- [x] 5.1 `lift-next-recommend-card.tsx` и `lift-next-recommend-block.tsx` —
  принятая в песочнице сборка, без стаб-состояний (состояния приходят хуком).
  Список «Ещё варианты» снят после осмотра в чате (design.md, Решение 11):
  блок — только карточки, `moreLabel` из контракта убран
- [x] 5.2 `apply-recommend-variant.ts`: чистая функция
  `(draft, config, variant) → draft` — `per-lift`: `count` секций с клампом по
  `maxLifts`; `group`: одна секция; `apply.buildingValues` (34758: `Nl`) —
  в секцию «Здание»; имён доменных полей функция не знает
- [x] 5.3 `use-lift-editor-next.ts`: `applyRecommendation(variant)` в control —
  применяет черновик, помечает поля `touched` (иначе `dependentRules` перетрут),
  снимает подписи источников, отменяет отложенный черновик и шлёт немедленный,
  раскрывает первую лифтовую секцию
- [x] 5.4 `lift-next-screen.tsx`: блок между секцией «Здание» и лифтовыми
  секциями, вне навигации «Далее» и вне счёта просмотренных секций
- [x] 5.5 `lift-editor-next.tsx`: без пропа `recommend` хук не поднимается и
  сеть не трогается
- [x] 5.6 Песочницу перевести на компонент пакета и удалить её копию блока —
  иначе первая же правка их разведёт (правило `/proba/README.md`); стаб-варианты
  остаются наполнением страницы

## 6. Тесты рендерера (`tests/react/`)

- [x] 6.1 Без `recommend` — блока нет, `fetch` не вызывался (регресс нынешнего
  поведения)
- [x] 6.2 Заполнение обязательных полей → ровно один GET на
  `/api/agent-resource` с ожидаемым query (включая `taskId`), после дебаунса
- [x] 6.3 Быстрая правка: один запрос по последнему значению, предыдущий отменён
- [x] 6.4 Ответ на устаревший ввод не отрисовывается; нормализованное `echo`
  (число вместо строки) протухшим не считается
- [x] 6.5 404 / сетевая ошибка / мусорное тело → блок скрыт, форма работает,
  ошибок на экране нет
- [x] 6.6 Разрез топ/остальные при `topCount` 2 и 5 вариантах; пустой `variants`
  → `emptyLabel`
- [x] 6.7 Применение варианта `count: 3` в `per-lift`: три секции, значения во
  всех, один немедленный черновик наружу
- [x] 6.8 Применение в `group`: секция одна, `Nl` записан в «Здание» из
  `apply.buildingValues`
- [x] 6.9 `dependentRules` не перетирают подставленное (`h`/`t123` при `Vn` из
  варианта); подпись источника с перезаписанного поля снята
- [x] 6.10 Кламп по `maxLifts`; «Далее» ходит по секциям так же, как без блока
- [x] 6.11 Регресс-прогон `lift-editor.test.tsx` (старый рендерер) без изменений

## 7. Python-зеркало

- [x] 7.1 `recommend` в `models/lift_editor.py` + parity-тест TS ↔ Python
- [x] 7.2 Невалидные фикстуры из 3.6 в python-тестах

## 8. Витрина demo (a2ui-путь)

- [x] 8.1 `apps/demo/src/with-lift-recommend.ts` — проп `recommend` в витрине
  `LiftEditorNext`
- [x] 8.2 Стаб `/api/agent-resource` — **не клиентский**, а серверный: варианты
  лежат в `apps/demo/src/demo-lift-recommend.ts`, отдаёт их middleware
  `vite.config.ts` (тот же, что уже отвечает на suggest lookup). Клиентская
  подмена `fetch` разошлась бы с прод-поведением, а тут блок ходит в сеть
  по-настоящему. Эхо отдаётся числом — проверка нормализации заодно
- [x] 8.3 Пройти вручную: ввод N/A поднимает блок, правка гасит и обновляет,
  клик перестраивает лифтовые секции, в логе action'ов один черновик

## 9. Публикация

- [x] 9.1 `pnpm run export:public` + `pnpm run verify:public`, закоммитить
  артефакты (`catalog.json`, схемы компонентов)
- [ ] 9.2 `pnpm run version:bump minor` + CHANGELOG — **не делал**: релизный
  шаг, а в дереве параллельно идёт незакрытый change отчётов; бампать надо
  один раз, когда оба готовы
- [x] 9.3 Полный прогон: TS + Python тесты, lint, typecheck

## 10. Кросс-репо (зеркальные changes, вне этого репо)

- [x] 10.1 `spai-elevator-calc-agent`: `GET /api/recommend` реализована для
  обеих методик в формате `RecommendResourceVariant`
  (`title`/`subtitle`/`notes`/`apply` + `buildingValues`)
- [ ] 10.2 `spai-elevator-calc-agent`: проп `recommend` в props формы
  (`form-args.ts`) — ТОЛЬКО после релиза этого пакета: схема props `.strict()`,
  незнакомый ключ уронит валидацию формы
- [ ] 10.3 `spai-chat-backend`: `"lift-recommend": "/api/recommend"` в реестре
  remote-a2a агента elevator-calc
- [ ] 10.4 `spai-ui`: бамп версии каталога
