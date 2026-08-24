import type React from 'react';

export interface SummaryCollapsibleProps {
  /** id панели — уникальный в пределах страницы (см. `SectionItem`). */
  panelId: string;
  label: string;
  /**
   * Сводка принятых значений: показывается только в свёрнутом виде — в
   * раскрытом те же значения стоят полями. Собирается вызывающим из живых
   * значений, а не приходит строкой: присланная разъехалась бы после правки.
   */
  summary: React.ReactNode;
  children: React.ReactNode;
}
