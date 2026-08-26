import type {A2uiMessage} from '@a2ui/web_core/v0_9';

/** Имя action'а автосохранения KeoEditor'а в демо. */
export const DEMO_KEO_DRAFT_ACTION = 'keo:draft';

/**
 * Добавляет `draftAction` в props `KeoEditorNext` демо-сообщений.
 *
 * Фикстура `keo-editor.json` намеренно остаётся без пропа (базовое поведение
 * без автосейва — им же проверяется, что следствие условия гаснет), а витрина
 * показывает включённый черновик: в консоли видно, что правка поля уезжает
 * после паузы, добавление помещения и «Далее» — сразу, а раскрытие секции не
 * шлёт ничего.
 */
export function withKeoDraftAction(messages: A2uiMessage[]): A2uiMessage[] {
  return messages.map(message => {
    const update = (message as any).updateComponents;
    if (!update) return message;

    return {
      ...message,
      updateComponents: {
        ...update,
        components: update.components.map((component: any) =>
          component.component === 'KeoEditorNext'
            ? {...component, draftAction: DEMO_KEO_DRAFT_ACTION}
            : component,
        ),
      },
    } as A2uiMessage;
  });
}
