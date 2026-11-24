/**
 * Строка протокола: лейбл, мета и действие в правом краю. Без полного текста
 * в props раскрытия нет. С ним (MCP App) под строкой — документ протокола
 * `.a2ui-protocol-doc`: markdown агента с формулами MathML.
 */
export const KIT_REPORT_PROTOCOL_CSS = `
.a2ui-kit .a2ui-protocol {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 14px;
}

/* Действие уезжает вправо само: в середине строки может не быть меты, и
   распорку пришлось бы держать пустым элементом. */
.a2ui-kit .a2ui-protocol__action { margin-left: auto; }

/* Документ протокола: плотнее статьи — это справка под отчётом. Широкие
   таблицы и формулы прокручиваются сами, карточку не распирают. */
.a2ui-kit .a2ui-protocol-doc {
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.a2ui-kit .a2ui-protocol-doc > :first-child { margin-top: 0; }
.a2ui-kit .a2ui-protocol-doc > :last-child { margin-bottom: 0; }
.a2ui-kit .a2ui-protocol-doc :is(h1, h2, h3, h4) {
  margin: 1.1em 0 0.4em;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.3;
}
.a2ui-kit .a2ui-protocol-doc h2 { font-size: 1rem; }
.a2ui-kit .a2ui-protocol-doc :is(p, ul, ol) { margin: 0.4em 0; }
.a2ui-kit .a2ui-protocol-doc :is(ul, ol) { padding-left: 1.3em; }
.a2ui-kit .a2ui-protocol-doc table {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 0.5em 0;
}
.a2ui-kit .a2ui-protocol-doc :is(th, td) {
  padding: 4px 8px;
  border-bottom: 1px solid var(--a2ui-card-border);
  text-align: left;
  vertical-align: top;
}
/* Блочная формула прокручивается обёрткой KaTeX, а не самим <math>: у него
   высокие знаки (дроби, скобки) включали ещё и вертикальную прокрутку. */
.a2ui-kit .a2ui-protocol-doc .katex-display {
  display: block;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 0.5em 0;
  padding: 2px 0;
}
`;
