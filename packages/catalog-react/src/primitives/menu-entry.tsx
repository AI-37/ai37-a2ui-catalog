import React from 'react';
import {Menu as BaseMenu} from '@base-ui/react/menu';
import type {MenuItem} from './menu.types';

/**
 * Пункт меню: со ссылкой — `LinkItem` (`<a href>`), с действием — `Item`
 * (`<div role="menuitem">`). Ветка вынесена сюда, чтобы в меню не было
 * тернарника вокруг разметки.
 */
export function MenuEntry({item}: {item: MenuItem}) {
  const className = `a2ui-popup__item${item.tone === 'danger' ? ' a2ui-popup__item--danger' : ''}`;

  if (item.href !== undefined) {
    return (
      <BaseMenu.LinkItem href={item.href} className={className}>
        {item.label}
      </BaseMenu.LinkItem>
    );
  }

  return (
    <BaseMenu.Item className={className} onClick={item.onSelect}>
      {item.label}
    </BaseMenu.Item>
  );
}
