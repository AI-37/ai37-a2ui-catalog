import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {
  constructionsEditorDefinition,
  type ConstructionEntry,
} from '@ai37/a2ui-catalog-schemas';
import {computeLiveRpr} from './compute-live-rpr';
import {ConstructionsEditorCard} from './constructions-editor-card';
import {createLocalId} from './create-local-id';
import {tokens} from './tokens';
import {useA2uiBaseStyles} from './shared';
import {validateConstructions} from './validate-constructions';

/**
 * Редактор конструкций одним сообщением (паттерн FormCard, Решения 1, 5, 6
 * design.md): рабочая копия конструкций — локальный state из props, все
 * правки на клиенте без action'ов; наружу уходят только один submit с полным
 * массивом в context (после клиентской валидации с подсветкой) и back без
 * валидации.
 */
export const ConstructionsEditor = createComponentImplementation(
  constructionsEditorDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const [constructions, setConstructions] = React.useState<ConstructionEntry[]>(() =>
      props.constructions.map(entry => ({...entry, layers: entry.layers.map(layer => ({...layer}))})),
    );
    const [closedIds, setClosedIds] = React.useState<ReadonlySet<string>>(new Set());
    const [submitAttempted, setSubmitAttempted] = React.useState(false);

    const typeConfigs = props.typeConfigs;
    const validation = validateConstructions(constructions, typeConfigs);

    const comparable = constructions.filter(entry => {
      const config = typeConfigs.find(candidate => candidate.type === entry.type);
      return config?.rnorm !== undefined;
    });
    const passing = comparable.filter(entry => {
      const config = typeConfigs.find(candidate => candidate.type === entry.type);
      const rpr = computeLiveRpr(entry, config, props.condition);
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

    const handleEntryChange = (next: ConstructionEntry) => {
      setConstructions(prev => prev.map(entry => (entry.id === next.id ? next : entry)));
    };

    const handleEntryRemove = (id: string) => {
      setConstructions(prev => prev.filter(entry => entry.id !== id));
    };

    const handleAdd = () => {
      const firstType = typeConfigs[0];
      if (!firstType) return;
      setConstructions(prev => [...prev, {id: createLocalId(), type: firstType.type, layers: []}]);
    };

    const handleSubmit = () => {
      if (!validation.valid) {
        setSubmitAttempted(true);
        return;
      }
      // Один action с полным массивом состояния — включая клиентские id
      // (агент их игнорирует) и все λ-поля (Решение 6 design.md).
      void context.dispatchAction({
        event: {name: props.submitAction, context: {constructions}},
      });
    };

    const handleBack = () => {
      void context.dispatchAction({
        event: {name: props.backAction, context: props.backActionContext ?? {}},
      });
    };

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
        {constructions.map(entry => (
          <ConstructionsEditorCard
            key={entry.id}
            entry={entry}
            typeConfigs={typeConfigs}
            condition={props.condition}
            materialsReferenceId={props.materialsReferenceId}
            minChars={props.minChars}
            open={!closedIds.has(entry.id)}
            errors={submitAttempted ? validation.byEntryId.get(entry.id) : undefined}
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
        <footer style={{display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'}}>
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
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              border: 'none',
              background: tokens.accent,
              color: tokens.accentContrast,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {props.submitLabel}
          </button>
          <span style={{color: tokens.textMuted, fontSize: '0.9rem'}}>
            проходит {passing.length} из {comparable.length}
          </span>
          {submitAttempted && !validation.valid ? (
            <span style={{color: tokens.danger, fontSize: '0.9rem'}}>
              Заполните подсвеченные поля
            </span>
          ) : null}
        </footer>
      </div>
    );
  },
);
