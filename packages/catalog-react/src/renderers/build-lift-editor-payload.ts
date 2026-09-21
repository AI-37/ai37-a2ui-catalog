import type {LiftEditorDraft} from './lift-editor.types';
import type {LiftNextDocument} from './lift-next.types';

/**
 * Payload действия формы — документ активной методики плюс ревизия, из
 * которой этот экран собран.
 *
 * `docRev` уезжает обратно нетронутым: по нему агент отличает действие живой
 * формы от действия устаревшего экземпляра, оставшегося в истории чата, и не
 * даёт второму затереть документ. Без пропа ключа в payload нет — агент со
 * старым контрактом видит прежний `{method, building, lifts}`.
 *
 * Общая на оба рендерера намеренно: `LiftEditor` и `LiftEditorNext` обязаны
 * слать одно и то же, а не собирать документ каждый по-своему.
 */
export function buildLiftEditorPayload(
  method: string,
  draft: LiftEditorDraft,
  docRev: number | undefined,
): LiftNextDocument {
  return {
    method,
    building: draft.building,
    lifts: draft.lifts,
    ...(docRev === undefined ? {} : {docRev}),
  };
}
