import type {ConstructionsGeneral} from '@ai37/a2ui-catalog-schemas';

/**
 * Ключ климатической части общих данных — снимок полей, из которых агент
 * считал `rnorm` (Решение 4 design.md): `buildingType`, город, tот, zот, tн,
 * tв. Сравнение ключа состояния с ключом props отвечает на вопрос «климат
 * тронут?»; отличие означает, что присланный `rnorm` протух и сравнение с ним
 * показывать нельзя. `condition` в ключ не входит: выбор λА/λБ на Rнорм не
 * влияет.
 *
 * Сравнение по значению, а не по ссылке: props пересобираются на каждый
 * рендер surface'а, и ссылочное равенство сбрасывало бы снимок впустую.
 */
export function climateKey(general: ConstructionsGeneral | undefined): string {
  return JSON.stringify([
    general?.buildingType ?? null,
    general?.city?.value ?? null,
    general?.tot ?? null,
    general?.zot ?? null,
    general?.tn ?? null,
    general?.tv ?? null,
  ]);
}
