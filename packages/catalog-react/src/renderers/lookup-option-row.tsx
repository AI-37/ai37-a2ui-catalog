import React from 'react';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';
import {
  lookupOptionGroupStyle,
  lookupOptionMetaStyle,
  lookupOptionTitleStyle,
} from './shared';
import {splitFirstMatch} from './split-first-match';

export type LookupOptionRowProps = {
  option: LookupOption;
  /** Текущий ввод поля — по нему подсвечивается совпадение в каждом слоте. */
  inputText: string;
};

/**
 * Содержимое одной опции lookup-дропдауна. С `title` — многострочная
 * раскладка group/title/meta (отсутствующий слот опускается вместе со
 * строкой), без `title` — однострочный `label`, как до слотов. Слоты — только
 * оформление: в поле после выбора попадает `label` (см. `LookupOption`).
 */
export function LookupOptionRow({option, inputText}: LookupOptionRowProps) {
  if (option.title === undefined) {
    return <Highlighted text={option.label} query={inputText} />;
  }

  return (
    <>
      {option.group !== undefined ? (
        <span style={lookupOptionGroupStyle}>
          <Highlighted text={option.group} query={inputText} />
        </span>
      ) : null}
      <span style={lookupOptionTitleStyle}>
        <Highlighted text={option.title} query={inputText} />
      </span>
      {option.meta !== undefined ? (
        <span style={lookupOptionMetaStyle}>
          <Highlighted text={option.meta} query={inputText} />
        </span>
      ) : null}
    </>
  );
}

/**
 * Текст слота с жирной подсветкой первого вхождения запроса. Подсветка
 * считается на клиенте от текущего ввода; текст рендерится как текст —
 * разметка из данных опции не интерпретируется.
 */
function Highlighted({text, query}: {text: string; query: string}) {
  const parts = splitFirstMatch(text, query);
  if (parts === null) {
    return <>{text}</>;
  }

  return (
    <>
      {parts.before}
      <b>{parts.match}</b>
      {parts.after}
    </>
  );
}
