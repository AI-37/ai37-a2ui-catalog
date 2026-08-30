import type {AddItemState, AddItemStateInput} from './add-item-state.types';

/**
 * Одно правило кнопки добавления на все списки с пределом (`maxRooms` у
 * `KeoEditorNext`, `maxLifts` у `LiftEditorNext`): формула у них была
 * дословно одна, и копия разошлась бы на первой же правке.
 *
 * Различаем ВИД предела, а не его значение (design next-add-item-limit,
 * Решения 1–2):
 *
 * - временный — освобождается удалением: кнопка гаснет и вернётся в работу,
 *   исчезновение перестраивало бы экран под руками;
 * - постоянный — верхняя граница сошлась с нижней, освободить нечем: кнопки
 *   нет вовсе, иначе экран показывает управляющий элемент, у которого
 *   доказуемо нет пути в рабочее состояние.
 */
export function resolveAddItemState({count, max, minCount}: AddItemStateInput): AddItemState {
  if (max === undefined || count < max) {
    return 'available';
  }

  return count <= minCount ? 'hidden' : 'disabled';
}
