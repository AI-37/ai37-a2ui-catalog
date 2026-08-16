import React from 'react';
import {buildLiftSectionSummary} from './build-lift-section-summary';
import {LiftEditorChevron} from './lift-editor-chevron';
import type {LiftEditorAdvancedProps} from './lift-editor.types';

/**
 * Блок «Параметры по умолчанию» тем же баннер-паттерном, что секции: в
 * свёрнутом виде — строка со сводкой принятых значений, а не слепой экспандер
 * (принятое видно без клика). Решение о попадании поля сюда принимает
 * `splitAdvancedFields` — прежние правила (обязательное пустое не прячется,
 * <3 полей — без блока) живут там.
 */
export function LiftEditorAdvanced({label, fields, values, renderField}: LiftEditorAdvancedProps) {
  const [open, setOpen] = React.useState(false);

  if (fields.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        className="a2ui-le-banner a2ui-le-banner--advanced"
        aria-expanded={false}
        onClick={() => setOpen(true)}
      >
        <LiftEditorChevron open={false} />
        <span className="a2ui-le-banner__title">{label}</span>
        <span className="a2ui-le-banner__summary">{buildLiftSectionSummary(fields, values)}</span>
        <span className="a2ui-le-link">Показать</span>
      </button>
    );
  }

  return (
    <div className="a2ui-le-advanced">
      <div className="a2ui-le-advanced__head">
        <button
          type="button"
          className="a2ui-le-section__toggle"
          aria-expanded={true}
          onClick={() => setOpen(false)}
        >
          <LiftEditorChevron open={true} />
          {label}
        </button>
        <button type="button" className="a2ui-le-link" onClick={() => setOpen(false)}>
          Свернуть
        </button>
      </div>
      <div className="a2ui-le-grid">
        {fields.map(field => (
          <React.Fragment key={field.name}>{renderField(field)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
