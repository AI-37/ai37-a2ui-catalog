import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import {CardBody} from './card-body';
import {CardHeader} from './card-header';
import {CardTriggerLabel} from './card-trigger-label';
import {buttonClassName} from './button-class-name';
import {cardClassName} from './card-class-name';
import {renderLabelSubscripts} from './render-label-subscripts';
import type {SectionItemProps} from './section-item.types';

/**
 * Секция-раскрывашка с пометкой — элемент `Accordion`: карточкой её делает
 * класс примитива, раскрытием, `aria-expanded` и клавиатурой владеет
 * библиотека. Переключается только тело: подложка, шапка и шеврон общие для
 * обоих состояний.
 *
 * Сводка стоит внутри кнопки-заголовка и видна только в свёрнутом виде: в
 * раскрытом те же значения стоят полями. Собирается она из `shortLabel`
 * полей — той же плоской нотации, что и подписи, — и потому идёт через
 * `renderLabelSubscripts`. Пометка и действие живут рядом с
 * `Accordion.Header`, а не внутри — кнопка внутри заголовка попала бы в его
 * доступное имя.
 */
export function SectionItem({
  value,
  panelId,
  title,
  summary,
  badge,
  action,
  sectionRef,
  children,
}: SectionItemProps) {
  return (
    <Accordion.Item ref={sectionRef} value={value} className={cardClassName()}>
      <CardHeader
        title={
          <Accordion.Header className="a2ui-card__heading">
            <Accordion.Trigger
              className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
              aria-controls={panelId}
            >
              {/* Заголовок не переносится: в узком контейнере он делил строку
                  со сводкой поровну и рассыпался на «Ли / фт / 2». Место
                  уступает сводка — она длиннее и переносится осмысленно. */}
              <CardTriggerLabel title={<span style={titleStyle}>{title}</span>} />
              <span className="a2ui-t--sub a2ui-t--muted">
                {summary === '' ? 'не заполнено' : renderLabelSubscripts(summary)}
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
        }
        badge={badge}
        action={action}
      />
      <Accordion.Panel keepMounted id={panelId} className="a2ui-card__panel">
        <CardBody>{children}</CardBody>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

const titleStyle: React.CSSProperties = {whiteSpace: 'nowrap'};
