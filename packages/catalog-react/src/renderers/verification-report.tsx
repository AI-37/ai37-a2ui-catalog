import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {verificationReportDefinition} from '@ai37/a2ui-catalog-schemas';
import {VerificationReportScreen} from './verification-report-screen';
import {useA2uiBaseStyles} from './shared';

/**
 * Результат проверки контрагента на примитивах каталога — тех же, что у
 * `*ReportNext`: шапка-вердикт, подпись секции, строка списка, раскрывашка
 * `SectionItem` и статусная пилюля. Своего листа стилей у рендерера нет.
 *
 * Действий у отчёта нет: раскрытие строк — локальное состояние, наружу
 * ничего не диспатчится. Поэтому на прошлой поверхности компонент не
 * глушится — раскрытие остаётся рабочим, как у остальных отчётов.
 */
export const VerificationReport = createComponentImplementation(
  verificationReportDefinition,
  ({props}) => {
    useA2uiBaseStyles();

    return <VerificationReportScreen props={props} />;
  },
);
