import React from 'react';
import {LookupFieldActionControl} from './lookup-field-action';
import {LookupFieldFetchControl} from './lookup-field-fetch';
import type {LookupFieldControlProps} from './lookup-field.types';

/**
 * Поле `type: 'lookup'` внутри FormCard: текстовый ввод с подсказками.
 *
 * Диспетчер канала подсказок по `field.suggestMode`: `'fetch'` — рендерер
 * сам ходит GET'ом на same-origin suggest-роут; иначе (default `'action'`)
 * — канал `lookup:suggest` через агента (см. form-card-lookup contract).
 * Выбранное значение в обоих режимах попадает в submit через скрытый input
 * — `handleSubmit` формы про lookup не знает.
 */
export function LookupFieldControl(props: LookupFieldControlProps) {
  if ((props.field.suggestMode ?? 'action') === 'fetch') {
    return <LookupFieldFetchControl {...props} />;
  }

  return <LookupFieldActionControl {...props} />;
}
