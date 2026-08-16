import type {LiftEditorMethodConfig} from '@ai37/a2ui-catalog-schemas';
import {findMissingBySection} from './find-missing-by-section';
import type {LiftEditorDraft, LiftSectionKey} from './lift-editor.types';

/**
 * Секция, раскрытая при монтировании и на новом снапшоте props: первая с
 * незаполненными обязательными полями, иначе — «Здание» (полный документ
 * открывается сверху, а не свёрнутым в ноль).
 */
export function pickInitialOpenSection(
  config: LiftEditorMethodConfig,
  draft: LiftEditorDraft,
): LiftSectionKey {
  const first = findMissingBySection(config, draft).keys().next();

  return first.done ? 'building' : first.value;
}
