import React from 'react';
import {Field, NumberField} from '../primitives';

export const R_FIELD_LABEL = 'r (однородность)';

/**
 * Коэффициент теплотехнической однородности r (Г.4 СП 50): множитель к Rусл,
 * (0; 1]. Поле есть только у слоистых типов — у изделий Rпр паспортное.
 * Пустое поле — «не задан»: агент считает с r = 1 и помечает это допущением,
 * поэтому дефолт в контроле не подставляется — только плейсхолдер «1», чтобы
 * пустое поле читалось как «1, если не указать иное», а не как поломка.
 * Поле на всю колонку, как тип и название рядом (решение владельца на стенде).
 */
export function ConstructionsNextRField({
  show,
  value,
  onChange,
}: {
  show: boolean;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  if (!show) {
    return null;
  }

  return (
    <Field label={R_FIELD_LABEL}>
      <NumberField
        value={value ?? null}
        min={0.01}
        max={1}
        step={0.01}
        placeholder="1"
        onValueChange={next => onChange(next ?? undefined)}
      />
    </Field>
  );
}
