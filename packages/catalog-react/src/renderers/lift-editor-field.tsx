import React from 'react';
import {controlStyle, fieldLabelStyle, fieldStyle} from './shared';
import {tokens} from './tokens';
import type {LiftEditorFieldProps} from './lift-editor.types';

let comboListSeq = 0;

/**
 * Контрол одного поля редактора. `combo` — свободный ввод с подсказками ряда
 * (Решение 6 design.md): значение вне `options` принимается как есть, ряд ГОСТ
 * здесь подсказка, а не ограничение. `lookup` в редакторе не используется
 * (справочники — non-goal change'а) и рендерится как обычный текст.
 *
 * `onCommit` зовётся на `blur`, только если значение отличается от значения на
 * момент `focus` (Решение 3 design.md): проход по форме табом черновиков не
 * порождает.
 */
export function LiftEditorField({
  field,
  value,
  options,
  missing,
  onChange,
  onCommit,
}: LiftEditorFieldProps) {
  // datalist привязывается по id — он должен пережить перерисовки поля.
  const listId = React.useMemo(() => `lift-editor-combo-${(comboListSeq += 1)}`, []);
  const text = value === undefined || value === null ? '' : String(value);
  const focusedText = React.useRef<string | null>(null);

  // Значение на фокусе, а не последний отправленный черновик: единица работы —
  // редактирование поля, глубокое сравнение документа тут ничего не добавляет.
  const commitProps = {
    onFocus: () => {
      focusedText.current = text;
    },
    onBlur: () => {
      const before = focusedText.current;
      focusedText.current = null;
      if (before !== null && before !== text) onCommit?.();
    },
  };

  // Целиком `border`, а не `borderColor`: смешивать shorthand с частью
  // свойства нельзя — React ругается и снятие подсветки работает через раз.
  const invalidStyle: React.CSSProperties = missing
    ? {border: `1px solid ${tokens.danger}`, background: tokens.surfaceWarm}
    : {};

  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>
        {field.label}
        {field.required ? <span style={{color: tokens.danger}}> *</span> : null}
      </span>
      {field.type === 'select' ? (
        <select
          name={field.name}
          value={text}
          onChange={event => onChange(event.target.value)}
          {...commitProps}
          style={{...controlStyle, ...invalidStyle}}
        >
          <option value="">— выберите —</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.type === 'boolean' ? (
        <input
          type="checkbox"
          name={field.name}
          checked={value === true || value === 'true'}
          onChange={event => onChange(event.target.checked)}
          {...commitProps}
          style={{justifySelf: 'start'}}
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
            {...commitProps}
            style={{...controlStyle, ...invalidStyle}}
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
          {...commitProps}
          style={{...controlStyle, ...invalidStyle}}
        />
      )}
      {field.hint ? (
        <span style={{fontSize: '0.78rem', color: tokens.textSubtle}}>{field.hint}</span>
      ) : null}
    </label>
  );
}
