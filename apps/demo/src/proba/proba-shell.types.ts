import type React from 'react';

export interface ProbaShellProps {
  /** Активный путь — подсвечивается в переключателе. */
  route: string;
  eyebrow: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}
