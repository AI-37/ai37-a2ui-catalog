import React from 'react';
import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';
import {computeLiveRpr} from './compute-live-rpr';
import {ConstructionsEditorCardHeader} from './constructions-editor-card-header';
import {ConstructionsEditorChevron} from './constructions-editor-chevron';
import {ConstructionsEditorLayerRow} from './constructions-editor-layer-row';
import {ConstructionsEditorPassport} from './constructions-editor-passport';
import {findInvalidLayers} from './find-invalid-layers';
import type {
  ConstructionHeaderFields,
  ConstructionsEditorCardProps,
} from './constructions-editor.types';
import {tokens} from './tokens';

// Пустой слой формы «+ Слой»: в state редактора не попадает до «Добавить».
const EMPTY_LAYER: ConstructionLayer = {material: '', thicknessMm: null};

/**
 * Карточка-аккордеон одной конструкции: шапка (тип/subtype/название), слои
 * строками-сводками (или паспортное Rпр для типов без слоёв) и live-чип Rпр
 * против Rнорм (сравнение — только при `showRnorm`). Все три блока живут одним
 * паттерном «чтение ↔ форма с явным коммитом», и форма раскрыта максимум одна
 * на весь редактор — её состоянием, как и состоянием конструкций, владеет
 * редактор. Карточка поднимает правки через `onChange` целой конструкцией,
 * коммиты форм — с `{commit: true}`. Конструкция с ошибкой в данных подсвечена
 * предупреждающим цветом с пометкой «проверить» — индикация, не блок
 * (см. `find-invalid-layers`).
 */
export function ConstructionsEditorCard({
  entry,
  typeConfigs,
  condition,
  materialsReferenceId,
  minChars,
  open,
  showRnorm,
  editingTarget,
  onEditingChange,
  onToggle,
  onChange,
  onRemove,
}: ConstructionsEditorCardProps) {
  const config = typeConfigs.find(candidate => candidate.type === entry.type);
  const rpr = computeLiveRpr(entry, config, condition);
  const invalidity = findInvalidLayers(entry, config);
  const title = entry.name?.trim() ? entry.name : (config?.label ?? entry.type);

  const handleHeaderCommit = (fields: ConstructionHeaderFields) => {
    onEditingChange(null);
    onChange({...entry, ...fields}, {commit: true});
  };

  const handlePassportCommit = (rprPassport: number | undefined) => {
    onEditingChange(null);
    onChange({...entry, rprPassport}, {commit: true});
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
    <section className={`a2ui-ce-card${invalidity.invalid ? ' a2ui-ce-card--invalid' : ''}`}>
      <header className="a2ui-ce-card__header">
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="a2ui-ce-card__toggle"
        >
          <ConstructionsEditorChevron open={open} />
          {title}
        </button>
        {invalidity.invalid ? (
          // Пометка, а не тревога: точка и слово приглушённым — карточка с
          // незаполненным слоем не ошибка, её просто ещё не дозаполнили.
          <span className="a2ui-ce-card__warn">
            <span className="a2ui-ce-dot" aria-hidden="true" />
            проверить
          </span>
        ) : null}
        <RprChip rpr={rpr} rnorm={showRnorm ? config?.rnorm : undefined} />
        <button
          type="button"
          aria-label="Удалить конструкцию"
          onClick={onRemove}
          className="a2ui-ce-card__remove"
        >
          ✕
        </button>
      </header>
      {open ? (
        <div className="a2ui-ce-card__body">
          <ConstructionsEditorCardHeader
            entry={entry}
            typeConfigs={typeConfigs}
            editing={editingTarget === 'header'}
            onOpen={() => onEditingChange('header')}
            onCommit={handleHeaderCommit}
            onCancel={() => onEditingChange(null)}
          />
          {config && !config.hasLayers ? (
            <ConstructionsEditorPassport
              value={entry.rprPassport}
              editing={editingTarget === 'passport'}
              onOpen={() => onEditingChange('passport')}
              onCommit={handlePassportCommit}
              onCancel={() => onEditingChange(null)}
            />
          ) : (
            <div className="a2ui-ce-card__layers">
              {entry.layers.map((layer, index) => (
                <ConstructionsEditorLayerRow
                  key={index}
                  layer={layer}
                  index={index}
                  rowName={`material-${entry.id}-${index}`}
                  condition={condition}
                  materialsReferenceId={materialsReferenceId}
                  minChars={minChars}
                  mode={editingTarget === index ? 'edit' : 'summary'}
                  // Клик по другой строке переводит форму туда: несохранённые
                  // правки прежней отбрасываются вместе с её формой.
                  onOpen={() => onEditingChange(index)}
                  onCommit={next => handleLayerCommit(index, next)}
                  onCancel={() => onEditingChange(null)}
                  onRemove={() => handleLayerRemove(index)}
                />
              ))}
              {editingTarget === 'new' ? (
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
                  className="a2ui-ce-btn a2ui-ce-btn--add-layer"
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

/**
 * Чип live-Rпр: значение и сравнение с Rнорм (зелёный ≥ / красный &lt;).
 * Без `rnorm` сравнение не показывается; без вычислимого Rпр — «—».
 */
function RprChip({rpr, rnorm}: {rpr: number | null; rnorm: number | undefined}) {
  const comparable = rpr !== null && rnorm !== undefined;
  const passes = comparable && rpr >= rnorm;

  const modifier = !comparable ? '' : passes ? ' a2ui-ce-chip--pass' : ' a2ui-ce-chip--fail';

  return (
    <span className={`a2ui-ce-chip${modifier}`}>
      Rпр {rpr === null ? '—' : rpr.toFixed(2)}
      {comparable ? ` ${passes ? '≥' : '<'} ${rnorm.toFixed(2)}` : ''}
    </span>
  );
}
