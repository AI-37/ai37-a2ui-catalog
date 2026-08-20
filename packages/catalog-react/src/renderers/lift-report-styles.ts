import {hashCss} from './hash-css';
import {tokens} from './tokens';

/** Префикс `href` стилевого слоя; полный ключ несёт хэш содержимого. */
export const LIFT_REPORT_STYLE_PREFIX = 'a2ui-lift-report';

/**
 * Стили `LiftReport` одной строкой (канон ConstructionsEditor/ThermalReport:
 * без отдельного CSS-файла и бандлера). Классы с префиксом `a2ui-lr-` —
 * единственная защита от коллизий в чужом хосте. Кнопки и ссылки сброшены от
 * корня (`.a2ui-lr .a2ui-lr-btn`) — правила хоста на элементе их перебивали бы.
 * Цвета — только токены `--a2ui-*` (группа `lr` + общие статусные).
 *
 * Метрики — канон отчёта (thermal-report-styles.ts): кегли в px (14 титулы /
 * 12.5 вторичный текст / 10.5 uppercase-подписи с letter-spacing 0.21px),
 * weight 500 у титулов, кнопки 13px с радиусом 9px без жирности, карточка
 * 14px, строки 10px, serif-заголовок вердикта. Своё против teplo — акцентная
 * рамка рекомендуемого варианта «Что изменить» и раскрываемый протокол
 * (`<details>`).
 */
