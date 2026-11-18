import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {
  A2UI_MESSAGES,
  A2uiI18nProvider,
  createA2uiI18n,
  formatMessage,
  formatPlural,
} from '@ai37/a2ui-catalog-react';
import {NumberField} from '@ai37/a2ui-catalog-react/primitives';
import {buildConditionsSummary} from '../../packages/catalog-react/src/renderers/build-conditions-summary';
import {buildReportInputsSummary} from '../../packages/catalog-react/src/renderers/build-report-inputs-summary';
import {calcFieldRangeWarning} from '../../packages/catalog-react/src/renderers/calc-field-range-warning';
import {formatDeviationPct} from '../../packages/catalog-react/src/renderers/format-deviation-pct';
import {formatGsop} from '../../packages/catalog-react/src/renderers/format-gsop';
import {formatMissingLambda} from '../../packages/catalog-react/src/renderers/format-missing-lambda';
import {formatNum} from '../../packages/catalog-react/src/renderers/keo-drawing/format-num';

const NBSP = ' ';

describe('формы по числу', () => {
  it.each([
    [1, '1 слой без λ'],
    [2, '2 слоя без λ'],
    [5, '5 слоёв без λ'],
    [11, '11 слоёв без λ'],
    [21, '21 слой без λ'],
    [22, '22 слоя без λ'],
  ])('по-русски без провайдера: %i → %s', (count, text) => {
    expect(formatMissingLambda(count)).toBe(text);
  });

  it('по-английски one/other, по-французски 0 — единственное', () => {
    expect(formatMissingLambda(1, createA2uiI18n('en'))).toBe('1 layer without λ');
    expect(formatMissingLambda(3, createA2uiI18n('en'))).toBe('3 layers without λ');
    expect(formatPlural('fr', A2UI_MESSAGES.fr.report.assumptionsCount, 0)).toBe('0 hypothèse');
  });

  it('категории нет в словаре — берётся other', () => {
    expect(formatPlural('ru', {other: '{count} шт.'}, 3)).toBe('3 шт.');
  });

  it('сводка исходных данных собирается на языке локали', () => {
    const inputs = {
      groups: [
        {label: 'a', chips: [{label: 'x', value: '1'}]},
        {
          label: 'b',
          tone: 'warning' as const,
          chips: [
            {label: 'y', value: '2'},
            {label: 'z', value: '3'},
          ],
        },
      ],
    };

    expect(buildReportInputsSummary(inputs)).toBe('3 значения · 2 приняты системой');
    expect(buildReportInputsSummary(inputs, createA2uiI18n('en'))).toBe(
      '3 values · 2 assumed by the system',
    );
  });
});

describe('числа по локали', () => {
  it('отклонение: без локали по-русски, дальше по тегу', () => {
    expect(formatDeviationPct(-23.34)).toBe('−23,3 %');
    expect(formatDeviationPct(0.6, 'en')).toBe('+0.6 %');
    expect(formatDeviationPct(-5, 'de')).toBe('−5,0 %');
  });

  it('ГСОП с разрядами локали', () => {
    expect(formatGsop(6380.4)).toBe(`6${NBSP}380`);
    expect(formatGsop(6380.4, 'en')).toBe('6,380');
    expect(formatGsop(16380, 'de')).toBe('16.380');
  });

  it('числа чертежа: разделитель локали, без разрядов', () => {
    expect(formatNum(19.98)).toBe('20,0');
    expect(formatNum(19.98, 1, 'en')).toBe('20.0');
    expect(formatNum(1234.5, 0, 'en')).toBe('1235');
  });

  it('границы поля в пометке — по локали', () => {
    const field = {name: 'h', label: 'h', type: 'number', min: 0.5, max: 2.5} as never;

    expect(calcFieldRangeWarning(field, 3)).toBe('вне диапазона 0,5…2,5');
    expect(calcFieldRangeWarning(field, 3, createA2uiI18n('en'))).toBe('out of range 0.5…2.5');
    const onlyMin = {...(field as object), max: undefined} as never;
    expect(calcFieldRangeWarning(onlyMin, 0.1, createA2uiI18n('es'))).toBe('menor que 0,5');
  });

  it('сводка условий: слова по словарю, значения как есть', () => {
    const general = {
      city: {value: 'msk', label: 'Москва'},
      buildingType: null,
      tv: 20,
      tot: -2.2,
      zot: 205,
      tn: -25,
      condition: 'Б',
    } as never;

    expect(buildConditionsSummary(general)).toBe(
      'Москва · климат по СП 131 · tв +20 °C · условия Б',
    );
    expect(buildConditionsSummary(general, A2UI_MESSAGES.en)).toBe(
      'Москва · climate per СП 131 · tв +20 °C · conditions Б',
    );
  });

  it('подстановка: неизвестное имя остаётся видимым', () => {
    expect(formatMessage('{a} и {b}', {a: 1})).toBe('1 и {b}');
  });

  it('NumberField пишет десятичный разделитель локали', () => {
    const field = <NumberField value={3.5} onValueChange={() => undefined} aria-label="n" />;
    const {unmount} = render(field);
    expect(screen.getByLabelText('n')).toHaveValue('3,5');
    unmount();

    render(
      <A2uiI18nProvider locale="en">{field}</A2uiI18nProvider>,
    );
    expect(screen.getByLabelText('n')).toHaveValue('3.5');
  });
});
