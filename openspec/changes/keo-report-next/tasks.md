## 1. Схема и регистрация

- [x] 1.1 `packages/catalog-schemas/src/components/keo-report.ts`:
      `keoReportNextDefinition` с `name: 'KeoReportNext'`, `slug:
      'keo-report-next'` на той же `keoReportPropsSchema`; нынешний
      definition не трогать
- [x] 1.2 `catalog.ts`: definition рядом со старым
- [x] 1.3 `constants.ts`: `'KeoReportNext'` в `CATALOG_COMPONENT_NAMES`
- [x] 1.4 `description` пишет, чем отличается и что props те же — по образцу
      `thermalReportNextDefinition`

## 2. Рендерер

- [x] 2.1 `keo-report-next.tsx` — `createComponentImplementation`, диспатч
      действий тем же контрактом
- [x] 2.2 `keo-report-next-screen.tsx` — экран без a2ui-хоста, наружу один
      `onAction` (песочница ставит его на страницу)
- [x] 2.3 «Что изменить» на `ReportRow`: акцентная рамка только у
      `tone: 'success'`, кнопка принятия — `outline`
- [x] 2.4 «Помещения» на `ReportRow`: значение пилюлей тона статуса, норма в
      `detail`, действие — где задано агентом
- [x] 2.5 Вердикт, исходные данные и протокол — готовые общие компоненты, не
      переписаны
- [x] 2.6 Допущения: общий `report-next-assumptions.tsx`; теплотех переключён,
      его копия удалена
- [x] 2.7 Словарь тонов КЕО → состояние набора отдельным файлом
      (`keo-report-next-recommendation-tone.ts`)
- [x] 2.8 Ни литералов цвета и кегля, ни своего листа стилей, ни новых
      примитивов
- [x] 2.9 `packages/catalog-react/src/catalog.ts` и `index.ts`: регистрация и
      экспорт рядом со старым

## 3. Python-зеркало

- [x] 3.1 `COMPONENT_MODELS`: `"KeoReportNext": KeoReportProps` (агент КЕО —
      питонный, модель одна на оба имени)

## 4. Публичные артефакты

- [x] 4.1 `pnpm run export:public` — `catalog.json` и `keo-report-next.schema.json`
- [x] 4.2 `pnpm run verify:public` — зелёный

## 5. Демо и песочница

- [x] 5.1 `apps/demo/src/app.tsx`: старый и новый на одном наполнении для обеих
      фикстур (`keo-report-fail`, `keo-report-pass`), сообщения подписаны
- [x] 5.2 Логгер действий подключён к новым сообщениям
- [x] 5.3 Песочница — в change `proba-keo-report-assembly` (здесь только
      ссылка: экран берётся из пакета, копии на странице нет)

## 6. Тесты

- [x] 6.1 `tests/react/keo-report-next.test.tsx`: состав экрана, слово
      состояния, действия с контекстом, помещения, протокол, «Скачать»
- [x] 6.2 `tests/python/test_models.py`: фикстура под именем `KeoReportNext`
- [x] 6.3 Тесты нынешнего `KeoReport` не тронуты и зелёные
- [x] 6.4 `pnpm run test:ts` и `pnpm run typecheck` — зелёные

## 7. Приёмка

- [x] 7.1 Скриншоты «до / после» обеих фикстур — `preview/`
- [x] 7.2 Узкий контейнер (380 px): правый слот под титулом, страница вбок не
      едет
- [x] 7.3 Проход клавиатурой: `Tab` по действиям в порядке чтения,
      `↓`/`Enter` открывает «Скачать», `Escape` возвращает фокус на триггер
- [x] 7.4 Гейт пользователя по макету (`/proba/report-assembly`) — принято
- [x] 7.5 Тары потребителям: `../spai-ui` (рендерит) и `../spai-chat-backend`
      (валидирует схему) — оба на 0.29.0, `KeoReportNext` в
      `CATALOG_COMPONENT_NAMES`. Агенту КЕО
      (`../spai-daylight-factor-calc-agent`) тара не ставилась: он на
      `@ai37/a2ui-catalog-schemas` 0.6.0 и `KeoReport` пока не эмитит вовсе
- [ ] 7.6 Живой прогон на стенде — **упирается в агента**: `KeoReport` сегодня
      не эмитит ни один репозиторий (проверено grep по `../spai-*`), поэтому
      переключать нечего, пока агент КЕО не начнёт слать отчёт
- [x] 7.7 CHANGELOG: запись в `## [Unreleased]`
