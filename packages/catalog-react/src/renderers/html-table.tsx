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

/**
 * Тема вложенного <table> — скоуп по .a2ui-html-table, инъекция один раз.
 * Только токены --a2ui-* → работает и в светлой, и в тёмной теме из коробки.
 */
function useHtmlTableStyles() {
  useEffect(() => {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.${SCOPE_CLASS} { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.${SCOPE_CLASS} table {
  width: 100%;
  border-collapse: collapse;
  background: ${tokens.surface};
  color: ${tokens.text};
  font-size: 0.9rem;
  line-height: 1.45;
}
.${SCOPE_CLASS} caption {
  padding: 10px 16px;
  text-align: left;
  color: ${tokens.textMuted};
  font-size: 0.85rem;
  caption-side: top;
}
.${SCOPE_CLASS} th,
.${SCOPE_CLASS} td {
  padding: 9px 14px;
  border-bottom: 1px solid ${tokens.borderSubtle};
  border-right: 1px solid ${tokens.borderFaint};
  text-align: left;
  vertical-align: top;
}
.${SCOPE_CLASS} th:last-child,
.${SCOPE_CLASS} td:last-child { border-right: none; }
.${SCOPE_CLASS} thead th {
  position: sticky;
  top: 0;
  background: ${tokens.surfaceHeader};
  color: ${tokens.textStrong};
  font-weight: 600;
  border-bottom: 2px solid ${tokens.borderStrong};
  white-space: nowrap;
}
.${SCOPE_CLASS} tbody th {
  background: ${tokens.surfaceMuted};
  color: ${tokens.textStrong};
  font-weight: 600;
}
.${SCOPE_CLASS} tbody tr:nth-child(even) > td { background: ${tokens.surfaceMuted}; }
.${SCOPE_CLASS} tbody tr:hover > td { background: ${tokens.surfaceHeader}; }
.${SCOPE_CLASS} tbody tr:last-child > th,
.${SCOPE_CLASS} tbody tr:last-child > td { border-bottom: none; }
`;
    document.head.appendChild(style);
  }, []);
}

export const HtmlTable = createComponentImplementation(htmlTableDefinition, ({props}) => {
  useA2uiBaseStyles();
  useHtmlTableStyles();

  const safeHtml = useMemo(() => sanitize(props.html), [props.html]);
  const attribution = [props.sourceCode, props.sourceTitle].filter(Boolean).join(' — ');
  const hasHeader = Boolean(props.title || props.caption);

  return (
    <section
      style={{
        overflow: 'hidden',
        borderRadius: 16,
        border: `1px solid ${tokens.border}`,
        background: tokens.surface,
        color: tokens.text,
        boxShadow: `0 1px 2px ${tokens.borderFaint}`,
      }}
    >
      {hasHeader ? (
        <header
          style={{
            padding: '13px 16px 11px',
            borderBottom: `1px solid ${tokens.borderSubtle}`,
          }}
        >
          {props.title ? (
            <h3 style={{margin: 0, fontSize: '1rem', fontWeight: 700, color: tokens.textStrong}}>
              {props.title}
            </h3>
          ) : null}
          {props.caption ? (
            <p style={{margin: props.title ? '4px 0 0' : 0, fontSize: '0.85rem', color: tokens.textMuted}}>
              {props.caption}
            </p>
          ) : null}
        </header>
      ) : null}
      <div className={SCOPE_CLASS} dangerouslySetInnerHTML={{__html: safeHtml}} />
      {attribution ? (
        <footer
          style={{
            padding: '9px 16px',
            borderTop: `1px solid ${tokens.borderSubtle}`,
            fontSize: '0.8rem',
            color: tokens.textSubtle,
          }}
        >
          {attribution}
        </footer>
      ) : null}
    </section>
  );
});
