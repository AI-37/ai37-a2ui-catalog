import React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {
  applyHostFonts,
  applyHostStyleVariables,
  type App,
  type McpUiHostContext,
} from '@modelcontextprotocol/ext-apps';
import type {Transport} from '@modelcontextprotocol/client';
import {A2uiAppSession} from './a2ui-app-session';
import {A2uiAppSurface} from './a2ui-app-surface';
import {installResourceFetch} from './resource-fetch';

export type A2uiAppView = {session: A2uiAppSession; root: Root};

function applyHostContext(session: A2uiAppSession, context: McpUiHostContext | undefined): void {
  if (context === undefined) return;
  session.applyHostContext(context);
  if (context.styles?.variables !== undefined) applyHostStyleVariables(context.styles.variables);
  if (context.styles?.css?.fonts !== undefined) applyHostFonts(context.styles.css.fonts);
}

/**
 * Запуск view: обработчики `App` вешаются до `connect()` — иначе первый
 * результат инструмента можно пропустить. Без `transport` `App` говорит с
 * родительским окном (`postMessage`), как в настоящем хосте.
 */
export async function startA2uiAppView(
  app: App,
  container: HTMLElement,
  transport?: Transport,
): Promise<A2uiAppView> {
  const session = new A2uiAppSession(app);
  app.addEventListener('toolresult', result => session.showToolResult(result));
  app.addEventListener('hostcontextchanged', context => applyHostContext(session, context));
  installResourceFetch(globalThis, (id, context) => session.requestResource(id, context));

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <A2uiAppSurface session={session} />
    </React.StrictMode>,
  );

  await app.connect(transport);
  applyHostContext(session, app.getHostContext());
  return {session, root};
}
