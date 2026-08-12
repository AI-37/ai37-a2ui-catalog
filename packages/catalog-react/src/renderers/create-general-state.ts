import type {ConstructionsEditorProps, ConstructionsGeneral} from '@ai37/a2ui-catalog-schemas';

/**
 * Начальное состояние вкладки «Общие данные» из props: копия блока `general`
 * (или пустой блок, если агент его не прислал). Спец-случаи:
 *
 * - `buildingType` не задан → первый вариант `buildingTypeOptions`: список
 *   упорядочен агентом, первый в нём и есть значение по умолчанию (жилое).
 *   Пустой выбор остаётся доступным — вариант «—» в селекте;
 * - `condition` берётся из `general`, при пустом значении — из устаревшего
 *   top-level пропа (Решение 6 design.md), а если нет и его — «Б». Пустой
 *   селект показывал бы «—» там, где расчёт всё равно идёт по λБ: значение,
 *   с которым считают, должно быть видно;
 * - `gsop` переносится как есть: клиент его не считает и не правит, но держит в
 *   состоянии — иначе показ рядом с регионом пришлось бы читать из props мимо
 *   единственного источника правды (Решение 3 design.md).
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
    condition: general?.condition ?? condition ?? 'Б',
    gsop: general?.gsop ?? null,
  };
}
