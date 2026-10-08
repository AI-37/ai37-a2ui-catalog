import React, {createContext, useContext} from 'react';

/**
 * Что карточке артефакта нужно от хоста. Каталог не знает ни BFF хоста, ни
 * текущего проекта, поэтому «Сохранить в проект» — не A2UI-действие агенту, а
 * вызов хоста: прикрепление идёт в chat-backend (`POST /api/artifacts/:id/attach`),
 * агенту в этом ходе делать нечего.
 */
export interface ArtifactCardHost {
  /**
   * База ссылок на артефакты у хоста (его прокси к chat-backend). Только
   * относительный путь от корня; иное игнорируется и берётся `/api/artifacts`.
   */
  baseUrl?: string;
  /**
   * Прикрепить артефакт к проекту. Нет функции — нет кнопки (например, тред
   * вне проекта или widget-канал, где проектов нет). Ошибка — отказ
   * сохранения: карточка покажет «Не удалось сохранить».
   */
  onSaveToProject?: (artifactId: string) => Promise<void>;
}

const ArtifactCardHostContext = createContext<ArtifactCardHost>({});

/** Хост оборачивает поверхность A2UI, чтобы карточки артефактов получили его ссылки и действия. */
export function ArtifactCardHostProvider({
  value,
  children,
}: {
  value: ArtifactCardHost;
  children: React.ReactNode;
}) {
  return <ArtifactCardHostContext.Provider value={value}>{children}</ArtifactCardHostContext.Provider>;
}

export function useArtifactCardHost(): ArtifactCardHost {
  return useContext(ArtifactCardHostContext);
}
