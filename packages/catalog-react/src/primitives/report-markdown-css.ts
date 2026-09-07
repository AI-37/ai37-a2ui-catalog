/**
 * Markdown отчёта: протокол расчёта — это разделы, формулы, списки и таблица
 * исходных данных. Своей шкалы здесь нет — только ступени набора: заголовки
 * протокола (`##`, `###`) живут внутри карточки и заголовками карточки быть не
 * должны, поэтому крупнее `body` они не становятся.
 *
 * Отступы съедены у корня и восстановлены сеткой: браузерные `margin` абзацев
 * и заголовков схлопываются друг с другом по-разному, и ровного ритма из них
 * не выходит.
 */
export const KIT_REPORT_MARKDOWN_CSS = `
.a2ui-kit .a2ui-md {
  display: grid;
  gap: 10px;
  font-size: var(--a2ui-text-size-body);
  line-height: var(--a2ui-text-line-body);
  /* Длинная формула или адрес не должны растягивать карточку: перенос по
     словам, а рвётся только то слово, которое само не помещается. */
  overflow-wrap: break-word;
  min-width: 0;
}

.a2ui-kit .a2ui-md > * { margin: 0; }

/* Заголовок раздела отделяется сверху, но не первый — иначе тело панели
   получает двойной отступ от собственного padding. */
.a2ui-kit .a2ui-md :is(h1, h2, h3, h4, h5, h6) {
  font-size: var(--a2ui-text-size-body);
  line-height: var(--a2ui-text-line-body);
  font-weight: var(--a2ui-text-weight-strong);
  margin: 0;
}

.a2ui-kit .a2ui-md :is(h1, h2, h3, h4, h5, h6):not(:first-child) { margin-top: 6px; }

/* Верхний уровень протокола («1. Исходные данные») — отбивка крупнее и
   разделитель: разделов пять, и без границы они сливаются в один поток. */
.a2ui-kit .a2ui-md :is(h1, h2):not(:first-child) {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--a2ui-card-border);
}

.a2ui-kit .a2ui-md :is(ul, ol) {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 4px;
}

.a2ui-kit .a2ui-md li { margin: 0; }

.a2ui-kit .a2ui-md hr {
  height: 1px;
  border: none;
  background: var(--a2ui-card-border);
}

.a2ui-kit .a2ui-md :is(code, pre) {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: var(--a2ui-text-size-sub);
}

.a2ui-kit .a2ui-md code {
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--a2ui-card-surface-sunken);
}

.a2ui-kit .a2ui-md pre {
  overflow-x: auto;
  padding: 10px 12px;
  border-radius: var(--a2ui-card-radius-sunken);
  background: var(--a2ui-card-surface-sunken);
}

.a2ui-kit .a2ui-md pre code { padding: 0; background: none; }

/* Выключная формула шире колонки — едет она, а не карточка. По вертикали
   скролл запрещён: у KaTeX высота считается точно, и лишняя ось дала бы
   обрезанные индексы вместо переноса. */
.a2ui-kit .a2ui-md .katex-display {
  margin: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 2px;
}

/* Своя таблица набора уже несёт геометрию (a2ui-table); здесь только снимаем
   внешний отступ обёртки со скроллом. */
.a2ui-kit .a2ui-md .a2ui-table-scroll { margin: 0; }
`;
