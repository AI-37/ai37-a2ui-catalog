import React from 'react';
import type {AttachmentChoiceCardProps} from '@ai37/a2ui-catalog-schemas';
import {Button, Card, CardHeader, KIT_SCOPE, KitStyles} from '../primitives';
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
 *
 * Раскладка — канон `*Next`: шапка утопленной полосой (`Card flat` +
 * `CardHeader`, как у КЕО и лифтов), строка файла и подвал. Подвал — как у
 * `ConstructionsNextFooter`: вторичная кнопка `lg` рядом с главной
 * `filled lg`. Выбор и есть отправка, поэтому radio и «Продолжить» нет.
 */
export function AttachmentChoiceCardScreen({props, file, sent, sink}: ScreenProps) {
  const {upload} = file;
  const ready = upload.status === 'ready' ? upload : null;

  return (
    <div className={KIT_SCOPE}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          <Card flat>
            <CardHeader
              title={
                <span style={headTitleStyle} className="a2ui-t--body a2ui-t--strong">
                  {props.title}
                </span>
              }
            />
          </Card>

          <AttachmentChoiceDescription text={props.description} />

          <div style={fileRowStyle}>
            <AttachmentChoiceFileSlot
              attach={props.attach}
              upload={upload}
              disabled={sent}
              onPick={file.pick}
              onClear={file.clear}
            />
          </div>
          <AttachmentChoiceFootnote hint={props.attach.hint} upload={upload} />

          <div style={footerStyle}>
            <Button size="lg" disabled={sent || upload.status === 'uploading'} onClick={sink.onSkip}>
              {props.skip.label}
            </Button>
            <Button
              variant="filled"
              size="lg"
              disabled={sent || ready === null}
              onClick={() => ready && sink.onAttach({fileId: ready.fileId, fileName: ready.fileName})}
            >
              {props.attach.label}
            </Button>
          </div>
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
const headTitleStyle: React.CSSProperties = {flex: 1, minWidth: 0};
const paragraphStyle: React.CSSProperties = {margin: 0};
const fileRowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 10,
};
/* Как `ConstructionsNextFooter`: две кнопки lg в строку, перенос на узком. */
const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  flexWrap: 'wrap',
};
