import type React from 'react';

/**
 * Пункт меню. `href` — если пункт ведёт наружу (скачивание отдаёт сервер
 * заголовками, значит это ссылка); `onSelect` — если пункт меняет экран.
 */
export interface MenuItem {
  label: string;
  href?: string;
  onSelect?: () => void;
  /** Тон пункта: `danger` — необратимое действие. */
  tone?: 'neutral' | 'danger';
}

/**
 * Форма триггера. `button` — рамка вокруг подписи: под ней действие.
 * `link` — подпись с кареткой без рамки: под ней не действие, а выбранное
 * значение шапки (методика расчёта), и рамка обещала бы кнопку.
 * Без подписи триггер icon-only независимо от оси.
 */
export type MenuTrigger = 'button' | 'link';

export interface MenuProps {
  /** Подпись триггера. Без неё триггер icon-only и требует `ariaLabel`. */
  label?: string;
  /** Иконка триггера — например «⋯» у карточки конструкции. */
  icon?: React.ReactNode;
  /** Доступное имя для icon-only триггера. */
  ariaLabel?: string;
  trigger?: MenuTrigger;
  items: MenuItem[];
}
