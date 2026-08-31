import React from 'react';
import {Autocomplete} from '@base-ui/react/autocomplete';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';
import {useLookupSuggest} from '../renderers/use-lookup-suggest';
import {findOptionByLabel} from './find-option-by-label';
import {LookupOptionContent} from './lookup-option-content';
import {usePopupScheme} from './use-popup-scheme';
import type {LookupProps} from './lookup.types';

/**
 * Поиск по справочнику на Base UI Autocomplete. Сеть — наш `useLookupSuggest`
 * (debounce, abort, minChars); клавиатура, `aria` и позиционирование — из
 * библиотеки. `mode="none"` — фильтрует сервер, а не список.
 *
 * Не `Combobox`: тот запрещает свободный ввод, а город вне справочника обязан
 * оставаться значением поля.
 */
export function Lookup({
  name,
  referenceId,
  placeholder,
  text,
  minChars,
  onTextChange,
  onPick,
}: LookupProps) {
  const {anchorRef, popupRef} = usePopupScheme<HTMLInputElement>();
  const [selected, setSelected] = React.useState<LookupOption | null>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const {options, loading, queried, handleInputText, closeOptions} = useLookupSuggest({
    referenceId,
    minChars,
  });

  // Попап открыт, только когда ему есть что сказать: пока запрос короче порога
  // (или уже закрыт выбором), пустая коробка висела бы под полем полоской.
  // `loading` поднимается с момента прохождения порога, включая паузу debounce,
  // поэтому «Ищем…» видно всю паузу, а не только время запроса.
  const open = !dismissed && (loading || queried || options.length > 0);

  /**
   * Выбор ловится причиной события, а не `onClick` на `Item`: клик —
   * недокументированный контракт, а `reason` объявлен библиотекой и одинаков
   * для мыши и `Enter`.
   */
  const handleValueChange = (next: string, details: Autocomplete.Root.ChangeEventDetails) => {
    onTextChange(next);

    if (details.reason !== 'item-press') {
      setDismissed(false);
      handleInputText(next);
      return;
    }

    const option = findOptionByLabel(options, next);
    setSelected(option ?? null);
    closeOptions();

    if (option) {
      onPick(option);
    }
  };

  return (
    <Autocomplete.Root
      mode="none"
      items={options}
      value={text}
      onValueChange={handleValueChange}
      open={open}
      onOpenChange={next => setDismissed(!next)}
      // itemToStringLabel у Autocomplete нет: в поле попадает то, что вернёт
      // itemToStringValue. Значит подпись — сюда, а настоящий value уходит
      // отдельным скрытым полем, как в нашем LookupCombobox.
      itemToStringValue={(option: LookupOption) => option.label}
    >
      <Autocomplete.Input
        ref={anchorRef}
        className="a2ui-control a2ui-t--body"
        placeholder={placeholder}
      />
      <input type="hidden" name={name} value={selected?.value ?? ''} />

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={4}>
          <Autocomplete.Popup ref={popupRef} className="a2ui-popup a2ui-popup--anchored">
            <Autocomplete.Status className="a2ui-popup__status">
              {loading ? 'Ищем…' : null}
            </Autocomplete.Status>
            <Autocomplete.Empty className="a2ui-popup__empty">
              {queried ? 'Ничего не найдено' : null}
            </Autocomplete.Empty>

            <Autocomplete.List>
              {(option: LookupOption) => (
                <Autocomplete.Item key={option.value} value={option} className="a2ui-popup__item">
                  <LookupOptionContent option={option} query={text} />
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
