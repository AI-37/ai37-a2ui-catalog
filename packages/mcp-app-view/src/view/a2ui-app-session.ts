import type {App, McpUiHostContext} from '@modelcontextprotocol/ext-apps';
import type {CallToolResult} from '@modelcontextprotocol/client';
import type {ReactComponentImplementation} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog, type TextFile} from '@ai37/a2ui-catalog-react';
import {LOOKUP_SUGGEST_ACTION} from '@ai37/a2ui-catalog-schemas';
import {
  A2UI_RESOURCE_ACTION_PREFIX,
  readA2uiAppPayload,
  readA2uiResource,
  type A2uiAppActionArgs,
  type A2uiAppMessage,
  type A2uiAppPayload,
} from '../protocol';

export type ViewTheme = 'light' | 'dark';

/** Что видит React: поверхность, ход и ошибка. Новый объект на каждое изменение. */
export type ViewSnapshot = {
  processor: MessageProcessor<ReactComponentImplementation> | undefined;
  surfaceId: string | undefined;
  busy: boolean;
  error: string | undefined;
  theme: ViewTheme;
  /**
   * Хост объявил `downloadFile` при подключении. Нет — «Скачать» у протокола
   * текстом не показывается: Blob из песочницы всё равно не скачается.
   */
  canDownload: boolean;
};

/** Действие поверхности, как его отдаёт `MessageProcessor`. */
type SurfaceAction = {name: string; context?: Record<string, unknown> | undefined};

/** Черновик сохраняет ввод и только: поверхность после него не пересоздаётся. */
function isDraftAction(name: string): boolean {
  return name.endsWith(':draft');
}

/**
 * Тихое действие — без индикатора хода и без сообщения модели: черновик и
 * подсказки lookup в action-режиме. Итога у них нет, а мигать формой на
 * каждый набранный символ незачем.
 */
function isQuietAction(name: string): boolean {
  return isDraftAction(name) || name === LOOKUP_SUGGEST_ACTION;
}

function hasCreateSurface(messages: A2uiAppMessage[]): boolean {
  return messages.some(message => 'createSurface' in message);
}

