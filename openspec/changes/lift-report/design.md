## Context

Образец жанра — `ThermalReport` (change `thermal-report`): вердикт + inputs + протокол под катом уже спроектированы и обкатаны. `LiftReport` отличается блоком «Что изменить» (варианты с предвычисленным пересчётом) и тем, что «Скачать» с самого начала идёт через REST-цепочку agent-resource (у teplo Blob из props был временным решением до change `agent-report-download`).

## Goals / Non-Goals

**Goals:** карточка по figma — вердикт, «Что изменить», «Исходные данные» (введено вами / принято системой), протокол со «Скачать».

**Non-Goals:** сворачиваемая обёртка сообщения («Расчёт по ГОСТ … · 4 шага · 28 с» — это хром чата, не компонент); Blob-скачивание из props; пересчёт на клиенте (все значения приходят готовыми).

## Decisions

- **`inputs` — тот же контракт, что у ThermalReport** ({action?, groups: [{label, tone: 'normal'|'warning', chips: [{label, value}], note?}]}): жанр «введено вами / принято системой — проверьте» идентичен, расхождение контрактов — лишняя сущность для UI и агентов.
- **`suggestions` вместо `checks`/`constructions`.** Элемент: {id, title, detail, tone: 'pass'|'fail'|'neutral', action?, statusLabel?}. Вариант с `action` рендерит кнопку («Пересчитать»); без action — `statusLabel` тоном (`fail` — danger «не проходит»). `tone: 'pass'` выделяет рекомендуемый вариант (зелёная рамка на макете). Числа внутри — готовые строки от агента («Интервал 73 с — проходит с запасом»).
- **«Скачать» — `protocol.downloadUrl`, обычный `<a href>`.** Относительный URL проходит санитайзер spai-ui; `Content-Disposition: attachment` ставит ручка агента (spec `report-download` elevator). Поле опционально: пока флаг `REPORT_DOWNLOAD_LINK` у агента выключен, ссылки в props нет и кнопка не рендерится.
- **`protocol.content` — краткий вывод («Итог»), не простыня.** Как у ThermalReport: полная простыня в чат/props не попадает вовсе.

## Risks / Trade-offs

- [Расхождение с teplo-паттерном скачивания] → это осознанная эволюция: ThermalReport сможет мигрировать на `downloadUrl` тем же полем (аддитивно), `downloadContent` у лифтов не появляется.
