import React from 'react';
import type {CalcConditionsProps} from './calc-editor.types';

/**
 * Блок «Условия» расчётного редактора — readonly-строки: регион с группой
 * светового климата (КЕО) или широтной зоной и нормативом (инсоляция) приходят
 * готовыми строками от агента. Полей ввода здесь нет намеренно: нормативные
 * значения правятся не тут, а вопросом агенту.
 *
 * Общий файл на оба редактора, классы задаёт `prefix` (Решение 5 design
 * insolation-editor).
 */
export function CalcConditions({prefix, conditions}: CalcConditionsProps) {
  return (
    <div className={`a2ui-${prefix}-conditions`}>
      {conditions.map(condition => (
        <div key={condition.name} className={`a2ui-${prefix}-condition`}>
          <span className={`a2ui-${prefix}-condition__label`}>{condition.label}</span>
          <span className={`a2ui-${prefix}-condition__value`}>{condition.value}</span>
          {condition.note ? (
            <span className={`a2ui-${prefix}-condition__note`}>{condition.note}</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
