import type {
  LiftReportSuggestion,
  ThermalReportAction,
  ThermalReportInputs,
  ThermalReportProps,
  ThermalReportProtocol,
  ThermalReportVerdict,
} from '@ai37/a2ui-catalog-schemas';

/**
 * Общие части отчётов. Контракты `verdict`, `inputs`, `protocol` и `action` у
 * теплотеха и лифтов совпадают, поэтому здесь взят один из двух: собирают их
 * одни и те же компоненты, и разойтись им нечем. У протокола лифтов полей
 * меньше (нет Blob-полей), но все лишние необязательны — значение подходит.
 */
export type ReportNextVerdict = ThermalReportVerdict;
export type ReportNextInputs = ThermalReportInputs;
export type ReportNextProtocol = ThermalReportProtocol;
export type ReportNextAction = ThermalReportAction;

/**
 * Куда уходит нажатая кнопка. Рендерер подставляет `context.dispatchAction`,
 * песочница — консоль: своего состояния «отправлено» отчёт не показывает,
 * ответ приносит агент.
 */
export type ReportNextActionSink = (action: ReportNextAction) => void;

/** Тон варианта «Что изменить»: своей строкой, чтобы не тянуть весь Suggestion. */
export type LiftNextSuggestionTone = LiftReportSuggestion['tone'];

/** Экран отчёта: наполнение из props компонента и один выход наружу. */
export interface ThermalReportNextScreenProps {
  props: ThermalReportProps;
  onAction: ReportNextActionSink;
}
