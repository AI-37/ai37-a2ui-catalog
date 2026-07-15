import React, {useEffect, useMemo} from 'react';
import DOMPurify from 'dompurify';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {htmlTableDefinition} from '@ai37/a2ui-catalog-schemas';
import {useA2uiBaseStyles} from './shared';
import {tokens} from './tokens';

const SCOPE_CLASS = 'a2ui-html-table';
const STYLE_ID = 'a2ui-html-table-styles';

/**
 * Санитизация: HTML приходит из доверенного индекса документов, но чистим всегда
 * (defense-in-depth). Оставляем структуру таблицы и базовое инлайн-форматирование,
 * вырезаем скрипты/обработчики/встраивания и атрибут style (тему задаём мы, стили
 * документа в приложение не пускаем). DOMPurify по умолчанию удаляет script/on*.
 */
const SANITIZE_CONFIG = {
  FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'input', 'link', 'meta'],
  FORBID_ATTR: ['style', 'class', 'id'],
  ALLOW_DATA_ATTR: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
};

function sanitize(html: string): string {
  if (typeof window === 'undefined') {
    // SSR: виджет догидрируется на клиенте, где доступен DOM для DOMPurify.
    return '';
  }
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

/** Тема вложенного <table> — скоуп по .a2ui-html-table, инъекция один раз. */
function useHtmlTableStyles() {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.${SCOPE_CLASS} { overflow-x: auto; }
.${SCOPE_CLASS} table {
  width: 100%;
  border-collapse: collapse;
  background: ${tokens.surface};
  color: ${tokens.text};
  font-size: 0.95rem;
}
.${SCOPE_CLASS} caption {
  padding: 10px 12px;
  text-align: left;
  color: ${tokens.textMuted};
  caption-side: top;
}
.${SCOPE_CLASS} th,
.${SCOPE_CLASS} td {
  padding: 10px 14px;
  border: 1px solid ${tokens.borderSubtle};
  text-align: left;
  vertical-align: top;
}
.${SCOPE_CLASS} thead th,
.${SCOPE_CLASS} th {
  background: ${tokens.surfaceHeader};
  color: ${tokens.textStrong};
  font-weight: 700;
}
.${SCOPE_CLASS} tbody tr:nth-child(even) td {
  background: ${tokens.surfaceMuted};
}
`;
    document.head.appendChild(style);
  }, []);
}

export const HtmlTable = createComponentImplementation(htmlTableDefinition, ({props}) => {
  useA2uiBaseStyles();
  useHtmlTableStyles();

  const safeHtml = useMemo(() => sanitize(props.html), [props.html]);
  const attribution = [props.sourceCode, props.sourceTitle].filter(Boolean).join(' — ');

  return (
    <section style={{display: 'grid', gap: 10, color: tokens.text}}>
      {props.title ? (
        <h3 style={{margin: 0, fontSize: '1.05rem', color: tokens.textStrong}}>{props.title}</h3>
      ) : null}
      {props.caption ? (
        <p style={{margin: 0, color: tokens.textMuted, fontSize: '0.9rem'}}>{props.caption}</p>
      ) : null}
      <div
        style={{borderRadius: 18, border: `1px solid ${tokens.border}`, overflow: 'hidden'}}
      >
        <div className={SCOPE_CLASS} dangerouslySetInnerHTML={{__html: safeHtml}} />
      </div>
      {attribution ? (
        <p style={{margin: 0, color: tokens.textSubtle, fontSize: '0.85rem'}}>{attribution}</p>
      ) : null}
    </section>
  );
});
