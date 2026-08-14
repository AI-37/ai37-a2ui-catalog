import React from 'react';
import type {LookupComboboxProps} from './lookup-combobox.types';
import {LookupOptionRow} from './lookup-option-row';
import {inputStyle, lookupStatusStyle} from './shared';
import {tokens} from './tokens';

/**
 * Контролируемый комбобокс lookup-поля: текстовый input, скрытый input со
 * значением выбора (для submit-flow FormCard) и дропдаун опций. Общий для
 * action- и fetch-режимов; сетевых side-эффектов не имеет.
 *
 * Попап открыт не только при наличии опций, но и во время поиска (`loading`)
 * и после завершённого пустого запроса (`queried`): статус-строка «Ищем…» /
 * «Ничего не найдено» живёт вне `<ul role="listbox">` с `role="status"` —
 * она не опция и не должна попадать ни в выдачу скринридера как option, ни в
 * будущую клавиатурную навигацию.
 */
export function LookupCombobox({
  name,
  placeholder,
  inputText,
  selected,
  options,
  loading = false,
  queried = false,
  onInputChange,
  onPick,
  onClose,
  inputClassName,
}: LookupComboboxProps) {
  // Во время загрузки опции не показываются (возможно, они от прошлого
  // запроса) — попап занят статус-строкой.
  const visibleOptions = loading ? [] : options;
  const isOpen = loading || options.length > 0 || queried;
  const statusText = loading
    ? 'Ищем…'
    : queried && visibleOptions.length === 0
      ? 'Ничего не найдено'
      : null;

  return (
    <span style={{position: 'relative', display: 'grid'}}>
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        autoComplete="off"
        value={inputText}
        placeholder={placeholder}
        onChange={onInputChange}
        onBlur={onClose}
        onKeyDown={event => {
          if (event.key === 'Escape') onClose();
        }}
        // Класс и инлайн-стиль взаимоисключащи: инлайн победил бы CSS-слой.
        className={inputClassName}
        style={inputClassName ? undefined : inputStyle}
      />
      <input type="hidden" name={name} value={selected?.value ?? ''} />
      {isOpen ? (
        <div
          aria-busy={loading || undefined}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            margin: '4px 0 0',
            padding: 4,
            maxHeight: 240,
            overflowY: 'auto',
            borderRadius: 10,
            border: `1px solid ${tokens.borderStrong}`,
            background: tokens.surface,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          }}
        >
          {statusText !== null ? (
            <span role="status" style={lookupStatusStyle}>
              {statusText}
            </span>
          ) : null}
          {visibleOptions.length > 0 ? (
            <ul
              role="listbox"
              style={{margin: 0, padding: 0, listStyle: 'none'}}
            >
              {visibleOptions.map(option => (
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
                    <LookupOptionRow option={option} inputText={inputText} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </span>
  );
}