export const LIFT_REPORT_CSS = `
.a2ui-lr {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 12px;
  color: ${tokens.lrText};
  box-sizing: border-box;
  font-size: 14px;
}
.a2ui-lr__card {
  border-radius: 14px;
  border: 1px solid ${tokens.lrBorder};
  background: ${tokens.lrSurface};
  overflow: hidden;
}
.a2ui-lr__section {
  padding: 16px 20px;
}
.a2ui-lr__section + .a2ui-lr__section {
  border-top: 1px solid ${tokens.lrBorder};
}

/* Вердикт */
.a2ui-lr__badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
}
.a2ui-lr__badge--pass { color: ${tokens.success}; }
.a2ui-lr__badge--fail { color: ${tokens.danger}; }
.a2ui-lr__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex: none;
}
.a2ui-lr__headline {
  margin: 10px 0 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 500;
  font-size: 26px;
  line-height: 1.2;
  color: ${tokens.lrText};
}
.a2ui-lr__summary {
  margin: 8px 0 0;
  color: ${tokens.lrTextMuted};
  font-size: 13px;
  line-height: 1.45;
}

/* Заголовок списочной секции («ЧТО ИЗМЕНИТЬ») */
.a2ui-lr__list-label {
  margin: 0 0 10px;
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${tokens.lrTextMuted};
}
.a2ui-lr__rows { display: grid; gap: 10px; }
.a2ui-lr__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 12px 14px;
  border: 1px solid ${tokens.lrBorder};
  border-radius: 10px;
  background: ${tokens.lrSurface};
}
/* Рекомендуемый вариант — акцентная (success) рамка макета. */
.a2ui-lr__row--pass { border-color: ${tokens.success}; }
.a2ui-lr__row-main { display: grid; gap: 3px; min-width: 0; flex: 1 1 240px; }
.a2ui-lr__row-title { font-weight: 500; line-height: 1.3; }
.a2ui-lr__row-detail { color: ${tokens.lrTextMuted}; font-size: 12.5px; line-height: 1.35; }
.a2ui-lr__row-side { display: inline-flex; align-items: center; gap: 10px; flex: none; }

/* Статус-лейбл варианта без действия */
.a2ui-lr__status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 500;
}
.a2ui-lr__status--pass { color: ${tokens.success}; }
.a2ui-lr__status--fail { color: ${tokens.danger}; }
.a2ui-lr__status--neutral { color: ${tokens.lrTextMuted}; }

/* Кнопки — канон отчёта: 13px, радиус 9px, без жирности; тёмная — border
   transparent + заливка текстовым цветом. */
.a2ui-lr .a2ui-lr-btn {
  appearance: none;
  margin: 0;
  padding: 8px 14px;
  border-radius: 9px;
  border: 1px solid ${tokens.lrBorder};
  background: transparent;
  color: ${tokens.lrText};
  font: inherit;
  font-size: 13px;
  line-height: 13px;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
}
.a2ui-lr .a2ui-lr-btn--solid {
  border-color: transparent;
  background: ${tokens.lrText};
  color: ${tokens.lrSurface};
}
.a2ui-lr .a2ui-lr-btn--link {
  padding: 4px 0;
  border-color: transparent;
  color: ${tokens.lrAccent};
}
/* Ховер объявляем сами (канон CE): у хоста он объявлен на элементе
   (.a2ui-surface button:hover с заливкой и рамкой) и красит серой пилюлей
   всё, у чего нет своего состояния. */
.a2ui-lr .a2ui-lr-btn:hover {
  background: transparent;
  border-color: ${tokens.lrTextMuted};
}
.a2ui-lr .a2ui-lr-btn--solid:hover {
  background: ${tokens.lrText};
  border-color: transparent;
}
.a2ui-lr .a2ui-lr-btn--link:hover {
  background: transparent;
  border-color: transparent;
  text-decoration: underline;
}

/* Исходные данные */
.a2ui-lr__inputs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 13px 14px 13px 20px;
  background: ${tokens.lrSurfaceSunken};
  border-bottom: 1px solid ${tokens.lrBorder};
}
.a2ui-lr__inputs-title { font-size: 14px; line-height: 14px; font-weight: 500; }
.a2ui-lr__group { display: grid; gap: 8px; }
.a2ui-lr__group + .a2ui-lr__group { margin-top: 14px; }
.a2ui-lr__group-label {
  margin: 0;
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${tokens.lrTextMuted};
}
.a2ui-lr__group--warning .a2ui-lr__group-label { color: ${tokens.warning}; }
.a2ui-lr__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.a2ui-lr__chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid ${tokens.lrBorder};
  border-radius: 999px;
  font-size: 12.5px;
}
.a2ui-lr__group--warning .a2ui-lr__chip { border-style: dashed; }
.a2ui-lr__chip-label { color: ${tokens.lrTextMuted}; }
.a2ui-lr__chip-value { font-weight: 500; }
.a2ui-lr__note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${tokens.lrSurfaceSunken};
  color: ${tokens.lrTextMuted};
  font-size: 12.5px;
  line-height: 1.45;
}
.a2ui-lr__note-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${tokens.warning};
  flex: none;
  margin-top: 5px;
}

/* Протокол — нативный <details>: строка-сводка раскрывает краткий вывод. */
.a2ui-lr__protocol {
  border-radius: 14px;
  border: 1px solid ${tokens.lrBorder};
  background: ${tokens.lrSurface};
}
.a2ui-lr__protocol-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 14px 20px;
  cursor: pointer;
  list-style: none;
}
/* Свой маркер вместо нативного треугольника (WebKit прячется отдельно). */
.a2ui-lr__protocol-head::-webkit-details-marker { display: none; }
.a2ui-lr__protocol-title { font-size: 14px; font-weight: 500; }
.a2ui-lr__protocol-meta { color: ${tokens.lrTextMuted}; font-size: 12.5px; }
.a2ui-lr__protocol-chevron {
  display: inline-block;
  color: ${tokens.lrTextMuted};
  margin-left: 10px;
  flex: none;
}
/* Состояние раскрытия держит сам <details> — шеврон поворачивает CSS,
   React-стейта у протокола нет. */
.a2ui-lr__protocol[open] .a2ui-lr__protocol-chevron { transform: rotate(90deg); }
/* От корня: сброс .a2ui-lr .a2ui-lr-btn (margin: 0) специфичнее одного класса. */
.a2ui-lr .a2ui-lr__protocol-download { margin-left: auto; }
/* «Скачать ▾» — dropdown форматов (download-format-menu, план report-download ред. 2). */
.a2ui-dfm { position: relative; display: inline-block; }
.a2ui-dfm__toggle { list-style: none; cursor: pointer; }
.a2ui-dfm__toggle::-webkit-details-marker { display: none; }
.a2ui-dfm__list {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 10;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid ${tokens.lrBorder};
  background: ${tokens.lrSurface};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.a2ui-dfm__item {
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: ${tokens.lrText};
  text-decoration: none;
  white-space: nowrap;
}
.a2ui-dfm__item:hover { background: ${tokens.lrBorder}; }
.a2ui-lr__protocol-body {
  margin: 0;
  padding: 14px 20px 16px;
  border-top: 1px solid ${tokens.lrBorder};
  color: ${tokens.lrTextMuted};
  font-size: 12.5px;
  line-height: 1.5;
  white-space: pre-wrap;
  font-family: inherit;
  overflow-x: auto;
}
`;

export const LIFT_REPORT_STYLE_HREF = `${LIFT_REPORT_STYLE_PREFIX}-${hashCss(LIFT_REPORT_CSS)}`;
