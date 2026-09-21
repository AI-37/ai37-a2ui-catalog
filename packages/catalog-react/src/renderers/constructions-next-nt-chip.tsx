import React from 'react';
import {Chip} from '../primitives';

/**
 * Чип поправки nt (5.3) рядом с чипом Rпр: показывается, только когда у
 * конструкции задана своя температура и поправка вычислима. Тон нейтральный —
 * nt не вердикт, а множитель нормы; вердикт несёт соседний чип.
 */
export function ConstructionsNextNtChip({nt}: {nt: number | null}) {
  if (nt === null) {
    return null;
  }

  return <Chip tone="neutral">nt {nt.toFixed(2)}</Chip>;
}
