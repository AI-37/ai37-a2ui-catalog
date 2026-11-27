## Why

`reports-next` перенёс на примитивы два отчёта из четырёх и назвал третий
следующим: «`KeoReport` и `InsolationReport` — следующий change: их черёд
после того, как на двух отчётах общий набор примитивов устоится». Набор
устоялся: `ThermalReportNext` и `LiftReportNext` живут на одном слое
примитивов, своих листов стилей у них нет.

КЕО отстал ровно настолько, насколько был написан отдельно: 244 строки
`keo-report-styles.ts`, 39 классов `a2ui-kr__*` и ещё 3 кнопочных
`a2ui-kr-btn*`, своя кнопка `keo-report-action-button.tsx` с тремя
вариантами — при том что из шести секций экрана четыре (вердикт,
допущения, исходные данные, протокол) у теплотеха и лифтов уже написаны
один раз и лежат готовыми. Своего у КЕО две
секции: «Что изменить» и «Помещения».

Расхождения видны глазами на одной странице: у КЕО кнопка принятия варианта
залита чёрным (`solid`) там, где у лифтов `outline`; отвергнутый вариант
объясняется красным `detail` вместо статусной пилюли, которой сказано то же
самое в двух других отчётах; «Скачать» — ссылка без меню форматов.

## What Changes

- **Рендерер `KeoReportNext`** в `packages/catalog-react`, собранный из
  примитивов набора. Схема props — та же `keoReportPropsSchema`: наполнение
  общее со старым, агенту КЕО менять нечего.
- **Своих у КЕО две секции**: «Что изменить» (`keo-report-next-recommendations`)
  и «Помещения» (`keo-report-next-rooms`) — обе на `ReportRow` набора.
  Остальные четыре взяты готовыми: `ReportNextVerdictSection`,
  `ReportNextAssumptions`, `ReportNextInputsCard`, `ReportNextProtocolCard`.
  Новых примитивов не заводится ни одного.
- **Канон `reports-next` применён к КЕО**: кнопка принятия — `outline`;
  акцентная рамка — только у рекомендованного варианта (`tone: 'success'`);
  слово состояния зашито в рендерер (`success | fail`), у `neutral` его нет;
  «Скачать» — меню форматов, растущее вверх; `protocol.content` на экране не
  выводится.
- **Общая заметка допущений** поднята в `report-next-assumptions.tsx` — до
  этого она была `thermal-report-next-assumptions.tsx`, хотя ничего
  теплотехнического в ней нет. Теплотех переключён на общую, копия удалена.
- **Новое имя `KeoReportNext`** в схемах, в `CATALOG_COMPONENT_NAMES`, в
  `COMPONENT_MODELS` python-зеркала (агент КЕО — питонный, зеркало у КЕО есть)
  и в публичных артефактах.
- **Нынешний `KeoReport` не меняется** — ни разметка, ни стили, ни тесты.
- **Макет — отдельным change** `proba-keo-report-assembly`: два наполнения
  КЕО блоками на `/proba/report-assembly`, инвентаризация числами и семь
  решений ревью. Здесь они применяются в коде, а не пересматриваются.

## Capabilities

### New Capabilities

- `keo-report-next` — рендерер отчёта КЕО на примитивах каталога: состав
  экрана, применённый канон отчётов, контракт данных и действий, требование
  сосуществования со старым.

### Modified Capabilities

(нет: правила набора заданы `reports-next` и здесь применяются)

## Impact

- `packages/catalog-schemas/src/components/keo-report.ts` — `keoReportNextDefinition`
  на той же схеме props; нынешний definition не трогать.
- `packages/catalog-schemas/src/catalog.ts`, `constants.ts` — регистрация и имя.
- `packages/catalog-react/src/renderers/keo-report-next*` — рендерер, экран и
  две свои секции; `report-next-assumptions.tsx` — общая заметка.
- `packages/catalog-react/src/renderers/thermal-report-next-screen.tsx` —
  импорт общей заметки вместо своей копии (удалена
  `thermal-report-next-assumptions.tsx`).
- `packages/catalog-react/src/catalog.ts`, `index.ts` — регистрация и экспорт.
- `packages/catalog-python/.../models/__init__.py` — `"KeoReportNext":
  KeoReportProps` в `COMPONENT_MODELS`.
- `public/a2ui/catalogs/ai37-a2ui/v2/*` — перегенерация (`export:public`).
- `apps/demo/src/app.tsx` — старый и новый на одном наполнении, обе фикстуры.
- `tests/react/keo-report-next.test.tsx`, `tests/python/test_models.py`;
  тесты нынешнего `KeoReport` **не трогать**.
- **Смежные репозитории:** имя компонента эмитит агент `keo` строкой. Чтобы
  посмотреть новый отчёт вживую, ему нужен переключатель имени (как
  `CONSTRUCTIONS_EDITOR_NEXT` в `spai-teplo-calc`). Отдельное изменение в том
  репозитории, здесь фиксируется как зависимость.

## Non-goals

- Вывод нынешнего `KeoReport` из обращения и удаление `keo-report-styles.ts`.
- Правка схемы props КЕО и контракта действий.
- `InsolationReport` — четвёртый отчёт, отдельный change.
- Тёмная тема — как и у остальных `*Next`, живёт в `next-dark-theme`.
- Переключатель имени в агенте `keo` — изменение в другом репозитории.
