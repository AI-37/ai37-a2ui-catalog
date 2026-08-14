import React from 'react';
import {type LookupOption} from '@ai37/a2ui-catalog-schemas';
import {LookupCombobox} from './lookup-combobox';
import type {LookupFieldControlProps} from './lookup-field.types';
import {resolveLookupDefault} from './resolve-lookup-default';
import {useLookupSuggest} from './use-lookup-suggest';

/**
 * Fetch-режим lookup-поля (`suggestMode: 'fetch'`): тонкая обёртка над хуком
 * `useLookupSuggest` (debounced GET на same-origin `LOOKUP_SUGGEST_ROUTE`,
 * отмена in-flight, тихий fallback на сбой). Контрол владеет только текстом
 * ввода и выбором; канал подсказок — целиком в хуке.
 */
export function LookupFieldFetchControl({field}: LookupFieldControlProps) {
  const defaultSelected = resolveLookupDefault(field);

  const [inputText, setInputText] = React.useState(defaultSelected?.label ?? '');
  const [selected, setSelected] = React.useState<LookupOption | null>(defaultSelected);
  const {options, loading, queried, handleInputText, closeOptions} = useLookupSuggest({
    referenceId: field.referenceId ?? '',
    minChars: field.minChars,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setInputText(text);
    setSelected(null);
    handleInputText(text);
  };

  const handlePick = (option: LookupOption) => {
    setSelected(option);
    setInputText(option.label);
    closeOptions();
  };

  return (
    <LookupCombobox
      name={field.name}
      placeholder={field.placeholder}
      inputText={inputText}
      selected={selected}
      options={options}
      loading={loading}
      queried={queried}
      onInputChange={handleChange}
      onPick={handlePick}
      onClose={closeOptions}
    />
  );
}
