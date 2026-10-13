import type {AttachmentChoiceAttach, AttachmentChoiceCardProps} from '@ai37/a2ui-catalog-schemas';

/** Состояние файла в карточке: от выбора до готового `fileId` на полке треда. */
export type AttachmentUpload =
  | {status: 'idle'}
  | {status: 'uploading'; fileName: string}
  | {status: 'ready'; fileId: string; fileName: string; bytes: number}
  | {status: 'error'; message: string};

export interface UseAttachmentUpload {
  upload: AttachmentUpload;
  /** Выбрать файл: загрузка стартует сразу, прежний in-flight запрос отменяется. */
  pick: (file: File) => void;
  /** Убрать выбранный файл (крестик у чипа). Файл на полке остаётся — TTL полки. */
  clear: () => void;
}

/** Получатель выбора: рендерер диспатчит действие, demo — пишет в лог. */
export interface AttachmentChoiceCardSink {
  onSkip: () => void;
  onAttach: (file: {fileId: string; fileName: string}) => void;
}

export interface AttachmentChoiceCardScreenProps {
  props: AttachmentChoiceCardProps;
  file: UseAttachmentUpload;
  /** Выбор уже отправлен: обе кнопки и слот гаснут, повторного действия нет. */
  sent: boolean;
  sink: AttachmentChoiceCardSink;
}

export interface AttachmentChoiceFileSlotProps {
  attach: AttachmentChoiceAttach;
  upload: AttachmentUpload;
  disabled: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}
