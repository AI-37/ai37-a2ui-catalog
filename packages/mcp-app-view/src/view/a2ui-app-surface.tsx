import React from 'react';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {ArtifactCardHostProvider, type ArtifactCardHost} from '@ai37/a2ui-catalog-react';
import type {A2uiAppSession} from './a2ui-app-session';

/**
 * Поверхность A2UI в рамке view: тема хоста на корне (`data-a2ui-theme` —
 * слово хоста для набора `*Next`), индикатор хода и ошибка вызова.
 *
 * Протокол текстом скачивается через хост (`ui/download-file`); хост без
 * `downloadFile` получает `null` — рендереры прячут «Скачать», а не рисуют
 * кнопку, которая молча ничего не делает.
 */
export function A2uiAppSurface({session}: {session: A2uiAppSession}) {
  const {processor, surfaceId, busy, error, theme, canDownload} = React.useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
  );
  const surface = surfaceId === undefined ? undefined : processor?.model.getSurface(surfaceId);
  const host = React.useMemo<ArtifactCardHost>(
    () => ({downloadFile: canDownload ? session.downloadFile : null}),
    [canDownload, session],
  );

  return (
    <div className="a2ui-mcp-app" data-a2ui-theme={theme} aria-busy={busy}>
      {busy && (
        <p className="a2ui-mcp-app__status" role="status">
          Агент считает…
        </p>
      )}
      {error !== undefined && (
        <p className="a2ui-mcp-app__error" role="alert">
          {error}
        </p>
      )}
      {surface === undefined ? (
        <p className="a2ui-mcp-app__status">Жду данных от агента…</p>
      ) : (
        <div className="a2ui-mcp-app__surface">
          <ArtifactCardHostProvider value={host}>
            <A2uiSurface surface={surface} />
          </ArtifactCardHostProvider>
        </div>
      )}
    </div>
  );
}
