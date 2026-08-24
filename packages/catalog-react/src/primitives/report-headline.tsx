import React from 'react';

/** Заголовок вердикта: ступень `display` набора и ось семейства `serif`. */
export function ReportHeadline({children}: {children: React.ReactNode}) {
  return (
    <h3 className="a2ui-t--display a2ui-t--serif" style={headlineStyle}>
      {children}
    </h3>
  );
}

/* Своих метрик у заголовка нет — только сброс маргина браузера. */
const headlineStyle: React.CSSProperties = {margin: 0};
