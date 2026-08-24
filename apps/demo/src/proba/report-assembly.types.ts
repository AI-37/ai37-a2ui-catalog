import type {
  LiftReportProps,
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
export type ReportVerdict = ThermalReportVerdict;
export type ReportInputs = ThermalReportInputs;
export type ReportProtocol = ThermalReportProtocol;
export type ReportAction = ThermalReportAction;

/** Тон варианта «Что изменить»: своей строкой, чтобы не тянуть весь Suggestion. */
export type LiftSuggestionTone = LiftReportSuggestion['tone'];

/** Подпись блока страницы: одна на все три наполнения. */
interface ReportBlockMeta {
  id: string;
  title: string;
  lead: string;
}

export interface ThermalReportBlock extends ReportBlockMeta {
  kind: 'thermal';
  props: ThermalReportProps;
}

export interface LiftReportBlock extends ReportBlockMeta {
  kind: 'lift';
  props: LiftReportProps;
}

export type ReportAssemblyBlock = ThermalReportBlock | LiftReportBlock;
