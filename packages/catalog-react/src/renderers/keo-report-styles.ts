import {hashCss} from './hash-css';
import {tokens} from './tokens';

/** Префикс `href` стилевого слоя; полный ключ несёт хэш содержимого. */
export const KEO_REPORT_STYLE_PREFIX = 'a2ui-keo-report';

/**
 * Стили `KeoReport` одной строкой (канон ThermalReport: без CSS-файла и
 * бандлера). Классы с префиксом `a2ui-kr-` — единственная защита от коллизий в
 * чужом хосте; кнопки сброшены от корня (`.a2ui-kr .a2ui-kr-btn`), иначе
 * хостовые правила на элементе их перебивают. Цвета — только токены `--a2ui-*`
 * (группа `kr` + общие статусные).
 *
 * Метрики — канон CE/TR: 14px титулы, 12.5px вторичный текст, 10.5px
 * uppercase-подписи с letter-spacing 0.21px, кнопки 13px с радиусом 9px,
 * карточка 14px. Своё, не переиспользованное из TR: карточки рекомендаций с
 * тоном.
 */
export const KEO_REPORT_CSS = `
.a2ui-kr {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 12px;
  color: ${tokens.krText};
  box-sizing: border-box;
  font-size: 14px;
}
.a2ui-kr__card {
  border-radius: 14px;
  border: 1px solid ${tokens.krBorder};
  background: ${tokens.krSurface};
  overflow: hidden;
}
.a2ui-kr__section { padding: 16px 20px; }
.a2ui-kr__section + .a2ui-kr__section { border-top: 1px solid ${tokens.krBorder}; }

/* Вердикт */
.a2ui-kr__badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
}
.a2ui-kr__badge--pass { color: ${tokens.success}; }
.a2ui-kr__badge--fail { color: ${tokens.danger}; }
.a2ui-kr__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex: none;
}
.a2ui-kr__headline {
  margin: 10px 0 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 500;
  font-size: 26px;
  line-height: 1.2;
  color: ${tokens.krText};
}
.a2ui-kr__summary {
  margin: 8px 0 0;
  color: ${tokens.krTextMuted};
  font-size: 13px;
  line-height: 1.45;
}

.a2ui-kr__list-label {
  margin: 0 0 10px;
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${tokens.krTextMuted};
}
.a2ui-kr__rows { display: grid; gap: 10px; }

/* Карточки «Что изменить»: тон задаёт рамку и цвет detail, кнопка appears
   только при action (Решение 2 design.md). */
.a2ui-kr__card-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 12px 14px;
  border: 1px solid ${tokens.krBorder};
  border-radius: 10px;
  background: ${tokens.krSurface};
}
.a2ui-kr__card-option--success {
  border-color: ${tokens.success};
  background: color-mix(in srgb, ${tokens.success} 6%, transparent);
}
.a2ui-kr__card-option-main { display: grid; gap: 3px; min-width: 0; flex: 1 1 240px; }
.a2ui-kr__card-option-title { font-weight: 500; line-height: 1.3; }
.a2ui-kr__card-option-detail { color: ${tokens.krTextMuted}; font-size: 12.5px; line-height: 1.35; }
.a2ui-kr__card-option--fail .a2ui-kr__card-option-detail { color: ${tokens.danger}; }

/* Строки помещений */
.a2ui-kr__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 12px 14px;
  border: 1px solid ${tokens.krBorder};
  border-radius: 10px;
  background: ${tokens.krSurface};
}
.a2ui-kr__row-main { display: grid; gap: 3px; min-width: 0; flex: 1 1 240px; }
.a2ui-kr__row-title { font-weight: 500; line-height: 1.3; }
.a2ui-kr__row-detail { color: ${tokens.krTextMuted}; font-size: 12.5px; line-height: 1.35; }
.a2ui-kr__row-side { display: inline-flex; align-items: center; gap: 10px; flex: none; }
.a2ui-kr__status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.a2ui-kr__status--pass { color: ${tokens.success}; }
.a2ui-kr__status--fail { color: ${tokens.danger}; }

/* Кнопки — канон CE: 13px, радиус 9px, без жирности. */
.a2ui-kr .a2ui-kr-btn {
  appearance: none;
  margin: 0;
  padding: 8px 14px;
  border-radius: 9px;
  border: 1px solid ${tokens.krBorder};
  background: transparent;
  color: ${tokens.krText};
  font: inherit;
  font-size: 13px;
  line-height: 13px;
  cursor: pointer;
  white-space: nowrap;
}
.a2ui-kr .a2ui-kr-btn--solid {
  border-color: transparent;
  background: ${tokens.krText};
  color: ${tokens.krSurface};
}
.a2ui-kr .a2ui-kr-btn--link {
  padding: 4px 0;
  border-color: transparent;
  color: ${tokens.krAccent};
}
/* Ховер объявляем сами: у хоста он объявлен на элементе и красит серой
   пилюлей всё, у чего нет своего состояния (канон CE/TR). */
.a2ui-kr .a2ui-kr-btn:hover { background: transparent; border-color: ${tokens.krTextMuted}; }
.a2ui-kr .a2ui-kr-btn--solid:hover { background: ${tokens.krText}; border-color: transparent; }
.a2ui-kr .a2ui-kr-btn--link:hover {
  background: transparent;
  border-color: transparent;
  text-decoration: underline;
}

/* Допущения / заметки */
.a2ui-kr__note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${tokens.krSurfaceSunken};
  color: ${tokens.krTextMuted};
  font-size: 12.5px;
  line-height: 1.45;
}
.a2ui-kr__note-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${tokens.warning};
  flex: none;
  margin-top: 5px;
}

/* Исходные данные */
.a2ui-kr__inputs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 13px 14px 13px 20px;
  background: ${tokens.krSurfaceSunken};
  border-bottom: 1px solid ${tokens.krBorder};
}
.a2ui-kr__inputs-title { font-size: 14px; line-height: 14px; font-weight: 500; }
.a2ui-kr__group { display: grid; gap: 8px; }
.a2ui-kr__group + .a2ui-kr__group { margin-top: 14px; }
.a2ui-kr__group-label {
  margin: 0;
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${tokens.krTextMuted};
}
.a2ui-kr__group--warning .a2ui-kr__group-label { color: ${tokens.warning}; }
.a2ui-kr__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.a2ui-kr__chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid ${tokens.krBorder};
  border-radius: 999px;
  font-size: 12.5px;
}
.a2ui-kr__group--warning .a2ui-kr__chip { border-style: dashed; }
.a2ui-kr__chip-label { color: ${tokens.krTextMuted}; }
.a2ui-kr__chip-value { font-weight: 500; }

/* Протокол — одна неразворачиваемая строка (канон после
   thermal-report-standard-buttons). */
.a2ui-kr__protocol {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 14px;
  border: 1px solid ${tokens.krBorder};
  background: ${tokens.krSurface};
}
.a2ui-kr__protocol-title { font-size: 14px; font-weight: 500; }
.a2ui-kr__protocol-meta { color: ${tokens.krTextMuted}; font-size: 12.5px; }
/* От корня: сброс .a2ui-kr .a2ui-kr-btn (margin: 0) специфичнее одного класса. */
.a2ui-kr .a2ui-kr__protocol-download { margin-left: auto; }
`;

export const KEO_REPORT_STYLE_HREF = `${KEO_REPORT_STYLE_PREFIX}-${hashCss(KEO_REPORT_CSS)}`;
