import type {LiftEditorProps} from '@ai37/a2ui-catalog-schemas';
import {seedLiftValues} from './seed-lift-values';
import type {LiftEditorDrafts} from './lift-editor.types';

/**
 * Черновики всех методик из props: активная ветка засевается присланными
 * значениями, остальные — дефолтами своих полей. Так переключение методики
 * туда-обратно ничего не теряет и ничего не переносит между ветками.
 */
export function createLiftEditorDrafts(props: LiftEditorProps): LiftEditorDrafts {
  const drafts: LiftEditorDrafts = {};

  for (const config of props.methodConfigs) {
    const isActive = config.method === props.method;
    const lifts = isActive && props.lifts.length > 0 ? props.lifts : [];

    drafts[config.method] = {
      building: isActive
        ? {...seedLiftValues(config.buildingFields), ...props.building}
        : seedLiftValues(config.buildingFields),
      lifts:
        lifts.length > 0
          ? lifts.map(lift => ({...seedLiftValues(config.liftFields), ...lift}))
          : [seedLiftValues(config.liftFields)],
    };
  }

  return drafts;
}
