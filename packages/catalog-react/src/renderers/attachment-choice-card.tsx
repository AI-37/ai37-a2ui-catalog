import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {attachmentChoiceCardDefinition} from '@ai37/a2ui-catalog-schemas';
import {AttachmentChoiceCardScreen} from './attachment-choice-card-screen';
import {useAttachmentUpload} from './use-attachment-upload';
import {useA2uiBaseStyles} from './shared';

/**
 * «Продолжить без файла / с файлом» с выбором файла внутри карточки.
 *
 * Файл грузится сразу при выборе — на полку треда, мимо очереди композера
 * (план AI-37/docs#497: иначе чип над полем ввода переживал клик по форме).
 * Обе кнопки шлют одно действие: skip — `{value}`, attach — `{value, fileId,
 * fileName}`. Агент берёт файл по `fileId`, а не угадывает по `context_refs`.
 */
export const AttachmentChoiceCard = createComponentImplementation(
  attachmentChoiceCardDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const file = useAttachmentUpload(props.contextId);
    const [sent, setSent] = React.useState(false);

    const dispatch = (payload: Record<string, string>) => {
      setSent(true);
      void context.dispatchAction({event: {name: props.action, context: payload}});
    };

    return (
      <AttachmentChoiceCardScreen
        props={props}
        file={file}
        sent={sent}
        sink={{
          onSkip: () => props.skip && dispatch({value: props.skip.value}),
          onAttach: ({fileId, fileName}) =>
            dispatch({value: props.attach.value, fileId, fileName}),
        }}
      />
    );
  },
);
