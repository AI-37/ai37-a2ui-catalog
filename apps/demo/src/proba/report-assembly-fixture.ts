import {
  liftReportPropsSchema,
  thermalReportPropsSchema,
  verificationReportPropsSchema,
} from '@ai37/a2ui-catalog-schemas';
import liftFixture from '../../../../fixtures/valid/lift-report.json';
import multiFixture from '../../../../fixtures/valid/thermal-report-multi.json';
import singleFixture from '../../../../fixtures/valid/thermal-report-single.json';
import verificationPassFixture from '../../../../fixtures/valid/verification-report-pass.json';
import verificationReviewFixture from '../../../../fixtures/valid/verification-report-review.json';
import type {ReportAssemblyBlock} from './report-assembly.types';

/**
 * Наполнение страницы — валидные фикстуры каталога, а не выдуманные данные.
 * Три вместе покрывают всё, что у отчётов есть: вердикт обоих статусов,
 * проверки со справочной строкой, конструкции с отклонениями и исключённые,
 * допущения, таблица слоёв, «Что изменить» с рекомендованным и непроходящим
 * вариантом, группа `tone: 'warning'` и оба вида «Скачать».
 *
 * Разбор схемой, а не приведение типа: JSON из репозитория и типы пакета
 * разъезжаются молча, а `parse` уронит страницу на первом же расхождении.
 */
export const REPORT_BLOCKS: ReportAssemblyBlock[] = [
  {
    kind: 'thermal',
    id: 'thermal-single',
    title: 'ThermalReport · одна конструкция',
    lead: 'Вердикт, проверки, таблица слоёв, исходные данные, протокол.',
    props: thermalReportPropsSchema.parse(singleFixture.props),
  },
  {
    kind: 'thermal',
    id: 'thermal-multi',
    title: 'ThermalReport · список конструкций',
    lead: 'Тот же компонент в другом режиме: конструкции с отклонениями, исключённые, допущения.',
    props: thermalReportPropsSchema.parse(multiFixture.props),
  },
  {
    kind: 'lift',
    id: 'lift',
    title: 'LiftReport',
    lead: 'Вердикт, «Что изменить» с пересчитанными вариантами, исходные данные, протокол.',
    props: liftReportPropsSchema.parse(liftFixture.props),
  },
  {
    kind: 'verification',
    id: 'verification-review',
    title: 'VerificationReport · проверка контрагента',
    lead: 'Вердикт «требует проверки», восемь проверок: строки с деталями раскрываются, остальные — обычные строки.',
    props: verificationReportPropsSchema.parse(verificationReviewFixture.props),
  },
  {
    kind: 'verification',
    id: 'verification-single',
    title: 'VerificationReport · точечная проверка',
    lead: 'Тот же компонент с одной строкой: вердикт карточки — статус этой проверки.',
    props: verificationReportPropsSchema.parse(verificationPassFixture.props),
  },
];
