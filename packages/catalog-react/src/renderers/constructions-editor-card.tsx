import React from 'react';
import type {
  CherdachnyeSubtype,
  ConstructionLayer,
  ConstructionType,
} from '@ai37/a2ui-catalog-schemas';
import {CHERDACHNYE_SUBTYPE_LABELS} from './cherdachnye-subtype-labels';
import {computeLiveRpr} from './compute-live-rpr';
import {ConstructionsEditorLayerRow} from './constructions-editor-layer-row';
import {findInvalidLayers} from './find-invalid-layers';
import type {ConstructionsEditorCardProps} from './constructions-editor.types';
import {
  controlStyle,
  fieldLabelStyle,
  fieldStyle,
  inputStyle,
  FIELD_COLUMN_WIDTH,
} from './shared';
import {tokens} from './tokens';

const SUBTYPED_TYPE: ConstructionType = 'cherdachnye_podval_grunt';

// Пустой слой формы «+ Слой»: в state редактора не попадает до «Добавить».
const EMPTY_LAYER: ConstructionLayer = {material: '', thicknessMm: null};

/**
 * Карточка-аккордеон одной конструкции: тип/subtype/название, слои
 * строками-сводками с единственной раскрытой формой (или паспортное Rпр для
 * типов без слоёв) и live-чип Rпр против Rнорм (сравнение — только при
 * `showRnorm`). Состоянием — и конструкций, и открытой формы слоя (она одна
 * на весь редактор) — владеет редактор; карточка поднимает правки через
 * `onChange` целой конструкцией, коммиты формы слоя — с `{commit: true}`.
 * Конструкция с ошибкой в данных подсвечена предупреждающим цветом с пометкой
 * «проверить» — индикация, не блок (см. `find-invalid-layers`).
 */
