import React from 'react';
import type {ConstructionsEditorPassportProps} from './constructions-editor.types';
import {
  cancelButtonStyle,
  commitButtonStyle,
  editButtonStyle,
  fieldLabelStyle,
  fieldStyle,
  inputStyle,
  FIELD_COLUMN_WIDTH,
} from './shared';
import {tokens} from './tokens';

const PASSPORT_LABEL = 'Rпр по паспорту, м²·°C/Вт';

/**
 * «Rпр по паспорту» типов без слоёв — тот же паттерн, что у слоя и шапки:
 * значение текстом с кнопкой «Изменить», правка — в форме с явным «Применить».
 * Незаданное значение показано предупреждающим цветом, как невалидные поля
 * строки-сводки слоя (см. `find-invalid-layers`).
 */
export function ConstructionsEditorPassport(props: ConstructionsEditorPassportProps) {
  if (!props.editing) {
    return <PassportSummary {...props} />;
  }

  return <PassportForm {...props} />;
}

function PassportSummary({value, onOpen}: ConstructionsEditorPassportProps) {
  const missing = value === undefined;

  return (
    <div style={{display: 'flex', alignItems: 'baseline', gap: 10, maxWidth: FIELD_COLUMN_WIDTH}}>
      <span style={{color: tokens.textMuted, fontSize: '0.9rem'}}>Rпр по паспорту:</span>
      <span style={{color: missing ? tokens.warning : tokens.textStrong, fontWeight: 500}}>
        {missing ? 'не задано' : value.toFixed(2)}
      </span>
      <button
        type="button"
        aria-label="Изменить Rпр по паспорту"
        onClick={onOpen}
        style={{...editButtonStyle, marginLeft: 'auto'}}
      >
        Изменить
      </button>
    </div>
  );
}

function PassportForm({value, onCommit, onCancel}: ConstructionsEditorPassportProps) {
  const [draft, setDraft] = React.useState<number | undefined>(value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value);
    setDraft(Number.isFinite(parsed) ? parsed : undefined);
  };

  const handleApply = () => {
    // Без изменений коммит вырождается в закрытие формы: черновик не шлётся.
    if (draft === value) {
      onCancel();
      return;
    }
    onCommit(draft);
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: 8,
        justifyItems: 'start',
        padding: '10px 12px',
        borderRadius: 12,
        border: `1px solid ${tokens.borderStrong}`,
        background: tokens.surface,
        maxWidth: FIELD_COLUMN_WIDTH,
        boxSizing: 'border-box',
      }}
    >
      <label style={fieldStyle}>
        <span style={fieldLabelStyle}>{PASSPORT_LABEL}</span>
        <input
          type="number"
          min={0.01}
          step="any"
          value={draft ?? ''}
          onChange={handleChange}
          style={{...inputStyle, width: 160}}
        />
      </label>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <button type="button" onClick={handleApply} style={commitButtonStyle}>
          Применить
        </button>
        <button type="button" onClick={onCancel} style={cancelButtonStyle}>
          Отмена
        </button>
      </div>
    </div>
  );
}
