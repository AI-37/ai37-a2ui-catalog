import type {ReportAction} from './report-assembly.types';

/**
 * Вес кнопки — по роли, а не по отчёту. `outline` — принять предложенный
 * вариант («Подобрать», «Пересчитать»): в отчёте уже есть акцент — вердикт, и
 * вторая заливка рядом спорит с ним за внимание. `link` — уход в редактор
 * («Изменить и пересчитать», «Вернуть в расчёт»).
 */
export type ReportActionWeight = 'outline' | 'link';

export interface ReportActionButtonProps {
  /** Нет действия — нет кнопки: у половины строк списка её и не должно быть. */
  action: ReportAction | undefined;
  weight: ReportActionWeight;
}
