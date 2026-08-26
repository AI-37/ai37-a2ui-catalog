import {keoEditorPropsSchema} from '@ai37/a2ui-catalog-schemas';
import fixture from '../../../../fixtures/valid/keo-editor.json';

/**
 * Наполнение экрана — валидная фикстура каталога, а не выдуманные данные.
 * Разбор схемой, а не приведение типа: JSON из репозитория и типы пакета
 * разъезжаются молча, а `parse` уронит страницу на первом же расхождении.
 *
 * Второе помещение — копия первого без имени (подпись ему даёт `roomLabel`:
 * «Помещение 2»). Второй набор значений пришлось бы выдумать, а сводку
 * свёрнутого помещения и счётчик ВСЕГО документа на одном помещении не
 * проверить: и то и другое молчит, пока помещение одно.
 */
export const KEO_PROPS = keoEditorPropsSchema.parse({
  ...fixture.props,
  rooms: [
    fixture.props.rooms[0],
    Object.fromEntries(
      Object.entries(fixture.props.rooms[0]!).filter(([key]) => key !== 'name'),
    ),
  ],
});
