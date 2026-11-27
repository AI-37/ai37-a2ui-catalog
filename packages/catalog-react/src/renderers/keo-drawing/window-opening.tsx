import React from 'react';
import {CutRect} from './cut-rect';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_BLUE} from './drawing-colors';

/**
 * Оконная стена на разрезе: подоконная и надоконная части сечения плюс линия
 * остекления посередине толщины стены (x = −Δст/2) от подоконника до верха
 * проёма. Внутренняя грань стены — x = 0.
 */
export function WindowOpening({
  wallThickness,
  sillHeight,
  windowTop,
  roomHeight,
}: {
  wallThickness: number;
  sillHeight: number;
  windowTop: number;
  roomHeight: number;
}) {
  const view = useDrawingView();
  const glassX = -wallThickness / 2;
  const top = view.toScreen(glassX, windowTop);
  const bottom = view.toScreen(glassX, sillHeight);

  return (
    <g>
      {sillHeight > 0 && <CutRect x={-wallThickness} y={0} w={wallThickness} h={sillHeight} />}
      {windowTop < roomHeight && (
        <CutRect x={-wallThickness} y={windowTop} w={wallThickness} h={roomHeight - windowTop} />
      )}
      <line
        x1={top.px}
        y1={top.py}
        x2={bottom.px}
        y2={bottom.py}
        strokeWidth={2.6}
        style={{stroke: DRAWING_BLUE}}
      />
    </g>
  );
}
