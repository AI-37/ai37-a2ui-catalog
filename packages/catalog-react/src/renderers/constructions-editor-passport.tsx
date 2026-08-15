import React from 'react';
import type {ConstructionsEditorPassportProps} from './constructions-editor.types';

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
    <div className="a2ui-ce-passport">
      <span className="a2ui-ce-passport__label">Rпр по паспорту:</span>
      <span
        className={`a2ui-ce-passport__value${missing ? ' a2ui-ce-passport__value--missing' : ''}`}
      >
        {missing ? 'не задано' : value.toFixed(2)}
      </span>
      <button
        type="button"
        aria-label="Изменить Rпр по паспорту"
        onClick={onOpen}
        className="a2ui-ce-btn a2ui-ce-btn--edit"
      >
        Изменить
      </button>
    </div>
  );
}

function PassportForm({value, onCommit, onCancel, onDraftChange}: ConstructionsEditorPassportProps) {
  const [draft, setDraft] = React.useState<number | undefined>(value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value);
    const next = Number.isFinite(parsed) ? parsed : undefined;
    setDraft(next);
    // Каждая правка уходит и в превью Rпр карточки; черновик — не коммит.
    onDraftChange?.(next);
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
    <div className="a2ui-ce-form a2ui-ce-form--compact">
      <label className="a2ui-ce-field">
        <span className="a2ui-ce-field__label">{PASSPORT_LABEL}</span>
        <input
          type="number"
          min={0.01}
          step="any"
          value={draft ?? ''}
          onChange={handleChange}
          className="a2ui-ce-control a2ui-ce-passport__input"
        />
      </label>
      <div className="a2ui-ce-actions">
        <button type="button" onClick={handleApply} className="a2ui-ce-btn a2ui-ce-btn--commit">
          Применить
        </button>
        <button type="button" onClick={onCancel} className="a2ui-ce-btn">
          Отмена
        </button>
      </div>
    </div>
  );
}
