/** Пилюля с числом: тон красит текст и рамку, заливки нет — фон уже несёт карточка. */
export const PROBA_CHIP_CSS = `
.a2ui-proba .a2ui-chip {
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid var(--a2ui-card-border, #e5e4e1);
  color: var(--a2ui-text-color-muted, #6e6e6a);
  white-space: nowrap;
}

.a2ui-proba .a2ui-chip--success {
  border-color: var(--a2ui-text-color-success, #16a34a);
  color: var(--a2ui-text-color-success, #16a34a);
}

.a2ui-proba .a2ui-chip--danger {
  border-color: var(--a2ui-text-color-danger, #dc2626);
  color: var(--a2ui-text-color-danger, #dc2626);
}
`;
