import type React from 'react';

export interface ProbaShellProps {
  /** Активный путь — подсвечивается в переключателе. */
  route: string;
  eyebrow: string;
  title: string;
  lead: string;
  /** Показать переключатель темы и отдать её странице атрибутом `data-a2ui-theme`. */
  themeToggle?: boolean;
  children: React.ReactNode;
}
