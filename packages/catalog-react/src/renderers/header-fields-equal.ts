import type {ConstructionHeaderFields} from './constructions-editor.types';

/**
 * Сравнение полей шапки поле-в-поле (аналог `layers-equal`): «Сохранить» без
 * изменений равносилен «Отмене» и не должен порождать черновик. Название
 * нормализуется: отсутствие названия и пустая строка для пользователя — одно
 * и то же, стереть уже пустое поле не значит «изменил».
 */
export function headerFieldsEqual(a: ConstructionHeaderFields, b: ConstructionHeaderFields) {
  return a.type === b.type && a.subtype === b.subtype && (a.name ?? '') === (b.name ?? '');
}
