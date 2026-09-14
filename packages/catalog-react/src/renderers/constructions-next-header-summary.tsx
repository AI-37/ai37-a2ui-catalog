import React from 'react';
import {Button} from '../primitives';
import {CHERDACHNYE_SUBTYPE_LABELS} from './cherdachnye-subtype-labels';
import {isSubtypeRequired} from './is-subtype-required';
import type {ConstructionsNextHeaderRowProps} from './constructions-next.types';

/**
 * Режим чтения шапки: тип (с разновидностью через «·») и название текстом,
 * рядом «Изменить». `aria-label` различает две кнопки «Изменить» карточки без
 * слоёв (шапка и паспортное Rпр) — на слух они были бы одинаковы.
 */
export function ConstructionsNextHeaderSummary({
  entry,
  typeConfigs,
  onOpen,
}: ConstructionsNextHeaderRowProps) {
  const config = typeConfigs.find(candidate => candidate.type === entry.type);
  const subtypeLabel = entry.subtype ? CHERDACHNYE_SUBTYPE_LABELS[entry.subtype] : undefined;
  const name = entry.name?.trim();

  return (
    <div style={rowStyle}>
      <span style={textStyle}>
        <span className="a2ui-t--sub">
          {config?.label ?? entry.type}
          {subtypeLabel ? ` · ${subtypeLabel}` : ''}
          <ConstructionsNextHeaderSubtypeMissing
            missing={entry.subtype === undefined && isSubtypeRequired(config)}
          />
        </span>
        <ConstructionsNextHeaderName name={name} />
      </span>
      <Button size="sm" aria-label="Изменить тип и название" onClick={onOpen}>
        Изменить
      </Button>
    </div>
  );
}

/**
 * Место разновидности не остаётся пустым: подсветка карточки говорит, где
 * смотреть, а текст — что заполнить. Тот же приём, что «толщина не задана» в
 * строке слоя. Разделитель внутри span, чтобы «·» не повис без текста у типов
 * без разновидностей.
 */
function ConstructionsNextHeaderSubtypeMissing({missing}: {missing: boolean}) {
  if (!missing) {
    return null;
  }

  return <span className="a2ui-t--warning">{' ·\u00A0разновидность не выбрана'}</span>;
}

/** Название есть не у всех конструкций: пустая строка сдвигала бы тип вверх. */
function ConstructionsNextHeaderName({name}: {name: string | undefined}) {
  if (!name) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{name}</span>;
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
};

const textStyle: React.CSSProperties = {display: 'grid', gap: 2, minWidth: 0};
