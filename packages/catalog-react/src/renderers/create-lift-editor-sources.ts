import type {LiftEditorProps} from '@ai37/a2ui-catalog-schemas';
import type {LiftEditorSourcesByMethod} from './lift-editor.types';

/**
 * Источники значений из props по методикам: заполнены только у активной ветки
 * (агент прислал провенанс для неё), остальные — пустые. Массив лифтов
 * выравнивается с массивом черновика, чтобы add/remove двигали оба одинаково.
 */
export function createLiftEditorSources(props: LiftEditorProps): LiftEditorSourcesByMethod {
  const sources: LiftEditorSourcesByMethod = {};

  for (const config of props.methodConfigs) {
    const isActive = config.method === props.method;
    const liftCount = isActive && props.lifts.length > 0 ? props.lifts.length : 1;

    sources[config.method] = {
      building: isActive ? (props.buildingSources ?? {}) : {},
      lifts: Array.from({length: liftCount}, (_unused, index) =>
        isActive ? (props.liftSources?.[index] ?? {}) : {},
      ),
    };
  }

  return sources;
}
