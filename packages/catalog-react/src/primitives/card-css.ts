/** Карточка: два уровня, вложенность считает CSS (`.a2ui-card .a2ui-card`). Значения — из слоя токенов. */
export const KIT_CARD_CSS = `
.a2ui-kit .a2ui-card {
  --_bg: var(--a2ui-card-surface);
  --_radius: var(--a2ui-card-radius);

  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 1px solid var(--a2ui-card-border);
  border-radius: var(--_radius);
  background: var(--_bg);
  text-align: left;
  font: inherit;
  color: inherit;
}

/* Вложенность считает CSS: карточка внутри карточки — второй уровень. */
.a2ui-kit .a2ui-card .a2ui-card {
  --_bg: var(--a2ui-card-surface-sunken);
  --_radius: var(--a2ui-card-radius-sunken);
}

/* Третьего уровня нет: глубже второго карточка возвращается на светлый фон,
   иначе стопка утопленных прямоугольников превращается в кашу. */
.a2ui-kit .a2ui-card .a2ui-card .a2ui-card {
  --_bg: var(--a2ui-card-surface);
}

/* --- тон: явный уровень, когда вложенность не совпадает с глубиной ----- */

.a2ui-kit .a2ui-card--surface {
  --_bg: var(--a2ui-card-surface);
  --_radius: var(--a2ui-card-radius);
}
.a2ui-kit .a2ui-card--sunken {
  --_bg: var(--a2ui-card-surface-sunken);
  --_radius: var(--a2ui-card-radius-sunken);
}
.a2ui-kit .a2ui-card--plain { --_bg: var(--a2ui-card-surface-plain); }

/* --- модификаторы ------------------------------------------------------ */

.a2ui-kit .a2ui-card--flat { border-color: transparent; }
.a2ui-kit .a2ui-card--invalid { border-color: var(--a2ui-card-danger); }

/* Кликабельная карточка — кнопка: курсор и ховер объявляем сами, у хоста они
   на элементе и красят серой пилюлей всё без своего состояния. */
.a2ui-kit button.a2ui-card { cursor: pointer; }
.a2ui-kit button.a2ui-card:hover { background: var(--_bg); border-color: var(--a2ui-card-border); }
.a2ui-kit button.a2ui-card:focus-visible {
  outline: 2px solid var(--a2ui-text-color-accent);
  outline-offset: 2px;
}

/* --- шапка и тело ------------------------------------------------------ */

/* Слоты переносятся: в узком контейнере титул, контекст и действие в одну
   строку не помещаются, а без переноса титул сжимался до нуля и его текст
   наезжал на соседний слот. Место уступает то, что стоит правее. */
.a2ui-kit .a2ui-card__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 12px;
}

/* Заголовок остаётся заголовком: Accordion.Header рендерит h3, а слоты шапки
   (пилюля, «✕») стоят рядом с ним, а не внутри — кнопка в заголовке читалась
   бы скринридером как часть названия конструкции. */
/* Минимум по содержимому (auto), а не 0: при нулевом минимуме шапка никогда
   не переносится — заголовок сжимается в столбик из букв, а пилюля и действие
   наезжают на него. С минимумом по содержимому строка не помещается честно, и
   правые слоты уезжают под заголовок. */
.a2ui-kit .a2ui-card__heading {
  flex: 1;
  display: flex;
  margin: 0;
  font: inherit;
  font-weight: var(--a2ui-text-weight-strong);
}

/* Только место в строке: оформление кнопки-раскрывашки приходит из
   примитива Button (variant="link"), а не отсюда. */
.a2ui-kit .a2ui-card__title {
  flex: 1;
  display: flex;
  /* justify-content явно: UA-стиль кнопки центрирует flex-содержимое, и
     заголовок уезжает от левого края. */
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  margin: 0;
  font: inherit;
  font-weight: var(--a2ui-text-weight-strong);
  text-align: left;
}

/* Два класса, чтобы перебить .a2ui-btn: у него своя горизонтальная
   центровка, отступы link-варианта и nowrap, а заголовок карточки обязан
   прижиматься влево и переноситься. */
/* Перенос по словам, а не по буквам: при anywhere минимальная ширина строки
   равна одной букве, и в узком контейнере flex сжимал сводку секции в
   вертикальный столбик из символов. break-word рвёт только то слово, которое
   само не помещается. */
.a2ui-kit .a2ui-btn.a2ui-card__title {
  padding: 0;
  white-space: normal;
  overflow-wrap: break-word;
}

.a2ui-kit .a2ui-card__body {
  display: grid;
  gap: 8px;
  padding: 0 12px 12px;
}

/* Панель раскрывашки: закрытая остаётся в DOM (keepMounted) ради валидного
   aria-controls, поэтому прячет её атрибут hidden, а не размонтирование. */
.a2ui-kit .a2ui-card__panel[hidden] { display: none; }
`;
