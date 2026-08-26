import React from 'react';
import {Button} from '../primitives';
import type {KeoFooterProps} from './keo-next.types';

/**
 * Подвал: счётчик источников по всему документу и кнопка. С `nextLabel` она
 * двухрежимная — «Далее» ведёт по секциям, пока непросмотренные есть, затем
 * становится «Рассчитать» из props. Без `nextLabel` режима навигации нет
 * вовсе: кнопка одна, та, что отправляет (Решение 4 design).
 *
 * Клиентской блокировки submit нет — незаполненное судит агент (Решение 8
 * design архивного `proba-keo-assembly`).
 */
export function KeoNextFooter({
  counter,
  sourcesLabel,
  pending,
  nextLabel,
  submitLabel,
  onSubmit,
}: KeoFooterProps) {
  return (
    <div style={footerStyle}>
      <Button variant="filled" size="lg" onClick={onSubmit}>
        {pending && nextLabel !== undefined ? nextLabel : submitLabel}
      </Button>
      <span className="a2ui-t--sub a2ui-t--muted">
        {sourcesLabel === undefined ? counter : `${sourcesLabel}: ${counter}`}
      </span>
    </div>
  );
}

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};
