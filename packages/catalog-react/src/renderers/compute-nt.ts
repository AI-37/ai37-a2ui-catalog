import type {ConstructionEntry} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionsClimateBase} from './constructions-next.types';

/**
 * Коэффициент nt по формуле (5.3) СП 50.13330.2024:
 * `nt = (tв* − tот*) / (tв − tот)` — поправка базового Rтр таблицы 3, когда
 * средняя внутренняя или наружная температура ОТДЕЛЬНОГО помещения отличается
 * от принятых в расчёте ГСОП. Пункт 5.3 исключений по столбцам таблицы не
 * делает, и приложение К СП 50 само считает nt для перекрытия над
 * неотапливаемым подвалом, поэтому поправка применима к любому типу.
 *
 * Незаданное поле берётся общим по зданию, поэтому одна введённая температура
 * уже даёт поправку. `null` — поправки нет:
 *
 * - ни tв*, ни tот* не заданы (nt = 1, показывать нечего);
 * - климат здания неполон — знаменатель неизвестен;
 * - пара бессмысленна (tв ≤ tот, или tв* ≤ тот*): на клиенте это индикация, а
 *   не блок — о негодной паре скажет агент, канон расчёта на сервере.
 */
export function computeNt(
  entry: ConstructionEntry,
  climate: ConstructionsClimateBase,
): number | null {
  if (entry.tvRoom === undefined && entry.totRoom === undefined) {
    return null;
  }

  const {tv, tot} = climate;
  if (tv === null || tot === null) {
    return null;
  }

  const base = tv - tot;
  if (base <= 0) {
    return null;
  }

  const nt = ((entry.tvRoom ?? tv) - (entry.totRoom ?? tot)) / base;
  return nt > 0 ? nt : null;
}
