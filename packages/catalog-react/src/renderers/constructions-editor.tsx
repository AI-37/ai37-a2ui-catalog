import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {
  constructionsEditorDefinition,
  type ConstructionEntry,
  type ConstructionsGeneral,
} from '@ai37/a2ui-catalog-schemas';
import {climateKey} from './climate-key';
import {computeLiveRpr} from './compute-live-rpr';
import {ConstructionsEditorCard} from './constructions-editor-card';
import {ConstructionsEditorGeneral} from './constructions-editor-general';
import {ConstructionsEditorTabs} from './constructions-editor-tabs';
import type {ConstructionsEditorTab} from './constructions-editor.types';
import {createGeneralState} from './create-general-state';
import {createLocalId} from './create-local-id';
import {tokens} from './tokens';
import {useA2uiBaseStyles} from './shared';

const GENERAL_TAB_LABEL = 'Общие данные';
const CONSTRUCTIONS_TAB_LABEL = 'Конструкции';
const NEXT_LABEL = 'Далее';

const primaryButtonStyle: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 12,
  border: 'none',
  background: tokens.accent,
  color: tokens.accentContrast,
  fontWeight: 600,
  cursor: 'pointer',
};

/**
 * Объединённый экран теплотехнического расчёта одним сообщением: вкладки
 * «Общие данные» и «Конструкции» с общим локальным состоянием (Решения 1—6
 * design.md). Переключение вкладок — чисто клиентское, ввод обеих переживает
 * его: на вкладке общих данных кнопка «Далее» просто ведёт к конструкциям,
 * submit живёт там. Наружу уходит один submit с `{general, constructions}` как есть —
 * клиентской блокировки и подсветки нет, о недостающем сообщает агент. При
 * заданном `draftAction` структурные правки списка конструкций дополнительно
 * уезжают черновиком с тем же payload'ом.
 *
 * Без пропа `general` компонент работает как прежде: одна вкладка конструкций
 * (переключателя нет) и submit с `{constructions}` — путь отката.
 */
