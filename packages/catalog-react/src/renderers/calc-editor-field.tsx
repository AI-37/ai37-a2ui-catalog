import React from 'react';
import {CalcSourceNote} from './calc-source-note';
import type {CalcEditorFieldProps} from './calc-editor.types';

/**
 * Контрол одного поля расчётного редактора (КЕО, инсоляция) с подписью
 * источника и предупреждениями. Общий файл на оба компонента: разметка и
 * поведение поля у них одинаковые, различаются только классы — их задаёт
 * `prefix` (Решение 5 design insolation-editor).
 *
 * Предупреждения — пометка «! проверить» с текстом правила; они не блокируют
 * submit и не мешают вводить дальше (канон CE).
 */
export function CalcEditorField({
  prefix,
  field,
  value,
  source,
  edited,
  warnings,
  onChange,
}: CalcEditorFieldProps) {
  const text = value === undefined || value === null ? '' : String(value);
  const warned = warnings.length > 0;
  const controlClass = `a2ui-${prefix}-control${warned ? ` a2ui-${prefix}-control--warned` : ''}`;
  // Предупреждение о значении САМОГО поля («нет — открытый горизонт»).
  const valueWarning = field.valueWarnings?.[text];
  const optionNote = field.optionNotes?.[text];

  return (
    <label className={`a2ui-${prefix}-field`}>
      <span className={`a2ui-${prefix}-field__label`}>
        {field.label}
        {field.required ? <span aria-hidden="true"> *</span> : null}
      </span>
      {field.type === 'select' ? (
        <select
          name={field.name}
          value={text}
          onChange={event => onChange(event.target.value)}
          className={controlClass}
        >
          <option value="">— выберите —</option>
          {(field.options ?? []).map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === 'boolean' ? (
        // alignSelf: у `-field` колоночный flex, а его align-items по умолчанию
        // stretch — без этого квадрат чекбокса растягивается во всю ширину поля.
        <input
          type="checkbox"
          name={field.name}
          checked={value === true || value === 'true'}
          onChange={event => onChange(event.target.checked)}
          style={{alignSelf: 'start'}}
        />
      ) : (
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          name={field.name}
          value={text}
          placeholder={field.placeholder}
          onChange={event => onChange(event.target.value)}
          className={controlClass}
        />
      )}
      <CalcSourceNote prefix={prefix} source={source} edited={edited} hint={field.hint} />
      {optionNote ? <span className={`a2ui-${prefix}-caption`}>{optionNote}</span> : null}
      {valueWarning ? (
        <span className={`a2ui-${prefix}-caption a2ui-${prefix}-caption--warning`}>
          <span className={`a2ui-${prefix}-dot`} aria-hidden="true" />
          {valueWarning}
        </span>
      ) : null}
      {warnings.map(warning => (
        <span
          key={warning}
          className={`a2ui-${prefix}-caption a2ui-${prefix}-caption--warning`}
          data-warning={field.name}
        >
          ! проверить — {warning}
        </span>
      ))}
    </label>
  );
}
