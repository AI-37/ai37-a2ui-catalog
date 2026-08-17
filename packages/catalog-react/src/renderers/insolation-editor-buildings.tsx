import React from 'react';
import {CalcEditorField as CalcField} from './calc-editor-field';
import {calcFieldRangeWarning} from './calc-field-range-warning';
import type {InsolationBuildingsProps} from './insolation-editor.types';

/**
 * Секция затеняющей застройки: здания — компактные строки (направление
 * select'ом, расстояние/высота/фронт числами) с удалением строки и «+ Добавить
 * здание». Список общий для всех расчётных точек, как на генплане: связь
 * «какое здание какую точку затеняет» вычисляет агент (Решение 1–2 design.md).
 * Правки и добавление локальны — наружу они уедут только с submit'ом.
 */
export function InsolationBuildings({
  title,
  fields,
  buildings,
  addLabel,
  removeLabel,
  addDisabled,
  isEdited,
  onChange,
  onAdd,
  onRemove,
}: InsolationBuildingsProps) {
  return (
    <section className="a2ui-ie-section">
      <div className="a2ui-ie-section__head">
        <span className="a2ui-ie-section__title">{title}</span>
        <span className="a2ui-ie-section__spacer" />
        <button type="button" className="a2ui-ie-add" disabled={addDisabled} onClick={onAdd}>
          + {addLabel}
        </button>
      </div>
      <div className="a2ui-ie-buildings">
        {buildings.length === 0 ? (
          <span className="a2ui-ie-buildings__empty">Застройка не указана</span>
        ) : null}
        {buildings.map(building => (
          <div key={building.id} className="a2ui-ie-building">
            {fields.map(field => {
              const range = calcFieldRangeWarning(field, building.values[field.name]);

              return (
                <CalcField
                  key={field.name}
                  prefix="ie"
                  field={field}
                  value={building.values[field.name]}
                  source={building.sources[field.name]}
                  edited={isEdited(building.id, field.name)}
                  warnings={range === undefined ? [] : [range]}
                  onChange={value => onChange(building.id, field.name, value)}
                />
              );
            })}
            <button
              type="button"
              className="a2ui-ie-link a2ui-ie-link--danger a2ui-ie-building__remove"
              onClick={() => onRemove(building.id)}
            >
              {removeLabel}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
