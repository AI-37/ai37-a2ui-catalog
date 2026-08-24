import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {thermalReportNextDefinition, type ThermalReportAction} from '@ai37/a2ui-catalog-schemas';
import {ThermalReportNextScreen} from './thermal-report-next-screen';
import {useA2uiBaseStyles} from './shared';

/**
 * Тот же результат теплотехнического расчёта, что `ThermalReport`, собранный
 * из примитивов каталога (`src/primitives`): строка списка, двухчастный чип,
 * статусная пилюля, serif-заголовок вердикта, таблица с итогом, заметка на
 * утопленном фоне, карточка протокола и меню «Скачать». Своего листа стилей у
 * рендерера нет — оформление приходит токенами через примитивы, и тот же
 * набор обслуживает `LiftReportNext`.
 *
 * Схема props общая со старым рендерером намеренно: одно наполнение обязано
 * рендериться обоими, иначе сравнивать нечего. Контракт действий тот же —
 * каждая кнопка диспатчит `{event: {name, context: payload ?? {}}}`.
 *
 * Отличия исполнения, а не контракта (канон change'а `proba-report-assembly`):
 * протокол — одна строка без раскрытия, `protocol.content` на экране не
 * выводится и участвует только в скачивании; слова статуса зашиты в рендерер;
 * кнопка «Подобрать» — `outline`, единственный акцент экрана — вердикт.
 */
export const ThermalReportNext = createComponentImplementation(
  thermalReportNextDefinition,
  ({props, context}) => {
    useA2uiBaseStyles();

    const handleAction = (action: ThermalReportAction) => {
      void context.dispatchAction({
        event: {name: action.name, context: action.payload ?? {}},
      });
    };

    return <ThermalReportNextScreen props={props} onAction={handleAction} />;
  },
);
