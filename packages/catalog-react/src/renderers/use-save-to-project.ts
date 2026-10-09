import {useRef, useState} from 'react';

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
 *
 * Состояние привязано к `artifactId`: тот же компонент на месте получает новый протокол
 * (пересчёт), и «В проекте» от прошлого артефакта сбрасывается в `initial`. Ответ хоста
 * по прошлому артефакту, пришедший после смены, состояние нового не трогает.
 */
export function useSaveToProject(
  artifactId: string | undefined,
  onSaveToProject: ((artifactId: string) => Promise<void>) | undefined,
  initial: SaveToProjectState = 'idle',
): SaveToProject {
  const [state, setState] = useState<SaveToProjectState>(initial);
  const [trackedId, setTrackedId] = useState(artifactId);
  // Сброс при смене артефакта — во время рендера (паттерн React «хранить прошлое значение
  // пропса»), чтобы новый протокол ни одного кадра не показался «В проекте».
  if (trackedId !== artifactId) {
    setTrackedId(artifactId);
    setState(initial);
  }
  const currentId = useRef(artifactId);
  currentId.current = artifactId;
  const canSave = artifactId !== undefined && onSaveToProject !== undefined;

  const save = () => {
    if (artifactId === undefined || onSaveToProject === undefined) return;
    if (state === 'saving' || state === 'saved') return;
    setState('saving');
    const settle = (next: SaveToProjectState) => () => {
      if (currentId.current === artifactId) setState(next);
    };
    onSaveToProject(artifactId).then(settle('saved'), settle('failed'));
  };

  return {state, canSave, save};
}
