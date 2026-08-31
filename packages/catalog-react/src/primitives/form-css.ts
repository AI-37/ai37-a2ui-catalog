import {FORM_THREE_COLUMNS_AT, FORM_TWO_COLUMNS_AT} from './form-breakpoints';

/** Форма: сетка в контейнерном запросе — карточку кладут в чат произвольной ширины. */
export const KIT_FORM_CSS = `
.a2ui-kit .a2ui-form {
  display: grid;
  gap: 12px 16px;
  grid-template-columns: 1fr;
}

/* Узкая раскладка базовая: без поддержки контейнерных запросов форма
   деградирует в одну колонку, а не ломается. */
@container a2ui-kit (min-width: ${FORM_TWO_COLUMNS_AT}px) {
  .a2ui-kit .a2ui-form--two { grid-template-columns: 1fr 1fr; }
}

/* «Строка + два числа» узкой не бывает: даже в самом тесном контейнере числа
   стоят парой, а длинное название материала забирает строку себе. Одна колонка
   растянула бы форму слоя на три экрана пустоты. */
.a2ui-kit .a2ui-form--three { grid-template-columns: 1fr 1fr; }
.a2ui-kit .a2ui-form--three .a2ui-field--wide { grid-column: span 2; }

/* В широком контейнере все три поля встают строкой: числа берут свою ширину,
   остальное достаётся строке — у толщины и λ значение короткое, и равная треть
   колонки им ни к чему. */
@container a2ui-kit (min-width: ${FORM_THREE_COLUMNS_AT}px) {
  .a2ui-kit .a2ui-form--three { grid-template-columns: 1fr auto auto; }
  .a2ui-kit .a2ui-form--three .a2ui-field--wide { grid-column: auto; }
}

.a2ui-kit .a2ui-field {
  display: grid;
  gap: 6px;
  min-width: 0;
  align-content: start;
  margin: 0;
}

/* Подпись — своя строка сетки: Field.Label рендерит <label>, связку с
   контролом ставит библиотека (htmlFor + id), а не порядок вложения. */
.a2ui-kit .a2ui-field__label {
  display: block;
  margin: 0;
}

.a2ui-kit .a2ui-control {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--a2ui-control-border);
  border-radius: var(--a2ui-control-radius);
  background: var(--a2ui-control-surface);
  color: inherit;
  font: inherit;
  font-size: var(--a2ui-text-size-body);
  line-height: var(--a2ui-text-line-body);
}

/* Поле под 4–5 знаков: ширина от содержимого, а не от колонки сетки. */
.a2ui-kit .a2ui-control--compact {
  width: calc(5ch + 22px);
  max-width: 100%;
}

.a2ui-kit .a2ui-control:focus-visible {
  outline: 2px solid var(--a2ui-text-color-accent);
  outline-offset: 1px;
}

.a2ui-kit .a2ui-control[data-disabled],
.a2ui-kit .a2ui-control:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* --- выпадающий список: тот же контрол плюс значение и стрелка --------- */

.a2ui-kit .a2ui-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  text-align: left;
  cursor: pointer;
}

.a2ui-kit .a2ui-select__value {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.a2ui-kit .a2ui-select__icon {
  flex: none;
  display: flex;
  width: 1em;
  height: 1em;
  color: var(--a2ui-text-color-muted);
}

/* Значение, а не контрол: править ГСОП нельзя, и коробка поля звала бы это
   делать (так же сегодня устроен .a2ui-ce-static). */
.a2ui-kit .a2ui-static {
  padding: 8px 0;
}

/* Значение пришло готовым — из проекта или посчитанным агентом: та же коробка
   контрола, залитая и без рамки. Не новая идея: ровно так с первого макета
   живёт .a2ui-ce-control--project в ConstructionsEditor, в набор заливку
   просто не перенесли. Читать можно, править незачем — и в ряду белых полей
   видно, что это значение не ваше.

   Два класса, чтобы перебить .a2ui-control: правила равной специфичности
   разрешаются порядком, а он зависит от порядка слоёв в KitStyles. */
.a2ui-kit .a2ui-control.a2ui-control--ready {
  border-color: transparent;
  background: var(--a2ui-control-surface-ready);
}

.a2ui-kit .a2ui-field__index {
  font-size: 0.85em;
  vertical-align: sub;
}
`;
