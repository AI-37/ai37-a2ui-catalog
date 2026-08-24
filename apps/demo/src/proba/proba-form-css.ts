/** Черновик формы: сетка в контейнерном запросе — карточку кладут в чат произвольной ширины. */
export const PROBA_FORM_CSS = `
.a2ui-proba .a2ui-form-scope {
  container-type: inline-size;
  container-name: a2ui-form;
  /* width обязателен: inline-size включает size containment, и во флекс-хосте
     обёртка схлопнулась бы в ноль. */
  width: 100%;
  min-width: 0;
}

.a2ui-proba .a2ui-form {
  display: grid;
  gap: 12px 16px;
  grid-template-columns: 1fr;
}

/* Узкая раскладка базовая: без поддержки контейнерных запросов форма
   деградирует в одну колонку, а не ломается. */
@container a2ui-form (min-width: 560px) {
  .a2ui-proba .a2ui-form--two { grid-template-columns: 1fr 1fr; }
}

.a2ui-proba .a2ui-field {
  display: grid;
  gap: 6px;
  min-width: 0;
  align-content: start;
  margin: 0;
}

.a2ui-proba .a2ui-control {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--a2ui-card-border, #e5e4e1);
  border-radius: 8px;
  background: var(--a2ui-card-surface-plain, #ffffff);
  color: inherit;
  font: inherit;
}

.a2ui-proba .a2ui-control:focus-visible {
  outline: 2px solid var(--a2ui-text-color-accent, #245a87);
  outline-offset: 1px;
}

/* Значение, а не контрол: править ГСОП нельзя, и коробка поля звала бы это
   делать (так же сегодня устроен .a2ui-ce-static). */
.a2ui-proba .a2ui-static {
  padding: 8px 0;
}

.a2ui-proba .a2ui-field__index {
  font-size: 0.85em;
  vertical-align: sub;
}
`;
