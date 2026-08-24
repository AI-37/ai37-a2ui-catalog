import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {liftReportNextDefinition, type LiftReportAction} from '@ai37/a2ui-catalog-schemas';
import {LiftReportNextScreen} from './lift-report-next-screen';
import {useA2uiBaseStyles} from './shared';

/**
 * Тот же результат расчёта лифтов, что `LiftReport`, собранный из примитивов
 * каталога — и из тех же самых, что `ThermalReportNext`: вердикт, строка
 * списка, исходные данные и протокол у двух отчётов написаны один раз. Своего
 * листа стилей у рендерера нет.
 *
 * Схема props общая со старым рендерером намеренно, контракт действий тот же:
 * каждая кнопка диспатчит `{event: {name, context: payload ?? {}}}`.
 *
 * Отличия исполнения, а не контракта (канон change'а `proba-report-assembly`):
 * протокол — одна строка, `<details>` с `<pre>` не переносится и
 * `protocol.content` на экране не выводится; слово статуса варианта зашито
 * там, где состояние сводится к перечислению (`statusLabel` остаётся за
 * `neutral`); акцентная рамка — только у рекомендованного варианта.
 */
export const LiftReportNext = createComponentImplementation(
  liftReportNextDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const handleAction = (action: LiftReportAction) => {
      void context.dispatchAction({
        event: {name: action.name, context: action.payload ?? {}},
      });
    };

    return <LiftReportNextScreen props={props} onAction={handleAction} />;
  },
);
