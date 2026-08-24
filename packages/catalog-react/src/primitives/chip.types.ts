import type React from 'react';

/**
 * Тон пилюли: нейтральная, проходит по норме, не проходит, незакрытая работа.
 * `warning` — не ошибка и не успех: им помечена секция, которую ещё предстоит
 * заполнить.
 */
export type ChipTone = 'neutral' | 'success' | 'danger' | 'warning';

export interface ChipProps {
  tone?: ChipTone;
  children: React.ReactNode;
}
