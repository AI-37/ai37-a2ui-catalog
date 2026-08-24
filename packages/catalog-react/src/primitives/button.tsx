import React from 'react';
import {ButtonIcon} from './button-icon';
import {buttonClassName} from './button-class-name';
import type {ButtonProps} from './button.types';

/** Кнопка: модификаторы ортогональны — variant задаёт форму, size отступы, tone цвет. */
export function Button({
  variant,
  size,
  tone,
  dashed,
  icon,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={buttonClassName({
        variant,
        size,
        tone,
        dashed,
        iconOnly: Boolean(icon) && !children,
        className,
      })}
      disabled={disabled}
      {...rest}
    >
      <ButtonIcon icon={icon} />
      {children}
    </button>
  );
}
