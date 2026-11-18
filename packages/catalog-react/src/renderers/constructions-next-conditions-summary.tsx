import React from 'react';
import type {ConstructionsGeneral} from '@ai37/a2ui-catalog-schemas';
import {buildConditionsSummary} from './build-conditions-summary';
import {useA2uiMessages} from '../i18n';

/**
 * Сводка условий в шапке. Раскрытая форма показывает те же значения полями,
 * поэтому там сводки нет — отдельным компонентом с ранним `return null`, а не
 * тернарником в разметке секции.
 */
export function ConstructionsNextConditionsSummary({
  open,
  general,
}: {
  open: boolean;
  general: ConstructionsGeneral;
}) {
  const m = useA2uiMessages();
  if (open) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{buildConditionsSummary(general, m)}</span>;
}