function resultText(result: CallToolResult): string {
  return result.content
    .flatMap(block => (block.type === 'text' ? [block.text] : []))
    .join('\n')
    .trim();
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Состояние view между хостом MCP Apps и поверхностью A2UI.
 *
 * Хост присылает результат инструмента → поверхность рисуется заново. Действие
 * поверхности уходит в `actionTool` вместе с непрозрачным `state`; ответ того же
 * формата перерисовывает поверхность, а его текст становится контекстом модели.
 */
export class A2uiAppSession {
  private snapshot: ViewSnapshot = {
    processor: undefined,
    surfaceId: undefined,
    busy: false,
    error: undefined,
    theme: 'light',
    canDownload: false,
  };

  private readonly listeners = new Set<() => void>();

  private payload: A2uiAppPayload | undefined;

  // Номер последнего отправленного и последнего принятого ответа: поздний
  // ответ на черновик не должен затереть состояние, пришедшее с расчётом.
  private issued = 0;

  private applied = 0;

  constructor(private readonly app: App) {}

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  readonly getSnapshot = (): ViewSnapshot => this.snapshot;

  /** Результат инструмента от хоста (`ontoolresult`): поверхность с нуля. */
  showToolResult(result: CallToolResult): void {
    const payload = readA2uiAppPayload(result._meta);
    if (payload === undefined) return;
    this.applied = this.issued;
    this.payload = payload;
    this.render(payload);
  }

  /** Тема хоста. Остальное (переменные, шрифты) применяет `host-styles`. */
  applyHostContext(context: McpUiHostContext): void {
    if (context.theme === undefined) return;
    this.update({theme: context.theme === 'dark' ? 'dark' : 'light'});
  }

  /** Возможности хоста после `connect()`: пока что только скачивание файлов. */
  applyHostCapabilities(): void {
    this.update({canDownload: this.app.getHostCapabilities()?.downloadFile !== undefined});
  }

  /**
   * Загрузчик файлов каталога внутри MCP App: Blob-ссылку песочница режет,
   * поэтому файл уходит хосту как `ui/download-file`. `isError` — отказ или
   * отмена в диалоге хоста: это решение пользователя, а не сбой, экран его не
   * показывает. Ошибкой считается только оборванный вызов.
   */
  readonly downloadFile = async (file: TextFile): Promise<void> => {
    try {
      await this.app.downloadFile({
        contents: [
          {
            type: 'resource',
            resource: {
              uri: `file:///${encodeURIComponent(file.fileName)}`,
              mimeType: file.mimeType,
              text: file.text,
            },
          },
        ],
      });
    } catch (error) {
      this.update({error: `Не удалось скачать файл: ${errorText(error)}`});
    }
  };

  /** Обработчик действий поверхности: отдаётся в `MessageProcessor`. */
  readonly handleAction = async (action: SurfaceAction): Promise<void> => {
    const quiet = isQuietAction(action.name);
    if (!quiet) this.update({busy: true, error: undefined});
    try {
      const call = await this.callActionTool(action.name, action.context ?? {});
      if (call !== undefined) await this.applyActionResult(action.name, call.result, call.sent);
    } catch (error) {
      if (!quiet) this.update({error: errorText(error)});
    } finally {
      if (!quiet) this.update({busy: false});
    }
  };

  /**
   * Ресурсный канал (`lookupHost`, `recommend`): `resource:<id>` тем же
   * `actionTool`. Нет поверхности, ошибка инструмента или пустой ответ —
   * `undefined`, рендерер молча прячет блок, как при 404 своей ручки.
   */
  async requestResource(id: string, context: Record<string, unknown>): Promise<unknown> {
    const call = await this.callActionTool(`${A2UI_RESOURCE_ACTION_PREFIX}${id}`, context);
    if (call === undefined || call.result.isError === true) return undefined;
    return readA2uiResource(call.result._meta);
  }

  private async callActionTool(
    name: string,
    context: Record<string, unknown>,
  ): Promise<{result: CallToolResult; sent: number} | undefined> {
    const current = this.payload;
    if (current === undefined) return undefined;
    this.issued += 1;
    const sent = this.issued;
    const args: A2uiAppActionArgs = {name, context, state: current.state};
    const result = await this.app.callServerTool({name: current.actionTool, arguments: args});
    return {result, sent};
  }

  private async applyActionResult(name: string, result: CallToolResult, sent: number): Promise<void> {
    if (result.isError === true) {
      if (!isQuietAction(name)) this.update({error: resultText(result) || 'Агент вернул ошибку.'});
      return;
    }
    const next = readA2uiAppPayload(result._meta);
    if (next === undefined || sent < this.applied) return;
    this.applied = sent;
    this.payload = next;
    if (!isDraftAction(name)) this.render(next);
    if (!isQuietAction(name)) await this.shareWithModel(resultText(result));
  }

  /**
   * Поток с `createSurface` — новая поверхность в новом процессоре (тот же id в
   * старом процессор отверг бы). Без него — правка текущей, например опции
   * lookup через `updateDataModel`.
   */
  private render(payload: A2uiAppPayload): void {
    try {
      this.process(payload);
    } catch (error) {
      this.update({error: `Не удалось показать поверхность: ${errorText(error)}`});
    }
  }

  private process(payload: A2uiAppPayload): void {
    const messages = payload.messages as unknown as A2uiMessage[];
    if (hasCreateSurface(payload.messages)) {
      const processor = new MessageProcessor([ai37Catalog], this.handleAction);
      processor.processMessages(messages);
      this.update({processor, surfaceId: payload.surfaceId, error: undefined});
      return;
    }
    if (messages.length === 0 || this.snapshot.processor === undefined) return;
    this.snapshot.processor.processMessages(messages);
    this.update({});
  }

  /**
   * Итог хода — в контекст модели: на следующем сообщении пользователя она
   * знает результат. Сам ход модели не запускаем, расчёт уже готов. Хост без
   * поддержки контекста — не ошибка расчёта, пользователь её видеть не должен.
   */
  private async shareWithModel(text: string): Promise<void> {
    if (text.length === 0) return;
    try {
      await this.app.updateModelContext({content: [{type: 'text', text}]});
    } catch {
      // Контекст модели — бонус к расчёту, а не его часть.
    }
  }

  private update(patch: Partial<ViewSnapshot>): void {
    this.snapshot = {...this.snapshot, ...patch};
    this.listeners.forEach(listener => listener());
  }
}
