import type {CalcFieldSourceKind} from '@ai37/a2ui-catalog-schemas';

/**
 * Названия видов источника словами — подписи полей расчётных редакторов (КЕО,
 * инсоляция). Свой словарь, а не констракшновый `fieldSourceLabel`: у
 * расчётных модулей два дополнительных вида — «рассчитано» (значение посчитал
 * агент) и «допущение» (значение принято без данных проекта).
 */
const LABELS: Record<CalcFieldSourceKind, string> = {
  project: 'из проекта',
  question: 'из вашего вопроса',
  suggested: 'предложено агентом',
  calculated: 'рассчитано',
  assumption: 'допущение',
};

/** Метка поля, которое пользователь правил: источник больше не агентский. */
export const CALC_EDITED_LABEL = 'изменено вами';

export function calcFieldSourceLabel(kind: CalcFieldSourceKind): string {
  return LABELS[kind];
}
