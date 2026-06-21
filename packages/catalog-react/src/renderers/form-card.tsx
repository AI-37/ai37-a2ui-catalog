import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {formCardDefinition} from '@ai37/a2ui-catalog-schemas';
import {useA2uiBaseStyles} from './shared';
import {tokens} from './tokens';

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 10,
  border: `1px solid ${tokens.borderStrong}`,
  fontSize: '0.95rem',
  background: tokens.surface,
  color: tokens.text,
};

export const FormCard = createComponentImplementation(formCardDefinition, ({props, context}) => {
  useA2uiBaseStyles();

  const formRef = React.useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formEl = formRef.current;
    if (!formEl) return;

    // Значения собираем в пределах СВОЕЙ формы (ref-scoped querySelector, не
    // global document) — чтобы несколько FormCard на surface не конфликтовали.
    // Коэрс типов НЕ делаем — агент коэрсит. boolean → checked, остальное → value.
    const values: Record<string, string | boolean> = {};
    for (const field of props.fields) {
      const el = formEl.querySelector<HTMLInputElement | HTMLSelectElement>(
        `[name="${field.name}"]`,
      );
      if (!el) continue;
      if (field.type === 'boolean') {
        values[field.name] = (el as HTMLInputElement).checked;
      } else {
        values[field.name] = el.value;
      }
    }

    // Канон A2UI v0.9: { event: { name, context } } → userAction.name/.context → onAction.
    void context.dispatchAction({
      event: {name: props.submit.action, context: values},
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      style={{
        display: 'grid',
        gap: 16,
        padding: 18,
        borderRadius: 18,
        border: `1px solid ${tokens.border}`,
        background: tokens.surface,
        color: tokens.text,
      }}
    >
      <header style={{display: 'grid', gap: 4}}>
        <h3 style={{margin: 0, fontSize: '1.05rem', color: tokens.textStrong}}>{props.title}</h3>
        {props.description ? (
          <p style={{margin: 0, color: tokens.textMuted}}>{props.description}</p>
        ) : null}
      </header>
      <div style={{display: 'grid', gap: 12}}>
        {props.fields.map((field, index) => (
          <label key={`${field.name}-${index}`} style={{display: 'grid', gap: 6}}>
            <span style={{fontWeight: 600}}>
              {field.label}
              {field.required ? <span style={{color: tokens.danger}}> *</span> : null}
            </span>
            {field.type === 'select' ? (
              <select
                name={field.name}
                defaultValue={field.defaultValue as string | number | undefined}
                style={inputStyle}
              >
                {(field.options ?? []).map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'boolean' ? (
              <input
                type="checkbox"
                name={field.name}
                defaultChecked={field.defaultValue === true}
                style={{justifySelf: 'start'}}
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                name={field.name}
                placeholder={field.placeholder}
                defaultValue={field.defaultValue as string | number | undefined}
                style={inputStyle}
              />
            )}
          </label>
        ))}
      </div>
      <button
        type="submit"
        style={{
          justifySelf: 'start',
          padding: '10px 18px',
          borderRadius: 12,
          border: 'none',
          background: tokens.accent,
          color: tokens.accentContrast,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {props.submit.label}
      </button>
    </form>
  );
});
