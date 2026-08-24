import React from 'react';
import {Collapsible} from '@base-ui/react/collapsible';
import {Card, CardHeader, CardTriggerLabel, buttonClassName} from '@ai37/a2ui-catalog-react/primitives';
import {ConditionsForm} from './conditions-form';
import {ConditionsSummary} from './conditions-summary';
import {useConditions} from './use-conditions';

/**
 * Свой id панели: библиотека снимает `aria-controls` со свёрнутого триггера, а
 * спека требует его в обоих состояниях — значит id объявляем сами.
 */
const PANEL_ID = 'proba-conditions-panel';

/**
 * Секция «Условия»: подпись и одна карточка в двух состояниях. Раскрытием
 * владеет `Collapsible` — он же держит `aria-expanded`/`aria-controls` и
 * `data-panel-open` для шеврона. Соседей у секции нет, поэтому здесь
 * `Collapsible`, а не `Accordion`.
 *
 * Подпись «УСЛОВИЯ» стоит снаружи карточки и потому остаётся на месте в обоих
 * состояниях — в пакете она объявлена только в раскрытой ветке и пропадает
 * при сворачивании.
 */
export function ConditionsGroup() {
  const [open, setOpen] = React.useState(false);
  const control = useConditions();

  return (
    <div style={groupStyle}>
      <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">Условия</span>

      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <Card flat>
          <CardHeader
            title={
              <Collapsible.Trigger
                className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
                aria-controls={PANEL_ID}
              >
                <CardTriggerLabel title="Условия расчёта" />
                <ConditionsSummary open={open} state={control.state} />
              </Collapsible.Trigger>
            }
          />
          <Collapsible.Panel keepMounted id={PANEL_ID} className="a2ui-card__panel">
            <ConditionsForm control={control} />
          </Collapsible.Panel>
        </Card>
      </Collapsible.Root>
    </div>
  );
}

const groupStyle: React.CSSProperties = {display: 'grid', gap: 8};
