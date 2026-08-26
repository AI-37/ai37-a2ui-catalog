import type {ReportNextStatus} from './report-next-status-text';

/**
 * Тон варианта «Что изменить» словарём КЕО в состояние отчёта: проходящий
 * вариант у КЕО назван `success`, у лифтов — `pass`, а слово состояния и
 * пилюля набора знают одно имя. Словарь живёт здесь, а не в примитиве:
 * расходятся схемы агентов, набор про их историю знать не обязан. `neutral`
 * в словарь не входит — состоянием он не является и слова не получает.
 */
export const KEO_REPORT_NEXT_STATUS: Record<'success' | 'fail', ReportNextStatus> = {
  success: 'pass',
  fail: 'fail',
};
