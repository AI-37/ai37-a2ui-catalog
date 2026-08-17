import React from 'react';
import {CalcChevron} from './calc-chevron';
import type {KeoEditorSectionProps} from './keo-editor.types';

/**
 * Секция помещения. Обычная секция всегда раскрыта — это анкета, а не
 * навигация. Секция с `advanced` («Коэффициенты приняты по умолчанию») ведёт
 * себя баннером: в свёрнутом виде показывает сводку принятых значений, чтобы
 * принятое было видно без клика (канон `LiftEditorAdvanced`).
 */
export function KeoEditorSection({
  section,
  summary,
  open,
  onToggle,
  children,
}: KeoEditorSectionProps) {
  if (section.advanced && !open) {
    return (
      <button type="button" className="a2ui-ke-banner" aria-expanded={false} onClick={onToggle}>
        <CalcChevron prefix="ke" open={false} />
        <span className="a2ui-ke-banner__title">{section.title}</span>
        <span className="a2ui-ke-banner__summary">{summary}</span>
        <span className="a2ui-ke-link">Показать</span>
      </button>
    );
  }

  return (
    <section className="a2ui-ke-section">
      <div className="a2ui-ke-section__head">
        {section.advanced ? (
          <button
            type="button"
            className="a2ui-ke-section__toggle"
            aria-expanded={true}
            onClick={onToggle}
          >
            <CalcChevron prefix="ke" open={true} />
            {section.title}
          </button>
        ) : (
          <span className="a2ui-ke-section__title">{section.title}</span>
        )}
        <span className="a2ui-ke-section__spacer" />
        {section.advanced ? (
          <button type="button" className="a2ui-ke-link" onClick={onToggle}>
            Свернуть
          </button>
        ) : null}
      </div>
      <div className="a2ui-ke-grid">{children}</div>
    </section>
  );
}
