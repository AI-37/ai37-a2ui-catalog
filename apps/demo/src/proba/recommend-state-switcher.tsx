import React from 'react';
import {Button} from '@ai37/a2ui-catalog-react/primitives';
import type {RecommendState} from './recommend.types';

/** Четыре состояния блока подряд: в песочнице их видно без сети. */
const STATES: Array<[RecommendState, string]> = [
  ['loading', 'Загрузка'],
  ['shown', 'Список'],
  ['empty', 'Пусто'],
  ['stale', 'Устарело'],
];

/**
 * Переключатель состояний — деталь песочницы, а не блока: в пакете состояние
 * приходит от хука, и переключать его руками будет нечем.
 */
export function RecommendStateSwitcher({
  state,
  onChange,
}: {
  state: RecommendState;
  onChange: (next: RecommendState) => void;
}) {
  return (
    <div style={rowStyle}>
      {STATES.map(([value, label]) => (
        <Button
          key={value}
          size="sm"
          variant={value === state ? 'filled' : 'outline'}
          onClick={() => onChange(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

const rowStyle: React.CSSProperties = {display: 'flex', flexWrap: 'wrap', gap: 8};
