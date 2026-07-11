import React from 'react';
import {
  LOOKUP_MIN_CHARS_DEFAULT,
  LOOKUP_SUGGEST_ACTION,
  lookupOptionsPath,
  type LookupOption,
  type LookupSuggestData,
} from '@ai37/a2ui-catalog-schemas';
import type {LookupFieldControlProps} from './lookup-field.types';
import {inputStyle} from './shared';
import {tokens} from './tokens';
import {useDataModelValue} from './use-data-model-value';

/** Задержка debounce перед отправкой `lookup:suggest`, мс. */
const LOOKUP_DEBOUNCE_MS = 300;

/**
 * Поле `type: 'lookup'` внутри FormCard: текстовый ввод с подсказками.
 *
 * Подсказки запрашиваются action'ом `lookup:suggest` (debounce, порог
 * `minChars`) и приходят от агента через updateDataModel по пути
 * `lookupOptionsPath(field.name)`. Выбранное значение попадает в submit
 * через скрытый input — `handleSubmit` формы не знает про lookup.
 */
export function LookupFieldControl({field, context}: LookupFieldControlProps) {
  const defaultSelected =
    typeof field.defaultValue === 'object' && field.defaultValue !== null
      ? (field.defaultValue as LookupOption)
      : null;

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
    <span style={{position: 'relative', display: 'grid'}}>
      <input
        type="text"
        role="combobox"
        aria-expanded={options.length > 0}
        autoComplete="off"
        value={inputText}
        placeholder={field.placeholder}
        onChange={handleChange}
        onBlur={() => setOpen(false)}
        onKeyDown={event => {
          if (event.key === 'Escape') setOpen(false);
        }}
        style={inputStyle}
      />
      <input type="hidden" name={field.name} value={selected?.value ?? ''} />
      {options.length > 0 ? (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 10,
            margin: '4px 0 0',
            padding: 4,
            listStyle: 'none',
            maxHeight: 240,
            overflowY: 'auto',
            borderRadius: 10,
            border: `1px solid ${tokens.borderStrong}`,
            background: tokens.surface,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
          }}
        >
          {options.map(option => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={selected?.value === option.value}
                // onMouseDown (не onClick): выбор должен успеть до blur инпута.
                onMouseDown={event => {
                  event.preventDefault();
                  handlePick(option);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '6px 8px',
                  border: 'none',
                  borderRadius: 6,
                  background: 'transparent',
                  color: tokens.text,
                  textAlign: 'left',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </span>
  );
}
