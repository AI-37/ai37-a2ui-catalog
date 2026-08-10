import React from 'react';
import {tokens} from './tokens';
import type {LiftEditorTab, LiftEditorTabsProps} from './lift-editor.types';

const tabStyle = (selected: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  borderRadius: 12,
  border: `1px solid ${selected ? tokens.borderStrong : tokens.border}`,
  background: selected ? tokens.surfaceHeader : 'transparent',
  color: selected ? tokens.textStrong : tokens.textMuted,
  fontWeight: 600,
  cursor: 'pointer',
});

/**
 * Вкладки «Здание» + лифты и кнопка добавления. Переключение и добавление —
 * локальные: наружу компонент шлёт только submit. Точка у подписи означает
 * незаполненные обязательные поля этой вкладки.
 */
export function LiftEditorTabs({
  active,
  buildingLabel,
  liftTabLabel,
  perLift,
  liftCount,
  addLabel,
  canAdd,
  incomplete,
  onSelect,
  onAdd,
}: LiftEditorTabsProps) {
  const tabs: Array<{key: LiftEditorTab; label: string}> = [
    {key: 'building', label: buildingLabel},
    ...Array.from({length: liftCount}, (_unused, index) => ({
      key: index as LiftEditorTab,
      label: perLift ? `${liftTabLabel} ${index + 1}` : liftTabLabel,
    })),
  ];

  return (
    <div role="tablist" style={{display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center'}}>
      {tabs.map(tab => (
        <button
          key={String(tab.key)}
          type="button"
          role="tab"
          aria-selected={tab.key === active}
          // Пометка — атрибутом и точкой, не текстом: доступное имя вкладки
          // остаётся её подписью, а незаполненные поля и так подсвечены на экране.
          data-incomplete={incomplete.has(tab.key) ? 'true' : undefined}
          title={incomplete.has(tab.key) ? 'Есть незаполненные обязательные поля' : undefined}
          onClick={() => onSelect(tab.key)}
          style={tabStyle(tab.key === active)}
        >
          {incomplete.has(tab.key) ? (
            <span
              aria-hidden="true"
              style={{width: 7, height: 7, borderRadius: '50%', background: tokens.danger}}
            />
          ) : null}
          {tab.label}
        </button>
      ))}
      {perLift ? (
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          style={{
            ...tabStyle(false),
            marginLeft: 'auto',
            borderStyle: 'dashed',
            opacity: canAdd ? 1 : 0.45,
            cursor: canAdd ? 'pointer' : 'not-allowed',
          }}
        >
          + {addLabel}
        </button>
      ) : null}
    </div>
  );
}
