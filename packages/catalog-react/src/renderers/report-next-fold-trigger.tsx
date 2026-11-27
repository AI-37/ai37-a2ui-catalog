import React from 'react';
import {Collapsible} from '@base-ui/react/collapsible';
import {CardTriggerLabel, buttonClassName} from '../primitives';

/**
 * Кнопка-раскрывашка справочного блока отчёта: шеврон, заголовок и — только в
 * свёрнутом виде — сводка. Раскрытием и `aria-expanded` владеет `Collapsible`,
 * сюда приходит уже готовое состояние.
 *
 * Сводка стоит СНАРУЖИ кнопки: внутри она попала бы в доступное имя триггера,
 * и скринридер читал бы «Исходные данные 26 значений 4 приняты системой» одной
 * строкой (канон `SectionItem`: слоты рядом с заголовком, а не в нём).
 */
export function ReportNextFoldTrigger({
  panelId,
  label,
  summary,
  open,
}: {
  panelId: string;
  label: string;
  summary: string;
  open: boolean;
}) {
  return (
    <>
      <Collapsible.Trigger
        className={buttonClassName({variant: 'link', className: 'a2ui-card__title'})}
        aria-controls={panelId}
      >
        <CardTriggerLabel title={<span style={labelStyle}>{label}</span>} />
      </Collapsible.Trigger>
      {open ? null : <span className="a2ui-t--sub a2ui-t--muted">{summary}</span>}
    </>
  );
}

/* Заголовок не переносится: в узком контейнере он делил строку со сводкой
   поровну и рассыпался по буквам. Место уступает сводка — она длиннее. */
const labelStyle: React.CSSProperties = {whiteSpace: 'nowrap'};
