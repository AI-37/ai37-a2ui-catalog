import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {keoEditorNextDefinition} from '@ai37/a2ui-catalog-schemas';
import {KeoNextScreen} from './keo-next-screen';
import {useA2uiBaseStyles} from './shared';

/**
 * Тот же экран сбора исходных данных КЕО, что `KeoEditor`, собранный из
 * примитивов каталога (`src/primitives`): карточка, кнопка, пилюля, ступени
 * текста, форма/поле, секция-раскрывашка со сводкой и пометкой, подпись
 * источника — оформление наше, а раскрывашки, списки, числовые поля, поиск по
 * справочнику и меню приходят из `@base-ui/react` вместе с клавиатурой и
 * `aria`. Схема props общая со старым рендерером намеренно: одно наполнение
 * обязано рендериться обоими, иначе сравнивать нечего.
 *
 * Контракт данных не меняется. Наружу уходит один submit с полным документом
 * `{conditions, rooms}`, и условия в нём — живые: правка города и есть смысл
 * «изменить только для расчёта». Черновиков у этого экрана нет — в схеме
 * `KeoEditor` второго action не объявлено.
 *
 * Доменных знаний о СП 367 и СП 52 здесь нет — нормативы, справочники,
 * готовые строки плоскости и правила предупреждающей валидации целиком
 * приходят в props.
 */
export const KeoEditorNext = createComponentImplementation(
  keoEditorNextDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    return (
      <KeoNextScreen
        props={props}
        sink={{
          onSubmit: document => {
            void context.dispatchAction({event: {name: props.submit.name, context: document}});
          },
        }}
      />
    );
  },
);
