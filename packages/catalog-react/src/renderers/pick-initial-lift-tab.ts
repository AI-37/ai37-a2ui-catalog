import type {LiftEditorMethodConfig} from '@ai37/a2ui-catalog-schemas';
import {findMissingRequired} from './find-missing-required';
import type {LiftEditorDraft, LiftEditorTab} from './lift-editor.types';

/**
 * Вкладка при монтировании: первая с незаполненными обязательными полями,
 * иначе — последняя вкладка лифта (пользователь продолжает с того лифта, к
 * которому его подвёл агент).
 */
export function pickInitialLiftTab(
  config: LiftEditorMethodConfig,
  draft: LiftEditorDraft,
): LiftEditorTab {
  if (findMissingRequired(config.buildingFields, draft.building).length > 0) {
    return 'building';
  }

  const incomplete = draft.lifts.findIndex(
    lift => findMissingRequired(config.liftFields, lift).length > 0,
  );

  return incomplete >= 0 ? incomplete : Math.max(0, draft.lifts.length - 1);
}
