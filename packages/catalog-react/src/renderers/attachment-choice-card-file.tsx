import React from 'react';
import {AttachmentChoiceFileChip} from './attachment-choice-card-file-chip';
import {AttachmentChoiceFilePicker} from './attachment-choice-card-file-picker';
import {AttachmentChoiceFileUploading} from './attachment-choice-card-file-uploading';
import type {AttachmentChoiceFileSlotProps} from './attachment-choice-card.types';

/** Слот файла: выбор, загрузка или выбранный файл — ровно одна ветка видна. */
export function AttachmentChoiceFileSlot(props: AttachmentChoiceFileSlotProps) {
  return (
    <>
      <AttachmentChoiceFilePicker {...props} />
      <AttachmentChoiceFileUploading upload={props.upload} />
      <AttachmentChoiceFileChip {...props} />
    </>
  );
}
