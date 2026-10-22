import React from 'react';
import {Button} from '../primitives';
import type {AttachmentChoiceCardSkipButtonProps} from './attachment-choice-card.types';

/** Кнопка «без файла»; без `skip` в props карточка только запрашивает файл. */
export function AttachmentChoiceCardSkipButton({skip, disabled, onSkip}: AttachmentChoiceCardSkipButtonProps) {
  if (!skip) return null;

  return (
    <Button size="lg" disabled={disabled} onClick={onSkip}>
      {skip.label}
    </Button>
  );
}
