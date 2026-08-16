import type {LiftEditorMethodConfig} from '@ai37/a2ui-catalog-schemas';
import {findMissingRequired} from './find-missing-required';
import type {LiftEditorDraft, LiftSectionKey} from './lift-editor.types';

/**
 * Незаполненные обязательные поля по секциям. Порядок ключей — порядок секций
 * на экране (здание, затем лифты): им пользуется навигация кнопки `pendingLabel`.
 */
export function findMissingBySection(
  config: LiftEditorMethodConfig,
  draft: LiftEditorDraft,
): Map<LiftSectionKey, string[]> {
  const missing = new Map<LiftSectionKey, string[]>();

  const building = findMissingRequired(config.buildingFields, draft.building);
  if (building.length > 0) missing.set('building', building);

  draft.lifts.forEach((lift, index) => {
    const fields = findMissingRequired(config.liftFields, lift);
    if (fields.length > 0) missing.set(`lift-${index}`, fields);
  });

  return missing;
}
