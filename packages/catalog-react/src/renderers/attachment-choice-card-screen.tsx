import React from 'react';
import {Button, Card, CardHeader, KIT_SCOPE, KitStyles} from '../primitives';
import {AttachmentChoiceCardError} from './attachment-choice-card-error';
import {AttachmentChoiceFileSlot} from './attachment-choice-card-file';
import {AttachmentChoiceCardSkipButton} from './attachment-choice-card-skip-button';
import {AttachmentChoiceCardNote} from './attachment-choice-card-note';
import type {AttachmentChoiceCardScreenProps} from './attachment-choice-card.types';

/**
 * Экран карточки отдельно от рендерера — чтобы ставить его в demo без a2ui-хоста.
 *
 * Раскладка — канон `*Next`: шапка утопленной полосой (`Card flat` +
 * `CardHeader`, как у КЕО и лифтов), строка файла и подвал. Подвал — как у
 * `ConstructionsNextFooter`: вторичная кнопка `lg` рядом с главной
 * `filled lg`; без `skip` главная остаётся одна. Выбор и есть отправка, поэтому radio и «Продолжить» нет.
 */
export function AttachmentChoiceCardScreen({props, file, sent, sink}: AttachmentChoiceCardScreenProps) {
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

          <AttachmentChoiceCardNote text={props.description} />

          <div style={fileRowStyle}>
            <AttachmentChoiceFileSlot
              attach={props.attach}
              upload={upload}
              disabled={sent}
              onPick={file.pick}
              onClear={file.clear}
            />
          </div>
          <AttachmentChoiceCardError upload={upload} />
          <AttachmentChoiceCardNote text={upload.status === 'error' ? undefined : props.attach.hint} />

          <div style={footerStyle}>
            <AttachmentChoiceCardSkipButton
              skip={props.skip}
              disabled={sent || upload.status === 'uploading'}
              onSkip={sink.onSkip}
            />
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

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 14, padding: 16};
const headTitleStyle: React.CSSProperties = {flex: 1, minWidth: 0};
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
