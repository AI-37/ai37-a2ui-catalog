import React from 'react';
import {Select as BaseSelect} from '@base-ui/react/select';
import {CaretIcon} from './icons';
import {selectOptions} from './select-options';
import {usePopupScheme} from './use-popup-scheme';
import type {SelectProps} from './select.types';

/**
 * Выпадающий список на Base UI Select: стрелки, `Home`/`End`, поиск по первым
 * буквам, `Escape` и возврат фокуса — библиотечные. Наше здесь только
 * оформление: триггер — тот же `a2ui-control`, попап — общий `a2ui-popup`.
 *
 * `alignItemWithTrigger={false}` — список встаёт под полем, а не поверх него:
 * нативная раскладка `<select>` в карточке чата перекрывает соседние поля.
 *
 * `items` уходит и в `Root`: по нему `Select.Value` показывает подпись
 * выбранного значения, а не само значение (`steny` → «Стены»).
 */
export function Select({items, value, onValueChange, placeholder, disabled, name}: SelectProps) {
  const {anchorRef, popupRef} = usePopupScheme<HTMLButtonElement>();
  const options = selectOptions(items);

  return (
    <BaseSelect.Root
      items={options}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
    >
      <BaseSelect.Trigger ref={anchorRef} className="a2ui-control a2ui-select a2ui-t--body">
        <BaseSelect.Value className="a2ui-select__value" placeholder={placeholder} />
        <BaseSelect.Icon className="a2ui-select__icon">
          <CaretIcon />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>

      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={4} alignItemWithTrigger={false}>
          <BaseSelect.Popup ref={popupRef} className="a2ui-popup a2ui-popup--wide">
            <BaseSelect.List>
              {options.map(option => (
                <BaseSelect.Item
                  key={option.value}
                  value={option.value}
                  className="a2ui-popup__item"
                >
                  <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
