import React from 'react';
import {LiftEditorSourceNote} from './lift-editor-source-note';
import type {LiftEditorFieldProps} from './lift-editor.types';

let comboListSeq = 0;

/**
 * Контрол одного поля редактора. `combo` — свободный ввод с подсказками ряда:
 * значение вне `options` принимается как есть, ряд ГОСТ здесь подсказка, а не
 * ограничение. `lookup` в редакторе не используется и рендерится как текст.
 *
 * Под контролом — подпись: источник значения (если поле не правлено), иначе
 * `hint` поля. Blur-триггера черновика больше нет: любая правка планирует
 * отправку дебаунсом в корне (Решение 6 design lift-editor-sections-responsive).
 */
export function LiftEditorField({field, value, options, missing, source, onChange}: LiftEditorFieldProps) {
  // datalist привязывается по id — он должен пережить перерисовки поля.
  const listId = React.useMemo(() => `lift-editor-combo-${(comboListSeq += 1)}`, []);
  const text = value === undefined || value === null ? '' : String(value);
  const controlClass = `a2ui-le-control${missing ? ' a2ui-le-control--missing' : ''}`;

  return (
    <label className="a2ui-le-field">
      <span className="a2ui-le-field__label">
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
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'boolean' ? (
        // alignSelf: у `a2ui-le-field` колоночный flex, а его align-items по
        // умолчанию stretch — без этого квадрат чекбокса растягивается во всю
        // ширину поля.
        <input
          type="checkbox"
          name={field.name}
          checked={value === true || value === 'true'}
          onChange={event => onChange(event.target.checked)}
          style={{alignSelf: 'start'}}
        />
      ) : field.type === 'combo' ? (
        <>
          <input
            type="text"
            name={field.name}
            list={listId}
            value={text}
            placeholder={field.placeholder}
            onChange={event => onChange(event.target.value)}
            className={controlClass}
          />
          <datalist id={listId}>
            {options.map(option => (
              <option key={option.value} value={option.value} label={option.note ?? option.label} />
            ))}
          </datalist>
        </>
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
      {source !== undefined ? (
        <LiftEditorSourceNote source={source} />
      ) : field.hint ? (
        <span className="a2ui-le-caption">{field.hint}</span>
      ) : null}
    </label>
  );
}
