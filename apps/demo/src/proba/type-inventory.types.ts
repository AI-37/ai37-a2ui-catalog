import type React from 'react';

/** Ступень фактической шкалы: один кегль, как он объявлен в CSS пакета. */
export interface TypeStep {
  /** Кегль строкой — ключ ступени. */
  size: string;
  /** Начертание и интерлиньяж, как в CSS. */
  metrics: string;
  /** Сколько раз кегль объявлен по всем `*-styles.ts`. */
  declarations: number;
  /** Роли, которые сегодня сидят на этой ступени. */
  roles: string;
  /** Как отрисовать образец. */
  sample: React.CSSProperties;
  /** Текст образца. */
  text: string;
  /** Замечание к ступени, если она лишняя или ведёт себя не как соседи. */
  note?: string;
}

/** Ступень предлагаемой шкалы: имя токена вместо кегля в правиле. */
export interface ProposedTypeStep {
  token: string;
  metrics: string;
  role: string;
  sample: React.CSSProperties;
  text: string;
  /** Что с этой ступени сходится сюда из нынешней шкалы. */
  absorbs: string;
}
