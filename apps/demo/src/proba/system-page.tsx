import React from 'react';
import {ButtonsSystem} from './buttons-system';
import {CardsSystem} from './cards-system';
import {DisclosureSystem} from './disclosure-system';
import {FormSystem} from './form-system';
import {MenuSystem} from './menu-system';
import {NotesSystem} from './notes-system';
import {ProbaShell} from './proba-shell';
import {ReportSystem} from './report-system';
import {TypographySystem} from './typography-system';

/**
 * `/proba/system` — готовый набор примитивов без разборов и обоснований.
 * Тумблер темы обязателен: примитив, показанный только в одной теме, считается
 * непроверенным ровно так же, как примитив, которого на витрине нет.
 */
export function SystemPage() {
  return (
    <ProbaShell
      route="/proba/system"
      eyebrow="AI37 A2UI CATALOG"
      title="Готовое"
      lead="Примитивы каталога в предлагаемом виде: оформление наше, поведение из Base UI."
      themeToggle
    >
      <TypographySystem />
      <ButtonsSystem />
      <CardsSystem />
      <FormSystem />
      <DisclosureSystem />
      <MenuSystem />
      <NotesSystem />
      <ReportSystem />
    </ProbaShell>
  );
}
