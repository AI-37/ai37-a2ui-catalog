import React from 'react';
import {DrawingContext} from './drawing-context';
import {createDrawingView} from './create-drawing-view';
import {DRAWING_HATCH, DRAWING_SHEET} from './drawing-colors';
import type {DrawingBounds} from './drawing-view.types';

/**
 * Лист чертежа: холст в мировых метрах и штриховка сечений одним `pattern` на
 * лист. Id штриховки уникален (`useId`) — на странице два листа, и общий id
 * увёл бы ссылку `url(#…)` в чужой `<svg>`.
 *
 * Лист рисуется в натуральную величину и скроллится внутри своей обёртки:
 * вписывание по ширине карточки ужало бы подписи до нечитаемых (в чат-ленте
 * карточка бывает уже 400 px). Страница вбок при этом не едет — прокрутка
 * своя у обёртки.
 */
export function DrawingSheet({
  bounds,
  pxPerMeter,
  title,
  children,
}: {
  bounds: DrawingBounds;
  pxPerMeter: number;
  title: string;
  children: React.ReactNode;
}) {
  const hatchId = `${React.useId().replace(/[^a-zA-Z0-9_-]/g, '')}-hatch`;
  const view = React.useMemo(
    () => createDrawingView(bounds, pxPerMeter, hatchId),
    [bounds, pxPerMeter, hatchId],
  );

  return (
    <DrawingContext.Provider value={view}>
      <div style={scrollStyle}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={title}
          width={view.width}
          height={view.height}
          viewBox={`0 0 ${view.width} ${view.height}`}
          style={svgStyle}
        >
          <defs>
            <pattern
              id={hatchId}
              width={7}
              height={7}
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
            >
              <line x1={0} y1={0} x2={0} y2={7} strokeWidth={0.8} style={{stroke: DRAWING_HATCH}} />
            </pattern>
          </defs>
          <rect
            x={0}
            y={0}
            width={view.width}
            height={view.height}
            style={{fill: DRAWING_SHEET}}
          />
          {children}
        </svg>
      </div>
    </DrawingContext.Provider>
  );
}

const scrollStyle: React.CSSProperties = {
  maxWidth: '100%',
  overflowX: 'auto',
  borderRadius: 'var(--a2ui-card-radius-sunken)',
  border: '1px solid var(--a2ui-card-border)',
};

// Отсечение по кромке листа объявляем сами: веер графика уходит за габарит
// холста, а UA-правило `svg:root { overflow: hidden }` держится не везде —
// без него подложка вылезала бы на соседние секции карточки.
const svgStyle: React.CSSProperties = {
  display: 'block',
  overflow: 'hidden',
  fontFamily: 'var(--a2ui-font)',
};
