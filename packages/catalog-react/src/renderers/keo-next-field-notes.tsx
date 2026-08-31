import React from 'react';
import {KeoNextOptionNote} from './keo-next-option-note';
import {KeoNextSourceNote} from './keo-next-source-note';
import {KeoNextValueWarning} from './keo-next-value-warning';
import {KeoNextWarnings} from './keo-next-warnings';
import type {KeoFieldNotesProps} from './keo-next.types';

/**
 * Подписи под контролом в порядке убывания важности: откуда значение,
 * пояснение к выбранному варианту, предупреждение о самом значении и пометки
 * «! проверить». Каждая ветка — свой компонент с ранним `return null`.
 */
export function KeoNextFieldNotes({
  field,
  value,
  source,
  edited,
  warnings,
}: KeoFieldNotesProps) {
  const text = value === undefined || value === null ? '' : String(value);

  return (
    <>
      <KeoNextSourceNote source={source} edited={edited} hint={field.hint} />
      <KeoNextOptionNote field={field} value={text} />
      <KeoNextValueWarning field={field} value={text} />
      <KeoNextWarnings warnings={warnings} />
    </>
  );
}
