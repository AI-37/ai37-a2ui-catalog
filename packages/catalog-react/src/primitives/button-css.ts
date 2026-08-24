/** Кнопка: геометрия одна, цвет — из слоя `--a2ui-btn-*`, кегль — со ступени шкалы. */
export const KIT_BUTTON_CSS = `
.a2ui-kit .a2ui-btn {
  --_ink: var(--a2ui-btn-fg);
  --_pad-y: 8px;
  --_pad-x: 14px;
  /* Кегль берётся со ступени шкалы, а не назначается кнопке отдельно:
     md и lg — body, sm — sub. Своего размера у кнопки нет. */
  --_font: var(--a2ui-text-size-body);

  appearance: none;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: var(--_pad-y) var(--_pad-x);
  border-radius: var(--a2ui-btn-radius);
  border: 1px solid var(--a2ui-btn-border);
  background: transparent;
  color: var(--_ink);
  font: inherit;
  font-size: var(--_font);
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
}

/* --- variant: форма -------------------------------------------------- */

.a2ui-kit .a2ui-btn--filled {
  border-color: transparent;
  background: var(--_ink);
  color: var(--a2ui-btn-surface);
}

/* outline — базовое состояние, отдельных правил не требует. */

.a2ui-kit .a2ui-btn--link {
  padding: 4px 0;
  border-color: transparent;
  background: transparent;
  color: var(--_ink);
}

/* --- size: только отступы и ступень ---------------------------------- */

.a2ui-kit .a2ui-btn--sm {
  --_pad-y: 4px;
  --_pad-x: 10px;
  --_font: var(--a2ui-text-size-sub);
}

.a2ui-kit .a2ui-btn--lg { --_pad-y: 10px; --_pad-x: 20px; }

/* --- tone: только цвет ----------------------------------------------- */

.a2ui-kit .a2ui-btn--accent { --_ink: var(--a2ui-btn-accent); }
.a2ui-kit .a2ui-btn--danger { --_ink: var(--a2ui-btn-danger); }

/* --- модификаторы ----------------------------------------------------- */

.a2ui-kit .a2ui-btn--dashed { border-style: dashed; }

/* Icon-only: квадрат по высоте своего размера, подпись живёт в aria-label. */
.a2ui-kit .a2ui-btn--icon-only {
  padding: var(--_pad-y);
  aspect-ratio: 1;
}

.a2ui-kit .a2ui-chevron {
  flex: none;
  width: 1em;
  height: 1em;
  transition: transform 120ms ease;
}

/* Раскрытое состояние ставит библиотека своими data-атрибутами: шеврон
   больше не получает состояние пропсом и не может разъехаться с панелью. */
.a2ui-kit [data-panel-open] .a2ui-chevron,
.a2ui-kit [data-popup-open] .a2ui-chevron { transform: rotate(90deg); }

.a2ui-kit .a2ui-caret {
  flex: none;
  width: 1em;
  height: 1em;
  transition: transform 120ms ease;
}

.a2ui-kit [data-popup-open] .a2ui-caret { transform: rotate(180deg); }

.a2ui-kit .a2ui-btn__icon {
  display: block;
  width: 1em;
  height: 1em;
  flex: none;
}

/* --- состояния -------------------------------------------------------- */

.a2ui-kit .a2ui-btn:hover {
  background: transparent;
  border-color: var(--a2ui-btn-text-muted);
}
.a2ui-kit .a2ui-btn--filled:hover { background: var(--_ink); border-color: transparent; }
.a2ui-kit .a2ui-btn--link:hover {
  background: transparent;
  border-color: transparent;
  text-decoration: underline;
}
.a2ui-kit .a2ui-btn:focus-visible {
  outline: 2px solid var(--a2ui-btn-accent);
  outline-offset: 2px;
}
.a2ui-kit .a2ui-btn:disabled,
.a2ui-kit .a2ui-btn[data-disabled] {
  opacity: 0.45;
  cursor: not-allowed;
}
`;
