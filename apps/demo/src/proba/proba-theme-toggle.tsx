import React from 'react';
import type {ProbaThemeToggleProps} from './proba-theme-toggle.types';

/**
 * Переключатель темы витрины. Ставит ровно то, что ставит хост у потребителя —
 * атрибут `data-a2ui-theme` на предке (его вешает `ProbaShell`), — а не какой-то
 * свой режим: витрина показывает механизм, а не его имитацию.
 */
export function ProbaThemeToggle({theme, onChange}: ProbaThemeToggleProps) {
  return (
    <div style={groupStyle} role="group" aria-label="Тема набора">
      {(['light', 'dark'] as const).map(value => (
        <button
          key={value}
          type="button"
          aria-pressed={theme === value}
          onClick={() => onChange(value)}
          style={theme === value ? activeStyle : buttonStyle}
        >
          {value === 'light' ? 'Светлая' : 'Тёмная'}
        </button>
      ))}
    </div>
  );
}

const groupStyle: React.CSSProperties = {
  display: 'inline-flex',
  gap: 6,
  padding: 4,
  borderRadius: 999,
  border: '1px solid light-dark(rgba(15, 23, 42, 0.12), rgba(237, 237, 234, 0.16))',
};

const buttonStyle: React.CSSProperties = {
  padding: '5px 14px',
  borderRadius: 999,
  border: 'none',
  background: 'transparent',
  color: 'light-dark(#475569, #a0a09b)',
  fontSize: 13,
  cursor: 'pointer',
};

const activeStyle: React.CSSProperties = {
  ...buttonStyle,
  background: 'light-dark(#0f172a, #ededea)',
  color: 'light-dark(#ffffff, #191918)',
};
