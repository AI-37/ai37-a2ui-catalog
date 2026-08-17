import React from 'react';
import type {CalcTabsProps} from './calc-editor.types';

/**
 * Вкладки повторяемых экранов расчётного редактора (помещения КЕО, расчётные
 * точки инсоляции) и кнопка добавления. Переключение и добавление — локальные:
 * наружу не уходит ни одного действия до «Рассчитать».
 */
export function CalcTabs({
  prefix,
  labels,
  activeIndex,
  addLabel,
  addDisabled,
  onSelect,
  onAdd,
}: CalcTabsProps) {
  return (
    <div className={`a2ui-${prefix}-tabs`} role="tablist">
      {labels.map((label, index) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={index === activeIndex}
          className={`a2ui-${prefix}-tab${index === activeIndex ? ` a2ui-${prefix}-tab--active` : ''}`}
          onClick={() => onSelect(index)}
        >
          {label}
        </button>
      ))}
      <button
        type="button"
        className={`a2ui-${prefix}-add`}
        disabled={addDisabled}
        onClick={onAdd}
      >
        + {addLabel}
      </button>
    </div>
  );
}
