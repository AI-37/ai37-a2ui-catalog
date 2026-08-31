import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {keoReportNextDefinition, type KeoReportAction} from '@ai37/a2ui-catalog-schemas';
import {KeoReportNextScreen} from './keo-report-next-screen';
import {useA2uiBaseStyles} from './shared';

/**
 * Тот же результат расчёта КЕО, что `KeoReport`, собранный из примитивов
 * каталога — и ровно из тех же, что `ThermalReportNext` и `LiftReportNext`:
 * вердикт, строка списка, исходные данные и протокол у трёх отчётов написаны
 * один раз. Своего листа стилей у рендерера нет — 244 строки
 * `keo-report-styles.ts` заменены токенами примитивов.
 *
 * Схема props общая со старым рендерером намеренно, контракт действий тот же:
 * каждая кнопка диспатчит `{event: {name, context: payload ?? {}}}`.
 *
 * Отличия исполнения, а не контракта (канон change'а `proba-report-assembly`,
 * применённый в `reports-next`): слова статуса зашиты в рендерер, акцентная
 * рамка осталась только у рекомендованного варианта, кнопки принятия —
 * `outline` (единственный акцент экрана — вердикт), «Скачать» — меню форматов.
 */
export const KeoReportNext = createComponentImplementation(
  keoReportNextDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const handleAction = (action: KeoReportAction) => {
      void context.dispatchAction({
        event: {name: action.name, context: action.payload ?? {}},
      });
    };

    return <KeoReportNextScreen props={props} onAction={handleAction} />;
  },
);
