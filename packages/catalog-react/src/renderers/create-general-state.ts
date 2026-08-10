import type {ConstructionsEditorProps, ConstructionsGeneral} from '@ai37/a2ui-catalog-schemas';

/**
 * Начальное состояние вкладки «Общие данные» из props: копия блока `general`
 * (или пустой блок, если агент его не прислал). Спец-случаи:
 *
 * - `buildingType` не задан → первый вариант `buildingTypeOptions`: список
 *   упорядочен агентом, первый в нём и есть значение по умолчанию (жилое).
 *   Пустой выбор остаётся доступным — вариант «—» в селекте;
 * - `condition` берётся из `general`, а при пустом значении — из устаревшего
 *   top-level пропа (Решение 6 design.md); `null` дальше означает λБ, как на
 *   сервере.
 */
export function createGeneralState(
  general: ConstructionsGeneral | undefined,
  condition: ConstructionsEditorProps['condition'],
  buildingTypeOptions: string[] | undefined,
): ConstructionsGeneral {
  return {
    buildingType: general?.buildingType ?? buildingTypeOptions?.[0] ?? null,
    city: general?.city ? {...general.city} : null,
    tot: general?.tot ?? null,
    zot: general?.zot ?? null,
    tn: general?.tn ?? null,
    tv: general?.tv ?? null,
    condition: general?.condition ?? condition ?? null,
  };
}
