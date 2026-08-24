import React from 'react';
import {Form, SummaryCollapsible} from '../primitives';
import {LiftNextAdvancedSummary} from './lift-next-advanced-summary';
import type {LiftNextAdvancedProps} from './lift-next.types';

/**
 * Блок «Параметры по умолчанию»: свёрнутая строка со сводкой принятых значений,
 * а не слепой экспандер — принятое видно без клика.
 *
 * Кто попадает в блок, решает `splitAdvancedFields` пакета: пустое обязательное
 * поле не прячется никогда, ради одного-двух полей блок не создаётся.
 */
export function LiftNextAdvanced({
  panelId,
  label,
  fields,
  values,
  renderField,
}: LiftNextAdvancedProps) {
  if (fields.length === 0) {
    return null;
  }

  return (
    <SummaryCollapsible
      panelId={panelId}
      label={label}
      summary={<LiftNextAdvancedSummary fields={fields} values={values} />}
    >
      <Form columns={2}>{fields.map(renderField)}</Form>
    </SummaryCollapsible>
  );
}
