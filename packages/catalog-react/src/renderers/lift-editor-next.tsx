import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {liftEditorNextDefinition} from '@ai37/a2ui-catalog-schemas';
import {LiftNextScreen} from './lift-next-screen';
import {useA2uiBaseStyles} from './shared';

/**
 * Тот же экран подбора лифтов, что `LiftEditor`, собранный из примитивов
 * каталога (`src/primitives`): карточка, кнопка, пилюля, ступени текста,
 * форма/поле, секция-раскрывашка со сводкой и пометкой, свёрнутый блок принятых
 * значений, подпись источника — оформление наше, а раскрывашки, списки,
 * числовые поля и меню приходят из `@base-ui/react` вместе с клавиатурой и
 * `aria`. Схема props общая со старым рендерером намеренно: одно наполнение
 * обязано рендериться обоими, иначе сравнивать нечего.
 *
 * Контракт данных не меняется. Наружу уходит один submit с документом активной
 * ветки `{method, building, lifts}`; при заданном `draftAction` правка поля
 * планирует черновик дебаунсом (`LIFT_DRAFT_DEBOUNCE_MS`), а структурные
 * действия — добавление и удаление лифта, смена методики, «Далее» — шлют его
 * немедленно, отменяя отложенный. Черновики неактивных методик живут на
 * клиенте: возврат к прежней ветке показывает введённое, наружу уезжает только
 * активная.
 *
 * Доменных знаний о ГОСТ здесь нет — конфиги методик, ряды значений и
 * зависимые правила целиком приходят в props.
 */
export const LiftEditorNext = createComponentImplementation(
  liftEditorNextDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const draftAction = props.draftAction;

    return (
      <LiftNextScreen
        props={props}
        sink={{
          // Без `draftAction` автосейва нет: получателя не существует, и
          // черновик не собирается вовсе.
          onDraft: draftAction
            ? document => {
                void context.dispatchAction({event: {name: draftAction, context: document}});
              }
            : undefined,
          onSubmit: document => {
            void context.dispatchAction({event: {name: props.submitAction, context: document}});
          },
        }}
      />
    );
  },
);
