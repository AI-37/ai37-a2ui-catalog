import React from 'react';
import {render} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {renderLabelSubscripts} from '../../packages/catalog-react/src/primitives/render-label-subscripts';

/**
 * Правило узкое намеренно: подпись — человеческий текст, и жадное правило
 * превратило бы `some_word` в подстрочный индекс. Здесь проверяются обе
 * стороны границы — что распознаётся и что обязано пройти насквозь.
 */
function draw(text: string) {
  const {container} = render(<span>{renderLabelSubscripts(text)}</span>);

  return {
    text: container.textContent ?? '',
    indexes: Array.from(container.querySelectorAll('sub')).map(node => node.textContent),
  };
}

describe('renderLabelSubscripts', () => {
  it.each([
    ['d_п — глубина помещения, м', 'd', 'п'],
    ['h_пд — высота подоконника, м', 'h', 'пд'],
    ['Δ_ст — толщина стены, м', 'Δ', 'ст'],
    ['ρ_ф — отражение фасада', 'ρ', 'ф'],
    ['C_N по табл. 5.1', 'C', 'N'],
    ['r_0 — отражённый свет', 'r', '0'],
    ['ε_зд — затенение зданием', 'ε', 'зд'],
  ])('%s рендерит индекс подстрочным', (label, base, index) => {
    const drawn = draw(label);

    expect(drawn.indexes).toEqual([index]);
    expect(drawn.text).toBe(label.replace(`${base}_${index}`, `${base}${index}`));
    expect(drawn.text).not.toContain('_');
  });

  it.each(['Остекление', 'some_word в подписи', 'ГСОП', 'MF по табл. 4.3', 'e_норм'])(
    '%s проходит насквозь',
    label => {
      const drawn = draw(label);

      expect(drawn.indexes).toEqual([]);
      expect(drawn.text).toBe(label);
    },
  );

  it('сводка секции получает индекс у каждого символа', () => {
    const drawn = draw('d_п 5.4 · b_п 3.4 · h_пд 0.8');

    expect(drawn.indexes).toEqual(['п', 'п', 'пд']);
    expect(drawn.text).toBe('dп 5.4 · bп 3.4 · hпд 0.8');
  });

  it('индекс в скобках распознаётся по границам токена', () => {
    const drawn = draw('высота (h_о) окна');

    expect(drawn.indexes).toEqual(['о']);
    expect(drawn.text).toBe('высота (hо) окна');
  });

  it('текст без совпадений возвращается строкой, а не массивом кусков', () => {
    expect(renderLabelSubscripts('Остекление')).toBe('Остекление');
  });
});
