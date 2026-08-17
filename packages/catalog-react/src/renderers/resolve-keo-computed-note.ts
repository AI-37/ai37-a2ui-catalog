import type {KeoComputedNotes} from '@ai37/a2ui-catalog-schemas';
import type {CalcFieldValues} from './calc-editor.types';

/**
 * Подпись плоскости и расчётной точки для текущих значений помещения: строка
 * выбирается по назначению, а точка при необходимости уточняется комнатностью
 * квартиры. Никакой нормативной логики — только выбор готовой строки из props,
 * поэтому подпись пересчитывается локально при каждой правке (Решение 3
 * design.md: компонент знает «ключ → строка», а не СП).
 */
export function resolveKeoComputedNote(
  notes: KeoComputedNotes,
  values: CalcFieldValues,
): string | undefined {
  const purpose = String(values[notes.purposeField] ?? '');
  const entry = notes.byPurpose[purpose];
  if (entry === undefined) return undefined;

  const apartment =
    notes.apartmentField === undefined ? '' : String(values[notes.apartmentField] ?? '');
  const point = entry.byApartment?.[apartment] ?? entry.point;

  return point === undefined ? entry.plane : `${entry.plane} · ${point}`;
}
