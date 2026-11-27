import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {keoEditorNextDefinition} from '@ai37/a2ui-catalog-schemas';
import {KeoNextScreen} from './keo-next-screen';
import {useA2uiBaseStyles} from './shared';
import {applyKeoDraftSeed} from './apply-keo-draft-seed';
import {useKeoDraftPost} from './use-keo-draft-post';

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
 * «изменить только для расчёта». При заданном `draftAction` тот же документ
 * уезжает черновиком: правка поля — дебаунсом, структурное действие — сразу.
 *
 * Доменных знаний о СП 367 и СП 52 здесь нет — нормативы, справочники,
 * готовые строки плоскости и правила предупреждающей валидации целиком
 * приходят в props.
 */
export const KeoEditorNext = createComponentImplementation(
  keoEditorNextDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const draftAction = props.draftAction;

    // СПАЙК keo-draft-rest-channel: при заданном `draftUrl` черновик уезжает
    // POST'ом вне диалогового run'а (индикатор выполнения не мелькает), а
    // пересчитанные подписи условий применяются из ответа локально.
    // `draftAction` — путь отката: без URL канал прежний, диалоговый.
    const {postDraft, noteOverrides, draftSeed} = useKeoDraftPost(
      props.draftUrl,
      JSON.stringify([props.conditions, props.rooms]),
    );
    // Посев добранного GET'ом черновика (перезагрузка страницы) — поверх него
    // локальные оверрайды подписей условий из ответов на POST.
    const seeded = applyKeoDraftSeed(props, draftSeed);
    const conditions = seeded.conditions.map(condition => {
      const note = noteOverrides[condition.name];
      return note === undefined ? condition : {...condition, note};
    });

    return (
      <KeoNextScreen
        props={{...seeded, conditions}}
        sink={{
          // Без `draftUrl` и `draftAction` автосейва нет: получателя не
          // существует, и черновик не собирается вовсе.
          onDraft:
            postDraft ??
            (draftAction
              ? document => {
                  void context.dispatchAction({event: {name: draftAction, context: document}});
                }
              : undefined),
          onSubmit: document => {
            void context.dispatchAction({event: {name: props.submit.name, context: document}});
          },
        }}
      />
    );
  },
);
