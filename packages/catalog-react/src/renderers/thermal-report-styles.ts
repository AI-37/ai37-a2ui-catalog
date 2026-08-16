import {hashCss} from './hash-css';
import {tokens} from './tokens';

/** Префикс `href` стилевого слоя; полный ключ несёт хэш содержимого. */
export const THERMAL_REPORT_STYLE_PREFIX = 'a2ui-thermal-report';

/**
 * Стили `ThermalReport` одной строкой (канон ConstructionsEditor: без
 * отдельного CSS-файла и бандлера). Классы с префиксом `a2ui-tr-` —
 * единственная защита от коллизий в чужом хосте. Кнопки сброшены от корня
 * (`.a2ui-tr .a2ui-tr-btn`) — правила хоста на элементе их перебивали бы.
 * Цвета — только токены `--a2ui-*` (группа `tr` + общие статусные).
 */
export const THERMAL_REPORT_CSS = `
.a2ui-tr {
  display: grid;
  width: 100%;
  min-width: 0;
  gap: 12px;
  color: ${tokens.trText};
  box-sizing: border-box;
  font-size: 0.95rem;
}
.a2ui-tr__card {
  border-radius: 14px;
  border: 1px solid ${tokens.trBorder};
  background: ${tokens.trSurface};
  overflow: hidden;
}
.a2ui-tr__section {
  padding: 16px 20px;
}
.a2ui-tr__section + .a2ui-tr__section {
  border-top: 1px solid ${tokens.trBorder};
}

/* Вердикт */
.a2ui-tr__badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.a2ui-tr__badge--pass { color: ${tokens.success}; }
.a2ui-tr__badge--fail { color: ${tokens.danger}; }
.a2ui-tr__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
  flex: none;
}
.a2ui-tr__headline {
  margin: 10px 0 0;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 500;
  font-size: 1.7rem;
  line-height: 1.2;
  color: ${tokens.trText};
}
.a2ui-tr__summary {
  margin: 8px 0 0;
  color: ${tokens.trTextMuted};
  line-height: 1.45;
}

/* Заголовок списочной секции («ПРОВЕРКИ», «КОНСТРУКЦИИ») */
.a2ui-tr__list-label {
  margin: 0 0 10px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${tokens.trTextMuted};
}
.a2ui-tr__rows { display: grid; gap: 8px; }
.a2ui-tr__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 12px 14px;
  border: 1px solid ${tokens.trBorder};
  border-radius: 10px;
  background: ${tokens.trSurface};
}
.a2ui-tr__row-main { display: grid; gap: 3px; min-width: 0; flex: 1 1 240px; }
.a2ui-tr__row-title { font-weight: 600; }
.a2ui-tr__row-detail { color: ${tokens.trTextMuted}; font-size: 0.88rem; }
.a2ui-tr__row-side { display: inline-flex; align-items: center; gap: 10px; flex: none; }

/* Статус проверки и чип отклонения */
.a2ui-tr__status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.88rem;
  font-weight: 500;
}
.a2ui-tr__status--pass { color: ${tokens.success}; }
.a2ui-tr__status--fail { color: ${tokens.danger}; }
.a2ui-tr__deviation {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 0.88rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.a2ui-tr__deviation--pass { color: ${tokens.success}; }
.a2ui-tr__deviation--fail { color: ${tokens.danger}; }

/* Кнопки: тёмная пилюля (действие строки) и контурная (исходные данные) */
.a2ui-tr .a2ui-tr-btn {
  appearance: none;
  border: none;
  margin: 0;
  padding: 8px 16px;
  border-radius: 999px;
  background: ${tokens.trText};
  color: ${tokens.trSurface};
  font: inherit;
  font-size: 0.88rem;
  cursor: pointer;
  white-space: nowrap;
}
.a2ui-tr .a2ui-tr-btn--outline {
  background: ${tokens.trSurface};
  color: ${tokens.trText};
  border: 1px solid ${tokens.trBorder};
}
.a2ui-tr .a2ui-tr-btn--link {
  background: transparent;
  color: ${tokens.trAccent};
  padding: 4px 0;
  border-radius: 6px;
}

/* Таблица слоёв */
.a2ui-tr__table-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 4px 14px;
  padding: 12px 20px;
  background: ${tokens.trSurfaceSunken};
  border-bottom: 1px solid ${tokens.trBorder};
}
.a2ui-tr__table-title { font-weight: 600; }
.a2ui-tr__table-meta { color: ${tokens.trTextMuted}; font-size: 0.85rem; }
.a2ui-tr__table-scroll { overflow-x: auto; }
.a2ui-tr__table {
  width: 100%;
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}
.a2ui-tr__table th,
.a2ui-tr__table td {
  padding: 10px 20px;
  text-align: right;
  white-space: nowrap;
}
.a2ui-tr__table th:first-child,
.a2ui-tr__table td:first-child {
  text-align: left;
  white-space: normal;
  width: 100%;
}
.a2ui-tr__table th {
  font-size: 0.8rem;
  font-weight: 500;
  color: ${tokens.trTextMuted};
  border-bottom: 1px solid ${tokens.trBorder};
}
.a2ui-tr__table td { border-bottom: 1px solid ${tokens.borderFaint}; }
.a2ui-tr__table tr:last-child td { border-bottom: none; }
.a2ui-tr__table-footer td {
  background: ${tokens.trSurfaceSunken};
  font-weight: 600;
  white-space: normal;
}

/* Допущения / заметки */
.a2ui-tr__note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 10px;
  background: ${tokens.trSurfaceSunken};
  color: ${tokens.trTextMuted};
  font-size: 0.88rem;
  line-height: 1.45;
}
.a2ui-tr__note-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${tokens.warning};
  flex: none;
  margin-top: 6px;
}

/* Исходные данные */
.a2ui-tr__inputs-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 12px 14px 12px 20px;
  background: ${tokens.trSurfaceSunken};
  border-bottom: 1px solid ${tokens.trBorder};
}
.a2ui-tr__inputs-title { font-weight: 600; }
.a2ui-tr__group { display: grid; gap: 8px; }
.a2ui-tr__group + .a2ui-tr__group { margin-top: 14px; }
.a2ui-tr__group-label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${tokens.trTextMuted};
}
.a2ui-tr__group--warning .a2ui-tr__group-label { color: ${tokens.warning}; }
.a2ui-tr__chips { display: flex; flex-wrap: wrap; gap: 8px; }
.a2ui-tr__chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid ${tokens.trBorder};
  border-radius: 999px;
  font-size: 0.88rem;
}
.a2ui-tr__group--warning .a2ui-tr__chip { border-style: dashed; }
.a2ui-tr__chip-label { color: ${tokens.trTextMuted}; }
.a2ui-tr__chip-value { font-weight: 600; }

/* Протокол */
.a2ui-tr__protocol { border-radius: 14px; border: 1px solid ${tokens.trBorder}; background: ${tokens.trSurface}; }
.a2ui-tr__protocol-summary {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 14px 20px;
  cursor: pointer;
  list-style: none;
}
.a2ui-tr__protocol-summary::-webkit-details-marker { display: none; }
.a2ui-tr__protocol-summary::before {
  content: '›';
  font-weight: 600;
  color: ${tokens.trTextMuted};
  transition: transform 0.15s ease;
  display: inline-block;
}
.a2ui-tr__protocol[open] .a2ui-tr__protocol-summary::before { transform: rotate(90deg); }
.a2ui-tr__protocol-title { font-weight: 600; }
/* От корня: сброс .a2ui-tr .a2ui-tr-btn (margin: 0) специфичнее одного класса. */
.a2ui-tr .a2ui-tr__protocol-download { margin-left: auto; }
.a2ui-tr__protocol-meta { color: ${tokens.trTextMuted}; font-size: 0.85rem; }
.a2ui-tr__protocol-content {
  margin: 0;
  padding: 14px 20px;
  border-top: 1px solid ${tokens.trBorder};
  background: ${tokens.trSurfaceSunken};
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  max-height: 480px;
  overflow-y: auto;
}
`;

export const THERMAL_REPORT_STYLE_HREF = `${THERMAL_REPORT_STYLE_PREFIX}-${hashCss(
  THERMAL_REPORT_CSS,
)}`;
