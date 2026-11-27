import React from 'react';
import type {ProposalCardProps} from '@ai37/a2ui-catalog-schemas';
import {Button, buttonClassName} from '../primitives';
import type {ProposalCardFooterKind, ProposalCardSink} from './proposal-card.types';

interface ProposalCardFooterProps {
  kind: ProposalCardFooterKind;
  props: ProposalCardProps;
  sent: boolean;
  sink: ProposalCardSink;
}

/**
 * Подвал: главная кнопка `filled lg` (канон `*Next`, без accent) или ссылка
 * на страницу решений тем же размером. Ссылка — `<a>`, а не кнопка: она
 * ведёт на страницу хоста и работает и на прошлой поверхности.
 */
export function ProposalCardFooter({kind, props, sent, sink}: ProposalCardFooterProps) {
  if (kind === 'confirm' && props.confirm !== undefined) {
    return (
      <div style={footerStyle}>
        <Button variant="filled" size="lg" disabled={sent} onClick={sink.onConfirm}>
          {props.confirm.label}
        </Button>
      </div>
    );
  }
  if (kind === 'link' && props.decideLink !== undefined) {
    return (
      <div style={footerStyle}>
        <a className={buttonClassName({size: 'lg'})} href={props.decideLink.href}>
          {props.decideLink.label}
        </a>
      </div>
    );
  }
  return null;
}

const footerStyle: React.CSSProperties = {display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'};
