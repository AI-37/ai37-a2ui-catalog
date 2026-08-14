import type {A2uiMessage} from '@a2ui/web_core/v0_9';

/**
 * Патчит props ConstructionsEditor'а под витрину статусных чипов и
 * двухрежимной кнопки: пресетным карточкам — `status: 'confirm'`, окну —
 * `'confirm-passport'`, плюс карточка с двумя слоями без λ и `pendingLabel`.
 * `tв` обнуляется, чтобы показать гейт условий: чипов нет, «Далее» ведёт к
 * условиям; после ввода tв чипы загораются тем же рендером.
 *
 * Фикстура `constructions-editor-surface.json` намеренно остаётся без статусов
 * (базовое поведение старого агента), витрина патчит копию.
 */
export function withStatusChipsPreview(messages: A2uiMessage[]): A2uiMessage[] {
  return messages.map(message => {
    const update = (message as any).updateComponents;
    if (!update) return message;

    return {
      ...message,
      updateComponents: {
        ...update,
        components: update.components.map((component: any) =>
          component.component === 'ConstructionsEditor'
            ? {
                ...component,
                pendingLabel: 'Далее',
                general: {...component.general, tv: null},
                constructions: [
                  ...component.constructions.map((entry: any) =>
                    entry.type === 'okna'
                      ? {...entry, status: 'confirm-passport'}
                      : {...entry, status: 'confirm'},
                  ),
                  {
                    id: 'c-wall-draft',
                    type: 'steny',
                    name: 'Стена из распознавания (2 слоя без λ)',
                    status: 'confirm',
                    layers: [
                      {material: 'Кладка из известняка', thicknessMm: 510},
                      {material: 'Засыпка перлитовая', thicknessMm: 100},
                    ],
                  },
                ],
              }
            : component,
        ),
      },
    } as A2uiMessage;
  });
}
