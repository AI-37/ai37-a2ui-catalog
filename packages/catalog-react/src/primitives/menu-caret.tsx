import React from 'react';
import {CaretIcon} from './icons';

/** Каретка триггера меню. У icon-only кнопки её нет: иконка уже говорит про меню. */
export function MenuCaret({label}: {label: string | undefined}) {
  if (label === undefined) {
    return null;
  }

  return <CaretIcon />;
}
