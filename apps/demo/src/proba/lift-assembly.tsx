import React from 'react';
import {LiftNextScreen} from '../../../../packages/catalog-react/src/renderers/lift-next-screen';
import type {LiftBranch} from './lift-assembly.types';

/**
 * Ветка витрины: тот самый экран из пакета, а не его копия. Части экрана
 * переехали в `packages/catalog-react` вместе с рендерером
 * (change `lift-editor-next`) — держать здесь второй экземпляр значило бы
 * разойтись с ним первой же правкой.
 *
 * Наружу вместо `dispatchAction` — консоль: a2ui-контекста на странице нет, а
 * служебный трафик в UI не показывается — приёмка по нему идёт в devtools.
 */
export function LiftAssembly({branch}: {branch: LiftBranch}) {
  return (
    <section style={frameStyle}>
      <LiftNextScreen
        props={branch.props}
        sink={{
          onDraft: document => console.info('[proba/lift-assembly]', branch.id, 'draft', document),
          onSubmit: document =>
            console.info('[proba/lift-assembly]', branch.id, branch.props.submitAction, document),
        }}
      />
      {/* Подпись под экраном: ступени текста объявлены под корнем набора,
          поэтому она стоит в своём `a2ui-kit`, а не в голом span. */}
      <div className="a2ui-kit">
        <span className="a2ui-t--sub a2ui-t--muted">
          черновики — в консоли, служебного трафика на экране нет
        </span>
      </div>
    </section>
  );
}

const frameStyle: React.CSSProperties = {display: 'grid', gap: 12};
