import React from 'react';
import {Button} from '../primitives';
import type {AttachmentChoiceFileSlotProps} from './attachment-choice-card.types';

/** Кнопка выбора файла; скрытый `<input type="file">` открывается ею. */
export function AttachmentChoiceFilePicker({
  attach,
  upload,
  disabled,
  onPick,
}: AttachmentChoiceFileSlotProps) {
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
