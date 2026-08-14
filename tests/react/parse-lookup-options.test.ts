import {describe, expect, it} from 'vitest';
import {parseLookupOptions} from '../../packages/catalog-react/src/renderers/parse-lookup-options';

// Контракт fetch-канала: фильтрация, а не пересборка объектов — слоты
// оформления (`group`/`title`/`meta`) и произвольные доп. поля (λА/λБ)
// должны доезжать до рендерера целиком (design.md, Решение 6).
describe('parseLookupOptions', () => {
  it('сохраняет слоты и произвольные доп. поля опции целиком', () => {
    const option = {
      value: 'm-kirpich-glina',
      label: 'Кирпичная кладка — глиняного обыкновенного (ρ 1800)',
      group: 'Кирпичная кладка из сплошного кирпича',
      title: 'Глиняного обыкновенного на цементно-песчаном растворе',
      meta: 'ρ 1800 · λА 0,7 / λБ 0,81',
      lambdaA: 0.7,
    };

    const parsed = parseLookupOptions({options: [option]});

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(option);
  });

  it('отбрасывает элемент без строкового value, сохраняя остальные', () => {
    const valid = {value: 'ok', label: 'Целая опция', title: 'Целая'};

    const parsed = parseLookupOptions({
      options: [{value: 42, label: 'Битая опция'}, valid],
    });

    expect(parsed).toEqual([valid]);
  });
});
