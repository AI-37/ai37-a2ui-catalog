import {hashCss} from './hash-css';
import {tokens} from './tokens';

/** Порог контейнерной раскладки: выше — две колонки, ниже — одна. */
export const CONSTRUCTIONS_EDITOR_BREAKPOINT = 560;

/** Префикс `href` стилевого слоя; полный ключ несёт хэш содержимого. */
export const CONSTRUCTIONS_EDITOR_STYLE_PREFIX = 'a2ui-constructions-editor';

/**
 * Стили рендереров `ConstructionsEditor` одной строкой: инлайн-стили не умеют
 * container queries, а отдельный `styles.css` потребовал бы бандлера в сборке
 * пакета и импорта у каждого потребителя (Решение 1 design.md).
 *
 * Правила: все классы с префиксом `a2ui-ce-` (изоляции в чужом хосте нет,
 * префикс — единственная защита от коллизий), специфичность — один класс,
 * чтобы хост мог переопределить своим правилом без `!important`. Цвета — только
 * токены `--a2ui-*`; значения макета вынесены в группу `--a2ui-color-ce-*`
 * (`tokens.ts`), литералов здесь нет.
 *
 * Узкая раскладка — базовая, широкая живёт внутри `@container`: без поддержки
 * container queries компонент деградирует в одну колонку, а не ломается.
 * Кегли и отступы — с макета (`figma-values.md`).
 */
