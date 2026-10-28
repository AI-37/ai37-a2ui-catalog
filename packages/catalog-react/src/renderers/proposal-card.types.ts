import type {ProposalCardProps} from '@ai37/a2ui-catalog-schemas';

/**
 * Что стоит в подвале карточки: кнопка подтверждения, ссылка на страницу
 * решений или ничего. Считает `resolveProposalCardFooter`, экран только рисует.
 */
export type ProposalCardFooterKind = 'confirm' | 'link' | 'none';

/** Получатель решения: рендерер диспатчит действие, demo — пишет в лог. */
export interface ProposalCardSink {
  onConfirm: () => void;
}

export interface ProposalCardScreenProps {
  props: ProposalCardProps;
  /** Прошлая поверхность хоста: живой задачи у агента нет, кнопка не показывается. */
  readOnly: boolean;
  /** Подтверждение уже отправлено: кнопка гаснет, повторного действия нет. */
  sent: boolean;
  sink: ProposalCardSink;
}
