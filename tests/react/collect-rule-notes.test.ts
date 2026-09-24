import {describe, expect, it} from 'vitest';
import type {LiftEditorDependentRule} from '@ai37/a2ui-catalog-schemas';
import {collectRuleNotes} from '../../packages/catalog-react/src/renderers/collect-rule-notes';

const SP54_RULE: LiftEditorDependentRule = {
  sources: [{field: 'N', scope: 'building'}, {field: 'Vn'}],
  rows: [
    {when: [18, 1], note: {field: 'Vn', text: 'ниже минимума СП 54'}},
    {when: [19, 1], note: {field: 'Vn', text: 'ниже минимума СП 54', tone: 'muted'}},
  ],
};

const VN_RULE: LiftEditorDependentRule = {
  sources: [{field: 'Vn'}],
  rows: [{when: [1], set: {h: 1.5}}],
};

describe('collectRuleNotes', () => {
  it('совпавшая строка с note даёт подпись полю, числа сравниваются численно', () => {
    expect(collectRuleNotes([SP54_RULE], {N: '18'}, {Vn: '1.0'})).toEqual({
      Vn: {field: 'Vn', text: 'ниже минимума СП 54'},
    });
    expect(collectRuleNotes([SP54_RULE], {N: 19}, {Vn: '1,0'}).Vn?.tone).toBe('muted');
  });

  it('нет совпадения — подписи нет', () => {
    expect(collectRuleNotes([SP54_RULE], {N: 17}, {Vn: 1})).toEqual({});
    expect(collectRuleNotes([SP54_RULE], {N: 18}, {Vn: 1.6})).toEqual({});
    expect(collectRuleNotes([SP54_RULE], {}, {Vn: 1})).toEqual({});
  });

  it('строки только с set подписей не дают', () => {
    expect(collectRuleNotes([VN_RULE], {}, {Vn: 1})).toEqual({});
  });

  it('на одно поле побеждает первое правило', () => {
    const other: LiftEditorDependentRule = {
      sources: [{field: 'Vn'}],
      rows: [{when: [1], note: {field: 'Vn', text: 'второе'}}],
    };
    expect(collectRuleNotes([SP54_RULE, other], {N: 18}, {Vn: 1}).Vn?.text).toBe('ниже минимума СП 54');
  });
});
