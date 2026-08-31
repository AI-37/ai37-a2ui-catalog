import React from 'react';
import {DrawingText} from './drawing-text';
import {DRAWING_FAN_NUM} from './drawing-colors';

/**
 * Нумерация полуокружностей веера по горизонтали от полюса: 0, 5, 10 … Общая
 * у обоих графиков — номер полуокружности и есть связка I и II через C₁.
 * Номера, ушедшие за кромку листа, не печатаются.
 */
export function FanNumbers({
  px,
  py,
  r50,
  sheetWidth,
  offsetY,
}: {
  px: number;
  py: number;
  r50: number;
  sheetWidth: number;
  offsetY: number;
}) {
  const numbers: React.ReactElement[] = [];

  for (let n = 5; n <= 50; n += 5) {
    const x = px + (n / 50) * r50;
    if (x > sheetWidth - 14) {
      break;
    }
    numbers.push(
      <DrawingText
        key={`n${n}`}
        x={x}
        y={py + offsetY}
        fill={DRAWING_FAN_NUM}
        size={12}
        anchor="middle"
      >
        {String(n)}
      </DrawingText>,
    );
  }

  return (
    <g>
      <DrawingText x={px - 5} y={py + offsetY} fill={DRAWING_FAN_NUM} size={12} anchor="middle">
        0
      </DrawingText>
      {numbers}
    </g>
  );
}
