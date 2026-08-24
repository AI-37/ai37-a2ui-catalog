import React from 'react';
import {ButtonsSystem} from './buttons-system';
import {CardsSystem} from './cards-system';
import {FormSystem} from './form-system';
import {ProbaShell} from './proba-shell';
import {TypographySystem} from './typography-system';

/** `/proba/system` — готовый набор примитивов без разборов и обоснований. */
export function SystemPage() {
  return (
    <ProbaShell
      route="/proba/system"
      eyebrow="AI37 A2UI CATALOG"
      title="Готовое"
      lead="Примитивы каталога в предлагаемом виде."
    >
      <TypographySystem />
      <ButtonsSystem />
      <CardsSystem />
      <FormSystem />
    </ProbaShell>
  );
}
