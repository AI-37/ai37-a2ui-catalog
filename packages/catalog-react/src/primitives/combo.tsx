import React from 'react';
import {Autocomplete} from '@base-ui/react/autocomplete';
import {Input} from './input';
import type {ComboOption, ComboProps} from './combo.types';

/**
 * Свободный ввод с рядом-подсказкой: ряд ГОСТ открывается целиком по клику и
 * стрелке, но ввод не ограничивает — каталоги изготовителей из рядов выходят.
 *
 * Не `Select`: тот своё значение запрещает. Не `Lookup`: тот ходит в справочник
 * по `referenceId`, а ряд приходит в наполнении и живёт на клиенте. Под низом у
 * всех троих Base UI, здесь — `Autocomplete` с `mode="none"`: фильтрация
 * прятала бы остальной ряд после первой набранной цифры.
 *
 * Пустой ряд — обычное поле: попап из одной пустой полосы обещал бы подсказки,
 * которых нет (у `doorWidth` ряд появляется только с выбранным типом здания).
 */
export function Combo({name, options, value, onValueChange, placeholder}: ComboProps) {
  if (options.length === 0) {
    return (
      <Input
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={event => onValueChange(event.target.value)}
      />
    );
  }

  return (
    <Autocomplete.Root
      mode="none"
      items={options as ComboOption[]}
      value={value}
      onValueChange={next => onValueChange(next)}
      openOnInputClick
      // В поле попадает то, что вернёт itemToStringValue: у ряда значение и
      // подпись совпадают, поэтому скрытого поля со значением здесь нет.
      itemToStringValue={(option: ComboOption) => option.value}
    >
      <Autocomplete.Input
        className="a2ui-control a2ui-t--body"
        name={name}
        placeholder={placeholder}
      />

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={4}>
          <Autocomplete.Popup className="a2ui-popup a2ui-popup--anchored">
            <Autocomplete.List>
              {(option: ComboOption) => (
                <Autocomplete.Item key={option.value} value={option} className="a2ui-popup__item">
                  <span className="a2ui-popup__title">{option.label}</span>
                  {option.note === undefined ? null : (
                    <span className="a2ui-popup__meta">{option.note}</span>
                  )}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
