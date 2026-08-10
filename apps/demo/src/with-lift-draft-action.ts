import type {A2uiMessage} from '@a2ui/web_core/v0_9';

/** Имя action'а автосохранения LiftEditor'а в демо. */
export const DEMO_LIFT_DRAFT_ACTION = 'lift:draft';

/**
 * Добавляет `draftAction` в props LiftEditor'а демо-сообщений.
 *
 * Фикстура `lift-editor-surface.json` намеренно остаётся без пропа (базовое
 * поведение без автосейва), а витрина показывает включённый черновик: в консоли
 * видно, что action уходит на границах экранов и на blur правки, но не на
 * проходе по полям табом.
 */
export function withLiftDraftAction(messages: A2uiMessage[]): A2uiMessage[] {
  return messages.map(message => {
    const update = (message as any).updateComponents;
    if (!update) return message;

    return {
      ...message,
      updateComponents: {
        ...update,
        components: update.components.map((component: any) =>
          component.component === 'LiftEditor'
            ? {...component, draftAction: DEMO_LIFT_DRAFT_ACTION}
            : component,
        ),
      },
    } as A2uiMessage;
  });
}
