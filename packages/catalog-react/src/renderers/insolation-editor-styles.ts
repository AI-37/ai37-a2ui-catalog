import {hashCss} from './hash-css';
import {tokens} from './tokens';

/** Порог контейнерной раскладки: выше — две колонки полей, ниже — одна. */
export const INSOLATION_EDITOR_BREAKPOINT = 560;

/** Префикс `href` стилевого слоя; полный ключ несёт хэш содержимого. */
export const INSOLATION_EDITOR_STYLE_PREFIX = 'a2ui-insolation-editor';

/**
 * Стили `InsolationEditor` одной строкой (канон CE/LE/KeoEditor). Все классы с
 * префиксом `a2ui-ie-`; сбросы кнопок и контролов записаны от корня — у хоста
 * такие стили объявлены на элементе. Цвета — только токены `--a2ui-*` (группа
 * `ie` + общие статусные). Своя константа, не копия КЕО: правка стилей одного
 * компонента не должна молча менять другой.
 *
 * Затеняющая застройка — компактные строки (flex-обёртка), а не сетка на четыре
 * колонки: зданий бывает много, а полей у здания четыре, и в узком чате строка
 * должна складываться сама.
 */
export const INSOLATION_EDITOR_CSS = `
.a2ui-ie {
  container-type: inline-size;
  container-name: a2ui-ie;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* width обязателен: size containment во флекс-хосте схлопывает карточку. */
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  color: ${tokens.ieText};
  font-size: 14px;
}

.a2ui-ie__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${tokens.ieSurfaceSunken};
}

.a2ui-ie__header-title { margin-right: auto; font-weight: 600; color: ${tokens.ieText}; }
.a2ui-ie__header-meta { color: ${tokens.ieTextMuted}; font-size: 13px; }

.a2ui-ie-conditions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid ${tokens.ieBorder};
  border-radius: 10px;
  background: ${tokens.ieSurface};
}

.a2ui-ie-condition { display: grid; gap: 2px; min-width: 0; }
.a2ui-ie-condition__label { color: ${tokens.ieTextMuted}; font-size: 13px; }
.a2ui-ie-condition__value { font-weight: 500; overflow-wrap: anywhere; }
.a2ui-ie-condition__note { color: ${tokens.ieTextMuted}; font-size: 12px; }

.a2ui-ie-tabs { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }

.a2ui-ie .a2ui-ie-tab {
  padding: 6px 12px;
  border: 1px solid ${tokens.ieBorder};
  border-radius: 999px;
  background: transparent;
  color: ${tokens.ieTextMuted};
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.a2ui-ie .a2ui-ie-tab--active {
  border-color: transparent;
  background: ${tokens.ieText};
  color: ${tokens.ieSurface};
}

.a2ui-ie .a2ui-ie-add {
  padding: 6px 12px;
  border: 1px dashed ${tokens.ieTextMuted};
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.a2ui-ie .a2ui-ie-add:disabled { opacity: 0.45; cursor: not-allowed; }

.a2ui-ie__point-head { display: flex; align-items: center; justify-content: flex-end; }

.a2ui-ie-section {
  padding: 10px 14px 14px;
  border: 1px solid ${tokens.ieBorder};
  border-radius: 10px;
  background: ${tokens.ieSurface};
}

.a2ui-ie-section__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.a2ui-ie-section__title {
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${tokens.ieTextMuted};
}

.a2ui-ie-section__spacer { flex: 1; }

.a2ui-ie-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }

.a2ui-ie-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.a2ui-ie-field__label { font-size: 13px; color: ${tokens.ieTextMuted}; }

.a2ui-ie .a2ui-ie-control {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  /* Рамка от цвета текста: в тёмной теме хоста токен границы сливается с фоном. */
  border: 1px solid ${tokens.ieBorder};
  border-color: color-mix(in srgb, currentColor 22%, transparent);
  border-radius: 8px;
  background: ${tokens.ieSurface};
  color: inherit;
  font: inherit;
}

.a2ui-ie .a2ui-ie-control--warned { border-color: ${tokens.warning}; }

.a2ui-ie-caption {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${tokens.ieTextMuted};
  overflow-wrap: anywhere;
}

.a2ui-ie-caption--accent { color: ${tokens.ieAccent}; }
.a2ui-ie-caption--warning { color: ${tokens.warning}; }

.a2ui-ie-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: ${tokens.warning};
}

/* Затеняющая застройка: строка здания складывается сама в узком чате. */
.a2ui-ie-buildings { display: grid; gap: 10px; }

.a2ui-ie-building {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 8px 10px;
  padding: 10px;
  border: 1px solid ${tokens.ieBorder};
  border-radius: 8px;
  background: ${tokens.ieSurfaceSunken};
}

.a2ui-ie-building .a2ui-ie-field { flex: 1 1 140px; }
.a2ui-ie-building__remove { align-self: center; }

.a2ui-ie-buildings__empty { color: ${tokens.ieTextMuted}; font-size: 13px; }

/* Плашка модели застройки: предупреждение данными, не «ошибка формы». */
.a2ui-ie-notice {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 12px;
  border-radius: 8px;
  background: ${tokens.ieSurfaceSunken};
  color: ${tokens.ieTextMuted};
  font-size: 12.5px;
  line-height: 1.45;
}

.a2ui-ie-notice__dot {
  flex: none;
  width: 7px;
  height: 7px;
  margin-top: 5px;
  border-radius: 999px;
  background: ${tokens.warning};
}

.a2ui-ie-notice--info .a2ui-ie-notice__dot { background: ${tokens.ieAccent}; }

.a2ui-ie .a2ui-ie-link {
  padding: 0;
  border: none;
  background: transparent;
  color: ${tokens.ieAccent};
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.a2ui-ie .a2ui-ie-link--danger { color: ${tokens.danger}; }

.a2ui-ie__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px 12px;
}

.a2ui-ie__sources { margin-right: auto; color: ${tokens.ieTextMuted}; font-size: 12px; }

.a2ui-ie .a2ui-ie-submit {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: ${tokens.ieText};
  color: ${tokens.ieSurface};
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

/* Ховеры объявляем сами: у хоста они на элементе и красят серой пилюлей всё,
   у чего нет своего состояния (канон CE/LE/TR). */
.a2ui-ie .a2ui-ie-tab:hover { background: transparent; border-color: ${tokens.ieTextMuted}; }
.a2ui-ie .a2ui-ie-tab--active:hover { background: ${tokens.ieText}; border-color: transparent; }
.a2ui-ie .a2ui-ie-add:hover { background: transparent; border-color: ${tokens.ieText}; }
.a2ui-ie .a2ui-ie-link:hover { background: transparent; text-decoration: underline; }
.a2ui-ie .a2ui-ie-submit:hover { background: ${tokens.ieText}; }

@container a2ui-ie (min-width: ${INSOLATION_EDITOR_BREAKPOINT}px) {
  .a2ui-ie-grid,
  .a2ui-ie-conditions {
    grid-template-columns: 1fr 1fr;
  }
}
`;

export const INSOLATION_EDITOR_STYLE_HREF = `${INSOLATION_EDITOR_STYLE_PREFIX}-${hashCss(
  INSOLATION_EDITOR_CSS,
)}`;