export const ConstructionsEditor = createComponentImplementation(
  constructionsEditorDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const hasGeneral = props.general !== undefined;

    const [constructions, setConstructions] = React.useState<ConstructionEntry[]>(() =>
      props.constructions.map(entry => ({...entry, layers: entry.layers.map(layer => ({...layer}))})),
    );
    const [closedIds, setClosedIds] = React.useState<ReadonlySet<string>>(new Set());
    const [activeTab, setActiveTab] = React.useState<ConstructionsEditorTab>(
      hasGeneral ? 'general' : 'constructions',
    );
    // Состояние из props, а не сами props: дефолт типа здания подставляется
    // здесь же и «тронутым климатом» не считается.
    const initialGeneral = createGeneralState(
      props.general,
      props.condition,
      props.buildingTypeOptions,
    );
    const [general, setGeneral] = React.useState<ConstructionsGeneral>(initialGeneral);

    // Снимок климата, из которого агент посчитал `rnorm`. Новые props (ответ
    // агента с пересчитанным Rнорм) — новый снимок и свежее состояние вкладки.
    const propsClimate = climateKey(initialGeneral);
    const [baseClimate, setBaseClimate] = React.useState(propsClimate);
    if (propsClimate !== baseClimate) {
      setBaseClimate(propsClimate);
      setGeneral(initialGeneral);
    }
    const climateDirty = climateKey(general) !== baseClimate;

    const typeConfigs = props.typeConfigs;
    // `condition` из вкладки; нет значения — λБ, как на сервере (Решение 6).
    const condition = general.condition ?? undefined;

    const comparable = constructions.filter(entry => {
      const config = typeConfigs.find(candidate => candidate.type === entry.type);
      return config?.rnorm !== undefined;
    });
    const passing = comparable.filter(entry => {
      const config = typeConfigs.find(candidate => candidate.type === entry.type);
      const rpr = computeLiveRpr(entry, config, condition);
      return rpr !== null && config?.rnorm !== undefined && rpr >= config.rnorm;
    });

    const handleToggle = (id: string) => {
      setClosedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    };

    // Полное состояние экрана: `general` — только когда агент его прислал,
    // иначе payload прежний (путь отката).
    const buildContext = (entries: ConstructionEntry[]) =>
      hasGeneral ? {general, constructions: entries} : {constructions: entries};

    // Автосейв черновика: тот же payload, что у submit'а, без чтения ответа
    // агента. Нет пропа — no-op.
    const sendDraft = (next: ConstructionEntry[]) => {
      if (!props.draftAction) return;
      void context.dispatchAction({
        event: {name: props.draftAction, context: buildContext(next)},
      });
    };

    const handleEntryChange = (next: ConstructionEntry) => {
      const current = constructions.find(entry => entry.id === next.id);
      // Add/remove слоя приходит сюда же, что и правки полей; отличаем по
      // длине массива слоёв (Решение 3 design.md).
      const structural = current !== undefined && current.layers.length !== next.layers.length;
      const updated = constructions.map(entry => (entry.id === next.id ? next : entry));
      setConstructions(updated);
      if (structural) sendDraft(updated);
    };

    const handleEntryRemove = (id: string) => {
      const updated = constructions.filter(entry => entry.id !== id);
      setConstructions(updated);
      sendDraft(updated);
    };

    const handleAdd = () => {
      const firstType = typeConfigs[0];
      if (!firstType) return;
      const updated = [
        ...constructions,
        {id: createLocalId(), type: firstType.type, layers: []} as ConstructionEntry,
      ];
      setConstructions(updated);
      sendDraft(updated);
    };

    // Ничего не блокируем и не подсвечиваем: единственный компетентный
    // валидатор — агент (Решение 3 design.md).
    const handleSubmit = () => {
      void context.dispatchAction({
        event: {name: props.submitAction, context: buildContext(constructions)},
      });
    };

    const handleBack = () => {
      if (!props.backAction) return;
      void context.dispatchAction({
        event: {name: props.backAction, context: props.backActionContext ?? {}},
      });
    };

    const showConstructions = !hasGeneral || activeTab === 'constructions';

    return (
      <div
        style={{
          display: 'grid',
          gap: 12,
          padding: 18,
          borderRadius: 18,
          border: `1px solid ${tokens.border}`,
          background: tokens.surface,
          color: tokens.text,
        }}
      >
        {hasGeneral ? (
          <ConstructionsEditorTabs
            active={activeTab}
            generalLabel={props.generalTabLabel ?? GENERAL_TAB_LABEL}
            constructionsLabel={props.constructionsTabLabel ?? CONSTRUCTIONS_TAB_LABEL}
            onSelect={setActiveTab}
          />
        ) : null}
        {hasGeneral && activeTab === 'general' ? (
          <div role="tabpanel">
            <ConstructionsEditorGeneral
              general={general}
              buildingTypeOptions={props.buildingTypeOptions}
              cityReferenceId={props.cityReferenceId}
              minChars={props.minChars}
              onChange={setGeneral}
            />
          </div>
        ) : null}
        {showConstructions ? (
          <div role={hasGeneral ? 'tabpanel' : undefined} style={{display: 'grid', gap: 12}}>
            {constructions.map(entry => (
              <ConstructionsEditorCard
                key={entry.id}
                entry={entry}
                typeConfigs={typeConfigs}
                condition={condition}
                materialsReferenceId={props.materialsReferenceId}
                minChars={props.minChars}
                open={!closedIds.has(entry.id)}
                showRnorm={!climateDirty}
                onToggle={() => handleToggle(entry.id)}
                onChange={handleEntryChange}
                onRemove={() => handleEntryRemove(entry.id)}
              />
            ))}
            <button
              type="button"
              onClick={handleAdd}
              style={{
                justifySelf: 'start',
                padding: '8px 14px',
                borderRadius: 12,
                border: `1px dashed ${tokens.borderStrong}`,
                background: 'transparent',
                color: tokens.text,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + {props.addLabel}
            </button>
          </div>
        ) : null}
        <footer style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
          {props.backLabel && props.backAction ? (
            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: '10px 18px',
                borderRadius: 12,
                border: `1px solid ${tokens.borderStrong}`,
                background: 'transparent',
                color: tokens.text,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {props.backLabel}
            </button>
          ) : null}
          {activeTab === 'general' && hasGeneral ? (
            // «Далее» — та же локальная смена вкладки, что и клик по табу:
            // введённое остаётся в state, агенту ничего не уходит. Сводка по
            // конструкциям здесь не к месту — она про соседнюю вкладку.
            <button
              type="button"
              onClick={() => setActiveTab('constructions')}
              style={primaryButtonStyle}
            >
              {props.nextLabel ?? NEXT_LABEL}
            </button>
          ) : (
            <>
              <button type="button" onClick={handleSubmit} style={primaryButtonStyle}>
                {props.submitLabel}
              </button>
              {/* Климат тронут → присланный Rнорм протух, сводка молчит до
                  следующих props (Решение 4 design.md). */}
              {climateDirty ? null : (
                <span style={{color: tokens.textMuted, fontSize: '0.9rem'}}>
                  проходит {passing.length} из {comparable.length}
                </span>
              )}
            </>
          )}
        </footer>
      </div>
    );
  },
);
