import React from 'react';
import {PROBA_RECOMMEND_CSS} from './recommend-block-css';
import {RecommendBody} from './recommend-body';
import type {RecommendLabels, RecommendState, RecommendVariant} from './recommend.types';

/**
 * Блок подбора конфигураций. Не секция: бейджа у него нет, в навигации
 * «Далее» он не участвует и просмотренным не считается — поэтому подпись
 * стоит оверлайном снаружи, как у «УСЛОВИЙ» и «КОНСТРУКЦИЙ», а не шапкой
 * карточки.
 *
 * Состояние приходит пропом: в пакете его даст `useRecommendVariants`
 * (дебаунс, `AbortController`, ключ актуальности), в песочнице — переключатель
 * страницы. Сети здесь нет намеренно.
 */
export function RecommendBlock({
  state,
  variants,
  labels,
}: {
  state: RecommendState;
  variants: RecommendVariant[];
  labels: RecommendLabels;
}) {
  return (
    <>
      <style href="proba-recommend" precedence="default">
        {PROBA_RECOMMEND_CSS}
      </style>
      <div className={`a2ui-recommend${state === 'stale' ? ' a2ui-recommend--stale' : ''}`}>
        <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">{labels.title}</span>
        <RecommendBody state={state} variants={variants} labels={labels} />
      </div>
    </>
  );
}
