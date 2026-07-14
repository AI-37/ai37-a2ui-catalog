import React from 'react';
import {
  LOOKUP_DEBOUNCE_MS,
  LOOKUP_MIN_CHARS_DEFAULT,
  LOOKUP_SUGGEST_ROUTE,
  type LookupOption,
} from '@ai37/a2ui-catalog-schemas';
import {LookupCombobox} from './lookup-combobox';
import type {LookupFieldControlProps} from './lookup-field.types';
import {parseLookupOptions} from './parse-lookup-options';
import {resolveLookupDefault} from './resolve-lookup-default';

/**
 * Fetch-режим lookup-поля (`suggestMode: 'fetch'`): подсказки запрашиваются
 * самим рендерером — debounced GET на относительный same-origin
 * `LOOKUP_SUGGEST_ROUTE` (BFF потребителя проксирует его до агента-владельца
 * справочника). `AbortController` отменяет предыдущий in-flight запрос, так
 * что виден только ответ на последний ввод. Любой сбой канала — тихий
 * fallback: пустой дропдаун, поле редактируемо, submit не блокируется.
 */
export function LookupFieldFetchControl({field}: LookupFieldControlProps) {
  const defaultSelected = resolveLookupDefault(field);

  const [inputText, setInputText] = React.useState(defaultSelected?.label ?? '');
  const [selected, setSelected] = React.useState<LookupOption | null>(defaultSelected);
  const [options, setOptions] = React.useState<LookupOption[]>([]);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = React.useRef<AbortController | null>(null);

  const minChars = field.minChars ?? LOOKUP_MIN_CHARS_DEFAULT;

  React.useEffect(
    () => () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const requestOptions = async (query: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const params = new URLSearchParams({referenceId: field.referenceId ?? '', query});

    try {
      const response = await fetch(`${LOOKUP_SUGGEST_ROUTE}?${params}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        setOptions([]);
        return;
      }
      const body: unknown = await response.json();
      setOptions(parseLookupOptions(body));
    } catch {
      // Отменённый запрос (новый ввод/unmount) — не сбой: его ответ просто
      // не нужен, состояние не трогаем. Остальное — тихий fallback.
      if (!controller.signal.aborted) {
        setOptions([]);
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setInputText(text);
    setSelected(null);
    clearTimeout(debounceRef.current);

    const query = text.trim();
    if (query.length < minChars) {
      abortRef.current?.abort();
      setOptions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void requestOptions(query);
    }, LOOKUP_DEBOUNCE_MS);
  };

  const handlePick = (option: LookupOption) => {
    setSelected(option);
    setInputText(option.label);
    setOptions([]);
  };

  return (
    <LookupCombobox
      name={field.name}
      placeholder={field.placeholder}
      inputText={inputText}
      selected={selected}
      options={options}
      onInputChange={handleChange}
      onPick={handlePick}
      onClose={() => setOptions([])}
    />
  );
}
