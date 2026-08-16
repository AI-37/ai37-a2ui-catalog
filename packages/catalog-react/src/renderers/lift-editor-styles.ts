import {hashCss} from './hash-css';
import {tokens} from './tokens';

/** Порог контейнерной раскладки: выше — две колонки полей, ниже — одна. */
export const LIFT_EDITOR_BREAKPOINT = 560;

/** Префикс `href` стилевого слоя; полный ключ несёт хэш содержимого. */
export const LIFT_EDITOR_STYLE_PREFIX = 'a2ui-lift-editor';

/**
 * Стили рендереров `LiftEditor` одной строкой: инлайн-стили не умеют container
 * queries, а отдельный CSS-файл потребовал бы бандлера и импорта у потребителя
 * (Решение 5 design lift-editor-sections-responsive). Своя константа, не копия
 * теплотеха: правка стилей одного компонента не должна молча менять другой.
 *
 * Правила: все классы с префиксом `a2ui-le-`; правила, сбрасывающие
 * оформление кнопок и полей, записаны от корня (`.a2ui-le .a2ui-le-…`) — у
 * хоста такие стили объявлены на элементе и перебивают одноклассовые. Цвета —
 * только токены `--a2ui-*`, значения макета — в группе `--a2ui-color-le-*`
 * (`tokens.ts`).
 *
 * Узкая раскладка — базовая, широкая живёт внутри `@container`: без поддержки
 * container queries компонент деградирует в одну колонку, а не ломается.
 */
