import type React from 'react';

export interface SectionItemProps {
  /** Значение элемента аккордеона — им же владеет управляемое раскрытие. */
  value: string;
  /**
   * id панели. Base UI снимает `aria-controls` со свёрнутого триггера, поэтому
   * связь объявляется явно; на странице с двумя экранами id обязан их различать.
   */
  panelId: string;
  title: string;
  /** Строка-сводка свёрнутой секции; пустая — «не заполнено». */
  summary: string;
  /** Пометка состояния секции — пилюля, `undefined` — пометки нет. */
  badge?: React.ReactNode;
  /** Действие в шапке — например «Удалить» у повторяемой секции. */
  action?: React.ReactNode;
  /** Якорь секции для прокрутки навигацией. */
  sectionRef?: (node: HTMLElement | null) => void;
  children: React.ReactNode;
}
