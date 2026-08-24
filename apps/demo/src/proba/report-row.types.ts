import type React from 'react';

/**
 * Тон строки. `accent` — рекомендованный вариант «Что изменить»: рамка
 * акцентом. Провал тона не несёт — о нём говорит правый слот, а список из
 * пяти красных рамок перестаёт читаться.
 */
export type ReportRowTone = 'neutral' | 'accent';

export interface ReportRowProps {
  title: React.ReactNode;
  /** Пояснение под титулом: «Rпр 3,21 · Rнорм 3,08». */
  detail?: string | undefined;
  /** Правый слот: статусная пилюля, чип отклонения или кнопка действия. */
  side?: React.ReactNode;
  tone?: ReportRowTone | undefined;
}
