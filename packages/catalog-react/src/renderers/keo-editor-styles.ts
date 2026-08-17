import {hashCss} from './hash-css';
import {tokens} from './tokens';

/** Порог контейнерной раскладки: выше — две колонки полей, ниже — одна. */
export const KEO_EDITOR_BREAKPOINT = 560;

/** Префикс `href` стилевого слоя; полный ключ несёт хэш содержимого. */
export const KEO_EDITOR_STYLE_PREFIX = 'a2ui-keo-editor';

/**
 * Стили `KeoEditor` одной строкой (канон CE/LE: инлайн-стили не умеют
 * container queries, а отдельный CSS-файл потребовал бы бандлера у
 * потребителя). Все классы с префиксом `a2ui-ke-`; правила, сбрасывающие
 * оформление кнопок и контролов, записаны от корня — у хоста такие стили
 * объявлены на элементе и перебивают одноклассовые. Цвета — только токены
 * `--a2ui-*` (группа `ke` + общие статусные).
 *
 * Узкая раскладка базовая, широкая живёт в `@container`: без поддержки
 * container queries компонент деградирует в одну колонку, а не ломается.
 */
export const KEO_EDITOR_CSS = `
.a2ui-ke {
  container-type: inline-size;
  container-name: a2ui-ke;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* width обязателен: size containment во флекс-хосте схлопывает карточку. */
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  color: ${tokens.keText};
  font-size: 14px;
}

.a2ui-ke__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${tokens.keSurfaceSunken};
}

.a2ui-ke__header-title {
  margin-right: auto;
  font-weight: 600;
  color: ${tokens.keText};
}

.a2ui-ke__header-meta {
  color: ${tokens.keTextMuted};
  font-size: 13px;
}

/* Условия — readonly-строки: значение уже посчитано агентом. */
.a2ui-ke-conditions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid ${tokens.keBorder};
  border-radius: 10px;
  background: ${tokens.keSurface};
}

.a2ui-ke-condition { display: grid; gap: 2px; min-width: 0; }
.a2ui-ke-condition__label { color: ${tokens.keTextMuted}; font-size: 13px; }
.a2ui-ke-condition__value { font-weight: 500; overflow-wrap: anywhere; }
.a2ui-ke-condition__note { color: ${tokens.keTextMuted}; font-size: 12px; }

/* Вкладки помещений и «+ Добавить помещение» одной строкой. */
.a2ui-ke-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.a2ui-ke .a2ui-ke-tab {
  padding: 6px 12px;
  border: 1px solid ${tokens.keBorder};
  border-radius: 999px;
  background: transparent;
  color: ${tokens.keTextMuted};
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.a2ui-ke .a2ui-ke-tab--active {
  border-color: transparent;
  background: ${tokens.keText};
  color: ${tokens.keSurface};
}

.a2ui-ke .a2ui-ke-add {
  padding: 6px 12px;
  border: 1px dashed ${tokens.keTextMuted};
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.a2ui-ke .a2ui-ke-add:disabled { opacity: 0.45; cursor: not-allowed; }

/* Строка над секциями: «Удалить помещение» у активной вкладки. */
.a2ui-ke__room-head {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.a2ui-ke-section {
  padding: 10px 14px 14px;
  border: 1px solid ${tokens.keBorder};
  border-radius: 10px;
  background: ${tokens.keSurface};
}

.a2ui-ke-section__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.a2ui-ke-section__title {
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${tokens.keTextMuted};
}

.a2ui-ke-section__spacer { flex: 1; }

/* Свёрнутая секция умолчаний — баннер со сводкой принятых значений. */
.a2ui-ke .a2ui-ke-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: 1px solid ${tokens.keBorder};
  border-radius: 10px;
  background: ${tokens.keSurfaceSunken};
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.a2ui-ke-banner__title { font-weight: 600; white-space: nowrap; }

.a2ui-ke-banner__summary {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${tokens.keTextMuted};
  font-size: 13px;
}

.a2ui-ke .a2ui-ke-section__toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.a2ui-ke-chevron {
  flex-shrink: 0;
  color: ${tokens.keTextMuted};
  transition: transform 120ms ease;
}

.a2ui-ke-chevron--open { transform: rotate(90deg); }

/* Вычисляемая подпись плоскости и точки расчёта — не поле ввода. */
.a2ui-ke-computed {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${tokens.keSurfaceSunken};
  font-size: 13px;
}

.a2ui-ke-computed__label {
  color: ${tokens.keTextMuted};
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  text-transform: uppercase;
  align-self: center;
}

.a2ui-ke-computed__value { color: ${tokens.keText}; overflow-wrap: anywhere; }

.a2ui-ke-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.a2ui-ke-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.a2ui-ke-field__label { font-size: 13px; color: ${tokens.keTextMuted}; }

.a2ui-ke .a2ui-ke-control {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  /* Рамка от цвета текста: в тёмной теме хоста токен границы сливается с фоном. */
  border: 1px solid ${tokens.keBorder};
  border-color: color-mix(in srgb, currentColor 22%, transparent);
  border-radius: 8px;
  background: ${tokens.keSurface};
  color: inherit;
  font: inherit;
}

.a2ui-ke .a2ui-ke-control--warned { border-color: ${tokens.warning}; }

.a2ui-ke-caption {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${tokens.keTextMuted};
  overflow-wrap: anywhere;
}

.a2ui-ke-caption--accent { color: ${tokens.keAccent}; }
.a2ui-ke-caption--warning { color: ${tokens.warning}; }

.a2ui-ke-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: ${tokens.warning};
}

.a2ui-ke .a2ui-ke-link {
  padding: 0;
  border: none;
  background: transparent;
  color: ${tokens.keAccent};
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.a2ui-ke .a2ui-ke-link--danger { color: ${tokens.danger}; }

.a2ui-ke__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 12px;
}

.a2ui-ke__sources {
  margin-right: auto;
  color: ${tokens.keTextMuted};
  font-size: 12px;
}

.a2ui-ke .a2ui-ke-submit {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: ${tokens.keText};
  color: ${tokens.keSurface};
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

/* Ховеры объявляем сами: у хоста они на элементе и красят серой пилюлей всё,
   у чего нет своего состояния (канон CE/LE/TR). */
.a2ui-ke .a2ui-ke-tab:hover { background: transparent; border-color: ${tokens.keTextMuted}; }
.a2ui-ke .a2ui-ke-tab--active:hover { background: ${tokens.keText}; border-color: transparent; }
.a2ui-ke .a2ui-ke-add:hover { background: transparent; border-color: ${tokens.keText}; }
.a2ui-ke .a2ui-ke-banner:hover { background: ${tokens.keSurfaceSunken}; }
.a2ui-ke .a2ui-ke-section__toggle:hover { background: transparent; }
.a2ui-ke .a2ui-ke-link:hover { background: transparent; text-decoration: underline; }
.a2ui-ke .a2ui-ke-submit:hover { background: ${tokens.keText}; }

@container a2ui-ke (min-width: ${KEO_EDITOR_BREAKPOINT}px) {
  .a2ui-ke-grid,
  .a2ui-ke-conditions {
    grid-template-columns: 1fr 1fr;
  }
}
`;

export const KEO_EDITOR_STYLE_HREF = `${KEO_EDITOR_STYLE_PREFIX}-${hashCss(KEO_EDITOR_CSS)}`;
