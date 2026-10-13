import React from 'react';
import {Button, CloseIcon, DataChip} from '../primitives';
import type {AttachmentChoiceFileSlotProps} from './attachment-choice-card.types';

/** Выбранный файл: `DataChip` «Файл · имя · размер» и icon-only кнопка снять. */
export function AttachmentChoiceFileChip({upload, disabled, onClear}: AttachmentChoiceFileSlotProps) {
  if (upload.status !== 'ready') return null;

  return (
    <span style={rowStyle}>
      <DataChip label="Файл" value={`${upload.fileName} · ${formatKb(upload.bytes)}`} />
      <Button
        size="sm"
        icon={<CloseIcon />}
        aria-label={`Убрать ${upload.fileName}`}
        disabled={disabled}
        onClick={onClear}
      />
    </span>
  );
}

function formatKb(bytes: number): string {
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

const rowStyle: React.CSSProperties = {display: 'inline-flex', alignItems: 'center', gap: 4};
