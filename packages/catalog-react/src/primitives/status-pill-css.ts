/**
 * Статусная пилюля с точкой: вердикт отчёта и статус строки. Цвет берётся у
 * модификаторов цвета текста набора (`a2ui-t--success` и соседи), поэтому
 * своих тонов здесь нет — только точка и раскладка.
 */
export const KIT_STATUS_PILL_CSS = `
.a2ui-kit .a2ui-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

/* Точка красится текущим цветом: тон приходит одним классом на всю пилюлю. */
.a2ui-kit .a2ui-pill__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex: none;
}
`;
