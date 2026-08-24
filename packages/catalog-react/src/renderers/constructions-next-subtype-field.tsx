import React from 'react';
import type {CherdachnyeSubtype, ConstructionType} from '@ai37/a2ui-catalog-schemas';
import {Field, Select} from '../primitives';
import {CHERDACHNYE_SUBTYPE_LABELS} from './cherdachnye-subtype-labels';
import {SUBTYPED_TYPE} from './subtyped-construction-type';

const SUBTYPE_ITEMS = Object.entries(CHERDACHNYE_SUBTYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

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
  if (type !== SUBTYPED_TYPE) {
    return null;
  }

  return (
    <Field label="Разновидность">
      <Select
        items={SUBTYPE_ITEMS}
        value={value ?? null}
        placeholder="—"
        onValueChange={next => onChange((next as CherdachnyeSubtype | null) ?? undefined)}
      />
    </Field>
  );
}
