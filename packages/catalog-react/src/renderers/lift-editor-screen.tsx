import React from 'react';
import type {LiftEditorField as LiftEditorFieldSchema} from '@ai37/a2ui-catalog-schemas';
import {findMissingRequired} from './find-missing-required';
import {LiftEditorAdvanced} from './lift-editor-advanced';
import {LiftEditorField} from './lift-editor-field';
import {resolveLiftFieldOptions} from './resolve-lift-field-options';
import {FIELD_COLUMN_WIDTH} from './shared';
import {splitAdvancedFields} from './split-advanced-fields';
import {tokens} from './tokens';
import type {LiftEditorScreenProps} from './lift-editor.types';

/**
 * Экран вкладки — здания или лифта. Состав полей приходит из активного конфига
 * методики, поэтому один и тот же компонент рисует обе ветки. Экран здания
 * открывается выбором методики (Решение 3 design.md).
 */
export function LiftEditorScreen({
  title,
  gostLabel,
  fields,
  values,
  building,
  advancedLabel,
  methodSelect,
  onChange,
  onCommit,
}: LiftEditorScreenProps) {
  const missing = new Set(findMissingRequired(fields, values));
  const {main, advanced} = splitAdvancedFields(fields, values);

  const renderField = (field: LiftEditorFieldSchema) => (
    <LiftEditorField
      key={field.name}
      field={field}
      value={values[field.name]}
      options={resolveLiftFieldOptions(field, building, values)}
      missing={missing.has(field.name)}
      onChange={value => onChange(field.name, value)}
      onCommit={onCommit}
    />
  );

  return (
    <div role="tabpanel" style={{display: 'grid', gap: 12, maxWidth: FIELD_COLUMN_WIDTH}}>
      <header style={{display: 'grid', gap: 2}}>
        <h3 style={{margin: 0, fontSize: '1.05rem', color: tokens.textStrong}}>{title}</h3>
        <span style={{fontSize: '0.8rem', color: tokens.textSubtle}}>{gostLabel}</span>
      </header>
      <div style={{display: 'grid', gap: 12}}>
        {methodSelect ? (
          // Без `onCommit`: смена методики — самостоятельный триггер черновика,
          // blur селекта добавил бы только дубль.
          <LiftEditorField
            field={methodSelect.field}
            value={methodSelect.value}
            options={methodSelect.options}
            missing={false}
            onChange={value => methodSelect.onChange(String(value))}
          />
        ) : null}
        {main.map(renderField)}
      </div>
      <LiftEditorAdvanced label={advancedLabel} fields={advanced} renderField={renderField} />
    </div>
  );
}
