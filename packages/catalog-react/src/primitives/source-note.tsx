import React from 'react';
import type {LiftEditorFieldSource} from '@ai37/a2ui-catalog-schemas';
import {fieldSourceLabel} from './field-source-label';

/**
 * Подпись под контролом: откуда взялось значение. Обоснование агента (`note`)
 * или слово из общего словаря провенанса каталога.
 *
 * Подпись — это всё: оформление контрола от источника не меняется и ничего не
 * блокируется. Предложенное агентом («из вопроса», «предложено агентом»)
 * набрано акцентом — его ждут проверять, остальное приглушено.
 *
 * Правку снимает вызывающий: источники приходят сюда уже без тронутых полей
 * (`omitTouchedLiftSources`).
 */
export function SourceNote({source}: {source: LiftEditorFieldSource}) {
  const accent = source.source === 'suggested' || source.source === 'question';

  return (
    <span className={`a2ui-t--sub ${accent ? 'a2ui-t--accent' : 'a2ui-t--muted'}`}>
      {source.note ?? fieldSourceLabel(source.source)}
    </span>
  );
}
