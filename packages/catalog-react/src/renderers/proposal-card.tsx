import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {proposalCardDefinition} from '@ai37/a2ui-catalog-schemas';
import {ProposalCardScreen} from './proposal-card-screen';
import {useA2uiBaseStyles} from './shared';
import {useSurfaceReadOnly} from './surface-read-only';

/**
 * Карточка подтверждения пачки предложений (план AI-37/docs#545 §3.7, §3.9).
 *
 * «Подтвердить» шлёт `action` с `{proposalId, decision: 'accept'}`; хост
 * доставляет его агенту как `userAction` с `surfaceId`, пока задача агента
 * в `input-required`. Под `withReadOnlyGate` карточка не стоит: на прошлой
 * поверхности кнопка прячется сама, а ссылка на «Требуют решения» должна
 * остаться рабочей — живой задачи уже нет, решать пачку надо там.
 */
export const ProposalCard = createComponentImplementation(proposalCardDefinition, ({props, context}) => {
  useA2uiBaseStyles();

  const readOnly = useSurfaceReadOnly();
  const [sent, setSent] = React.useState(false);

  const onConfirm = () => {
    if (sent || props.confirm === undefined) {
      return;
    }
    setSent(true);
    void context.dispatchAction({
      event: {name: props.confirm.action, context: {proposalId: props.proposalId, decision: 'accept'}},
    });
  };

  return <ProposalCardScreen props={props} readOnly={readOnly} sent={sent} sink={{onConfirm}} />;
});
