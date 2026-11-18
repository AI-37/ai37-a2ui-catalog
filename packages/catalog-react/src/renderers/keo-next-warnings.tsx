import React from 'react';
import {renderLabelSubscripts} from '../primitives/render-label-subscripts';
import {useA2uiMessages} from '../i18n';

/**
 * Пометки «! проверить»: правила геометрии из props и выход числа за границы
 * поля. Только подпись — контрол не подсвечивается и submit не блокируется
 * (открытый вопрос 4 design: подсветка контрола заводится отдельным решением,
 * если подпись потеряется среди подписей источников).
 */
export function KeoNextWarnings({warnings}: {warnings: readonly string[]}) {
  const m = useA2uiMessages();
  if (warnings.length === 0) {
    return null;
  }

  return (
    <>
      {warnings.map(warning => (
        <span key={warning} className="a2ui-t--sub a2ui-t--warning">
          {m.common.checkPrefix} {renderLabelSubscripts(warning)}
        </span>
      ))}
    </>
  );
}
