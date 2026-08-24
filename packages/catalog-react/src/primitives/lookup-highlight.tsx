import React from 'react';

/** Подсветка первого вхождения запроса в тексте опции. */
export function LookupHighlight({text, query}: {text: string; query: string}) {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;

  if (at < 0) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, at)}
      <span className="a2ui-popup__match">{text.slice(at, at + query.length)}</span>
      {text.slice(at + query.length)}
    </>
  );
}
