import React from 'react';
import type {InsolationNoticesProps} from './insolation-editor.types';

/**
 * Плашки модели застройки: упрощённая модель прямоугольных экранов, «не
 * указанная застройка завышает результат — сверьте с генпланом». Тексты
 * приходят от агента (Решение 6 design.md: предупреждения — данными), submit
 * они не блокируют.
 */
export function InsolationNotices({notices}: InsolationNoticesProps) {
  return (
    <>
      {notices.map(notice => (
        <div
          key={notice.text}
          className={`a2ui-ie-notice${notice.tone === 'info' ? ' a2ui-ie-notice--info' : ''}`}
        >
          <span className="a2ui-ie-notice__dot" aria-hidden="true" />
          <span>{notice.text}</span>
        </div>
      ))}
    </>
  );
}
