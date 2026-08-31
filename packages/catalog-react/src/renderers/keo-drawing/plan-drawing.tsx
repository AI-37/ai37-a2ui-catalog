import React from 'react';
import {CalcPoint} from './calc-point';
import {CutRect} from './cut-rect';
import {DimH} from './dim-h';
import {DimV} from './dim-v';
import {DrawingSheet} from './drawing-sheet';
import {GraphIiFan} from './graph-ii-fan';
import {PlanSector} from './plan-sector';
import {formatMm} from './format-mm';
import {formatNum} from './format-num';
import {graphRadius50} from './graph-radius50';
import {planBounds} from './plan-bounds';
import {PLAN_SIDE_WALL} from './sheet-constants';
import type {KeoPlanDrawing} from '@ai37/a2ui-catalog-schemas';

/**
 * План помещения с наложенным графиком Данилюка II: оконная стена двумя
 * простенками, сектор света через проём между азимутами ψ₁ и ψ₂, веер графика
 * полюсом в расчётной точке и размерные ГОСТ.
 *
 * Одно окно намеренно: модель допускает и смещённый проём, и несколько окон,
 * но первая версия рисует ровно то, что нужно жилой комнате (Non-goals
 * proposal.md).
 */
export function PlanDrawing({plan, pxPerMeter}: {plan: KeoPlanDrawing; pxPerMeter: number}) {
  const bounds = planBounds(plan);
  const {roomWidth, roomDepth, wallThickness} = plan;
  const lt = plan.point.lt;
  const halfRoom = roomWidth / 2;
  const outer = halfRoom + PLAN_SIDE_WALL;
  const windowFrom = plan.window.offset - plan.window.width / 2;
  const windowTo = plan.window.offset + plan.window.width / 2;

  return (
    <DrawingSheet bounds={bounds} pxPerMeter={pxPerMeter} title="План помещения">
      {/* сектор света — под конструкциями, как на листе */}
      <PlanSector
        poleY={lt}
        psi1Deg={plan.psi1Deg}
        psi2Deg={plan.psi2Deg}
        wallThickness={wallThickness}
        label={plan.n2 === undefined ? undefined : formatNum(plan.n2)}
      />

      <GraphIiFan
        poleY={lt}
        rayAnglesDeg={plan.fanRayAnglesDeg}
        radius50={graphRadius50(lt, wallThickness)}
      />

      {/* оконная стена двумя простенками, боковые стены, дальняя */}
      <CutRect x={-outer} y={-wallThickness} w={windowFrom + outer} h={wallThickness} />
      <CutRect x={windowTo} y={-wallThickness} w={outer - windowTo} h={wallThickness} />
      <CutRect x={-outer} y={0} w={PLAN_SIDE_WALL} h={roomDepth + PLAN_SIDE_WALL} />
      <CutRect x={halfRoom} y={0} w={PLAN_SIDE_WALL} h={roomDepth + PLAN_SIDE_WALL} />
      <CutRect x={-outer} y={roomDepth} w={roomWidth + 2 * PLAN_SIDE_WALL} h={PLAN_SIDE_WALL} />

      <CalcPoint x={0} y={lt} />

      {/* размерные (мм) */}
      <DimH
        x1={windowFrom}
        x2={windowTo}
        yObj={-wallThickness}
        offsetPx={-30}
        label={formatMm(plan.window.width)}
      />
      <DimH
        x1={-halfRoom}
        x2={halfRoom}
        yObj={roomDepth + PLAN_SIDE_WALL}
        offsetPx={40}
        label={formatMm(roomWidth)}
      />
      <DimV y1={0} y2={roomDepth} xObj={outer} offsetPx={40} label={formatMm(roomDepth)} />
      <DimV y1={0} y2={lt} xObj={-outer} offsetPx={-36} label={formatMm(lt)} />
    </DrawingSheet>
  );
}
