import React from 'react';
import type {LiftReportSuggestion} from '@ai37/a2ui-catalog-schemas';
import {ReportActionButton} from './report-action-button';
import {StatusPill} from './status-pill';
import type {LiftSuggestionTone} from './report-assembly.types';
import type {StatusPillTone} from './status-pill.types';

/** Тон варианта — в тон пилюли: `neutral` варианта и есть нейтральная пилюля. */
const PILL_TONE: Record<LiftSuggestionTone, StatusPillTone> = {
  pass: 'pass',
  fail: 'fail',
  neutral: 'neutral',
};

/**
 * Правый слот варианта «Что изменить»: кнопка принятия либо статус-лейбл
 * тоном варианта. Оба сразу не приходят — вариант, который не проходит,
 * принимать нечем.
 */
export function LiftSuggestionSide({item}: {item: LiftReportSuggestion}) {
  if (item.action !== undefined) {
    return <ReportActionButton action={item.action} weight="outline" />;
  }

  if (item.statusLabel !== undefined) {
    return <StatusPill tone={PILL_TONE[item.tone]}>{item.statusLabel}</StatusPill>;
  }

  return null;
}
