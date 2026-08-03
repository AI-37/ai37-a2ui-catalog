import React from 'react';
import type {
  CherdachnyeSubtype,
  ConstructionLayer,
  ConstructionType,
} from '@ai37/a2ui-catalog-schemas';
import {CHERDACHNYE_SUBTYPE_LABELS} from './cherdachnye-subtype-labels';
import {computeLiveRpr} from './compute-live-rpr';
import {ConstructionsEditorLayerRow} from './constructions-editor-layer-row';
import type {ConstructionsEditorCardProps} from './constructions-editor.types';
import {inputStyle} from './shared';
import {tokens} from './tokens';

const SUBTYPED_TYPE: ConstructionType = 'cherdachnye_podval_grunt';

/**
 * Карточка-аккордеон одной конструкции: тип/subtype/название, таблица слоёв с
 * add/remove строк (или паспортное Rпр для типов без слоёв) и live-чип Rпр
 * против Rнорм. Состоянием владеет редактор; карточка поднимает правки через
 * `onChange` целой конструкцией.
 */
export function ConstructionsEditorCard({
  entry,
  typeConfigs,
  condition,
  materialsReferenceId,
  minChars,
  open,
  errors,
  onToggle,
  onChange,
  onRemove,
}: ConstructionsEditorCardProps) {
  const config = typeConfigs.find(candidate => candidate.type === entry.type);
  const rpr = computeLiveRpr(entry, config, condition);
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

  const handleLayerChange = (index: number, layer: ConstructionLayer) => {
    onChange({...entry, layers: entry.layers.map((prev, i) => (i === index ? layer : prev))});
  };

  const handleLayerRemove = (index: number) => {
    onChange({...entry, layers: entry.layers.filter((_, i) => i !== index)});
  };

  const handleLayerAdd = () => {
    onChange({...entry, layers: [...entry.layers, {material: '', thicknessMm: null}]});
  };

  return (
    <section
      style={{
        borderRadius: 14,
        border: `1px solid ${tokens.border}`,
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
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: 'transparent',
            color: tokens.textStrong,
            fontWeight: 600,
            fontSize: '0.98rem',
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <span aria-hidden="true">{open ? '▾' : '▸'}</span>
          {title}
        </button>
        <RprChip rpr={rpr} rnorm={config?.rnorm} />
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
          <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
            <label style={{display: 'grid', gap: 4}}>
              <span style={{fontSize: '0.85rem', color: tokens.textMuted}}>Тип конструкции</span>
              <select value={entry.type} onChange={handleTypeChange} style={inputStyle}>
                {typeConfigs.map(typeConfig => (
                  <option key={typeConfig.type} value={typeConfig.type}>
                    {typeConfig.label}
                  </option>
                ))}
              </select>
            </label>
            {entry.type === SUBTYPED_TYPE ? (
              <label style={{display: 'grid', gap: 4}}>
                <span style={{fontSize: '0.85rem', color: tokens.textMuted}}>Разновидность</span>
                <select
                  value={entry.subtype ?? ''}
                  onChange={handleSubtypeChange}
                  style={inputStyle}
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
            <label style={{display: 'grid', gap: 4, flex: 1, minWidth: 180}}>
              <span style={{fontSize: '0.85rem', color: tokens.textMuted}}>Название</span>
              <input
                type="text"
                value={entry.name ?? ''}
                onChange={handleNameChange}
                style={inputStyle}
              />
            </label>
          </div>
          {config && !config.hasLayers ? (
            <label style={{display: 'grid', gap: 4, justifySelf: 'start'}}>
              <span style={{fontSize: '0.85rem', color: tokens.textMuted}}>
                Rпр по паспорту, м²·°C/Вт
              </span>
              <input
                type="number"
                min={0.01}
                step="any"
                aria-invalid={errors?.rprPassport || undefined}
                value={entry.rprPassport ?? ''}
                onChange={handleRprPassportChange}
                style={{
                  ...inputStyle,
                  width: 160,
                  ...(errors?.rprPassport ? {border: `1px solid ${tokens.danger}`} : null),
                }}
              />
            </label>
          ) : (
            <div style={{display: 'grid', gap: 8}}>
              <table style={{borderCollapse: 'collapse', width: '100%'}}>
                <thead>
                  <tr>
                    {['Материал', 'Толщина, мм', 'λ, Вт/(м·°C)', ''].map((heading, index) => (
                      <th
                        key={index}
                        style={{
                          padding: '4px 6px',
                          textAlign: 'left',
                          fontSize: '0.8rem',
                          color: tokens.textSubtle,
                          fontWeight: 600,
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entry.layers.map((layer, index) => (
                    <ConstructionsEditorLayerRow
                      key={index}
                      layer={layer}
                      rowName={`material-${entry.id}-${index}`}
                      condition={condition}
                      materialsReferenceId={materialsReferenceId}
                      minChars={minChars}
                      errors={errors?.layers.get(index)}
                      onChange={next => handleLayerChange(index, next)}
                      onRemove={() => handleLayerRemove(index)}
                    />
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={handleLayerAdd}
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
            </div>
          )}
        </div>
      ) : null}
    </section>
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
