import type {LiftReportAction} from '@ai37/a2ui-catalog-schemas';

/** Колбэк секций: клик по действию поднимается в корень, диспатчит только он. */
export type LiftReportOnAction = (action: LiftReportAction) => void;
