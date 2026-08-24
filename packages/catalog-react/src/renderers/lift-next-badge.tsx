import React from 'react';
import {Chip} from '../primitives';
import type {LiftNextBadgeProps} from './lift-next.types';

/** Тексты пометок: те же слова, что на нынешнем экране лифтов. */
const LABELS = {fill: 'заполните', review: 'просмотреть'} as const;

/**
 * Пометка секции пилюлей набора: «заполните» тоном предупреждения (незакрытая
 * работа — не ошибка), «просмотреть» нейтральным. Пометка ничего не блокирует.
 */
export function LiftNextBadge({tone}: LiftNextBadgeProps) {
  if (tone === undefined) {
    return null;
  }

  return <Chip tone={tone === 'fill' ? 'warning' : 'neutral'}>{LABELS[tone]}</Chip>;
}
