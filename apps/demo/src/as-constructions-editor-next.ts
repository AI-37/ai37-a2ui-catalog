import type {A2uiMessage} from '@a2ui/web_core/v0_9';

/** Имя нового рендерера в схемах: тот же экран, та же схема props. */
export const CONSTRUCTIONS_NEXT_COMPONENT = 'ConstructionsEditorNext';

/**
 * Те же сообщения, адресованные новому рендереру. Наполнение общее с
 * `ConstructionsEditor` намеренно: два экрана в треде сравнивают исполнение, а
 * на разных данных сравнивать нечего (change constructions-editor-next).
 */
export function asConstructionsEditorNext(messages: A2uiMessage[]): A2uiMessage[] {
  return messages.map(message => {
    const update = (message as any).updateComponents;
    if (!update) return message;

    return {
      ...message,
      updateComponents: {
        ...update,
        components: update.components.map((component: any) =>
          component.component === 'ConstructionsEditor'
            ? {...component, component: CONSTRUCTIONS_NEXT_COMPONENT}
            : component,
        ),
      },
    } as A2uiMessage;
  });
}