export function ConstructionsEditorCard({
  entry,
  typeConfigs,
  condition,
  materialsReferenceId,
  minChars,
  open,
  showRnorm,
  editingIndex,
  onEditingChange,
  onToggle,
  onChange,
  onRemove,
}: ConstructionsEditorCardProps) {
  const config = typeConfigs.find(candidate => candidate.type === entry.type);
  const rpr = computeLiveRpr(entry, config, condition);
  const invalidity = findInvalidLayers(entry, config);
  const title = entry.name?.trim() ? entry.name : (config?.label ?? entry.type);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as ConstructionType;
    onChange({
      ...entry,
      type: nextType,
      subtype: nextType === SUBTYPED_TYPE ? entry.subtype : undefined,
    });
  };

  const handleSubtypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onChange({...entry, subtype: value ? (value as CherdachnyeSubtype) : undefined});
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({...entry, name: event.target.value});
  };

  const handleRprPassportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(event.target.value);
    onChange({...entry, rprPassport: Number.isFinite(parsed) ? parsed : undefined});
  };

  const handleLayerCommit = (index: number, layer: ConstructionLayer) => {
    onEditingChange(null);
    onChange(
      {...entry, layers: entry.layers.map((prev, i) => (i === index ? layer : prev))},
      {commit: true},
    );
  };

  const handleLayerAdd = (layer: ConstructionLayer) => {
    onEditingChange(null);
    onChange({...entry, layers: [...entry.layers, layer]}, {commit: true});
  };

  const handleLayerRemove = (index: number) => {
    onEditingChange(null);
    onChange({...entry, layers: entry.layers.filter((_, i) => i !== index)}, {commit: true});
  };

  return (
    <section
      style={{
        borderRadius: 14,
        border: `1px solid ${invalidity.invalid ? tokens.warning : tokens.border}`,
        background: tokens.surfaceMuted,
      }}
    >
      <header style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px'}}>
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          style={{
            flex: 1,
            display: 'flex',
            // justifyContent явно: UA-стиль кнопки центрирует flex-содержимое,
            // и заголовок уезжал от левого края.
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: 8,
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: tokens.textStrong,
            fontWeight: 600,
            fontSize: '0.98rem',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <Chevron open={open} />
          {title}
        </button>
        {invalidity.invalid ? (
          <span
            style={{
              color: tokens.warning,
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            ! проверить
          </span>
        ) : null}
        <RprChip rpr={rpr} rnorm={showRnorm ? config?.rnorm : undefined} />
        <button
          type="button"
          aria-label="Удалить конструкцию"
          onClick={onRemove}
          style={{
            border: 'none',
            background: 'transparent',
            color: tokens.textSubtle,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          ✕
        </button>
      </header>
      {open ? (
        <div style={{display: 'grid', gap: 10, padding: '0 12px 12px'}}>
          {/* Поля шапки в столбик — как на вкладке общих данных. */}
          <div style={{display: 'grid', gap: 10, maxWidth: FIELD_COLUMN_WIDTH}}>
            <label style={fieldStyle}>
              <span style={fieldLabelStyle}>Тип конструкции</span>
              <select value={entry.type} onChange={handleTypeChange} style={controlStyle}>
                {typeConfigs.map(typeConfig => (
                  <option key={typeConfig.type} value={typeConfig.type}>
                    {typeConfig.label}
                  </option>
                ))}
              </select>
            </label>
            {entry.type === SUBTYPED_TYPE ? (
              <label style={fieldStyle}>
                <span style={fieldLabelStyle}>Разновидность</span>
                <select
                  value={entry.subtype ?? ''}
                  onChange={handleSubtypeChange}
                  style={controlStyle}
                >
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
                value={entry.name ?? ''}
                onChange={handleNameChange}
                style={controlStyle}
              />
            </label>
          </div>
          {config && !config.hasLayers ? (
            <label style={{...fieldStyle, justifySelf: 'start'}}>
              <span style={fieldLabelStyle}>Rпр по паспорту, м²·°C/Вт</span>
              <input
                type="number"
                min={0.01}
                step="any"
                value={entry.rprPassport ?? ''}
                onChange={handleRprPassportChange}
                style={{...inputStyle, width: 160}}
              />
            </label>
          ) : (
            <div style={{display: 'grid', gap: 8}}>
              {entry.layers.map((layer, index) => (
                <ConstructionsEditorLayerRow
                  key={index}
                  layer={layer}
                  index={index}
                  rowName={`material-${entry.id}-${index}`}
                  condition={condition}
                  materialsReferenceId={materialsReferenceId}
                  minChars={minChars}
                  mode={editingIndex === index ? 'edit' : 'summary'}
                  // Клик по другой строке переводит форму туда: несохранённые
                  // правки прежней отбрасываются вместе с её формой.
                  onOpen={() => onEditingChange(index)}
                  onCommit={next => handleLayerCommit(index, next)}
                  onCancel={() => onEditingChange(null)}
                  onRemove={() => handleLayerRemove(index)}
                />
              ))}
              {editingIndex === 'new' ? (
                <ConstructionsEditorLayerRow
                  layer={EMPTY_LAYER}
                  index={entry.layers.length}
                  rowName={`material-${entry.id}-new`}
                  condition={condition}
                  materialsReferenceId={materialsReferenceId}
                  minChars={minChars}
                  mode="new"
                  onCommit={handleLayerAdd}
                  onCancel={() => onEditingChange(null)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => onEditingChange('new')}
                  style={{
                    justifySelf: 'start',
                    padding: '6px 12px',
                    borderRadius: 10,
                    border: `1px dashed ${tokens.borderStrong}`,
                    background: 'transparent',
                    color: tokens.text,
                    cursor: 'pointer',
                  }}
                >
                  + Слой
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

/** Шеврон аккордеона: вправо — свёрнуто, вниз (поворот) — раскрыто. */
function Chevron({open}: {open: boolean}) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      style={{
        flexShrink: 0,
        color: tokens.textSubtle,
        transform: open ? 'rotate(90deg)' : 'none',
        transition: 'transform 120ms ease',
      }}
    >
      <path
        d="M3.5 1.5 L7 5 L3.5 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Чип live-Rпр: значение и сравнение с Rнорм (зелёный ≥ / красный &lt;).
 * Без `rnorm` сравнение не показывается; без вычислимого Rпр — «—».
 */
function RprChip({rpr, rnorm}: {rpr: number | null; rnorm: number | undefined}) {
  const comparable = rpr !== null && rnorm !== undefined;
  const passes = comparable && rpr >= rnorm;

  const color = !comparable ? tokens.textMuted : passes ? tokens.success : tokens.danger;
  const border = !comparable ? tokens.border : color;

  return (
    <span
      style={{
        padding: '2px 10px',
        borderRadius: 999,
        border: `1px solid ${border}`,
        color,
        fontSize: '0.85rem',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      Rпр {rpr === null ? '—' : rpr.toFixed(2)}
      {comparable ? ` ${passes ? '≥' : '<'} ${rnorm.toFixed(2)}` : ''}
    </span>
  );
}
