import React from 'react';
import type {InsolationTimeline} from '@ai37/a2ui-catalog-schemas';
import {timelinePositionPct} from './timeline-position-pct';

/**
 * Суточный график солнце/тень: горизонтальная полоса от `axisStart` до
 * `axisEnd`, ширина сегмента пропорциональна длительности, засечки подписаны
 * под полосой. Промежутки без сегментов остаются нейтральным фоном полосы (до
 * восхода, после окончания расчётного окна) — отдельных элементов на них нет.
 *
 * Подписи сегментов («тень · здание 1») выведены в caption под осью, а не
 * внутрь полосы: сегмент прерывистой инсоляции бывает узким, и текст в нём
 * нечитаем (Risks design.md). Никакого форматирования минут: все показываемые
 * длительности — готовые строки в `checks`.
 */
export function InsolationReportTimelineSection({timeline}: {timeline: InsolationTimeline}) {
  const labelled = timeline.segments.filter(segment => segment.label !== undefined);

  return (
    <section className="a2ui-ir__section">
      <p className="a2ui-ir__list-label">{timeline.title}</p>
      <div className="a2ui-ir__bar">
        {timeline.segments.map((segment, index) => {
          const left = timelinePositionPct(segment.from, timeline.axisStart, timeline.axisEnd);
          const right = timelinePositionPct(segment.to, timeline.axisStart, timeline.axisEnd);
          // Ширина округляется отдельно: разность процентов иначе даёт хвост
          // двоичной дроби (16.659999999999997%) прямо в атрибуте style.
          const width = Math.max(0, Math.round((right - left) * 100) / 100);

          return (
            <span
              key={`${segment.from}-${segment.to}-${index}`}
              className={`a2ui-ir__segment a2ui-ir__segment--${segment.kind}`}
              data-kind={segment.kind}
              style={{left: `${left}%`, width: `${width}%`}}
              title={segment.label}
            />
          );
        })}
      </div>
      <div className="a2ui-ir__ticks">
        {timeline.ticks.map(tick => (
          <span
            key={`${tick.at}-${tick.label}`}
            className="a2ui-ir__tick"
            style={{left: `${timelinePositionPct(tick.at, timeline.axisStart, timeline.axisEnd)}%`}}
          >
            {tick.label}
          </span>
        ))}
      </div>
      {labelled.length > 0 ? (
        <p className="a2ui-ir__timeline-caption">
          {labelled.map(segment => segment.label).join(' · ')}
        </p>
      ) : null}
    </section>
  );
}
