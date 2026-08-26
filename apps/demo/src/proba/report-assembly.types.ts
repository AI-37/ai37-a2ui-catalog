import type {LiftReportProps, ThermalReportProps} from '@ai37/a2ui-catalog-schemas';

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
