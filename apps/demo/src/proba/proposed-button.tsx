import React from 'react';
import {ButtonIcon} from './button-icon';
import type {ProposedButtonProps} from './proposed-button.types';

/** Кнопка: модификаторы ортогональны — variant задаёт форму, size отступы, tone цвет. */
export function ProposedButton({
  variant = 'outline',
  size = 'md',
  tone = 'neutral',
  dashed = false,
  icon,
  disabled,
  className: hostClassName,
  children,
  ...rest
}: ProposedButtonProps) {
  const iconOnly = Boolean(icon) && !children;

  const className = [
    'a2ui-btn',
    hostClassName,
    variant !== 'outline' && `a2ui-btn--${variant}`,
    size !== 'md' && `a2ui-btn--${size}`,
    tone !== 'neutral' && `a2ui-btn--${tone}`,
    dashed && 'a2ui-btn--dashed',
    iconOnly && 'a2ui-btn--icon-only',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={className} disabled={disabled} {...rest}>
      <ButtonIcon icon={icon} />
      {children}
    </button>
  );
}
