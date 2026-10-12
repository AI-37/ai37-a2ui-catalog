import React from 'react';
import type {AttachmentUpload} from './attachment-choice-card.types';

/** Ошибка загрузки вместо подсказки: `role="alert"`, чтобы её услышал скринридер. */
export function AttachmentChoiceCardError({upload}: {upload: AttachmentUpload}) {
  if (upload.status !== 'error') return null;

  return (
    <p className="a2ui-t--sub a2ui-t--danger" role="alert" style={paragraphStyle}>
      {upload.message}
    </p>
  );
}

const paragraphStyle: React.CSSProperties = {margin: 0};
