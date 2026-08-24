import React from 'react';
import {Card} from './proposed-card';
import {CardHeader} from './proposed-card-header';
import {ConditionsForm} from './conditions-form';
import {ConditionsSummary} from './conditions-summary';
import {ProposedButton} from './proposed-button';

/** Секция «Условия»: подпись и одна карточка в двух состояниях. */
export function ConditionsGroup({open, onToggle}: {open: boolean; onToggle: () => void}) {
  return (
    <div style={groupStyle}>
      <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">Условия</span>

      <Card flat>
        <CardHeader
          open={open}
          onToggle={onToggle}
          title={
            <>
              Условия расчёта <ConditionsSummary open={open} />
            </>
          }
          action={
            <ProposedButton variant="link" tone="accent" onClick={onToggle}>
              {open ? 'Свернуть' : 'Показать'}
            </ProposedButton>
          }
        />
        <ConditionsForm open={open} />
      </Card>
    </div>
  );
}

const groupStyle: React.CSSProperties = {display: 'grid', gap: 8};
