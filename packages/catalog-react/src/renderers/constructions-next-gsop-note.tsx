import React from 'react';
import type {ConstructionsGeneral, ConstructionsGeneralSources} from '@ai37/a2ui-catalog-schemas';
import {ConstructionsNextSourceNote} from './constructions-next-source-note';

/**
 * Подпись источника под ГСОП. Пока значения нет, подписи тоже нет: обоснование
 * под прочерком объясняло бы то, чего на экране не показано.
 */
export function ConstructionsNextGsopNote({
  general,
  sources,
}: {
  general: ConstructionsGeneral;
  sources: ConstructionsGeneralSources;
}) {
  if (general.gsop === null || general.gsop === undefined) {
    return null;
  }

  return <ConstructionsNextSourceNote source={sources.gsop} />;
}
