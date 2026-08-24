import React from 'react';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';
import {LookupHighlight} from './lookup-highlight';
import {LookupOptionSlot} from './lookup-option-slot';

/** Содержимое опции: без `title` — одна строка `label`, иначе группа / заголовок / мета. */
export function LookupOptionContent({option, query}: {option: LookupOption; query: string}) {
  if (option.title === undefined) {
    return <LookupHighlight text={option.label} query={query} />;
  }

  return (
    <>
      <LookupOptionSlot text={option.group} query={query} className="a2ui-popup__group" />
      <span className="a2ui-popup__title">
        <LookupHighlight text={option.title} query={query} />
      </span>
      <LookupOptionSlot text={option.meta} query={query} className="a2ui-popup__meta" />
    </>
  );
}