export const CONSTRUCTIONS_EDITOR_CSS = `
.a2ui-ce {
  container-type: inline-size;
  container-name: a2ui-ce;
  display: grid;
  border-radius: 14px;
  border: 1px solid ${tokens.ceBorder};
  background: ${tokens.ceSurface};
  color: ${tokens.ceText};
  box-sizing: border-box;
  overflow: hidden;
}

/* Шапка карточки: заголовок слева, контекст справа, на одной базовой линии. */
.a2ui-ce__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 6px 14px;
  padding: 13px 20px;
  background: ${tokens.ceSurfaceSunken};
  border-bottom: 1px solid ${tokens.ceBorder};
}

.a2ui-ce__header-title {
  font-size: 14px;
  line-height: 14px;
  font-weight: 500;
  color: ${tokens.ceText};
}

.a2ui-ce__header-context {
  font-size: 12.5px;
  line-height: 13px;
  color: ${tokens.ceTextMuted};
}

.a2ui-ce__body {
  display: grid;
  gap: 20px;
  padding: 18px 20px;
}

/* Группа: заголовок секции + содержимое. */
.a2ui-ce__group {
  display: grid;
  gap: 10px;
}

.a2ui-ce-section-title {
  margin: 0;
  font-size: 10.5px;
  line-height: 13px;
  letter-spacing: 0.21px;
  font-weight: 500;
  text-transform: uppercase;
  color: ${tokens.ceTextMuted};
}

.a2ui-ce-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.a2ui-ce__list {
  display: grid;
  gap: 10px;
}

.a2ui-ce__footer {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.a2ui-ce__count {
  color: ${tokens.ceTextMuted};
  font-size: 12px;
  line-height: 12px;
}

/* Свёрнутый блок условий: строка-сводка целиком раскрывает блок, поэтому она
   кнопка — со сброшенным UA-оформлением и выравниванием по левому краю. */
.a2ui-ce-banner {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 4px 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 11px 14px;
  border: none;
  border-radius: 10px;
  background: ${tokens.ceSurfaceSunken};
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.a2ui-ce-banner__title {
  font-size: 12.5px;
  line-height: 15px;
  font-weight: 500;
  color: ${tokens.ceText};
}

.a2ui-ce-banner__summary {
  flex: 1;
  min-width: 0;
  font-size: 12.5px;
  line-height: 15px;
  color: ${tokens.ceTextMuted};
  overflow-wrap: anywhere;
}

.a2ui-ce-link {
  padding: 0;
  border: none;
  background: transparent;
  color: ${tokens.ceAccent};
  font-size: 12.5px;
  line-height: 15px;
  cursor: pointer;
  white-space: nowrap;
}

.a2ui-ce-btn {
  padding: 8px 14px;
  border-radius: 9px;
  border: 1px solid ${tokens.ceBorder};
  background: transparent;
  color: ${tokens.ceText};
  font-size: 13px;
  line-height: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.a2ui-ce-btn--primary {
  padding: 10px 20px;
  border-color: transparent;
  background: ${tokens.ceText};
  color: ${tokens.ceSurface};
}

.a2ui-ce-btn--dashed {
  justify-self: start;
  border-style: dashed;
}

.a2ui-ce-btn--commit {
  border-color: transparent;
  background: ${tokens.ceText};
  color: ${tokens.ceSurface};
}

.a2ui-ce-btn--edit {
  padding: 4px 10px;
  color: ${tokens.ceTextMuted};
  font-size: 12px;
  white-space: nowrap;
}

.a2ui-ce-btn--danger {
  margin-left: auto;
  padding: 6px 4px;
  border-color: transparent;
  color: ${tokens.danger};
  font-size: 12.5px;
}

.a2ui-ce-btn--add-layer {
  justify-self: start;
  padding: 6px 12px;
  border-style: dashed;
}

/* Ряд полей: одно поле в колонку, подпись над контролом. */
.a2ui-ce-field {
  display: grid;
  gap: 6px;
  min-width: 0;
  align-content: start;
}

.a2ui-ce-field__label {
  font-size: 12.5px;
  line-height: 15px;
  font-weight: 500;
  color: ${tokens.ceText};
}

.a2ui-ce-field__index {
  font-size: 11.5px;
  line-height: 14px;
  font-weight: 400;
  color: ${tokens.ceTextMuted};
}

.a2ui-ce-control {
  width: 100%;
  min-height: 37px;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 9px;
  border: 1px solid ${tokens.ceBorder};
  font-size: 14px;
  line-height: 17px;
  background: ${tokens.ceSurface};
  color: ${tokens.ceText};
}

/* Значение из проекта: заливка отличает поле от обычного контрола, рамка
   остаётся (макет, figma-values.md). */
.a2ui-ce-control--project {
  background: ${tokens.ceSurfaceSunken};
}

/* Предложенное агентом/выведенное из вопроса: акцентная рамка, значение
   приглушено — «ещё не подтверждено». */
.a2ui-ce-control--suggested {
  border: 1.5px solid ${tokens.ceAccent};
  color: ${tokens.ceTextMuted};
}

/* Селект в оформлении контрола: нативный вид сброшен, стрелка своя — иначе
   системный контрол не совпадает по высоте с текстовыми полями ряда. */
.a2ui-ce-select {
  position: relative;
  display: grid;
}

.a2ui-ce-select > select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 32px;
}

.a2ui-ce-select__arrow {
  position: absolute;
  top: 50%;
  right: 12px;
  display: flex;
  transform: translateY(-50%);
  color: ${tokens.ceTextMuted};
  pointer-events: none;
}

/* Подпись источника под контролом. */
.a2ui-ce-note {
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-size: 11.5px;
  line-height: 15px;
  color: ${tokens.ceTextMuted};
  overflow-wrap: anywhere;
}

/* Цвет подписи совпадает с цветом рамки контрола. */
.a2ui-ce-note--accent {
  color: ${tokens.ceAccent};
}

.a2ui-ce-note__dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: ${tokens.warning};
}

/* Значение вместо контрола (ГСОП, авто-λ): рамки нет, но высота строки та же,
   что у поля ввода, — иначе значение висит выше соседей по ряду. */
.a2ui-ce-static {
  display: flex;
  align-items: center;
  min-height: 37px;
  color: ${tokens.ceText};
  font-size: 14px;
  line-height: 17px;
}

.a2ui-ce-static--muted {
  color: ${tokens.ceTextMuted};
  font-size: 12.5px;
}

.a2ui-ce-auto {
  color: ${tokens.ceTextMuted};
  font-size: 11.5px;
}

.a2ui-ce-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.a2ui-ce-form {
  display: grid;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${tokens.ceBorder};
  background: ${tokens.ceSurface};
  box-sizing: border-box;
}

/* Форма с единственным узким полем: не растягиваем её на всю ширину. */
.a2ui-ce-form--compact {
  justify-items: start;
}

.a2ui-ce-card {
  border-radius: 10px;
  border: 1px solid ${tokens.ceBorder};
  background: ${tokens.ceSurfaceSunken};
}

.a2ui-ce-card--invalid {
  border-color: ${tokens.warning};
}

.a2ui-ce-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
}

.a2ui-ce-card__toggle {
  flex: 1;
  display: flex;
  /* justify-content явно: UA-стиль кнопки центрирует flex-содержимое, и
     заголовок уезжает от левого края. */
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: ${tokens.ceText};
  font-weight: 500;
  font-size: 13px;
  line-height: 16px;
  text-align: left;
  cursor: pointer;
  overflow-wrap: anywhere;
}

.a2ui-ce-card__warn {
  color: ${tokens.warning};
  font-size: 11.5px;
  font-weight: 500;
  white-space: nowrap;
}

.a2ui-ce-card__remove {
  border: none;
  background: transparent;
  color: ${tokens.ceTextMuted};
  cursor: pointer;
  font-size: 1rem;
}

.a2ui-ce-card__body {
  display: grid;
  gap: 10px;
  padding: 0 12px 12px;
}

.a2ui-ce-card__layers {
  display: grid;
  gap: 8px;
}

.a2ui-ce-chevron {
  flex-shrink: 0;
  color: ${tokens.ceTextMuted};
  transition: transform 120ms ease;
}

.a2ui-ce-chevron--open {
  transform: rotate(90deg);
}

.a2ui-ce-chip {
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid ${tokens.ceBorder};
  color: ${tokens.ceTextMuted};
  font-size: 11.5px;
  font-weight: 500;
  white-space: nowrap;
}

.a2ui-ce-chip--pass {
  border-color: ${tokens.success};
  color: ${tokens.success};
}

.a2ui-ce-chip--fail {
  border-color: ${tokens.danger};
  color: ${tokens.danger};
}

.a2ui-ce-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.a2ui-ce-head__text {
  display: grid;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.a2ui-ce-head__type {
  color: ${tokens.ceText};
  font-size: 12.5px;
  line-height: 15px;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.a2ui-ce-head__name {
  color: ${tokens.ceTextMuted};
  font-size: 11.5px;
  line-height: 15px;
  overflow-wrap: anywhere;
}

.a2ui-ce-passport {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.a2ui-ce-passport__label {
  color: ${tokens.ceTextMuted};
  font-size: 12.5px;
}

.a2ui-ce-passport__value {
  color: ${tokens.ceText};
  font-size: 14px;
  font-weight: 500;
}

.a2ui-ce-passport__value--missing {
  color: ${tokens.warning};
}

.a2ui-ce-passport .a2ui-ce-btn--edit {
  margin-left: auto;
}

.a2ui-ce-passport__input {
  width: 160px;
}

.a2ui-ce-layer {
  display: flex;
  align-items: baseline;
  /* Явно: хостовые стили кнопок центрируют flex-содержимое — сводка
     превращается в кашу по центру. */
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 2px 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 9px;
  border: 1px solid ${tokens.ceBorder};
  background: ${tokens.ceSurface};
  color: ${tokens.ceText};
  font-size: 12.5px;
  line-height: 15px;
  text-align: left;
  cursor: pointer;
}

.a2ui-ce-layer__no {
  color: ${tokens.ceTextMuted};
  font-variant-numeric: tabular-nums;
}

/* Материал забирает остаток строки, но не ужимается уже 8rem: колонка чисел
   не переносится (nowrap), и без этого минимума на узком контейнере название
   рвалось бы по буквам. Не влезли — числа уезжают на следующую строку. */
.a2ui-ce-layer__material {
  color: ${tokens.ceText};
  font-weight: 500;
  flex: 1 1 8rem;
  overflow-wrap: anywhere;
}

.a2ui-ce-layer__numbers {
  display: flex;
  align-items: baseline;
  gap: 6px;
  white-space: nowrap;
  margin-left: auto;
}

.a2ui-ce-layer__dot {
  color: ${tokens.ceTextMuted};
}

.a2ui-ce-layer__warn {
  color: ${tokens.warning};
}

.a2ui-ce-layer__hint {
  color: ${tokens.ceTextMuted};
}

/* Сетка полей блока условий и ряд «толщина + λ» формы слоя: базово одна
   колонка, две — только когда контейнер шире порога. */
.a2ui-ce-conditions__grid,
.a2ui-ce-pair {
  display: grid;
  gap: 14px;
}

.a2ui-ce-conditions__climate {
  display: grid;
  gap: 14px;
  margin-top: 14px;
}

@container a2ui-ce (min-width: ${CONSTRUCTIONS_EDITOR_BREAKPOINT}px) {
  .a2ui-ce-conditions__grid,
  .a2ui-ce-conditions__climate,
  .a2ui-ce-pair {
    grid-template-columns: 1fr 1fr;
  }
}
`;

/**
 * `href` тега стилей: React 19 поднимает `<style href precedence>` в `<head>`
 * и дедуплицирует по этому ключу — сколько бы редакторов ни было в треде,
 * правила окажутся в документе один раз (Решение 1 design.md).
 *
 * Ключ содержит хэш CSS: иначе уже вставленный тег живёт с прежним содержимым
 * до перезагрузки страницы, и правки стилей не видны при HMR (см. `hash-css`).
 */
export const CONSTRUCTIONS_EDITOR_STYLE_HREF = `${CONSTRUCTIONS_EDITOR_STYLE_PREFIX}-${hashCss(
  CONSTRUCTIONS_EDITOR_CSS,
)}`;
