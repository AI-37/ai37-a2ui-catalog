## 1. Канал черновика из форм

- [x] 1.1 `constructions-editor.types.ts`: добавить необязательный
  `onDraftChange` в пропы строки слоя и паспортной формы
- [x] 1.2 `constructions-editor-layer-row.tsx`: `LayerForm` зовёт
  `onDraftChange(draft)` при каждом изменении черновика (толщина, ручная λ,
  ввод/выбор материала)
- [x] 1.3 `constructions-editor-passport.tsx`: `PassportForm` зовёт
  `onDraftChange(draft)` при изменении значения

## 2. Превью в карточке

- [x] 2.1 `constructions-editor-card.tsx`: state превью-черновика; сброс в
  `null` при любом изменении `editingTarget` (открытие, отмена, переключение,
  коммит)
- [x] 2.2 Построение превью-entry для чипа: подмена слоя по индексу (edit),
  добавление в конец (new), подмена `rprPassport` (passport); чип Rпр
  считается `computeLiveRpr` от превью-entry, всё остальное (статусный чип,
  невалидность, сводки) — от закоммиченного `entry`

## 3. Тесты

- [x] 3.1 `tests/react/constructions-editor.test.tsx`: перевернуть тест
  «ввод в форме не трогает live-Rпр» → чип пересчитывается, строка-сводка и
  state не меняются, action'ов нет
- [x] 3.2 Новые тесты: превью для формы нового слоя и паспортного Rпр;
  «Отмена»/переключение формы возвращают чип; стёртая толщина исключает слой
  из суммы без NaN

## 4. Финал

- [x] 4.1 Обновить doc-комментарии (`constructions-editor-card.tsx`,
  `constructions-editor-layer-row.tsx`) под новый контракт превью
- [x] 4.2 Прогнать lint/typecheck/тесты пакета `catalog-react`, проверить
  вживую в demo-приложении (headless Chrome, скриншот чипа при правке)
