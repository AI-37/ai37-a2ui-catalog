import type {ButtonClassOptions} from './button.types';

/**
 * Классы кнопки по осям. Отдельной функцией, потому что оформление нужно не
 * только своему `<button>`: части Base UI (`Accordion.Trigger`,
 * `Collapsible.Trigger`, `Select.Trigger`, `Menu.Trigger`) рендерят свой
 * элемент, и класс им отдаётся снаружи. Поведение — библиотечное, вид — наш.
 */
export function buttonClassName({
  variant = 'outline',
  size = 'md',
  tone = 'neutral',
  dashed = false,
  iconOnly = false,
  className,
}: ButtonClassOptions = {}): string {
  return [
    'a2ui-btn',
    className,
    variant !== 'outline' && `a2ui-btn--${variant}`,
    size !== 'md' && `a2ui-btn--${size}`,
    tone !== 'neutral' && `a2ui-btn--${tone}`,
    dashed && 'a2ui-btn--dashed',
    iconOnly && 'a2ui-btn--icon-only',
  ]
    .filter(Boolean)
    .join(' ');
}
