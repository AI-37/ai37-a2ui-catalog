import React from 'react';
import {DrawingText} from './drawing-text';
import {useDrawingView} from './use-drawing-view';
import {DRAWING_RED} from './drawing-colors';
import {useA2uiMessages} from '../../i18n';

/**
 * Подпись вместо сектора, когда небо из расчётной точки перекрыто застройкой:
 * сектора нет, и n₁ на листе нет тоже — β-луч выше α-луча показывает, почему.
 */
export function SkyBlockedNote({
  poleX,
  poleY,
  glassX,
}: {
  poleX: number;
  poleY: number;
  glassX: number;
}) {
  const view = useDrawingView();
  const m = useA2uiMessages();
  const p = view.toScreen(poleX, poleY);
  const dPx = Math.abs(glassX - poleX) * view.pxPerMeter;

  return (
    <DrawingText
      x={p.px - dPx * 0.55}
      y={p.py - 24}
      fill={DRAWING_RED}
      size={13}
      anchor="middle"
    >
      {m.keo.skyBlocked}
    </DrawingText>
  );
}
