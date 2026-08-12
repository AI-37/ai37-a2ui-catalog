import React from 'react';
import type {CherdachnyeSubtype, ConstructionType} from '@ai37/a2ui-catalog-schemas';
import {CHERDACHNYE_SUBTYPE_LABELS} from './cherdachnye-subtype-labels';
import {ConstructionsEditorSelect} from './constructions-editor-select';
import type {
  ConstructionHeaderFields,
  ConstructionsEditorCardHeaderProps,
} from './constructions-editor.types';
import {headerFieldsEqual} from './header-fields-equal';

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
    <div className="a2ui-ce-head">
      <div className="a2ui-ce-head__text">
        <span className="a2ui-ce-head__type">
          {config?.label ?? entry.type}
          {subtypeLabel ? ` · ${subtypeLabel}` : ''}
        </span>
        {name ? <span className="a2ui-ce-head__name">{name}</span> : null}
      </div>
      {/* aria-label различает две кнопки «Изменить» карточки без слоёв
          (шапка и паспортное Rпр) — на слух они были бы одинаковы. */}
      <button
        type="button"
        aria-label="Изменить тип и название"
        onClick={onOpen}
        className="a2ui-ce-btn a2ui-ce-btn--edit"
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
    <div className="a2ui-ce-form">
      <label className="a2ui-ce-field">
        <span className="a2ui-ce-field__label">Тип конструкции</span>
        <ConstructionsEditorSelect
          value={draft.type}
          onChange={handleTypeChange}
          className="a2ui-ce-control"
        >
          {typeConfigs.map(typeConfig => (
            <option key={typeConfig.type} value={typeConfig.type}>
              {typeConfig.label}
            </option>
          ))}
        </ConstructionsEditorSelect>
      </label>
      {draft.type === SUBTYPED_TYPE ? (
        <label className="a2ui-ce-field">
          <span className="a2ui-ce-field__label">Разновидность</span>
          <ConstructionsEditorSelect
            value={draft.subtype ?? ''}
            onChange={handleSubtypeChange}
            className="a2ui-ce-control"
          >
            <option value="">—</option>
            {Object.entries(CHERDACHNYE_SUBTYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </ConstructionsEditorSelect>
        </label>
      ) : null}
      <label className="a2ui-ce-field">
        <span className="a2ui-ce-field__label">Название</span>
        <input
          type="text"
          value={draft.name ?? ''}
          onChange={event => setDraft({...draft, name: event.target.value})}
          className="a2ui-ce-control"
        />
      </label>
      <div className="a2ui-ce-actions">
        <button type="button" onClick={handleSave} className="a2ui-ce-btn a2ui-ce-btn--commit">
          Сохранить
        </button>
        <button type="button" onClick={onCancel} className="a2ui-ce-btn">
          Отмена
        </button>
      </div>
    </div>
  );
}
