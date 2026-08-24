import React from 'react';
import type {LookupOption} from '@ai37/a2ui-catalog-schemas';
import {LookupCombobox} from '../../../../packages/catalog-react/src/renderers/lookup-combobox';
import {useLookupSuggest} from '../../../../packages/catalog-react/src/renderers/use-lookup-suggest';

/** Нынешний `LookupCombobox` из пакета — как есть, для сравнения с библиотечным. */
export function CurrentLookup({
  name,
  referenceId,
  placeholder,
  onPick,
}: {
  name: string;
  referenceId: string;
  placeholder: string;
  onPick: (option: LookupOption) => void;
}) {
  const [text, setText] = React.useState('');
  const [selected, setSelected] = React.useState<LookupOption | null>(null);
  const {options, loading, queried, handleInputText, closeOptions} = useLookupSuggest({
    referenceId,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
    handleInputText(event.target.value);
  };

  const handlePick = (option: LookupOption) => {
    setText(option.label);
    setSelected(option);
    closeOptions();
    onPick(option);
  };

  return (
    <LookupCombobox
      name={name}
      placeholder={placeholder}
      inputText={text}
      selected={selected}
      options={options}
      loading={loading}
      queried={queried}
      onInputChange={handleInputChange}
      onPick={handlePick}
      onClose={closeOptions}
      inputClassName="a2ui-control a2ui-t--body"
    />
  );
}