export const LIFT_EDITOR_CSS = `
.a2ui-le {
  container-type: inline-size;
  container-name: a2ui-le;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* width обязателен: container-type: inline-size включает size containment,
     и во флекс-хосте карточка без него схлопывается в ноль (см. стили
     теплотеха). min-width: 0 — длинная строка не распирает колонку хоста. */
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  color: ${tokens.leText};
  font-size: 14px;
}

/* Шапка карточки: заголовок слева, контекст и переключатель методики справа. */
.a2ui-le__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${tokens.leSurfaceSunken};
}

.a2ui-le__header-title {
  margin-right: auto;
  font-weight: 600;
  color: ${tokens.leText};
}

.a2ui-le__header-context {
  color: ${tokens.leTextMuted};
  font-size: 13px;
}

/* Переключатель методики: текст «ГОСТ · тип здания», поверх — прозрачный
   нативный select с теми же габаритами (клик по тексту открывает выбор). */
.a2ui-le-method {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  cursor: pointer;
}

.a2ui-le-method__text {
  color: ${tokens.leText};
  border-bottom: 1px dashed ${tokens.leTextMuted};
  font-size: 13px;
}

.a2ui-le-method__chevron {
  color: ${tokens.leTextMuted};
  font-size: 11px;
}

.a2ui-le .a2ui-le-method__select {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  opacity: 0;
  cursor: pointer;
}

.a2ui-le-section {
  border: 1px solid ${tokens.leBorder};
  border-radius: 10px;
  background: ${tokens.leSurface};
}

.a2ui-le-section--open {
  padding: 10px 14px 14px;
}

/* Свёрнутая секция: вся строка-сводка — одна кнопка раскрытия со сброшенным
   UA/хостовым оформлением. */
.a2ui-le .a2ui-le-banner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

/* Свёрнутый блок дефолтов — тот же баннер, но утопленный внутри секции. */
.a2ui-le .a2ui-le-banner--advanced {
  margin-top: 10px;
  border-radius: 8px;
  background: ${tokens.leSurfaceSunken};
}

.a2ui-le-banner__title {
  font-weight: 600;
  white-space: nowrap;
  color: ${tokens.leText};
}

.a2ui-le-banner__summary {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${tokens.leTextMuted};
  font-size: 13px;
}

.a2ui-le-chevron {
  flex-shrink: 0;
  color: ${tokens.leTextMuted};
  transition: transform 120ms ease;
}

.a2ui-le-chevron--open {
  transform: rotate(90deg);
}

.a2ui-le-section__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

/* «Шеврон + заголовок» раскрытой секции — единая кнопка сворачивания. */
.a2ui-le .a2ui-le-section__toggle {
  display: inline-flex;
  justify-content: flex-start;
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

.a2ui-le-section__spacer {
  flex: 1;
}

.a2ui-le .a2ui-le-link {
  padding: 0;
  border: none;
  background: transparent;
  color: ${tokens.leAccent};
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.a2ui-le .a2ui-le-link--danger {
  color: ${tokens.danger};
}

/* Пометка секции: «заполните» (пустые обязательные) / «просмотреть». */
.a2ui-le-badge {
  padding: 1px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, ${tokens.warning} 14%, transparent);
  color: ${tokens.warning};
  font-size: 12px;
  white-space: nowrap;
}

/* Сетка полей: базово одна колонка, две — от порога по ширине контейнера. */
.a2ui-le-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.a2ui-le-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.a2ui-le-field__label {
  font-size: 13px;
  color: ${tokens.leTextMuted};
}

.a2ui-le .a2ui-le-control {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  /* Рамка от цвета текста, не от токена границы: в тёмной теме хоста граница
     сливается с фоном (см. стили теплотеха). Токен — запасное значение. */
  border: 1px solid ${tokens.leBorder};
  border-color: color-mix(in srgb, currentColor 22%, transparent);
  border-radius: 8px;
  background: ${tokens.leSurface};
  color: inherit;
  font: inherit;
}

.a2ui-le .a2ui-le-control--missing {
  border-color: ${tokens.danger};
}

/* Подпись под контролом: hint поля или источник значения. */
.a2ui-le-caption {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${tokens.leTextMuted};
  overflow-wrap: anywhere;
}

.a2ui-le-caption--accent {
  color: ${tokens.leAccent};
}

.a2ui-le-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: ${tokens.warning};
}

/* Раскрытый блок дефолтов: утопленная панель внутри секции. */
.a2ui-le-advanced {
  margin-top: 10px;
  padding: 10px;
  border-radius: 8px;
  background: ${tokens.leSurfaceSunken};
}

.a2ui-le-advanced__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.a2ui-le .a2ui-le-add {
  align-self: flex-start;
  padding: 8px 14px;
  border: 1px dashed ${tokens.leTextMuted};
  border-radius: 8px;
  background: transparent;
  font: inherit;
  font-size: 13px;
  color: inherit;
  cursor: pointer;
}

.a2ui-le .a2ui-le-add:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.a2ui-le__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.a2ui-le .a2ui-le-submit {
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: ${tokens.leText};
  color: ${tokens.leSurface};
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.a2ui-le .a2ui-le-submit:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Ховеры объявляем сами: у хоста они объявлены на элементе и красят серой
   пилюлей всё, у чего нет своего состояния (см. стили теплотеха). */
.a2ui-le .a2ui-le-section__toggle:hover,
.a2ui-le .a2ui-le-link:hover {
  background: transparent;
}

.a2ui-le .a2ui-le-link:hover {
  text-decoration: underline;
}

.a2ui-le .a2ui-le-banner:hover {
  background: ${tokens.leSurfaceSunken};
}

.a2ui-le .a2ui-le-add:hover {
  background: transparent;
  border-color: ${tokens.leText};
}

.a2ui-le .a2ui-le-submit:hover {
  background: ${tokens.leText};
}

@container a2ui-le (min-width: ${LIFT_EDITOR_BREAKPOINT}px) {
  .a2ui-le-grid {
    grid-template-columns: 1fr 1fr;
  }
}
`;

/**
 * `href` тега стилей: React 19 поднимает `<style href precedence>` в `<head>`
 * и дедуплицирует по этому ключу — сколько бы редакторов ни было в треде,
 * правила окажутся в документе один раз. Хэш в ключе — чтобы правки CSS были
 * видны при HMR (см. `hash-css`).
 */
export const LIFT_EDITOR_STYLE_HREF = `${LIFT_EDITOR_STYLE_PREFIX}-${hashCss(LIFT_EDITOR_CSS)}`;
