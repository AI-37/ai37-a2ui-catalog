import React from 'react';
import {Accordion} from '@base-ui/react/accordion';
import {CONSTRUCTIONS} from './assembly-fixture';
import {ConstructionCard} from './construction-card';
import {Button, PlusIcon} from '@ai37/a2ui-catalog-react/primitives';

/**
 * Секция «Конструкции»: подпись, аккордеон и кнопка добавления. Раскрыта одна
 * карточка за раз (`multiple={false}`) — список из четырёх открытых составов
 * перестаёт читаться.
 *
 * Подпись и кнопка стоят снаружи `Accordion.Root`: внутри него живут только
 * элементы, иначе стрелки начнут ходить по чужим кнопкам.
 */
export function ConstructionsGroup() {
  return (
    <div style={groupStyle}>
      <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">
        Конструкции · {CONSTRUCTIONS.length}
      </span>

      <Accordion.Root multiple={false} style={listStyle}>
        {CONSTRUCTIONS.map(entry => (
          <ConstructionCard key={entry.id} entry={entry} />
        ))}
      </Accordion.Root>

      {/* Кнопка «Добавить» обёрнута в justify-self: start — как прямой ребёнок
          grid она растягивалась во всю ширину группы и читалась как ещё одна
          карточка. */}
      <div style={{justifySelf: 'start'}}>
        <Button variant="link" tone="accent" icon={<PlusIcon />}>
          Добавить конструкцию
        </Button>
      </div>
    </div>
  );
}

const groupStyle: React.CSSProperties = {display: 'grid', gap: 8};

const listStyle: React.CSSProperties = {display: 'grid', gap: 8};
