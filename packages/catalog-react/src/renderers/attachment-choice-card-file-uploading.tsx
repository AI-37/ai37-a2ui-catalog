import React from 'react';
import type {AttachmentUpload} from './attachment-choice-card.types';

/** Строка «Загружаю …» на время запроса к ручке. */
export function AttachmentChoiceFileUploading({upload}: {upload: AttachmentUpload}) {
  if (upload.status !== 'uploading') return null;

  return (
    <span className="a2ui-t--sub a2ui-t--muted" role="status">
      Загружаю {upload.fileName}…
    </span>
  );
}
