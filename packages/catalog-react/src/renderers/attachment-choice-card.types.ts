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
  /** Убрать выбранный файл (крестик на чипе). Файл на полке остаётся — TTL полки. */
  clear: () => void;
}
