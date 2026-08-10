import React from 'react';
import {
  LOOKUP_DEBOUNCE_MS,
  LOOKUP_MIN_CHARS_DEFAULT,
  LOOKUP_SUGGEST_ACTION,
  lookupOptionsPath,
  type LookupOption,
  type LookupSuggestData,
} from '@ai37/a2ui-catalog-schemas';
import {LookupCombobox} from './lookup-combobox';
import type {LookupFieldControlProps} from './lookup-field.types';
import {resolveLookupDefault} from './resolve-lookup-default';
import {useDataModelValue} from './use-data-model-value';

/**
 * Action-режим lookup-поля (default): подсказки запрашиваются client
 * action'ом `lookup:suggest` (debounce, порог `minChars`) и приходят от
 * агента через updateDataModel по пути `lookupOptionsPath(field.name)`.
 */
export function LookupFieldActionControl({field, context}: LookupFieldControlProps) {
  const defaultSelected = resolveLookupDefault(field);

  const [inputText, setInputText] = React.useState(defaultSelected?.label ?? '');
  const [selected, setSelected] = React.useState<LookupOption | null>(defaultSelected);
  const [open, setOpen] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const minChars = field.minChars ?? LOOKUP_MIN_CHARS_DEFAULT;
  const data = useDataModelValue<LookupSuggestData>(context, lookupOptionsPath(field.name));

  React.useEffect(() => () => clearTimeout(debounceRef.current), []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setInputText(text);
    setSelected(null);
    clearTimeout(debounceRef.current);

    const query = text.trim();
    if (query.length < minChars) {
      setOpen(false);
      return;
    }
    setOpen(true);
    debounceRef.current = setTimeout(() => {
      void context.dispatchAction({
        event: {
          name: LOOKUP_SUGGEST_ACTION,
          context: {fieldName: field.name, referenceId: field.referenceId ?? '', query},
        },
      });
    }, LOOKUP_DEBOUNCE_MS);
  };

  const handlePick = (option: LookupOption) => {
    setSelected(option);
    setInputText(option.label);
    setOpen(false);
  };

  // Показываем только свежий ответ: эхо query от хоста должно совпадать с
  // текущим вводом (last-write-wins поверх debounce). Устаревший — игнор.
  const options = open && data && data.query === inputText.trim() ? data.options : [];

  return (
    <LookupCombobox
      name={field.name}
      placeholder={field.placeholder}
      inputText={inputText}
      selected={selected}
      options={options}
      onInputChange={handleChange}
      onPick={handlePick}
      onClose={() => setOpen(false)}
    />
  );
}
