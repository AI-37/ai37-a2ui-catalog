import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import {Button, PlusIcon} from '../primitives';
import {ConstructionsNextCard} from './constructions-next-card';
import type {ConstructionsNextListProps} from './constructions-next.types';

/**
 * Секция «Конструкции»: подпись, аккордеон и кнопка добавления. Раскрыта одна
 * карточка за раз (`multiple={false}`) — четыре открытых состава подряд
 * перестают читаться.
 *
 * Подпись и «Добавить» стоят снаружи `Accordion.Root`: внутри него живут
 * только элементы аккордеона.
 */
export function ConstructionsNextList({
  entries,
  typeConfigs,
  condition,
  materialsReferenceId,
  minChars,
  showRnorm,
  showStatusChips,
  dismissedStatusIds,
  openId,
  onOpenChange,
  editing,
  onEditingChange,
  onEntryChange,
  onEntryRemove,
  addLabel,
  onAdd,
  entryRef,
}: ConstructionsNextListProps) {
  return (
    <div style={groupStyle}>
      <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">
        Конструкции · {entries.length}
      </span>

      <Accordion.Root
        multiple={false}
        value={openId === null ? [] : [openId]}
        onValueChange={value => onOpenChange((value[0] as string | undefined) ?? null)}
        style={listStyle}
      >
        {entries.map(entry => (
          <ConstructionsNextCard
            key={entry.id}
            entry={entry}
            typeConfigs={typeConfigs}
            condition={condition}
            materialsReferenceId={materialsReferenceId}
            minChars={minChars}
            showRnorm={showRnorm}
            showStatusChips={showStatusChips}
            statusDismissed={dismissedStatusIds.has(entry.id)}
            editingTarget={editing?.entryId === entry.id ? editing.target : null}
            onEditingChange={target => onEditingChange(entry.id, target)}
            onChange={onEntryChange}
            onRemove={() => onEntryRemove(entry.id)}
            entryRef={element => entryRef(entry.id, element)}
          />
        ))}
      </Accordion.Root>

      {/* Кнопка «Добавить» обёрнута в justify-self: start — прямым ребёнком
          grid она растягивалась во всю ширину. Вариант link, а не рамка:
          пунктирный прямоугольник под списком карточек читался как ещё одна
          пустая карточка. */}
      <div style={{justifySelf: 'start'}}>
        <Button variant="link" tone="accent" icon={<PlusIcon />} onClick={onAdd}>
          {addLabel}
        </Button>
      </div>
    </div>
  );
}

const groupStyle: React.CSSProperties = {display: 'grid', gap: 8};

const listStyle: React.CSSProperties = {display: 'grid', gap: 8};
