import React from 'react';
import {Menu as BaseMenu} from '@base-ui/react/menu';
import {ButtonIcon} from './button-icon';
import {buttonClassName} from './button-class-name';
import {MenuCaret} from './menu-caret';
import {MenuEntry} from './menu-entry';
import type {MenuProps} from './menu.types';

/**
 * Меню на Base UI: стрелки между пунктами, `Escape` с возвратом фокуса на
 * триггер, `aria-expanded`/`aria-controls` и роли — библиотечные. У нынешнего
 * «Скачать ▾» на `<details>` роли `menu`/`menuitem` проставлены, а поведения
 * под ними нет.
 */
export function Menu({label, icon, ariaLabel, trigger = 'button', items}: MenuProps) {
  // Триггер-ссылка и icon-only живут в правом краю шапки: попап от их левого
  // края уезжал бы за карточку. Триггер-кнопка с подписью стоит в потоке слева,
  // ему естественнее start.
  const linkTrigger = label === undefined || trigger === 'link';

  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger
        className={buttonClassName({
          variant: linkTrigger ? 'link' : 'outline',
          tone: label === undefined ? 'neutral' : 'accent',
          iconOnly: label === undefined,
        })}
        aria-label={ariaLabel}
      >
        <ButtonIcon icon={icon} />
        {label}
        <MenuCaret label={label} />
      </BaseMenu.Trigger>

      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={4} align={linkTrigger ? 'end' : 'start'}>
          <BaseMenu.Popup className="a2ui-popup a2ui-popup--wide">
            {items.map(item => (
              <MenuEntry key={item.label} item={item} />
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
