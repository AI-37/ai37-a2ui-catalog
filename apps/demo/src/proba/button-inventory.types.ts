import type React from 'react';
/** Один экземпляр кнопки в ревизии: как её сегодня пишут в рендерере. */
export interface ButtonSample {
  /** Классы элемента без корневого (или `null` — стиль инлайновый). */
  className: string | null;
  /** Инлайн-стиль, если семейство живёт без CSS-класса (FormCard/ChoiceCard). */
  style?: React.CSSProperties;
  /** Подпись на кнопке в реальном рендерере. */
  label: string;
  /** Где встречается. */
  usedIn: string;
  /** Ключевые метрики строкой — для колонки расхождений. */
  metrics: string;
  /** Элемент разметки: почти везде `button`, у ссылок бывает `span`. */
  tag?: 'button' | 'a' | 'span';
}

/** Семейство кнопок = один префикс классов = один рендерер (или группа). */
export interface ButtonFamily {
  /** Заголовок группы. */
  title: string;
  /** Корневой класс-обёртка: правила записаны от него (`.a2ui-ce .a2ui-ce-btn`). */
  root: string | null;
  /** CSS-слой семейства; `null` — инлайн-стили без CSS. */
  css: string | null;
  /** Файл-источник. */
  source: string;
  /** Пометка дублирования: с кем совпадает один-в-один. */
  duplicateOf?: string;
  samples: ButtonSample[];
}
