import React from 'react';
import {Menu as BaseMenu} from '@base-ui/react/menu';
import {CaretIcon, MenuEntry, buttonClassName, type MenuItem} from '@ai37/a2ui-catalog-react/primitives';

/**
 * «Скачать ⌄» протокола. Собран на частях Base UI, а не на примитиве `Menu`:
 * набору не хватает оси стороны, а этому меню она нужна — протокол стоит
 * последней карточкой отчёта, и попап, растущий вниз, вылезает из сообщения.
 * Здесь он растёт **вверх**, внутрь карточки. При переносе в пакет это ось
 * `side` у `Menu`, а не отдельный компонент.
 *
 * Вид триггера и пунктов — классы набора: рамка, акцентный тон, каретка,
 * попап. Клавиатура, роли и `Escape` с возвратом фокуса — библиотечные.
 */
export function ReportDownloadMenu({items}: {items: MenuItem[]}) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger className={buttonClassName({variant: 'outline', tone: 'accent'})}>
        Скачать
        <CaretIcon />
      </BaseMenu.Trigger>

      <BaseMenu.Portal>
        <BaseMenu.Positioner side="top" align="end" sideOffset={4}>
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
