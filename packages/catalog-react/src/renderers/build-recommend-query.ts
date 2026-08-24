import type {LiftEditorRecommend} from '@ai37/a2ui-catalog-schemas';
import {isEmptyLiftValue} from './is-empty-lift-value';
import type {LiftFieldValues} from './lift-editor.types';
import type {RecommendQuery} from './recommend.types';

/**
 * Query подбора из декларации `params` и текущего черновика. Какие поля
 * уходят — знает наполнение, не компонент: состав параметров у методик разный,
 * а про ГОСТ здесь ничего не известно.
 *
 * `null` — запрос не уходит: хотя бы одно обязательное поле пусто. Пустое
 * необязательное просто пропускается, а не отправляется пустой строкой —
 * иначе ручка получит «H0=» и не отличит его от нуля.
 *
 * Ключ актуальности собирается из тех же пар, что и query: ответ на другой
 * ввод отбрасывается по нему, а не по эху ручки (эхо — только страховка).
 */
export function buildRecommendQuery({
  recommend,
  building,
  lift,
}: {
  recommend: LiftEditorRecommend;
  building: LiftFieldValues;
  /** Первая лифтовая секция: параметры со `scope: 'lift'` берутся из неё. */
  lift: LiftFieldValues;
}): RecommendQuery | null {
  const pairs: Array<[string, string]> = [];

  for (const param of recommend.params) {
    const source = param.scope === 'lift' ? lift : building;
    const value = source[param.name];

    if (isEmptyLiftValue(value)) {
      if (param.required === true) {
        return null;
      }
      continue;
    }

    pairs.push([param.name, String(value)]);
  }

  const params = new URLSearchParams({resource: recommend.resource});
  if (recommend.taskId !== undefined) {
    params.set('taskId', recommend.taskId);
  }
  for (const [name, value] of pairs) {
    params.set(name, value);
  }

  return {params, key: JSON.stringify(pairs)};
}
