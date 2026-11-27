import React from 'react';

/**
 * Индекс в подписи — только «одна буква + `_` + короткий индекс» на границах
 * токена: `d_п`, `h_пд`, `Δ_ст`, `C_N`, `r_0`. Правило узкое намеренно —
 * подпись это человеческий текст, и жадное превратило бы `some_word` в
 * `som<sub>e</sub>`. База из одной буквы и индекс в 1–3 знака покрывают всю
 * номенклатуру СП и не покрывают ничего похожего на код.
 *
 * Юникодом задача не решается: подстрочных кириллических «п», «пд», «ст» в нём
 * нет — поэтому индекс рисует каталог.
 */
const LABEL_INDEX = /(?<=^|[\s(·/])(\p{L})_([\p{L}\d]{1,3})(?=$|[\s,)·/])/gu;

/**
 * Строковая подпись с плоской нотацией → та же подпись с настоящим `<sub>`.
 * Совпадений нет — возвращается исходная строка, а не массив из одного куска.
 *
 * Класс `a2ui-field__index` тот же, что у захардкоженных JSX-подписей
 * `ConstructionsEditorNext`: стиль индекса один на каталог.
 */
export function renderLabelSubscripts(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  for (const match of text.matchAll(LABEL_INDEX)) {
    const start = match.index ?? 0;

    if (start > cursor) {
      nodes.push(text.slice(cursor, start));
    }

    nodes.push(
      <React.Fragment key={start}>
        {match[1]}
        <sub className="a2ui-field__index">{match[2]}</sub>
      </React.Fragment>,
    );

    cursor = start + match[0].length;
  }

  if (nodes.length === 0) {
    return text;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}
