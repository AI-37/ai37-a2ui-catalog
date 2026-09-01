import React from 'react';

/**
 * Надпись листа «рукописным» курсивом. Координаты — экранные px: примитив
 * стоит внутри других, они уже сделали преобразование мир → экран. Цвет
 * приходит токеном, поэтому идёт через `style`, а не атрибутом `fill`:
 * `var()` в атрибуте краски SVG не разбирается.
 */
export function DrawingText({
  x,
  y,
  fill,
  size,
  anchor,
  transform,
  children,
}: {
  x: number;
  y: number;
  fill: string;
  size: number;
  anchor: 'start' | 'middle' | 'end';
  transform?: string;
  children: string;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fontStyle="italic"
      textAnchor={anchor}
      transform={transform}
      style={{fill}}
    >
      {children}
    </text>
  );
}
