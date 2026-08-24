import React from 'react';
import {fieldSourceLabel} from './field-source-label';
import type {ConstructionsNextSourceNoteProps} from './constructions-next.types';

/**
 * Подпись источника под контролом: обоснование агента (`note`) или, если его
 * нет, название источника словами. Предложенное агентом («из вопроса»,
 * «предложено агентом») набрано акцентом — его ждут проверять; остальное
 * приглушено. Подпись ничего не блокирует — это оформление, а не запрет.
 *
 * Тронутого поля здесь не бывает: источники приходят уже без них
 * (`omitTouchedSources`), поэтому у компонента одна ветка — «источника нет».
 */
export function ConstructionsNextSourceNote({source}: ConstructionsNextSourceNoteProps) {
  if (source === undefined) {
    return null;
  }

  const accent = source.source === 'suggested' || source.source === 'question';

  return (
    <span className={`a2ui-t--sub ${accent ? 'a2ui-t--accent' : 'a2ui-t--muted'}`}>
      {source.note ?? fieldSourceLabel(source.source)}
    </span>
  );
}
