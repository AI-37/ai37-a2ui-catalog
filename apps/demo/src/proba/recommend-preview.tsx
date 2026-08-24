import React from 'react';
import {Card, KitStyles} from '@ai37/a2ui-catalog-react/primitives';
import {RECOMMEND_LABELS, RECOMMEND_VARIANTS} from './recommend-fixture';
import {RecommendBlock} from './recommend-block';
import {RecommendStateSwitcher} from './recommend-state-switcher';
import type {RecommendState} from './recommend.types';

/**
 * Блок подбора в раме сообщения — так, как он встанет между секцией «Здание»
 * и лифтовыми секциями. Экран рядом не копируется: второй экземпляр формы в
 * песочнице разошёлся бы с первым на первой же правке, а смотреть здесь надо
 * на блок.
 *
 * Пустой список у состояния `empty` — не выдумка, а тот же набор: `emptyLabel`
 * рисуется вместо списка, а не поверх него.
 */
export function RecommendPreview() {
  const [state, setState] = React.useState<RecommendState>('shown');

  return (
    <section className="a2ui-kit" style={frameStyle}>
      <KitStyles />

      <RecommendStateSwitcher state={state} onChange={setState} />

      <Card>
        <div style={bodyStyle}>
          <RecommendBlock
            state={state}
            variants={state === 'empty' ? [] : RECOMMEND_VARIANTS}
            labels={RECOMMEND_LABELS}
          />
        </div>
      </Card>
    </section>
  );
}

const frameStyle: React.CSSProperties = {display: 'grid', gap: 12};

/* Те же отступы, что у тела экрана лифтов: блок сравнивается с секциями по
   плотности, и разная рама сравнение бы обнулила. */
const bodyStyle: React.CSSProperties = {display: 'grid', gap: 12, padding: 16};
