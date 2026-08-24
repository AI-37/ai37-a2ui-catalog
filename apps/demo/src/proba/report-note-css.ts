/**
 * Заметка на утопленном фоне: допущения отчёта и `note` группы исходных
 * данных. Точка-маркер тоном предупреждения — заметка всегда про оговорку,
 * а не про успех.
 */
export const PROBA_REPORT_NOTE_CSS = `
.a2ui-kit .a2ui-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--a2ui-card-radius-sunken);
  background: var(--a2ui-card-surface-sunken);
  color: var(--a2ui-text-color-muted);
}

/* Точка выравнивается по первой строке текста, а не по центру блока. */
.a2ui-kit .a2ui-note__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--a2ui-text-color-warning);
  flex: none;
  margin-top: 5px;
}
`;
