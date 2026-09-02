import type React from 'react';

/** Что `usePopupScheme` раздаёт по двум концам портала. */
export interface PopupScheme<T extends HTMLElement> {
  /** На якорь: поле, триггер списка или триггер меню — он стоит внутри набора. */
  anchorRef: React.RefObject<T | null>;
  /** На узел попапа: ставится в портал, темы над собой не имеет. */
  popupRef: (node: HTMLElement | null) => void;
}
