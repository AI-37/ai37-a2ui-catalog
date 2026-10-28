import type {ProposalCardProps} from '@ai37/a2ui-catalog-schemas';
import {isProposalDecideHref} from './is-proposal-decide-href';
import type {ProposalCardFooterKind} from './proposal-card.types';

/**
 * Подвал карточки по правилам плана (docs#545 §3.7):
 * - решённая или заменённая пачка — ни кнопки, ни ссылки, состояние скажет шапка;
 * - у зрителя нет права решать — тоже ничего;
 * - живая задача (`confirm` пришёл, поверхность не прошлая) — кнопка;
 * - задачи нет — ссылка на «Требуют решения», если адрес безопасный.
 */
export function resolveProposalCardFooter(
  props: ProposalCardProps,
  readOnly: boolean,
): ProposalCardFooterKind {
  if (props.state !== 'open' || props.canDecide === false) {
    return 'none';
  }
  if (props.confirm !== undefined && !readOnly) {
    return 'confirm';
  }
  if (props.decideLink !== undefined && isProposalDecideHref(props.decideLink.href)) {
    return 'link';
  }
  return 'none';
}
