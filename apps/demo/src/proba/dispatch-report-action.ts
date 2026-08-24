import type {ReportNextAction} from '../../../../packages/catalog-react/src/renderers/report-next.types';

/**
 * Действие отчёта в песочнице: одно сообщение в консоль с именем и payload'ом.
 * На экране служебного трафика нет — приёмка по этой части идёт в devtools, а
 * не по мигающим плашкам. В рендерере на этом месте `context.dispatchAction`.
 */
export function dispatchReportAction(action: ReportNextAction): void {
  console.log('[report]', {name: action.name, payload: action.payload ?? {}});
}
