import React from 'react';
import type {LiftEditorRecommend} from '@ai37/a2ui-catalog-schemas';
import {LiftNextRecommendBlock} from './lift-next-recommend-block';
import {useRecommendVariants} from './use-recommend-variants';
import type {LiftFieldValues} from './lift-editor.types';
import type {OnApplyRecommendation} from './recommend.types';

/**
 * Канал подбора поднимается только здесь: без пропа `recommend` слот
 * возвращает `null` раньше, чем дойдёт до хука, и сеть не трогается вовсе —
 * это и есть путь отката. Хук нельзя вызвать условно, поэтому ветка живёт
 * отдельным компонентом, а не `if` внутри блока.
 */
export function LiftNextRecommendSlot({
  recommend,
  building,
  lift,
  onApply,
}: {
  recommend: LiftEditorRecommend | undefined;
  building: LiftFieldValues;
  /** Первая лифтовая секция: параметры со `scope: 'lift'` берутся из неё. */
  lift: LiftFieldValues;
  onApply: OnApplyRecommendation;
}) {
  if (recommend === undefined) {
    return null;
  }

  return (
    <LiftNextRecommendChannel
      recommend={recommend}
      building={building}
      lift={lift}
      onApply={onApply}
    />
  );
}

/** Хук и блок: отдельно от слота, потому что вызывается уже без условий. */
function LiftNextRecommendChannel({
  recommend,
  building,
  lift,
  onApply,
}: {
  recommend: LiftEditorRecommend;
  building: LiftFieldValues;
  lift: LiftFieldValues;
  onApply: OnApplyRecommendation;
}) {
  const {state, variants} = useRecommendVariants({recommend, building, lift});

  return (
    <LiftNextRecommendBlock
      recommend={recommend}
      state={state}
      variants={variants}
      onApply={onApply}
    />
  );
}
