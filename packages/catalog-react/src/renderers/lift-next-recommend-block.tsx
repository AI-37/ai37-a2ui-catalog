import React from 'react';
import {StyleTag} from './style-tag';
import {hashCss} from './hash-css';
import {LIFT_NEXT_RECOMMEND_CSS} from './lift-next-recommend-css';
import {LiftNextRecommendBody} from './lift-next-recommend-body';
import type {LiftNextRecommendBlockProps} from './recommend.types';

/**
 * Блок подбора конфигураций. Не секция: бейджа у него нет, в навигации
 * «Далее» он не участвует и просмотренным не считается — поэтому подпись
 * стоит оверлайном снаружи, как у групп полей, а не шапкой карточки.
 *
 * Состояние приходит пропом: канал поднимает `useRecommendVariants` слотом
 * выше, чтобы без пропа `recommend` хук не поднимался вовсе.
 */
export function LiftNextRecommendBlock(props: LiftNextRecommendBlockProps) {
  if (props.state === 'hidden') {
    return null;
  }

  return (
    <div
      className={`a2ui-recommend${props.state === 'stale' ? ' a2ui-recommend--stale' : ''}`}
    >
      <StyleTag
        href={`a2ui-lift-next-recommend-${hashCss(LIFT_NEXT_RECOMMEND_CSS)}`}
        css={LIFT_NEXT_RECOMMEND_CSS}
      />
      <span className="a2ui-t--sub a2ui-t--overline a2ui-t--muted">{props.recommend.title}</span>
      <LiftNextRecommendBody {...props} />
    </div>
  );
}
