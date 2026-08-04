import type {LookupOption} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionsClimatePatch} from './constructions-editor.types';

/** Климатические поля, которые может нести опция справочника городов. */
const CLIMATE_KEYS = ['tot', 'zot', 'tn'] as const;

/**
 * Читает климат из доп. полей опции подсказки города (контракт fetch-ответа —
 * `LookupOption & Record<string, unknown>`; агент-владелец справочника кладёт
 * `tot`/`zot`/`tn` числами). В отличие от λ (`read-option-lambda`) допускаются
 * отрицательные значения: tот и tн ниже нуля — норма. Не число (или NaN) —
 * поля нет, соответствующее поле формы не трогается.
 */
export function readOptionClimate(option: LookupOption): ConstructionsClimatePatch {
  const source = option as LookupOption & Record<string, unknown>;
  const patch: ConstructionsClimatePatch = {};

  for (const key of CLIMATE_KEYS) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      patch[key] = value;
    }
  }

  return patch;
}
