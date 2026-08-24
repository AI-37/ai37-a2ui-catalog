import React from 'react';
import type {LiftEditorField} from '@ai37/a2ui-catalog-schemas';
import {Form} from '../primitives';
import {LiftNextAdvanced} from './lift-next-advanced';
import {LiftNextField} from './lift-next-field';
import {resolveLiftFieldOptions} from './resolve-lift-field-options';
import {splitAdvancedFields} from './split-advanced-fields';
import type {LiftNextFieldsProps} from './lift-next.types';

/**
 * Содержимое раскрытой секции — здания или лифта: сетка основных полей и блок
 * дефолтов со сводкой. Состав полей приходит из конфига активной методики,
 * поэтому один компонент рисует обе ветки.
 */
export function LiftNextFields({
  advancedId,
  fields,
  values,
  building,
  advancedLabel,
  sources,
  onChange,
}: LiftNextFieldsProps) {
  const {main, advanced} = splitAdvancedFields(fields, values);

  const renderField = (field: LiftEditorField) => (
    <LiftNextField
      key={field.name}
      field={field}
      value={values[field.name]}
      // Ряд поля пересчитывается на каждый рендер: тип здания переключает ряды
      // Прил. Е, и подсказки обязаны меняться вместе с ним.
      options={resolveLiftFieldOptions(field, building, values)}
      sources={sources}
      onChange={onChange}
    />
  );

  return (
    <>
      <Form columns={2}>{main.map(renderField)}</Form>
      <LiftNextAdvanced
        panelId={advancedId}
        label={advancedLabel}
        fields={advanced}
        values={values}
        renderField={renderField}
      />
    </>
  );
}
