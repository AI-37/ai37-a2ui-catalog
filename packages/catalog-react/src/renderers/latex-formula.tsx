import React, {useMemo} from 'react';
import katex from 'katex';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {latexFormulaDefinition} from '@ai37/a2ui-catalog-schemas';
import {useA2uiBaseStyles} from './shared';

export const LatexFormula = createComponentImplementation(latexFormulaDefinition, ({props}) => {
  useA2uiBaseStyles();

  const rendered = useMemo(() => {
    try {
      return katex.renderToString(props.formula, {
        displayMode: props.displayMode ?? true,
        throwOnError: false,
        strict: 'ignore',
      });
    } catch (error) {
      return `<code>${String(error)}</code>`;
    }
  }, [props.displayMode, props.formula]);

  return (
    <section
      style={{
        display: 'grid',
        gap: 12,
        padding: 16,
        borderRadius: 18,
        border: props.bordered ? '1px solid rgba(15, 23, 42, 0.12)' : 'none',
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
      }}
    >
      {props.title ? <h3 style={{margin: 0, fontSize: '1rem'}}>{props.title}</h3> : null}
      <div dangerouslySetInnerHTML={{__html: rendered}} />
      {props.annotation ? <p style={{margin: 0, color: '#475569'}}>{props.annotation}</p> : null}
    </section>
  );
});
