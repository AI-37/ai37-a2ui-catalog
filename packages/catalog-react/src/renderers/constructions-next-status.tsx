import React from 'react';
import type {ConstructionStatus} from '@ai37/a2ui-catalog-schemas';
import type {ConstructionInvalidity} from './find-invalid-layers';
import {formatMissingLambda} from './format-missing-lambda';

/**
 * Ровно одна статусная пометка по приоритету: проблемы данных (однородное «нет
 * λ» называется счётом) → непогашенный агентский статус → «готова». Пометка, а
 * не тревога: карточка с незаполненным слоем или неподтверждённым составом не
 * ошибка, и submit она не блокирует.
 *
 * При закрытом гейте условий пометок нет вовсе: «готова» и «подтвердите»
 * преждевременны, пока не заполнены сами условия.
 */
export function ConstructionsNextStatus({
  show,
  invalidity,
  status,
}: {
  show: boolean;
  invalidity: ConstructionInvalidity;
  status: ConstructionStatus | undefined;
}) {
  if (!show) {
    return null;
  }

  if (invalidity.invalid) {
    return (
      <span className="a2ui-t--sub a2ui-t--warning">
        {invalidity.missingLambdaCount !== null
          ? formatMissingLambda(invalidity.missingLambdaCount)
          : 'проверить'}
      </span>
    );
  }

  if (status !== undefined) {
    return (
      <span className="a2ui-t--sub a2ui-t--warning">
        {status === 'confirm' ? 'подтвердите' : 'подтвердите паспорт'}
      </span>
    );
  }

  return <span className="a2ui-t--sub a2ui-t--success">готова</span>;
}
