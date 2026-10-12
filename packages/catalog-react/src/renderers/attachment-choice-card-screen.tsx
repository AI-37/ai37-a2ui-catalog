import React from 'react';
import type {AttachmentChoiceCardProps} from '@ai37/a2ui-catalog-schemas';
import {Button, Card, KIT_SCOPE, KitStyles} from '../primitives';
import {AttachmentChoiceFileSlot} from './attachment-choice-card-file';
import type {UseAttachmentUpload} from './attachment-choice-card.types';

export interface AttachmentChoiceCardSink {
  onSkip: () => void;
  onAttach: (file: {fileId: string; fileName: string}) => void;
}

interface ScreenProps {
  props: AttachmentChoiceCardProps;
  file: UseAttachmentUpload;
  /** Выбор уже отправлен: обе кнопки и слот гаснут, повторного действия нет. */
  sent: boolean;
  sink: AttachmentChoiceCardSink;
}

/**
 * Экран карточки отдельно от рендерера — чтобы ставить его в demo без a2ui-хоста.
 * Две кнопки вместо radio + «Продолжить»: выбор и есть отправка. Кнопка «с
 * файлом» неактивна, пока файл не загружен на полку.
 */
export function AttachmentChoiceCardScreen({props, file, sent, sink}: ScreenProps) {
  const {upload} = file;
  const uploading = upload.status === 'uploading';
  const ready = upload.status === 'ready' ? upload : null;

  return (
    <div className={KIT_SCOPE}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          <header style={headerStyle}>
            <h3 className="a2ui-t--body a2ui-t--strong" style={titleStyle}>
              {props.title}
            </h3>
            <AttachmentChoiceDescription text={props.description} />
          </header>

          <div style={rowStyle}>
            <Button variant="outline" disabled={sent || uploading} onClick={sink.onSkip}>
              {props.skip.label}
            </Button>
          </div>

          <div style={rowStyle}>
            <Button
              variant="filled"
              tone="accent"
              disabled={sent || ready === null}
              onClick={() => ready && sink.onAttach({fileId: ready.fileId, fileName: ready.fileName})}
            >
              {props.attach.label}
            </Button>
            <AttachmentChoiceFileSlot
              attach={props.attach}
              upload={upload}
              disabled={sent}
              onPick={file.pick}
              onClear={file.clear}
            />
          </div>

          <AttachmentChoiceFootnote hint={props.attach.hint} upload={upload} />
        </div>
      </Card>
    </div>
  );
}

function AttachmentChoiceDescription({text}: {text: string | undefined}) {
  if (text === undefined) return null;

  return (
    <p className="a2ui-t--sub a2ui-t--muted" style={paragraphStyle}>
      {text}
    </p>
  );
}

function AttachmentChoiceFootnote({
  hint,
  upload,
}: {
  hint: string | undefined;
  upload: UseAttachmentUpload['upload'];
}) {
  if (upload.status === 'error') {
    return (
      <p className="a2ui-t--sub a2ui-t--danger" role="alert" style={paragraphStyle}>
        {upload.message}
      </p>
    );
  }
  if (hint === undefined) return null;

  return (
    <p className="a2ui-t--sub a2ui-t--muted" style={paragraphStyle}>
      {hint}
    </p>
  );
}

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 14, padding: 16};
const headerStyle: React.CSSProperties = {display: 'grid', gap: 4};
const titleStyle: React.CSSProperties = {margin: 0};
const paragraphStyle: React.CSSProperties = {margin: 0};
const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
};
