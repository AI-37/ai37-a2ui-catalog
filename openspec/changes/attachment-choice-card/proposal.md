# AttachmentChoiceCard: выбор «без файла / с файлом» с загрузкой из карточки

## Why

Баг Минстроя (Notion 3f0a34ce…, план AI-37/docs#497): карточка подписи — `ChoiceCard` с двумя radio и
«Продолжить» — файл принять не умеет, поэтому PNG подписи кладут в композер через «+». Клик по форме —
A2UI action-ход: `context_refs` треда уезжают, агент подпись получает, но очередь чипов композера никто не
чистит — чип `image.png` остаётся над полем ввода. Подтверждено prod Loki (2 треда, 12:49:55 и 12:54:53 UTC
02.10) и кодом `@copilotkit/react-core@1.62.2`.

## What Changes

- Новый компонент `AttachmentChoiceCard` (аддитивно, пакеты 0.41.0, `CATALOG_VERSION` не меняется):
  кнопка `skip`, кнопка `attach` (неактивна, пока файл не загружен) и выбор файла рядом с ней.
- Файл грузится при выборе: same-origin multipart POST `CHAT_ATTACHMENTS_ROUTE` (`/api/chat-attachments`)
  с `{file, contextId}` — та же ручка, что у «+» композера. Новая константа в `catalog-schemas`.
- Обе кнопки шлют одно действие `action`: skip — `{value}`, attach — `{value, fileId, fileName}`.
- Python-зеркало `AttachmentChoiceCardProps` — эмитент Python-агент Минстроя.

Инвентаризация: закрыто набором — `Card` + `Card flat` + `CardHeader`, `Button` (outline lg / filled lg /
outline / icon-only sm), `DataChip`, `CloseIcon`, ступени `a2ui-t--*`; из библиотеки — ничего (нативный
`<input type="file">` скрыт, кнопка набора открывает его); новое — хук `useAttachmentUpload`, потому что
загрузки файла в каталоге не было ни у одного из 21 компонента.

## Impact

- `catalog-schemas`: схема, константа ручки, регистрация. `catalog-react`: рендерер под `withReadOnlyGate`.
  `catalog-python`: модель. Чужие рендереры не тронуты, `ChoiceCard` не меняется.
- Хост: ручка `/api/chat-attachments` у spai-ui уже есть. Потребитель-агент: minstroy (отдельный change).
- **Non-goals:** очистка чипов композера после A2UI action-хода (срез 3.4 плана, spai-ui); перетаскивание
  файла в карточку; несколько файлов.
