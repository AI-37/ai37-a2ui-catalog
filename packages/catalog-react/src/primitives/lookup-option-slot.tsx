import React from 'react';
import {LookupHighlight} from './lookup-highlight';

/** Необязательный слот опции: отсутствующий строки не занимает. */
export function LookupOptionSlot({
  text,
  query,
  className,
}: {
  text: string | undefined;
  query: string;
  className: string;
}) {
  if (text === undefined) {
    return null;
  }

  return (
    <span className={className}>
      <LookupHighlight text={text} query={query} />
    </span>
  );
}
