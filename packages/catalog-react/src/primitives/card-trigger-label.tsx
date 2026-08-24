import React from 'react';
import {ChevronIcon} from './icons';

/**
 * Содержимое кнопки-раскрывашки: шеврон и заголовок. Состояние сюда не
 * приходит — поворот шеврона ставит CSS по `data-panel-open` от библиотеки.
 */
export function CardTriggerLabel({title}: {title: React.ReactNode}) {
  return (
    <>
      <ChevronIcon />
      <span className="a2ui-t--body">{title}</span>
    </>
  );
}
