import type {CardClassOptions} from './card.types';

/**
 * Классы карточки. Отдельной функцией по той же причине, что и у кнопки:
 * `Accordion.Item` рендерит свой элемент, а выглядеть обязан карточкой —
 * значит класс приходит из примитива, а не верстается на месте.
 */
export function cardClassName({
  tone = 'auto',
  flat,
  invalid,
  className,
}: CardClassOptions = {}): string {
  return [
    'a2ui-card',
    className,
    tone !== 'auto' && `a2ui-card--${tone}`,
    flat && 'a2ui-card--flat',
    invalid && 'a2ui-card--invalid',
  ]
    .filter(Boolean)
    .join(' ');
}
