import type {LiftEditorProps} from '@ai37/a2ui-catalog-schemas';

/** Одна ветка витрины: наполнение методики и подписи блока над ней. */
export interface LiftBranch {
  id: string;
  title: string;
  lead: string;
  props: LiftEditorProps;
}
