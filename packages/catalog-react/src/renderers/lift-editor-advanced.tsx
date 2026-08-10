import React from 'react';
import {tokens} from './tokens';
import type {LiftEditorAdvancedProps} from './lift-editor.types';

/**
 * Экспандер «Параметры по умолчанию»: поля со значениями по умолчанию не
 * должны топить те два-три, которые реально надо ввести. Решение о попадании
 * поля сюда принимает `splitAdvancedFields` — здесь только оболочка.
 */
export function LiftEditorAdvanced({label, fields, renderField}: LiftEditorAdvancedProps) {
  if (fields.length === 0) return null;

  return (
    <details style={{marginTop: 4}}>
      <summary style={{cursor: 'pointer', fontSize: '0.85rem', color: tokens.textMuted}}>
        {label}{' '}
        <span style={{color: tokens.textSubtle}}>({fields.map(field => field.name).join(', ')})</span>
      </summary>
      <div style={{display: 'grid', gap: 12, marginTop: 12}}>
        {fields.map(field => (
          <React.Fragment key={field.name}>{renderField(field)}</React.Fragment>
        ))}
      </div>
    </details>
  );
}
