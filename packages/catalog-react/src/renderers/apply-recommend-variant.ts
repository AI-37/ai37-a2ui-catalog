import type {LiftEditorMethodConfig, RecommendResourceVariant} from '@ai37/a2ui-catalog-schemas';
import {seedLiftValues} from './seed-lift-values';
import type {LiftEditorDraft} from './lift-editor.types';

/**
 * Применение варианта как структурного действия: чистая функция, тестируемая
 * без DOM. Имён доменных полей она не знает — что писать, целиком приходит в
 * `apply`.
 *
 * `per-lift`: число секций приводится к `apply.count` с клампом по `maxLifts`
 * конфига — вариант «6 лифтов» на методике, где их максимум 4, не должен
 * порождать секций больше, чем разрешено. `group`: секция одна, `count`
 * игнорируется — число лифтов приезжает обычным полем в `buildingValues`.
 *
 * Уже введённые значения полей, которых нет в варианте, сохраняются: вариант
 * задаёт конфигурацию лифта, а не обнуляет форму.
 */
export function applyRecommendVariant({
  draft,
  config,
  variant,
}: {
  draft: LiftEditorDraft;
  config: LiftEditorMethodConfig;
  variant: RecommendResourceVariant;
}): LiftEditorDraft {
  const building = {...draft.building, ...(variant.apply.buildingValues ?? {})};

  if (config.liftsMode === 'group') {
    const base = draft.lifts[0] ?? seedLiftValues(config.liftFields);
    return {building, lifts: [{...base, ...variant.apply.values}]};
  }

  const count = Math.min(variant.apply.count, config.maxLifts ?? variant.apply.count);
  const lifts = Array.from({length: count}, (_unused, index) => ({
    ...(draft.lifts[index] ?? seedLiftValues(config.liftFields)),
    ...variant.apply.values,
  }));

  return {building, lifts};
}
