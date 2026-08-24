import React from 'react';

/**
 * Шапка экрана: заголовок и контекст справа. Без `headerTitle` шапки нет
 * вовсе — отдельным компонентом с ранним `return null`, а не тернарником.
 */
export function ConstructionsNextHeader({
  title,
  context,
}: {
  title: string | undefined;
  context: string | undefined;
}) {
  if (title === undefined) {
    return null;
  }

  return (
    <div style={rowStyle}>
      <span className="a2ui-t--body a2ui-t--strong">{title}</span>
      <ConstructionsNextHeaderContext context={context} />
    </div>
  );
}

/** Контекст справа есть не всегда: пустой span съедал бы gap строки. */
function ConstructionsNextHeaderContext({context}: {context: string | undefined}) {
  if (context === undefined) {
    return null;
  }

  return <span className="a2ui-t--sub a2ui-t--muted">{context}</span>;
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
};
