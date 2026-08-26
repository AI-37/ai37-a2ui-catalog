import React from 'react';
import type {CalcFieldSource, LiftEditorFieldSource} from '@ai37/a2ui-catalog-schemas';
import {Chip, KitStyles, SourceNote} from '@ai37/a2ui-catalog-react/primitives';
import {SYSTEM_SECTION_STYLE, SystemHeading} from './system-section';

/**
 * Все шесть видов провенанса каталога: два акцентных, два с оговоркой и два
 * без `note` — словом из словаря. Последние два (`calculated`, `assumption`)
 * нужны расчётным редакторам; `assumption` несёт точку-маркер.
 */
const SOURCES: Array<LiftEditorFieldSource | CalcFieldSource> = [
  {source: 'question', note: 'из вашего вопроса'},
  {source: 'suggested', note: 'предложено по классу здания'},
  {source: 'project', note: 'из проекта, лист АР-12'},
  {source: 'default'},
  {source: 'calculated', note: 'отметка центра окна посчитана по этажу'},
  {source: 'assumption'},
];

/**
 * Пометки: пилюля состояния секции и подпись источника значения под контролом.
 * Обе — только текст: ничего не блокируют и оформление контрола не меняют.
 */
export function NotesSystem() {
  return (
    <section className="a2ui-kit" style={SYSTEM_SECTION_STYLE}>
      <KitStyles />

      <SystemHeading
        title="Пометки"
        axes="Chip (neutral · success · danger · warning) · SourceNote (question · suggested · project · default · calculated · assumption)"
      />

      <div style={stageStyle}>
        {/* «заполните» тоном предупреждения: незакрытая работа — не ошибка.
            Кто из двух пометок сильнее, решает экран, здесь только вид. */}
        <Chip tone="warning">заполните</Chip>
        <Chip>просмотреть</Chip>
        <Chip tone="success">Rпр 4.09 ≥ 3.19</Chip>
        <Chip tone="danger">Rпр 0.21 &lt; 4.20</Chip>
      </div>

      <div style={{...stageStyle, flexDirection: 'column', alignItems: 'flex-start', gap: 6}}>
        {SOURCES.map(source => (
          <SourceNote key={source.source} source={source} />
        ))}
      </div>
    </section>
  );
}

const stageStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
  padding: '12px 14px',
  borderRadius: 10,
  background: 'light-dark(#f8fafc, #141413)',
};
