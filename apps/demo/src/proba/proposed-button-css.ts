/** Черновик кнопки: геометрия одна, цвета из слоя `--a2ui-btn-*`, кегль — со ступени `body`. */
export const PROPOSED_BUTTON_CSS = `
.a2ui-proba .a2ui-btn {
  --_fg: var(--a2ui-btn-fg, #1f1f1e);
  --_surface: var(--a2ui-btn-surface, #fafaf9);
  --_border: var(--a2ui-btn-border, #e5e4e1);
  --_muted: var(--a2ui-btn-text-muted, #6e6e6a);
  --_accent: var(--a2ui-btn-accent, #245a87);
  --_danger: var(--a2ui-btn-danger, #dc2626);

  --_ink: var(--_fg);
  --_pad-y: 8px;
  --_pad-x: 14px;
  --_font: 14px;

  appearance: none;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: var(--_pad-y) var(--_pad-x);
  border-radius: 9px;
  border: 1px solid var(--_border);
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

.a2ui-proba .a2ui-btn--filled {
  border-color: transparent;
  background: var(--_ink);
  color: var(--_surface);
}

/* outline — базовое состояние, отдельных правил не требует. */

.a2ui-proba .a2ui-btn--link {
  padding: 4px 0;
  border-color: transparent;
  background: transparent;
  color: var(--_ink);
}

/* --- size: только отступы и кегль ------------------------------------ */

/* Кегль берётся со ступеней шкалы, а не назначается кнопке отдельно:
   md и lg — body (14px), sm — sub (11px). Поэтому sm и lg отличаются от md
   отступами, а размер шрифта у кнопки перестаёт быть четвёртой ступенью. */
.a2ui-proba .a2ui-btn--sm { --_pad-y: 4px; --_pad-x: 10px; --_font: 11px; }
.a2ui-proba .a2ui-btn--lg { --_pad-y: 10px; --_pad-x: 20px; }

/* --- tone: только цвет ----------------------------------------------- */

.a2ui-proba .a2ui-btn--accent { --_ink: var(--_accent); }
.a2ui-proba .a2ui-btn--danger { --_ink: var(--_danger); }

/* --- модификаторы ----------------------------------------------------- */

.a2ui-proba .a2ui-btn--dashed { border-style: dashed; }

/* Icon-only: квадрат по высоте своего размера, подпись живёт в aria-label. */
.a2ui-proba .a2ui-btn--icon-only {
  padding: var(--_pad-y);
  aspect-ratio: 1;
}

.a2ui-proba .a2ui-btn__icon {
  display: block;
  width: 1em;
  height: 1em;
  flex: none;
}

/* --- состояния -------------------------------------------------------- */

.a2ui-proba .a2ui-btn:hover { background: transparent; border-color: var(--_muted); }
.a2ui-proba .a2ui-btn--filled:hover { background: var(--_ink); border-color: transparent; }
.a2ui-proba .a2ui-btn--link:hover {
  background: transparent;
  border-color: transparent;
  text-decoration: underline;
}
.a2ui-proba .a2ui-btn:focus-visible {
  outline: 2px solid var(--_accent);
  outline-offset: 2px;
}
.a2ui-proba .a2ui-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
`;
