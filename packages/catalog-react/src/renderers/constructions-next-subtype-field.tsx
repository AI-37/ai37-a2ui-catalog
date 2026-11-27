import React from 'react';
import type {CherdachnyeSubtype, ConstructionType} from '@ai37/a2ui-catalog-schemas';
import {Field, Select} from '../primitives';
import {cherdachnyeSubtypeLabels} from './cherdachnye-subtype-labels';
import {SUBTYPED_TYPE} from './subtyped-construction-type';
import {useA2uiMessages} from '../i18n';

/** Разновидность: поля нет у типов, у которых её не бывает. */
export function ConstructionsNextSubtypeField({
  type,
  value,
  onChange,
}: {
  type: ConstructionType;
  value: CherdachnyeSubtype | undefined;
  onChange: (value: CherdachnyeSubtype | undefined) => void;
}) {
  const m = useA2uiMessages();
  if (type !== SUBTYPED_TYPE) {
    return null;
  }

  return (
    <Field label={m.constructions.subtype}>
      <Select
        items={Object.entries(cherdachnyeSubtypeLabels(m)).map(([item, label]) => ({
          value: item,
          label,
        }))}
        value={value ?? null}
        placeholder="—"
        onValueChange={next => onChange((next as CherdachnyeSubtype | null) ?? undefined)}
      />
    </Field>
  );
}
