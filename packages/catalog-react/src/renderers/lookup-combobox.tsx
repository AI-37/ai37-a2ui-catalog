import React from 'react';
import type {LookupComboboxProps} from './lookup-combobox.types';
import {inputStyle} from './shared';
import {tokens} from './tokens';

/**
 * Контролируемый комбобокс lookup-поля: текстовый input, скрытый input со
 * значением выбора (для submit-flow FormCard) и дропдаун опций. Общий для
 * action- и fetch-режимов; сетевых side-эффектов не имеет.
 */
export function LookupCombobox({
  name,
  placeholder,
  inputText,
  selected,
  options,
  onInputChange,
  onPick,
  onClose,
  inputClassName,
}: LookupComboboxProps) {
  return (
    <span style={{position: 'relative', display: 'grid'}}>
      <input
        type="text"
        role="combobox"
        aria-expanded={options.length > 0}
        autoComplete="off"
        value={inputText}
        placeholder={placeholder}
        onChange={onInputChange}
        onBlur={onClose}
        onKeyDown={event => {
          if (event.key === 'Escape') onClose();
        }}
        // Класс и инлайн-стиль взаимоисключающи: инлайн победил бы CSS-слой.
        className={inputClassName}
        style={inputClassName ? undefined : inputStyle}
      />
      <input type="hidden" name={name} value={selected?.value ?? ''} />
      {options.length > 0 ? (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            margin: '4px 0 0',
            padding: 4,
            listStyle: 'none',
            maxHeight: 240,
            overflowY: 'auto',
            borderRadius: 10,
            border: `1px solid ${tokens.borderStrong}`,
            background: tokens.surface,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          }}
        >
          {options.map(option => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={selected?.value === option.value}
                // onMouseDown (не onClick): выбор должен успеть до blur инпута.
                onMouseDown={event => {
                  event.preventDefault();
                  onPick(option);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '6px 8px',
                  border: 'none',
                  borderRadius: 6,
                  background: 'transparent',
                  color: tokens.text,
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </span>
  );
}
