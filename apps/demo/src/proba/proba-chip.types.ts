import type React from 'react';

/** Тон пилюли: нейтральная, проходит по норме, не проходит. */
export type ChipTone = 'neutral' | 'success' | 'danger';

export interface ChipProps {
  tone?: ChipTone;
  children: React.ReactNode;
}
