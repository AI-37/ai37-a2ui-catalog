import React from 'react';
import {Chip} from '../primitives';
import type {KeoBadgeTone} from './keo-next.types';

/** Тексты пометок: те же слова, что на экране лифтов. */
const LABELS = {fill: 'заполните', review: 'просмотреть'} as const;

/**
 * Пометка секции пилюлей набора: «заполните» тоном предупреждения (незакрытая
 * работа — не ошибка), «просмотреть» нейтральным. Пометка ничего не блокирует.
 */
export function KeoNextBadge({tone}: {tone: KeoBadgeTone | undefined}) {
  if (tone === undefined) {
    return null;
  }

  return <Chip tone={tone === 'fill' ? 'warning' : 'neutral'}>{LABELS[tone]}</Chip>;
}
