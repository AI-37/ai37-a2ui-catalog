import React from 'react';
import type {ConstructionLayer} from '@ai37/a2ui-catalog-schemas';
import {computeLiveRpr} from './compute-live-rpr';
import {ConstructionsEditorCardHeader} from './constructions-editor-card-header';
import {ConstructionsEditorChevron} from './constructions-editor-chevron';
import {ConstructionsEditorLayerRow} from './constructions-editor-layer-row';
import {ConstructionsEditorPassport} from './constructions-editor-passport';
import {findInvalidLayers} from './find-invalid-layers';
import {formatMissingLambda} from './format-missing-lambda';
import type {
  ConstructionHeaderFields,
  ConstructionsEditorCardProps,
} from './constructions-editor.types';
import {tokens} from './tokens';

// Пустой слой формы «+ Слой»: в state редактора не попадает до «Добавить».
const EMPTY_LAYER: ConstructionLayer = {material: '', thicknessMm: null};

/**
 * Черновик открытой формы для превью Rпр: слой (edit/new) или паспортное
 * значение. Живёт только в карточке и только на чип — state редактора,
 * сводки и черновики агенту его не видят.
 */
type RprPreview =
  | {kind: 'layer'; layer: ConstructionLayer}
  | {kind: 'passport'; value: number | undefined};

/**
 * Карточка-аккордеон одной конструкции: шапка (тип/subtype/название), слои
 * строками-сводками (или паспортное Rпр для типов без слоёв) и live-чип Rпр
 * против Rнорм (сравнение — только при `showRnorm`). Все три блока живут одним
 * паттерном «чтение ↔ форма с явным коммитом», и форма раскрыта максимум одна
 * на весь редактор — её состоянием, как и состоянием конструкций, владеет
 * редактор. Карточка поднимает правки через `onChange` целой конструкцией,
 * коммиты форм — с `{commit: true}`. Единственное исключение из «до коммита
 * ничего не меняется» — чип Rпр: он пересчитывается мгновенно по черновику
 * открытой формы слоя/паспорта (`onDraftChange` → превью в state карточки),
 * не трогая state редактора. Статусный чип в шапке один, по приоритету
 * «проблемы данных → агентский статус → готова» — индикация, не блок
 * (см. `find-invalid-layers`); при закрытом гейте условий (`showStatusChips`)
 * чипов нет вовсе, остаётся только чип Rпр.
 */
export function ConstructionsEditorCard({
  entry,
  typeConfigs,
  condition,
  materialsReferenceId,
  minChars,
  open,
  showRnorm,
  showStatusChips,
  statusDismissed,
  editingTarget,
  onEditingChange,
  onToggle,
  onChange,
  onRemove,
}: ConstructionsEditorCardProps) {
  const config = typeConfigs.find(candidate => candidate.type === entry.type);

  // Превью-черновик открытой формы — только для чипа Rпр. Любая смена
  // `editingTarget` (открытие, отмена, переключение, коммит) сбрасывает его
  // прямо в рендере — чип ни кадра не живёт черновиком чужой формы; после
  // коммита те же значения уже в `entry`, скачка нет.
  const [preview, setPreview] = React.useState<RprPreview | null>(null);
  const [previewTarget, setPreviewTarget] = React.useState(editingTarget);
  if (previewTarget !== editingTarget) {
    setPreviewTarget(editingTarget);
    setPreview(null);
  }

  // Entry для чипа: подменённый слой (edit), добавленный в конец (new) или
  // чужое `rprPassport`. Всё остальное — статус, невалидность, сводки —
  // считается от закоммиченного `entry`.
  const previewEntry =
    preview === null
      ? entry
      : preview.kind === 'passport'
        ? {...entry, rprPassport: preview.value}
        : editingTarget === 'new'
          ? {...entry, layers: [...entry.layers, preview.layer]}
          : typeof editingTarget === 'number'
            ? {
                ...entry,
                layers: entry.layers.map((prev, i) =>
                  i === editingTarget ? preview.layer : prev,
                ),
              }
            : entry;

  const rpr = computeLiveRpr(previewEntry, config, condition);
  const invalidity = findInvalidLayers(entry, config);
  const title = entry.name?.trim() ? entry.name : (config?.label ?? entry.type);

  // Ровно один статусный чип по приоритету: проблемы данных (однородное «нет λ»
  // называется счётом) → непогашенный агентский статус → «готова».
  const agentStatus = statusDismissed ? undefined : entry.status;
  const statusChip = !showStatusChips
    ? null
    : invalidity.invalid
      ? {
          ok: false,
          text:
            invalidity.missingLambdaCount !== null
              ? formatMissingLambda(invalidity.missingLambdaCount)
              : 'проверить',
        }
      : agentStatus
        ? {ok: false, text: agentStatus === 'confirm' ? 'подтвердите' : 'подтвердите паспорт'}
        : {ok: true, text: 'готова'};

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
    <section
      className={`a2ui-ce-card${invalidity.invalid && showStatusChips ? ' a2ui-ce-card--invalid' : ''}`}
    >
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
        {statusChip ? (
          // Пометка, а не тревога: точка и слово — карточка с незаполненным
          // слоем или неподтверждённым составом не ошибка.
          <span className={statusChip.ok ? 'a2ui-ce-card__ok' : 'a2ui-ce-card__warn'}>
            <span
              className={`a2ui-ce-dot${statusChip.ok ? ' a2ui-ce-dot--ok' : ''}`}
              aria-hidden="true"
            />
            {statusChip.text}
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
              onDraftChange={value => setPreview({kind: 'passport', value})}
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
                  onDraftChange={draft => setPreview({kind: 'layer', layer: draft})}
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
                  onDraftChange={draft => setPreview({kind: 'layer', layer: draft})}
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
