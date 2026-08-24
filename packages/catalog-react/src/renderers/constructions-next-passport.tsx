import React from 'react';
import {ConstructionsNextPassportForm} from './constructions-next-passport-form';
import {ConstructionsNextPassportSummary} from './constructions-next-passport-summary';
import type {ConstructionsNextPassportProps} from './constructions-next.types';

/** Паспортное Rпр типов без слоёв: чтение или форма, как у слоя и шапки. */
export function ConstructionsNextPassport(props: ConstructionsNextPassportProps) {
  if (!props.editing) {
    return <ConstructionsNextPassportSummary {...props} />;
  }

  return <ConstructionsNextPassportForm {...props} />;
}
