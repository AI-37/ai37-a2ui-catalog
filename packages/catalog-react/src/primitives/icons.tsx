import React from 'react';

/** Общий набор атрибутов SVG: `currentColor` и размер по шрифту кнопки. */
const svgProps = {
  viewBox: '0 0 16 16',
  width: '100%',
  height: '100%',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Плюс — «добавить конструкцию», «слой». */
export const PlusIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <path d="M8 3.5v9M3.5 8h9" />
  </svg>
);

/** Карандаш — «изменить». */
export const PencilIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <path d="M11.2 2.8l2 2L6 12H4v-2z" />
    <path d="M2.8 14h10.4" />
  </svg>
);

/** Стрелка вниз — «скачать». */
export const DownloadIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <path d="M8 2.5v7.5M4.8 7.2L8 10.4l3.2-3.2" />
    <path d="M3 12.8h10" />
  </svg>
);

/** Корзина — «удалить». */
export const TrashIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <path d="M3.2 4.5h9.6M6.5 4.5V3h3v1.5" />
    <path d="M4.6 4.5l.6 8.2h5.6l.6-8.2" />
  </svg>
);

/** Круговая стрелка — «пересчитать». */
export const RefreshIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <path d="M13 8a5 5 0 1 1-1.6-3.7" />
    <path d="M13.2 2.6v3h-3" />
  </svg>
);

/**
 * Шеврон раскрытия: закрытый смотрит вправо. Состояние сюда не приходит —
 * поворот ставит CSS по `data-panel-open` / `data-popup-open`, которые
 * библиотека вешает на триггер сама.
 */
export const ChevronIcon = () => (
  <svg {...svgProps} className="a2ui-chevron" aria-hidden="true">
    <path d="M6 3.5L10.5 8 6 12.5" />
  </svg>
);

/**
 * Каретка выпадающего списка: смотрит вниз, а открытый попап разворачивает её
 * вверх. Отдельная от шеврона: у раскрывашки закрытое состояние смотрит вправо.
 */
export const CaretIcon = () => (
  <svg {...svgProps} className="a2ui-caret" aria-hidden="true">
    <path d="M3.5 6L8 10.5 12.5 6" />
  </svg>
);

/** Три точки — меню действий карточки. */
export const MoreIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <circle cx="8" cy="3.6" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="8" cy="8" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="8" cy="12.4" r="0.9" fill="currentColor" stroke="none" />
  </svg>
);

/** Крестик удаления — то, что сегодня набрано символом ✕ на 1rem. */
export const CloseIcon = () => (
  <svg {...svgProps} aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);
