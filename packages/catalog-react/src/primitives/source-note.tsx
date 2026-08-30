import React from 'react';
import type {CalcFieldSource, LiftEditorFieldSource} from '@ai37/a2ui-catalog-schemas';
import {fieldSourceLabel} from './field-source-label';
import {renderLabelSubscripts} from './render-label-subscripts';

/**
 * Подпись под контролом: откуда взялось значение. Обоснование агента (`note`)
 * или слово из общего словаря провенанса каталога.
 *
 * Подпись — это всё: оформление контрола от источника не меняется и ничего не
 * блокируется. Предложенное агентом («из вопроса», «предложено агентом»)
 * набрано акцентом — его ждут проверять, остальное приглушено.
 *
 * `assumption` дополнительно несёт точку-маркер: допущение должно быть видно
 * взглядом, не вчитыванием (так же сегодня устроен `CalcSourceNote`).
 *
 * Обоснование — тот же инженерный текст, что и подписи: индексы в нём
 * рендерятся тем же правилом.
 *
 * Правку снимает вызывающий: источники приходят сюда уже без тронутых полей
 * (`omitTouchedLiftSources`).
 */
export function SourceNote({source}: {source: LiftEditorFieldSource | CalcFieldSource}) {
  const accent = source.source === 'suggested' || source.source === 'question';
  const marked = source.source === 'assumption';

  return (
    <span
      className={`a2ui-t--sub ${accent ? 'a2ui-t--accent' : 'a2ui-t--muted'}`}
      style={marked ? markedStyle : undefined}
    >
      {marked ? <span aria-hidden="true" style={dotStyle} /> : null}
      {/* Подпись целиком — ОДИН потомок: у допущения строка выложена
          `inline-flex` с зазором, и куски `renderLabelSubscripts` стали бы
          отдельными флекс-элементами — «ρ  ф  0,5» вместо «ρф 0,5». */}
      <span>
        {source.note === undefined
          ? fieldSourceLabel(source.source)
          : renderLabelSubscripts(source.note)}
      </span>
    </span>
  );
}

/* Точка живёт в строке подписи, а не в своём блоке: правило набора для неё
   объявлять не за что — оси примитива это не меняет. */
const markedStyle: React.CSSProperties = {display: 'inline-flex', alignItems: 'baseline', gap: 6};

const dotStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: 'var(--a2ui-text-color-warning)',
  flex: 'none',
  alignSelf: 'center',
};
