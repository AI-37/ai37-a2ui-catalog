import React from 'react';
import {Card} from './proposed-card';
import {CardHeader} from './proposed-card-header';
import {Chip} from './proba-chip';
import {CloseIcon} from './proba-icons';
import {ConstructionBody} from './construction-body';
import {ProposedButton} from './proposed-button';
import type {ConstructionEntry} from './construction-card.types';

/** Карточка конструкции: шапка со слотами и тело со слоями. Раскрытие переключает только тело. */
export function ConstructionCard({
  entry,
  open,
  onToggle,
}: {
  entry: ConstructionEntry;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <Card>
      <CardHeader
        open={open}
        onToggle={onToggle}
        title={entry.title}
        badge={<Chip tone={entry.pass ? 'success' : 'danger'}>{entry.chip}</Chip>}
        action={
          <ProposedButton
            variant="link"
            icon={<CloseIcon />}
            aria-label={`Удалить: ${entry.title}`}
          />
        }
      />
      <ConstructionBody entry={entry} open={open} />
    </Card>
  );
}
