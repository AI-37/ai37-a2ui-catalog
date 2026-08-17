import {hashCss} from './hash-css';
import {tokens} from './tokens';

/** Префикс `href` стилевого слоя; полный ключ несёт хэш содержимого. */
export const INSOLATION_REPORT_STYLE_PREFIX = 'a2ui-insolation-report';

/**
 * Стили `InsolationReport` одной строкой (канон ThermalReport/KeoReport).
 * Классы с префиксом `a2ui-ir-`; кнопки сброшены от корня
 * (`.a2ui-ir .a2ui-ir-btn`) — правила хоста на элементе перебивали бы их.
 * Цвета — только токены `--a2ui-*` (группа `ir` + общие статусные); цвета
 * сегментов таймлайна — свои токены `ir-sun`/`ir-shadow` с INHERITS на
 * success/subtle, чтобы тёмная тема хоста красила полосу вместе с карточкой.
 */
export const INSOLATION_REPORT_CSS = `
.a2ui-ir {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 12px;
  color: ${tokens.irText};
  box-sizing: border-box;
  font-size: 14px;
}
.a2ui-ir__card {
  border-radius: 14px;
  border: 1px solid ${tokens.irBorder};
  background: ${tokens.irSurface};
  overflow: hidden;
}
.a2ui-ir__section { padding: 16px 20px; }
.a2ui-ir__section + .a2ui-ir__section { border-top: 1px solid ${tokens.irBorder}; }

/* Вердикт */
.a2ui-ir__badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
}
.a2ui-ir__badge--pass { color: ${tokens.success}; }
.a2ui-ir__badge--fail { color: ${tokens.danger}; }
.a2ui-ir__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex: none;
}
.a2ui-ir__headline {
  margin: 10px 0 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 500;
  font-size: 26px;
  line-height: 1.2;
  color: ${tokens.irText};
}
.a2ui-ir__summary {
  margin: 8px 0 0;
  color: ${tokens.irTextMuted};
  font-size: 13px;
  line-height: 1.45;
}

.a2ui-ir__list-label {
  margin: 0 0 10px;
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${tokens.irTextMuted};
}
.a2ui-ir__rows { display: grid; gap: 10px; }

/* Таймлайн: полоса от axisStart до axisEnd, промежутки без сегментов —
   нейтральный фон полосы. */
.a2ui-ir__bar {
  position: relative;
  height: 26px;
  border-radius: 8px;
  background: ${tokens.irSurfaceSunken};
  overflow: hidden;
}
.a2ui-ir__segment {
  position: absolute;
  top: 0;
  bottom: 0;
  /* Узкий сегмент (< 15 мин) иначе исчезает совсем — подпись при этом живёт в
     caption под полосой. */
  min-width: 4px;
}
.a2ui-ir__segment--sun { background: ${tokens.irSun}; }
.a2ui-ir__segment--shadow {
  background: color-mix(in srgb, ${tokens.irShadow} 45%, transparent);
}
.a2ui-ir__ticks { position: relative; height: 16px; margin-top: 6px; }
.a2ui-ir__tick {
  position: absolute;
  transform: translateX(-50%);
  color: ${tokens.irTextMuted};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.a2ui-ir__timeline-caption {
  margin: 8px 0 0;
  color: ${tokens.irTextMuted};
  font-size: 12.5px;
  line-height: 1.45;
}

/* Проверки */
.a2ui-ir__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 12px 14px;
  border: 1px solid ${tokens.irBorder};
  border-radius: 10px;
  background: ${tokens.irSurface};
}
.a2ui-ir__row-main { display: grid; gap: 3px; min-width: 0; flex: 1 1 240px; }
.a2ui-ir__row-title { font-weight: 500; line-height: 1.3; }
.a2ui-ir__row-detail { color: ${tokens.irTextMuted}; font-size: 12.5px; line-height: 1.35; }
.a2ui-ir__row-side { display: inline-flex; align-items: center; gap: 10px; flex: none; }
.a2ui-ir__status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 500;
}
.a2ui-ir__status--pass { color: ${tokens.success}; }
.a2ui-ir__status--fail { color: ${tokens.danger}; }
.a2ui-ir__status--info { color: ${tokens.irTextMuted}; }

/* Кнопки — канон CE: 13px, радиус 9px, без жирности. */
.a2ui-ir .a2ui-ir-btn {
  appearance: none;
  margin: 0;
  padding: 8px 14px;
  border-radius: 9px;
  border: 1px solid ${tokens.irBorder};
  background: transparent;
  color: ${tokens.irText};
  font: inherit;
  font-size: 13px;
  line-height: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.a2ui-ir .a2ui-ir-btn--solid {
  border-color: transparent;
  background: ${tokens.irText};
  color: ${tokens.irSurface};
}
.a2ui-ir .a2ui-ir-btn--link {
  padding: 4px 0;
  border-color: transparent;
  color: ${tokens.irAccent};
}
/* Ховер объявляем сами: у хоста он на элементе и красит серой пилюлей всё,
   у чего нет своего состояния (канон CE/TR). */
.a2ui-ir .a2ui-ir-btn:hover { background: transparent; border-color: ${tokens.irTextMuted}; }
.a2ui-ir .a2ui-ir-btn--solid:hover { background: ${tokens.irText}; border-color: transparent; }
.a2ui-ir .a2ui-ir-btn--link:hover {
  background: transparent;
  border-color: transparent;
  text-decoration: underline;
}

/* Допущения / заметки */
.a2ui-ir__note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${tokens.irSurfaceSunken};
  color: ${tokens.irTextMuted};
  font-size: 12.5px;
  line-height: 1.45;
}
.a2ui-ir__note + .a2ui-ir__note { margin-top: 8px; }
.a2ui-ir__note-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${tokens.warning};
  flex: none;
  margin-top: 5px;
}

/* Исходные данные */
.a2ui-ir__inputs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 13px 14px 13px 20px;
  background: ${tokens.irSurfaceSunken};
  border-bottom: 1px solid ${tokens.irBorder};
}
.a2ui-ir__inputs-title { font-size: 14px; line-height: 14px; font-weight: 500; }
.a2ui-ir__group { display: grid; gap: 8px; }
.a2ui-ir__group + .a2ui-ir__group { margin-top: 14px; }
.a2ui-ir__group-label {
  margin: 0;
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${tokens.irTextMuted};
}
.a2ui-ir__group--warning .a2ui-ir__group-label { color: ${tokens.warning}; }
.a2ui-ir__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.a2ui-ir__chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid ${tokens.irBorder};
  border-radius: 999px;
  font-size: 12.5px;
}
.a2ui-ir__group--warning .a2ui-ir__chip { border-style: dashed; }
.a2ui-ir__chip-label { color: ${tokens.irTextMuted}; }
.a2ui-ir__chip-value { font-weight: 500; }

/* Протокол — одна неразворачиваемая строка. */
.a2ui-ir__protocol {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 14px;
  border: 1px solid ${tokens.irBorder};
  background: ${tokens.irSurface};
}
.a2ui-ir__protocol-title { font-size: 14px; font-weight: 500; }
.a2ui-ir__protocol-meta { color: ${tokens.irTextMuted}; font-size: 12.5px; }
/* От корня: сброс .a2ui-ir .a2ui-ir-btn (margin: 0) специфичнее одного класса. */
.a2ui-ir .a2ui-ir__protocol-download { margin-left: auto; }
`;

export const INSOLATION_REPORT_STYLE_HREF = `${INSOLATION_REPORT_STYLE_PREFIX}-${hashCss(
  INSOLATION_REPORT_CSS,
)}`;
