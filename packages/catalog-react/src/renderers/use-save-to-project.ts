import {useState} from 'react';

export type SaveToProjectState = 'idle' | 'saving' | 'saved' | 'failed';

export interface SaveToProject {
  state: SaveToProjectState;
  /** Нет id или хост не дал обработчик — сохранять некуда, кнопки и пункта нет. */
  canSave: boolean;
  save: () => void;
}

/**
 * Состояние «Сохранить в проект» — общее у карточки артефакта и у меню «Скачать»
 * отчётов. Сохранение — вызов хоста (`ArtifactCardHost.onSaveToProject`), агенту
 * ничего не уходит. Пока идёт запрос, повторный вызов ничего не делает; после
 * отказа можно попробовать ещё раз.
 */
export function useSaveToProject(
  artifactId: string | undefined,
  onSaveToProject: ((artifactId: string) => Promise<void>) | undefined,
  initial: SaveToProjectState = 'idle',
): SaveToProject {
  const [state, setState] = useState<SaveToProjectState>(initial);
  const canSave = artifactId !== undefined && onSaveToProject !== undefined;

  const save = () => {
    if (artifactId === undefined || onSaveToProject === undefined) return;
    if (state === 'saving' || state === 'saved') return;
    setState('saving');
    onSaveToProject(artifactId).then(
      () => setState('saved'),
      () => setState('failed'),
    );
  };

  return {state, canSave, save};
}
