import type {A2uiMessage} from '@a2ui/web_core/v0_9';

/** Имя action'а автосохранения в демо — общее для патча props и логгера. */
export const DEMO_DRAFT_ACTION = 'constructions:draft';

/**
 * Добавляет `draftAction` в props ConstructionsEditor'а демо-сообщений.
 *
 * Фикстура `constructions-editor-surface.json` намеренно остаётся без пропа
 * (базовое поведение без автосейва), а витрина показывает включённый черновик.
 */
export function withConstructionsDraftAction(messages: A2uiMessage[]): A2uiMessage[] {
  return messages.map(message => {
    const update = (message as any).updateComponents;
    if (!update) return message;

    return {
      ...message,
      updateComponents: {
        ...update,
        components: update.components.map((component: any) =>
          // Оба рендерера экрана конструкций: черновик у них общий, как и схема.
          String(component.component).startsWith('ConstructionsEditor')
            ? {...component, draftAction: DEMO_DRAFT_ACTION}
            : component,
        ),
      },
    } as A2uiMessage;
  });
}
