import React from 'react';
import {LiftEditorChevron} from './lift-editor-chevron';
import type {LiftEditorSectionProps} from './lift-editor.types';
import {useA2uiMessages} from '../i18n';

/**
 * Секция экрана (здание, лифт, лифтовая группа): баннер-строка «шеврон ·
 * заголовок · сводка · „Показать“» ↔ раскрытый блок с шапкой, где «шеврон +
 * заголовок» — единая кнопка сворачивания (как у карточки теплотеха).
 * Переключение локальное: наружу ничего не отправляется, введённое переживает
 * сворачивание (состояние живёт в корне редактора).
 */
export function LiftEditorSection({
  title,
  summary,
  open,
  badge,
  onToggle,
  headerAction,
  children,
  sectionRef,
}: LiftEditorSectionProps) {
  const m = useA2uiMessages().common;
  const badgeNode =
    badge !== undefined ? (
      <span className="a2ui-le-badge">{badge === 'fill' ? m.badgeFill : m.badgeReview}</span>
    ) : null;

  if (!open) {
    return (
      <section ref={sectionRef} className="a2ui-le-section">
        <button type="button" className="a2ui-le-banner" aria-expanded={false} onClick={onToggle}>
          <LiftEditorChevron open={false} />
          <span className="a2ui-le-banner__title">{title}</span>
          <span className="a2ui-le-banner__summary">
            {summary === '' ? m.notFilled : summary}
          </span>
          {badgeNode}
          <span className="a2ui-le-link">{m.show}</span>
        </button>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="a2ui-le-section a2ui-le-section--open">
      <div className="a2ui-le-section__head">
        <button
          type="button"
          className="a2ui-le-section__toggle"
          aria-expanded={true}
          onClick={onToggle}
        >
          <LiftEditorChevron open={true} />
          {title}
        </button>
        {badgeNode}
        <span className="a2ui-le-section__spacer" />
        {headerAction}
        <button type="button" className="a2ui-le-link" onClick={onToggle}>
          {m.collapse}
        </button>
      </div>
      {children}
    </section>
  );
}
