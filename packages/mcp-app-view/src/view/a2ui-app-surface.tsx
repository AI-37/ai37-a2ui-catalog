import React from 'react';
import {A2uiSurface} from '@a2ui/react/v0_9';
import type {A2uiAppSession} from './a2ui-app-session';

/**
 * Поверхность A2UI в рамке view: тема хоста на корне (`data-a2ui-theme` —
 * слово хоста для набора `*Next`), индикатор хода и ошибка вызова.
 */
export function A2uiAppSurface({session}: {session: A2uiAppSession}) {
  const {processor, surfaceId, busy, error, theme} = React.useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
  );
  const surface = surfaceId === undefined ? undefined : processor?.model.getSurface(surfaceId);

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
          <A2uiSurface surface={surface} />
        </div>
      )}
    </div>
  );
}
