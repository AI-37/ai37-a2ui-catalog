import React from 'react';
import {PROBA_STATUS_PILL_CSS} from './status-pill-css';
import type {StatusPillProps, StatusPillTone} from './status-pill.types';

/** Цвет тона — модификаторами набора, своих значений пилюля не объявляет. */
const TONE_CLASS: Record<StatusPillTone, string> = {
  pass: 'a2ui-t--success',
  fail: 'a2ui-t--danger',
  warning: 'a2ui-t--warning',
  neutral: 'a2ui-t--muted',
};

/** Кегль — ступень `sub` с модификатором: вердикт разряжен, строка — нет. */
const SIZE_CLASS = {badge: 'a2ui-t--overline', row: 'a2ui-t--strong'} as const;

/** Статусная пилюля: точка + слово. Одна на вердикт отчёта и на строку списка. */
export function StatusPill({tone, size = 'row', children}: StatusPillProps) {
  return (
    <>
      <style href="proba-status-pill" precedence="default">
        {PROBA_STATUS_PILL_CSS}
      </style>
      <span className={`a2ui-pill a2ui-t--sub ${SIZE_CLASS[size]} ${TONE_CLASS[tone]}`}>
        <span className="a2ui-pill__dot" aria-hidden="true" />
        {children}
      </span>
    </>
  );
}
