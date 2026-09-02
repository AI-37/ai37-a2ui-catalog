import type {KeoEditorProps} from '@ai37/a2ui-catalog-schemas';
import type {KeoDocument} from './keo-next.types';

/**
 * СПАЙК keo-draft-rest-channel: вид props ГЛАЗАМИ ЧЕРНОВИКА, добранного GET'ом
 * при монтировании. Зеркало агентского `buildKeoEditor(draft)`: значения полей
 * и условий — из черновика, метки источников — из props (черновик происхождение
 * значений не двигает). Помещений в черновике может быть больше, чем в props
 * (добавленные до перезагрузки) — лишним достаются пустые sources.
 */
export function applyKeoDraftSeed(
  props: KeoEditorProps,
  seed: KeoDocument | undefined,
): KeoEditorProps {
  if (seed === undefined) {
    return props;
  }

  return {
    ...props,
    rooms: seed.rooms.map((room, position) => ({
      ...(room.name !== undefined ? {name: room.name} : {}),
      values: room.values,
      sources: props.rooms[position]?.sources ?? {},
    })),
    conditions: props.conditions.map(condition => {
      const value = seed.conditions[condition.name];
      return typeof value === 'string' ? {...condition, value} : condition;
    }),
  };
}
