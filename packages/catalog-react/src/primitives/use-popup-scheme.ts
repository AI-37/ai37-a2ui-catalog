import React from 'react';
import type {PopupScheme} from './use-popup-scheme.types';

/**
 * Тема портального попапа — один раз на три примитива (`Lookup`, `Select`,
 * `Menu`).
 *
 * Попап уезжает в портал, поэтому предка с темой у него нет и наследуемый
 * `color-scheme` до него не доходит: атрибут хоста стоит на обёртке сообщения,
 * а узел попапа — сосед `#root`. Второго источника значений это не заводит —
 * пары `light-dark()` попап объявляет у себя вместе с остальными токенами
 * (`POPUP_TOKEN_NAMES`). Доносится только то, как их читать.
 *
 * Источник правды — якорь: тот самый корень набора, внутри которого попап
 * логически находится. Схема снимается в момент открытия: узел монтируется
 * открытием, значит ref-колбэк и есть этот момент.
 */
export function usePopupScheme<T extends HTMLElement>(): PopupScheme<T> {
  const anchorRef = React.useRef<T | null>(null);

  const popupRef = React.useCallback((node: HTMLElement | null) => {
    const anchor = anchorRef.current;
    if (!node || !anchor) return;

    // Резольвнутая, а не объявленная: якорь мог получить тему от любого предка.
    const scheme = getComputedStyle(anchor).colorScheme;
    if (scheme) {
      node.style.colorScheme = scheme;
    }
  }, []);

  return {anchorRef, popupRef};
}
