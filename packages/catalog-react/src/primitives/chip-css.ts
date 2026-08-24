/** Пилюля с числом: тон красит текст и рамку, заливки нет — фон уже несёт карточка. */
export const KIT_CHIP_CSS = `
.a2ui-kit .a2ui-chip {
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid var(--a2ui-chip-border);
  color: var(--a2ui-chip-fg);
  white-space: nowrap;
}

.a2ui-kit .a2ui-chip--success {
  border-color: var(--a2ui-text-color-success);
  color: var(--a2ui-text-color-success);
}

.a2ui-kit .a2ui-chip--danger {
  border-color: var(--a2ui-text-color-danger);
  color: var(--a2ui-text-color-danger);
}

.a2ui-kit .a2ui-chip--warning {
  border-color: var(--a2ui-text-color-warning);
  color: var(--a2ui-text-color-warning);
}
`;
