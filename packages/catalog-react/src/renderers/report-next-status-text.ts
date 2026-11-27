import {RU_MESSAGES, type A2uiMessages} from '../i18n';

/** Состояние строки отчёта, у которого есть своё слово. */
export type ReportNextStatus = 'pass' | 'fail';

/**
 * Слова состояния, сводимого к перечислению. Зашиты в рендерер (словарь
 * `report`), а не приходят строкой: состояние названо перечислением, и
 * разрешить агенту выбирать для него слово — значит разрешить двум отчётам
 * говорить об одном и том же по-разному (`statusLabel` чтится только вне
 * перечисления).
 */
export function reportNextStatusText(
  status: ReportNextStatus,
  messages: A2uiMessages = RU_MESSAGES,
): string {
  return messages.report[status];
}
