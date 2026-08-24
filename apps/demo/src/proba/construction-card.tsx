import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import {CardHeader, CardTriggerLabel, Chip, Menu, MoreIcon, buttonClassName, cardClassName} from '@ai37/a2ui-catalog-react/primitives';
import {ConstructionBody} from './construction-body';
import type {ConstructionEntry} from './construction-card.types';

/**
 * Карточка конструкции — элемент аккордеона: карточкой её делает класс
 * примитива, раскрытием и клавиатурой владеет библиотека. Переключается только
 * тело: подложка, шапка и шеврон общие для обоих состояний.
 *
 * Действия карточки живут в меню, а не голым «✕»: удаление необратимо, и
 * попасть в него мимо намерения не должно быть так же легко, как в раскрытие.
 * Меню и пилюля стоят рядом с `Accordion.Header`, а не внутри: кнопка внутри
 * заголовка попадала бы в его доступное имя.
 */
export function ConstructionCard({entry}: {entry: ConstructionEntry}) {
  const panelId = `proba-construction-${entry.id}`;

  return (
    <Accordion.Item value={entry.id} className={cardClassName()}>
      <CardHeader
        title={
          <Accordion.Header className="a2ui-card__heading">
            <Accordion.Trigger
              className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
              aria-controls={panelId}
            >
              <CardTriggerLabel title={entry.title} />
            </Accordion.Trigger>
          </Accordion.Header>
        }
        badge={<Chip tone={entry.pass ? 'success' : 'danger'}>{entry.chip}</Chip>}
        action={
          <Menu
            icon={<MoreIcon />}
            ariaLabel={`Действия: ${entry.title}`}
            items={[{label: 'Удалить', tone: 'danger', onSelect: () => undefined}]}
          />
        }
      />
      <Accordion.Panel keepMounted id={panelId} className="a2ui-card__panel">
        <ConstructionBody entry={entry} />
      </Accordion.Panel>
    </Accordion.Item>
  );
}
