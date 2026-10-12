import React from 'react';
import type {AttachmentChoiceAttach} from '@ai37/a2ui-catalog-schemas';
import {Button, CloseIcon, DataChip} from '../primitives';
import type {AttachmentUpload} from './attachment-choice-card.types';

interface FileSlotProps {
  attach: AttachmentChoiceAttach;
  upload: AttachmentUpload;
  disabled: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}

/** Слот файла рядом с кнопкой «с файлом»: выбор, загрузка или выбранный файл. */
export function AttachmentChoiceFileSlot(props: FileSlotProps) {
  return (
    <>
      <FilePicker {...props} />
      <FileUploading upload={props.upload} />
      <FileChip {...props} />
    </>
  );
}

function FilePicker({attach, upload, disabled, onPick}: FileSlotProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  if (upload.status === 'uploading' || upload.status === 'ready') return null;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Сброс значения: повторный выбор того же файла после ошибки снова даёт change.
    event.target.value = '';
    if (file) onPick(file);
  };

  return (
    <>
      {/* Обычная кнопка, не пунктир: пунктир в наборе — только «+ Добавить …». */}
      <Button disabled={disabled} onClick={() => inputRef.current?.click()}>
        {attach.pickLabel}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={attach.accept}
        hidden
        aria-label={attach.pickLabel}
        onChange={handleChange}
      />
    </>
  );
}

function FileUploading({upload}: {upload: AttachmentUpload}) {
  if (upload.status !== 'uploading') return null;

  return (
    <span className="a2ui-t--sub a2ui-t--muted" role="status">
      Загружаю {upload.fileName}…
    </span>
  );
}

function FileChip({upload, disabled, onClear}: FileSlotProps) {
  if (upload.status !== 'ready') return null;

  return (
    <span style={chipRowStyle}>
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

const chipRowStyle: React.CSSProperties = {display: 'inline-flex', alignItems: 'center', gap: 4};
