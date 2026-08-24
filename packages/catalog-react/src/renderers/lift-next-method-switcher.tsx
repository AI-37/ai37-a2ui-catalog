import React from 'react';
import {Menu} from '../primitives';
import type {LiftNextMethodSwitcherProps} from './lift-next.types';

/**
 * Переключатель методики в шапке карточки: строка «ГОСТ · тип здания» с
 * выбором — меню набора, а не поле формы. Методика не заполняется вместе с
 * остальными данными: она решает, какие данные вообще спрашивать.
 *
 * Триггер — ссылка с кареткой, без рамки: рамка обещала бы действие, а это
 * выбранное значение шапки. Клавиатура, роли и попап — из меню примитива.
 *
 * Подпись собирается на клиенте из живого значения типа здания: присланная
 * агентом строка протухла бы после первой правки.
 */
export function LiftNextMethodSwitcher({
  configs,
  method,
  buildingKind,
  onChange,
}: LiftNextMethodSwitcherProps) {
  const active = configs.find(config => config.method === method);
  const gost = active?.gostLabel ?? method;

  return (
    <Menu
      trigger="link"
      label={buildingKind === '' ? gost : `${gost} · ${buildingKind}`}
      items={configs.map(config => ({
        label: config.label,
        onSelect: () => onChange(config.method),
      }))}
    />
  );
}
