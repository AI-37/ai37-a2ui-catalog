import type {ReportNextAction, ReportNextActionSink} from './report-next.types';

/**
 * Вес кнопки — по роли, а не по отчёту. `outline` — принять предложенный
 * вариант («Подобрать», «Пересчитать»): в отчёте уже есть акцент — вердикт, и
 * вторая заливка рядом спорит с ним за внимание. `link` — уход в редактор
 * («Изменить и пересчитать», «Вернуть в расчёт»).
 */
export type ReportNextActionWeight = 'outline' | 'link';

export interface ReportNextActionButtonProps {
  /** Нет действия — нет кнопки: у половины строк списка её и не должно быть. */
  action: ReportNextAction | undefined;
  weight: ReportNextActionWeight;
  onAction: ReportNextActionSink;
}
