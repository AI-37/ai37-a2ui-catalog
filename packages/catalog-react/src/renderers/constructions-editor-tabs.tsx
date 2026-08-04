import React from 'react';
import type {
  ConstructionsEditorTab,
  ConstructionsEditorTabsProps,
} from './constructions-editor.types';
import {tokens} from './tokens';

/**
 * Переключатель вкладок объединённого экрана. Чисто локальный: выбор вкладки
 * никуда не уезжает, состояние обеих вкладок живёт в редакторе и переключение
 * его не трогает.
 */
export function ConstructionsEditorTabs({
  active,
  generalLabel,
  constructionsLabel,
  onSelect,
}: ConstructionsEditorTabsProps) {
  const tabs: Array<{key: ConstructionsEditorTab; label: string}> = [
    {key: 'general', label: generalLabel},
    {key: 'constructions', label: constructionsLabel},
  ];

  return (
    <div role="tablist" style={{display: 'flex', gap: 6, flexWrap: 'wrap'}}>
      {tabs.map(tab => {
        const selected = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(tab.key)}
            style={{
              padding: '8px 14px',
              borderRadius: 12,
              border: `1px solid ${selected ? tokens.borderStrong : tokens.border}`,
              background: selected ? tokens.surfaceHeader : 'transparent',
              color: selected ? tokens.textStrong : tokens.textMuted,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
