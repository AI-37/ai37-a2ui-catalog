/** Типографика: три ступени и два модификатора. Значения — только из слоя токенов. */
export const KIT_TYPOGRAPHY_CSS = `
/* --- ступени ---------------------------------------------------------- */

.a2ui-kit .a2ui-t--display {
  font-size: var(--a2ui-text-size-display);
  line-height: var(--a2ui-text-line-display);
  font-weight: var(--a2ui-text-weight-strong);
  letter-spacing: normal;
  text-transform: none;
}

.a2ui-kit .a2ui-t--body {
  font-size: var(--a2ui-text-size-body);
  line-height: var(--a2ui-text-line-body);
  font-weight: 400;
  letter-spacing: normal;
  text-transform: none;
}

.a2ui-kit .a2ui-t--sub {
  font-size: var(--a2ui-text-size-sub);
  line-height: var(--a2ui-text-line-sub);
  font-weight: 400;
  letter-spacing: normal;
  text-transform: none;
}

/* --- модификаторы: кегль берут у ступени ------------------------------ */

.a2ui-kit .a2ui-t--strong { font-weight: var(--a2ui-text-weight-strong); }

/* Семейство — ось существующей ступени, а не четвёртая ступень шкалы:
   'display' + 'serif' и есть заголовок вердикта отчёта. */
.a2ui-kit .a2ui-t--serif { font-family: var(--a2ui-font-serif); }

.a2ui-kit .a2ui-t--overline {
  font-weight: var(--a2ui-text-weight-strong);
  letter-spacing: var(--a2ui-text-overline-tracking);
  text-transform: uppercase;
}

/* --- цвет ------------------------------------------------------------- */

.a2ui-kit .a2ui-t--muted { color: var(--a2ui-text-color-muted); }
.a2ui-kit .a2ui-t--accent { color: var(--a2ui-text-color-accent); }
.a2ui-kit .a2ui-t--danger { color: var(--a2ui-text-color-danger); }
.a2ui-kit .a2ui-t--success { color: var(--a2ui-text-color-success); }
.a2ui-kit .a2ui-t--warning { color: var(--a2ui-text-color-warning); }
.a2ui-kit .a2ui-t--on-fill { color: var(--a2ui-text-color-on-fill); }
`;
