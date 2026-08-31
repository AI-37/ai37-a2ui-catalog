import React from 'react';
import {focusWalkthroughTarget} from './focus-walkthrough-target';
import type {WalkthroughFocus} from './use-walkthrough-focus.types';

/**
 * Проход по секциям есть у двух компонентов набора, и дефект «кнопка
 * раскрывает секцию, но оставляет каретку на себе» у них общий. Поэтому
 * механика живёт одним хуком, а не копией в каждом рендерере (Решение 1
 * design `next-walkthrough-focus`).
 *
 * Цель назначается в обработчике, а фокус ставится эффектом: `focus()` по
 * скрытой панели браузер выполняет без результата, а раскрытие приезжает
 * только со следующим рендером.
 *
 * Ручное раскрытие каретку не двигает само собой: цель назначает ТОЛЬКО
 * кнопка прохода, а эффект без назначенной цели ничего не делает (Решение 4).
 */
export function useWalkthroughFocus<Key extends string>(): WalkthroughFocus<Key> {
  const nodes = React.useRef(new Map<Key, HTMLElement>());
  const aimed = React.useRef<Key | null>(null);

  React.useEffect(() => {
    const key = aimed.current;
    if (key === null) return;

    aimed.current = null;
    focusWalkthroughTarget(nodes.current.get(key) ?? null);
  });

  return {
    bindSection: key => node => {
      if (node === null) {
        nodes.current.delete(key);
      } else {
        nodes.current.set(key, node);
      }
    },

    nodeFor: key => nodes.current.get(key) ?? null,

    aimAt: key => {
      aimed.current = key;
    },
  };
}
