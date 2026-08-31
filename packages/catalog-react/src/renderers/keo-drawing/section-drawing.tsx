import React from 'react';
import {CalcPoint} from './calc-point';
import {CutRect} from './cut-rect';
import {DimH} from './dim-h';
import {DimV} from './dim-v';
import {DrawingSheet} from './drawing-sheet';
import {GraphIFan} from './graph-i-fan';
import {LevelMark} from './level-mark';
import {SightRay} from './sight-ray';
import {SkyBlockedNote} from './sky-blocked-note';
import {SkySector} from './sky-sector';
import {UrpLine} from './urp-line';
import {WindowOpening} from './window-opening';
import {formatLevel} from './format-level';
import {formatMm} from './format-mm';
import {formatNum} from './format-num';
import {graphRadius50} from './graph-radius50';
import {sectionBounds} from './section-bounds';
import {FAR_WALL_THICKNESS, SLAB_THICKNESS} from './sheet-constants';
import type {KeoSectionDrawing} from '@ai37/a2ui-catalog-schemas';

/**
 * Разрез по помещению с наложенным графиком Данилюка I — лист «под ВОК550»:
 * конструкции сечением, светопроём, веер графика полюсом в расчётной точке,
 * сектор видимого неба между β и α, визирные лучи и размерные ГОСТ.
 *
 * Всё, кроме габаритов и углов, — правило рендерера: плиты, дальняя стена,
 * поля листа и радиус веера в модели не приезжают.
 */
export function SectionDrawing({
  section,
  pxPerMeter,
}: {
  section: KeoSectionDrawing;
  pxPerMeter: number;
}) {
  const bounds = sectionBounds(section);
  const {roomDepth, roomHeight, wallThickness, sillHeight, windowTop} = section;
  const lt = section.point.lt;
  const pointHeight = section.point.height;
  const glassX = -wallThickness / 2;
  // нижняя граница сектора: верх застройки, а без застройки — подоконник
  const sillDeg = (Math.atan2(sillHeight - pointHeight, lt) * 180) / Math.PI;
  const fromDeg = section.betaDeg ?? sillDeg;
  const dimBase = SLAB_THICKNESS * pxPerMeter;

  return (
    <DrawingSheet bounds={bounds} pxPerMeter={pxPerMeter} title="Разрез по помещению">
      {/* конструкции: пол, потолок, дальняя стена, оконная стена с проёмом */}
      <CutRect
        x={bounds.xMin + 0.2}
        y={-SLAB_THICKNESS}
        w={roomDepth + FAR_WALL_THICKNESS - bounds.xMin - 0.2}
        h={SLAB_THICKNESS}
      />
      <CutRect
        x={-wallThickness - 0.3}
        y={roomHeight}
        w={roomDepth + FAR_WALL_THICKNESS + wallThickness + 0.3}
        h={SLAB_THICKNESS}
      />
      <CutRect x={roomDepth} y={0} w={FAR_WALL_THICKNESS} h={roomHeight + SLAB_THICKNESS} />
      <WindowOpening
        wallThickness={wallThickness}
        sillHeight={sillHeight}
        windowTop={windowTop}
        roomHeight={roomHeight}
      />

      {/* подложка графика I и линия УРП */}
      <GraphIFan poleX={lt} poleY={pointHeight} radius50={graphRadius50(lt, wallThickness)} />
      <UrpLine y={pointHeight} x1={0} x2={roomDepth} />

      {/* видимый участок неба и визирные лучи */}
      {section.skyVisible ? (
        <SkySector
          poleX={lt}
          poleY={pointHeight}
          fromDeg={fromDeg}
          toDeg={section.alphaDeg}
          glassX={glassX}
          label={section.n1 === undefined ? undefined : formatNum(section.n1)}
        />
      ) : (
        <SkyBlockedNote poleX={lt} poleY={pointHeight} glassX={glassX} />
      )}
      <SightRay
        x={lt}
        y={pointHeight}
        angleDeg={section.alphaDeg}
        label={`α = ${formatNum(section.alphaDeg)}° — верх проёма`}
      />
      {section.betaDeg !== undefined && (
        <SightRay
          x={lt}
          y={pointHeight}
          angleDeg={section.betaDeg}
          label={
            section.opposing === undefined
              ? `β = ${formatNum(section.betaDeg)}° — верх застройки`
              : `β = ${formatNum(section.betaDeg)}° — верх застройки (H = ${formatNum(
                  section.opposing.height,
                  0,
                )} м, l = ${formatNum(section.opposing.distance, 0)} м)`
          }
        />
      )}

      <CalcPoint x={lt} y={pointHeight} />

      {/* размерные (мм) и отметки уровней */}
      <DimH x1={0} x2={lt} yObj={0} offsetPx={dimBase + 30} label={formatMm(lt)} />
      {roomDepth > lt && (
        <DimH
          x1={lt}
          x2={roomDepth}
          yObj={0}
          offsetPx={dimBase + 30}
          label={formatMm(roomDepth - lt)}
        />
      )}
      <DimH x1={0} x2={roomDepth} yObj={0} offsetPx={dimBase + 62} label={formatMm(roomDepth)} />
      {sillHeight > 0 && (
        <DimV y1={0} y2={sillHeight} xObj={-wallThickness} offsetPx={-34} label={formatMm(sillHeight)} />
      )}
      <DimV y1={0} y2={windowTop} xObj={-wallThickness} offsetPx={-66} label={formatMm(windowTop)} />
      <DimV y1={0} y2={roomHeight} xObj={-wallThickness} offsetPx={-98} label={formatMm(roomHeight)} />
      <LevelMark x={bounds.xMin + 0.4} y={0} label="+0,000" />
      <LevelMark x={lt + 0.7} y={pointHeight} label={`+${formatLevel(pointHeight)} (УРП)`} />
    </DrawingSheet>
  );
}
