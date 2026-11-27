import React from 'react';
import {Button, CloseIcon, DataChip} from '../primitives';
import type {AttachmentChoiceFileSlotProps} from './attachment-choice-card.types';
import {formatMessage, useA2uiMessages} from '../i18n';

/** Выбранный файл: `DataChip` «Файл · имя · размер» и icon-only кнопка снять. */
export function AttachmentChoiceFileChip({upload, disabled, onClear}: AttachmentChoiceFileSlotProps) {
  const m = useA2uiMessages();
  if (upload.status !== 'ready') return null;

  return (
    <span style={rowStyle}>
      <DataChip
        label={m.attachment.file}
        value={`${upload.fileName} · ${formatKb(upload.bytes)}`}
      />
      <Button
        size="sm"
        icon={<CloseIcon />}
        aria-label={formatMessage(m.attachment.removeFile, {name: upload.fileName})}
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
