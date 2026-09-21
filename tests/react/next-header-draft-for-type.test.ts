import {describe, expect, it} from 'vitest';
import type {ConstructionTypeConfig} from '@ai37/a2ui-catalog-schemas';
import {nextHeaderDraftForType} from '../../packages/catalog-react/src/renderers/next-header-draft-for-type';

const CONFIGS: ConstructionTypeConfig[] = [
  {type: 'steny', label: 'Наружные стены', hasLayers: true},
  {type: 'cherdachnye_podval_grunt', label: 'Перекрытия', hasLayers: true},
  {type: 'okna', label: 'Окна', hasLayers: false},
];

describe('nextHeaderDraftForType', () => {
  it('слоистый → слоистый: r остаётся, чужая разновидность уходит', () => {
    const next = nextHeaderDraftForType(
      {type: 'cherdachnye_podval_grunt', subtype: 'cherdak', name: 'Чердак', r: 0.9},
      'steny',
      CONFIGS,
    );
    expect(next).toEqual({type: 'steny', subtype: undefined, name: 'Чердак', r: 0.9});
  });

  it('слоистый → изделие: r сбрасывается вместе с типом', () => {
    const next = nextHeaderDraftForType({type: 'steny', name: 'Стена', r: 0.9}, 'okna', CONFIGS);
    expect(next.r).toBeUndefined();
    expect(next.type).toBe('okna');
  });

  it('тип без конфига считается без слоёв — r не переносится', () => {
    const next = nextHeaderDraftForType({type: 'steny', r: 0.9}, 'dver', CONFIGS);
    expect(next.r).toBeUndefined();
  });
});
