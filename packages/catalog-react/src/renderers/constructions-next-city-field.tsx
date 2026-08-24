import React from 'react';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';
import {Input, Lookup} from '../primitives';

const PLACEHOLDER = 'Город из справочника';

/**
 * Поле города: со справочником — `Autocomplete` с подсказками, без него —
 * обычный ввод. Свободный текст остаётся значением в обеих ветках: города вне
 * справочника — забота агента, блокировать ввод не наше дело.
 */
export function ConstructionsNextCityField({
  referenceId,
  minChars,
  text,
  onTextChange,
  onPick,
}: {
  referenceId: string | undefined;
  minChars: number | undefined;
  text: string;
  onTextChange: (text: string) => void;
  onPick: (option: LookupOption) => void;
}) {
  if (referenceId === undefined) {
    return (
      <Input
        value={text}
        placeholder={PLACEHOLDER}
        onChange={event => onTextChange(event.target.value)}
      />
    );
  }

  return (
    <Lookup
      name="constructions-next-city"
      referenceId={referenceId}
      placeholder={PLACEHOLDER}
      text={text}
      minChars={minChars}
      onTextChange={onTextChange}
      onPick={onPick}
    />
  );
}
