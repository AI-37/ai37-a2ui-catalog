import React from 'react';
import {ConstructionsNextConditions} from './constructions-next-conditions';
import type {ConstructionsNextConditionsProps} from './constructions-next.types';

/**
 * Место блока «Условия» на экране: без пропа `general` блока нет вовсе (путь
 * отката — только конструкции и submit с `{constructions}`). Обёртка нужна и
 * ради якоря скролла: навигация кнопки-«Далее» ведёт к секции.
 */
export function ConstructionsNextConditionsSlot({
  show,
  sectionRef,
  ...conditions
}: ConstructionsNextConditionsProps & {
  show: boolean;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  if (!show) {
    return null;
  }

  return (
    <div ref={sectionRef}>
      <ConstructionsNextConditions {...conditions} />
    </div>
  );
}
