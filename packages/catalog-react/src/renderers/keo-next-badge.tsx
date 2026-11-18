import React from 'react';
import {Chip} from '../primitives';
import type {KeoBadgeTone} from './keo-next.types';
import {useA2uiMessages} from '../i18n';

/**
 * Пометка секции пилюлей набора: «заполните» тоном предупреждения (незакрытая
 * работа — не ошибка), «просмотреть» нейтральным. Пометка ничего не блокирует.
 */
export function KeoNextBadge({tone}: {tone: KeoBadgeTone | undefined}) {
  const m = useA2uiMessages();
  if (tone === undefined) {
    return null;
  }

  return (
    <Chip tone={tone === 'fill' ? 'warning' : 'neutral'}>
      {tone === 'fill' ? m.common.badgeFill : m.common.badgeReview}
    </Chip>
  );
}
