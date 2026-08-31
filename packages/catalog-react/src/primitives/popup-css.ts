import {declareTokens} from './declare-tokens';
import {POPUP_TOKEN_NAMES} from './kit-tokens';

/**
 * Общий попап трёх примитивов: подсказки справочника, выпадающий список, меню.
 * Токены объявлены на нём самом — попап уезжает в портал и слоя поверхности не
 * видит. Набор — подмножество общего слоя (`POPUP_TOKEN_NAMES`), значения
 * берутся из того же массива, поэтому разойтись им нечем.
 *
 * Тему попап тоже не видит по той же причине: `color-scheme` наследуется, а
 * предка с темой у портального узла нет. Схему кладёт на узел `usePopupScheme`
 * от якоря — вторых значений темы это не заводит, приезжает только то, как
 * читать уже объявленные пары.
 */
export const KIT_POPUP_CSS = `
.a2ui-popup {
${declareTokens(POPUP_TOKEN_NAMES)}

  box-sizing: border-box;
  max-height: 240px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--a2ui-card-border);
  border-radius: 10px;
  background: var(--a2ui-card-surface-plain);
  box-shadow: 0 8px 24px var(--a2ui-shadow-popup);
  font-family: var(--a2ui-font);
  color: var(--a2ui-text-color);
  font-size: var(--a2ui-text-size-body);
  line-height: var(--a2ui-text-line-body);
}

/* Список под полем повторяет его ширину; меню живёт по своей. */
.a2ui-popup--anchored { width: var(--anchor-width); }
.a2ui-popup--wide { min-width: var(--anchor-width); }

/* Блок, а не grid: у одной строки подсветка совпадения — inline-кусок текста,
   и в сетке она становилась отдельной строкой («Мос» / «ква»). Многострочная
   опция набирается блочными слотами ниже. */
.a2ui-popup__item {
  display: block;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  outline: none;
  color: inherit;
  text-decoration: none;
}

/* data-highlighted ставит библиотека — и на мышь, и на стрелки: одно правило
   закрывает и hover, и клавиатуру. */
.a2ui-popup__item[data-highlighted] {
  background: var(--a2ui-control-highlight);
}

.a2ui-popup__item--danger { color: var(--a2ui-text-color-danger); }

.a2ui-popup__item[data-selected] {
  color: var(--a2ui-text-color-accent);
  font-weight: var(--a2ui-text-weight-strong);
}

.a2ui-popup__title { display: block; }

.a2ui-popup__group,
.a2ui-popup__meta {
  display: block;
  font-size: var(--a2ui-text-size-sub);
  line-height: var(--a2ui-text-line-sub);
  color: var(--a2ui-text-color-muted);
}

.a2ui-popup__status,
.a2ui-popup__empty {
  display: block;
  padding: 6px 8px;
  font-size: var(--a2ui-text-size-sub);
  line-height: var(--a2ui-text-line-sub);
  color: var(--a2ui-text-color-muted);
}

/* Пустые статус и «ничего не найдено» занимали полосу над списком: узлы
   библиотека рендерит всегда, содержимое кладём мы. */
.a2ui-popup__status:empty,
.a2ui-popup__empty:empty { display: none; }

.a2ui-popup__match { font-weight: var(--a2ui-text-weight-strong); }
`;
