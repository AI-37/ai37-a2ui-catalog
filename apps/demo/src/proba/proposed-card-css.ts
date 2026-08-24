/** Черновик карточки: два уровня, вложенность считает CSS (`.a2ui-card .a2ui-card`). */
export const PROPOSED_CARD_CSS = `
.a2ui-proba .a2ui-card {
  --_surface: var(--a2ui-card-surface, #fafaf9);
  --_sunken: var(--a2ui-card-surface-sunken, #f1f1ef);
  --_plain: var(--a2ui-card-surface-plain, #ffffff);
  --_border: var(--a2ui-card-border, #e5e4e1);
  --_danger: var(--a2ui-card-danger, #dc2626);

  --_bg: var(--_surface);
  --_radius: 14px;

  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 1px solid var(--_border);
  border-radius: var(--_radius);
  background: var(--_bg);
  text-align: left;
  font: inherit;
  color: inherit;
}

/* Вложенность считает CSS: карточка внутри карточки — второй уровень. */
.a2ui-proba .a2ui-card .a2ui-card {
  --_bg: var(--_sunken);
  --_radius: 10px;
}

/* Третьего уровня нет: глубже второго карточка возвращается на светлый фон,
   иначе стопка утопленных прямоугольников превращается в кашу. */
.a2ui-proba .a2ui-card .a2ui-card .a2ui-card {
  --_bg: var(--_surface);
}

/* --- тон: явный уровень, когда вложенность не совпадает с глубиной ----- */

.a2ui-proba .a2ui-card--surface { --_bg: var(--_surface); --_radius: 14px; }
.a2ui-proba .a2ui-card--sunken { --_bg: var(--_sunken); --_radius: 10px; }
.a2ui-proba .a2ui-card--plain { --_bg: var(--_plain); }

/* --- модификаторы ------------------------------------------------------ */

.a2ui-proba .a2ui-card--flat { border-color: transparent; }
.a2ui-proba .a2ui-card--invalid { border-color: var(--_danger); }

/* Кликабельная карточка — кнопка: курсор и ховер объявляем сами, у хоста они
   на элементе и красят серой пилюлей всё без своего состояния. */
.a2ui-proba button.a2ui-card { cursor: pointer; }
.a2ui-proba button.a2ui-card:hover { background: var(--_bg); border-color: var(--_border); }
.a2ui-proba button.a2ui-card:focus-visible {
  outline: 2px solid var(--a2ui-text-color-accent, #245a87);
  outline-offset: 2px;
}

/* --- шапка и тело ------------------------------------------------------ */

.a2ui-proba .a2ui-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

/* Только место в строке: оформление кнопки-раскрывашки приходит из
   примитива Button (variant="link"), а не отсюда. */
.a2ui-proba .a2ui-card__title {
  flex: 1;
  display: flex;
  /* justify-content явно: UA-стиль кнопки центрирует flex-содержимое, и
     заголовок уезжает от левого края. */
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  min-width: 0;
  margin: 0;
  font: inherit;
  font-weight: 500;
  text-align: left;
}

/* Два класса, чтобы перебить .a2ui-btn: у него своя горизонтальная
   центровка, отступы link-варианта и nowrap, а заголовок карточки обязан
   прижиматься влево и переноситься. */
.a2ui-proba .a2ui-btn.a2ui-card__title {
  padding: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}

.a2ui-proba .a2ui-card__chevron {
  flex: none;
  width: 1em;
  height: 1em;
  transition: transform 120ms ease;
}

.a2ui-proba .a2ui-card__chevron--open { transform: rotate(90deg); }

.a2ui-proba .a2ui-card__body {
  display: grid;
  gap: 8px;
  padding: 0 12px 12px;
}
`;
