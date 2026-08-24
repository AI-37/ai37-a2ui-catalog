/** Черновик типографики: три ступени 26/14/11, одна гарнитура, цвета из слоя `--a2ui-text-color-*`. */
export const PROBA_TYPOGRAPHY_CSS = `
.a2ui-proba {
  --a2ui-font: system-ui, -apple-system, "Segoe UI", sans-serif;

  --a2ui-text-color: #1f1f1e;
  --a2ui-text-color-muted: #6e6e6a;
  --a2ui-text-color-accent: #245a87;
  --a2ui-text-color-danger: #dc2626;
  --a2ui-text-color-success: #16a34a;
  --a2ui-text-color-warning: #b45309;
  --a2ui-text-color-on-fill: #fafaf9;

  font-family: var(--a2ui-font);
  color: var(--a2ui-text-color);
}

/* --- ступени ---------------------------------------------------------- */

.a2ui-proba .a2ui-t--display {
  font-size: 26px;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
}

.a2ui-proba .a2ui-t--body {
  font-size: 14px;
  line-height: 1.35;
  font-weight: 400;
  letter-spacing: normal;
  text-transform: none;
}

.a2ui-proba .a2ui-t--sub {
  font-size: 11px;
  line-height: 1.3;
  font-weight: 400;
  letter-spacing: normal;
  text-transform: none;
}

/* --- модификаторы: кегль берут у ступени ------------------------------ */

.a2ui-proba .a2ui-t--strong { font-weight: 500; }

.a2ui-proba .a2ui-t--overline {
  font-weight: 500;
  letter-spacing: 0.21px;
  text-transform: uppercase;
}

/* --- цвет ------------------------------------------------------------- */

.a2ui-proba .a2ui-t--muted { color: var(--a2ui-text-color-muted); }
.a2ui-proba .a2ui-t--accent { color: var(--a2ui-text-color-accent); }
.a2ui-proba .a2ui-t--danger { color: var(--a2ui-text-color-danger); }
.a2ui-proba .a2ui-t--success { color: var(--a2ui-text-color-success); }
.a2ui-proba .a2ui-t--warning { color: var(--a2ui-text-color-warning); }
.a2ui-proba .a2ui-t--on-fill { color: var(--a2ui-text-color-on-fill); }
`;
