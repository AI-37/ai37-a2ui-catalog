import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {choiceCardDefinition} from '@ai37/a2ui-catalog-schemas';
import {useA2uiBaseStyles} from './shared';
import {tokens} from './tokens';

export const ChoiceCard = createComponentImplementation(choiceCardDefinition, ({props}) => {
  useA2uiBaseStyles();

  const multiple = props.multiple ?? false;
  const groupName = `choice-${props.submit?.action ?? props.title}`;

  return (
    <section
      style={{
        display: 'grid',
        gap: 14,
        padding: 18,
        borderRadius: 18,
        border: `1px solid ${tokens.border}`,
        background: tokens.surfaceWarm,
      }}
    >
      <header style={{display: 'grid', gap: 4}}>
        <h3 style={{margin: 0, fontSize: '1.05rem'}}>{props.title}</h3>
        {props.description ? (
          <p style={{margin: 0, color: tokens.textMuted}}>{props.description}</p>
        ) : null}
      </header>
      <div style={{display: 'grid', gap: 8}}>
        {props.choices.map((choice, index) => (
          <label
            key={`${choice.value}-${index}`}
            style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              padding: '10px 12px',
              borderRadius: 12,
              border: `1px solid ${tokens.borderSoft}`,
            }}
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={groupName}
              value={choice.value}
              style={{marginTop: 4}}
            />
            <span style={{display: 'grid', gap: 2}}>
              <span style={{fontWeight: 600}}>{choice.label}</span>
              {choice.description ? (
                <span style={{color: tokens.textSubtle, fontSize: '0.9rem'}}>{choice.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      {props.submit ? (
        <button
          type="button"
          data-action={props.submit.action}
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
      ) : null}
    </section>
  );
});
