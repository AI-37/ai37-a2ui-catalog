import React from 'react';
import {PROBA_SERIF_CSS} from './report-serif-css';

/** Заголовок вердикта: ступень `display` набора и ось семейства `serif`. */
export function ReportHeadline({children}: {children: React.ReactNode}) {
  return (
    <>
      <style href="proba-report-serif" precedence="default">
        {PROBA_SERIF_CSS}
      </style>
      <h3 className="a2ui-t--display a2ui-t--serif" style={headlineStyle}>
        {children}
      </h3>
    </>
  );
}

/* Своих метрик у заголовка нет — только сброс маргина браузера. */
const headlineStyle: React.CSSProperties = {margin: 0};
