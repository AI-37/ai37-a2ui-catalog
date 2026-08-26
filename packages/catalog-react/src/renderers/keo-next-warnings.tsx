import React from 'react';

/**
 * Пометки «! проверить»: правила геометрии из props и выход числа за границы
 * поля. Только подпись — контрол не подсвечивается и submit не блокируется
 * (открытый вопрос 4 design: подсветка контрола заводится отдельным решением,
 * если подпись потеряется среди подписей источников).
 */
export function KeoNextWarnings({warnings}: {warnings: readonly string[]}) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <>
      {warnings.map(warning => (
        <span key={warning} className="a2ui-t--sub a2ui-t--warning">
          ! проверить — {warning}
        </span>
      ))}
    </>
  );
}
