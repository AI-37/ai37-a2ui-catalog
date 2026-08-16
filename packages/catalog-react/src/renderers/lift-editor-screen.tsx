import React from 'react';
import type {LiftEditorField as LiftEditorFieldSchema} from '@ai37/a2ui-catalog-schemas';
import {findMissingRequired} from './find-missing-required';
import {LiftEditorAdvanced} from './lift-editor-advanced';
import {LiftEditorField} from './lift-editor-field';
import {resolveLiftFieldOptions} from './resolve-lift-field-options';
import {splitAdvancedFields} from './split-advanced-fields';
import type {LiftEditorScreenProps} from './lift-editor.types';

/**
 * Содержимое раскрытой секции — здания или лифта: сетка основных полей и блок
 * дефолтов со сводкой. Состав полей приходит из активного конфига методики,
 * поэтому один компонент рисует обе ветки. Заголовок и управление
 * сворачиванием живут в `LiftEditorSection`.
 */
export function LiftEditorScreen({
  fields,
  values,
  building,
  advancedLabel,
  sources,
  onChange,
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
      source={sources[field.name]}
      onChange={value => onChange(field.name, value)}
    />
  );

  return (
    <>
      <div className="a2ui-le-grid">{main.map(renderField)}</div>
      <LiftEditorAdvanced
        label={advancedLabel}
        fields={advanced}
        values={values}
        renderField={renderField}
      />
    </>
  );
}
