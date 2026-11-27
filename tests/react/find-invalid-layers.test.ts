import {describe, expect, it} from 'vitest';
import type {
  ConstructionEntry,
  ConstructionTypeConfig,
} from '@ai37/a2ui-catalog-schemas';
import {findInvalidLayers} from '../../packages/catalog-react/src/renderers/find-invalid-layers';

/**
 * Невыбранная разновидность — пятая причина невалидности (change
 * constructions-missing-subtype-invalid). Обязательность разновидности
 * выводится из формы `alphaN`, присланной агентом, а не из списка типов в
 * клиенте: появится второй тип с разновидностями — клиент узнает о нём сам.
 */
const FILLED_LAYERS: ConstructionEntry['layers'] = [
  {material: 'Железобетон', thicknessMm: 200, lambdaA: 1.92, lambdaB: 2.04},
];

function entry(overrides: Partial<ConstructionEntry> = {}): ConstructionEntry {
  return {id: 'c-1', type: 'cherdachnye_podval_grunt', layers: FILLED_LAYERS, ...overrides};
}

const SUBTYPED_CONFIG: ConstructionTypeConfig = {
  type: 'cherdachnye_podval_grunt',
  label: 'Чердачные и цокольные перекрытия, полы',
  hasLayers: true,
  alphaN: {cherdak: 12, podval_vent: 17, podval_nevent: 6},
};

const PLAIN_CONFIG: ConstructionTypeConfig = {
  type: 'steny',
  label: 'Наружные стены',
  hasLayers: true,
  alphaN: 23,
};

describe('findInvalidLayers: разновидность', () => {
  it('αн записью и разновидность не выбрана — невалидна, счёт слоёв не называется', () => {
    const result = findInvalidLayers(entry(), SUBTYPED_CONFIG);

    expect(result.missingSubtype).toBe(true);
    expect(result.invalid).toBe(true);
    expect(result.missingLambdaCount).toBeNull();
  });

  it('слои без λ не подменяют причину: при незаполненной разновидности счёта нет', () => {
    const result = findInvalidLayers(
      entry({layers: [{material: 'Минвата', thicknessMm: 150}]}),
      SUBTYPED_CONFIG,
    );

    expect(result.layerIndexes).toEqual([0]);
    expect(result.missingLambdaCount).toBeNull();
  });

  it('разновидность выбрана — валидна, без обращения к агенту', () => {
    const result = findInvalidLayers(entry({subtype: 'cherdak'}), SUBTYPED_CONFIG);

    expect(result.missingSubtype).toBe(false);
    expect(result.invalid).toBe(false);
  });

  it('αн числом — отсутствие разновидности ни на что не влияет', () => {
    const result = findInvalidLayers(entry({type: 'steny'}), PLAIN_CONFIG);

    expect(result.missingSubtype).toBe(false);
    expect(result.invalid).toBe(false);
  });

  it('конфига типа нет вовсе — поведение прежнее', () => {
    const result = findInvalidLayers(entry(), undefined);

    expect(result.missingSubtype).toBe(false);
    expect(result.invalid).toBe(false);
  });

  it('счёт «N слоёв без λ» сохраняется там, где разновидность ни при чём', () => {
    const result = findInvalidLayers(
      entry({type: 'steny', layers: [{material: 'Минвата', thicknessMm: 150}]}),
      PLAIN_CONFIG,
    );

    expect(result.missingLambdaCount).toBe(1);
  });

  it('тип без слоёв: разновидность обязательна и не выбрана — невалиден даже с паспортом', () => {
    const result = findInvalidLayers(
      entry({layers: [], rprPassport: 0.56}),
      {...SUBTYPED_CONFIG, hasLayers: false},
    );

    expect(result.missingSubtype).toBe(true);
    expect(result.invalid).toBe(true);
  });
});
