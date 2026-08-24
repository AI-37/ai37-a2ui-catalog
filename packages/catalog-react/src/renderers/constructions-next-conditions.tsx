import React from 'react';
import {Collapsible} from '@base-ui/react/collapsible';
import {Card, CardHeader, CardTriggerLabel, buttonClassName} from '../primitives';
import {ConstructionsNextConditionsForm} from './constructions-next-conditions-form';
import {ConstructionsNextConditionsSummary} from './constructions-next-conditions-summary';
import type {ConstructionsNextConditionsProps} from './constructions-next.types';

/**
 * Секция «Условия»: подпись и одна карточка в двух состояниях. Раскрытием
 * владеет `Collapsible` — он же держит `aria-expanded`/`aria-controls` и
 * `data-panel-open`, по которому CSS поворачивает шеврон. Соседей у секции
 * нет, поэтому здесь `Collapsible`, а не `Accordion`.
 *
 * Подпись «УСЛОВИЯ» стоит снаружи карточки и потому остаётся на месте в обоих
 * состояниях: у нынешнего рендерера она объявлена только в раскрытой ветке и
 * при сворачивании пропадает.
 *
 * Отдельной кнопки «Показать» нет: раскрывается вся полоска — и шеврон, и
 * заголовок, и сводка внутри одного триггера. Вторая кнопка о том же дублировала
 * бы её и требовала своего места в шапке.
 *
 * Свой id панели: библиотека снимает `aria-controls` со свёрнутого триггера, а
 * спека требует его в обоих состояниях — значит id объявляем сами. `useId`, а
 * не константа: в одном треде может стоять несколько редакторов.
 */
export function ConstructionsNextConditions({
  open,
  onOpenChange,
  ...general
}: ConstructionsNextConditionsProps) {
  const panelId = `${React.useId()}-conditions`;

  return (
    <div style={groupStyle}>
      <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">Условия</span>

      <Collapsible.Root open={open} onOpenChange={onOpenChange}>
        <Card flat>
          <CardHeader
            title={
              <Collapsible.Trigger
                className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
                aria-controls={panelId}
              >
                <CardTriggerLabel title="Условия расчёта" />
                <ConstructionsNextConditionsSummary open={open} general={general.general} />
              </Collapsible.Trigger>
            }
          />
          <Collapsible.Panel keepMounted id={panelId} className="a2ui-card__panel">
            <ConstructionsNextConditionsForm {...general} />
          </Collapsible.Panel>
        </Card>
      </Collapsible.Root>
    </div>
  );
}

const groupStyle: React.CSSProperties = {display: 'grid', gap: 8};
