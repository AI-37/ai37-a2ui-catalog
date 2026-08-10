import React from 'react';
import type {CherdachnyeSubtype, ConstructionType} from '@ai37/a2ui-catalog-schemas';
import {CHERDACHNYE_SUBTYPE_LABELS} from './cherdachnye-subtype-labels';
import type {
  ConstructionHeaderFields,
  ConstructionsEditorCardHeaderProps,
} from './constructions-editor.types';
import {headerFieldsEqual} from './header-fields-equal';
import {
  cancelButtonStyle,
  commitButtonStyle,
  controlStyle,
  editButtonStyle,
  fieldLabelStyle,
  fieldStyle,
  FIELD_COLUMN_WIDTH,
} from './shared';
import {tokens} from './tokens';

/** Единственный тип с разновидностями: селект subtype только у него. */
const SUBTYPED_TYPE: ConstructionType = 'cherdachnye_podval_grunt';

/**
 * Шапка раскрытой карточки в двух режимах — тем же паттерном, что строка слоя.
 * Режим чтения: тип (с разновидностью через «·») и название текстом, рядом
 * «Изменить». Форма: селекты типа/разновидности, инпут названия, «Сохранить» /
 * «Отмена»; правки живут в локальной копии полей, наверх уходят только по
 * коммиту — до него заголовок карточки, live-Rпр и состояние редактора прежние.
 */
export function ConstructionsEditorCardHeader(props: ConstructionsEditorCardHeaderProps) {
  if (!props.editing) {
    return <HeaderSummary {...props} />;
  }

  return <HeaderForm {...props} />;
}

function HeaderSummary({entry, typeConfigs, onOpen}: ConstructionsEditorCardHeaderProps) {
  const config = typeConfigs.find(candidate => candidate.type === entry.type);
  const subtypeLabel = entry.subtype ? CHERDACHNYE_SUBTYPE_LABELS[entry.subtype] : undefined;
  const name = entry.name?.trim();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        maxWidth: FIELD_COLUMN_WIDTH,
      }}
    >
      <div style={{display: 'grid', gap: 2, flex: 1, minWidth: 0}}>
        <span style={{color: tokens.textStrong, fontWeight: 500, overflowWrap: 'anywhere'}}>
          {config?.label ?? entry.type}
          {subtypeLabel ? ` · ${subtypeLabel}` : ''}
        </span>
        {name ? (
          <span style={{color: tokens.textMuted, fontSize: '0.9rem', overflowWrap: 'anywhere'}}>
            {name}
          </span>
        ) : null}
      </div>
      {/* aria-label различает две кнопки «Изменить» карточки без слоёв
          (шапка и паспортное Rпр) — на слух они были бы одинаковы. */}
      <button
        type="button"
        aria-label="Изменить тип и название"
        onClick={onOpen}
        style={editButtonStyle}
      >
        Изменить
      </button>
    </div>
  );
}

function HeaderForm({entry, typeConfigs, onCommit, onCancel}: ConstructionsEditorCardHeaderProps) {
  const [draft, setDraft] = React.useState<ConstructionHeaderFields>({
    type: entry.type,
    subtype: entry.subtype,
    name: entry.name,
  });

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as ConstructionType;
    setDraft({
      ...draft,
      type: nextType,
      subtype: nextType === SUBTYPED_TYPE ? draft.subtype : undefined,
    });
  };

  const handleSubtypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setDraft({...draft, subtype: value ? (value as CherdachnyeSubtype) : undefined});
  };

  const handleSave = () => {
    // Без изменений коммит вырождается в закрытие формы: черновик не шлётся.
    if (headerFieldsEqual(draft, entry)) {
      onCancel();
      return;
    }
    onCommit(draft);
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 12,
        border: `1px solid ${tokens.borderStrong}`,
        background: tokens.surface,
        maxWidth: FIELD_COLUMN_WIDTH,
        boxSizing: 'border-box',
      }}
    >
      <label style={fieldStyle}>
        <span style={fieldLabelStyle}>Тип конструкции</span>
        <select value={draft.type} onChange={handleTypeChange} style={controlStyle}>
          {typeConfigs.map(typeConfig => (
            <option key={typeConfig.type} value={typeConfig.type}>
              {typeConfig.label}
            </option>
          ))}
        </select>
      </label>
      {draft.type === SUBTYPED_TYPE ? (
        <label style={fieldStyle}>
          <span style={fieldLabelStyle}>Разновидность</span>
          <select value={draft.subtype ?? ''} onChange={handleSubtypeChange} style={controlStyle}>
            <option value="">—</option>
            {Object.entries(CHERDACHNYE_SUBTYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label style={fieldStyle}>
        <span style={fieldLabelStyle}>Название</span>
        <input
          type="text"
          value={draft.name ?? ''}
          onChange={event => setDraft({...draft, name: event.target.value})}
          style={controlStyle}
        />
      </label>
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <button type="button" onClick={handleSave} style={commitButtonStyle}>
          Сохранить
        </button>
        <button type="button" onClick={onCancel} style={cancelButtonStyle}>
          Отмена
        </button>
      </div>
    </div>
  );
}
