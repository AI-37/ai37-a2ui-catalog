import React from 'react';
import type {AttachmentUpload} from './attachment-choice-card.types';
import {formatMessage, useA2uiMessages} from '../i18n';

/** Строка «Загружаю …» на время запроса к ручке. */
export function AttachmentChoiceFileUploading({upload}: {upload: AttachmentUpload}) {
  const m = useA2uiMessages();
  if (upload.status !== 'uploading') return null;

  return (
    <span className="a2ui-t--sub a2ui-t--muted" role="status">
      {formatMessage(m.attachment.uploading, {name: upload.fileName})}
    </span>
  );
}
