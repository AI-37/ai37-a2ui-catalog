import React from 'react';
import type {StaticProps} from './static.types';

/**
 * Значение вместо контрола: коробка поля звала бы править то, что считает
 * агент.
 *
 * `boxed` — то же значение, но в залитой коробке контрола: так стоят строки
 * условий расчёта, где значение пришло готовым и правится не здесь, а вопросом
 * агенту. Без коробки значение теряется в ряду полей — подпись есть, а поля
 * будто нет.
 */
export function Static({boxed, children}: StaticProps) {
  const className = boxed
    ? 'a2ui-control a2ui-control--ready a2ui-t--body'
    : 'a2ui-static a2ui-t--body';

  return <span className={className}>{children}</span>;
}
