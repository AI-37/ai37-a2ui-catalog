import React from 'react';
import {Card, CardHeader, KIT_SCOPE, KitStyles} from '../primitives';
import {ProposalCardFooter} from './proposal-card-footer';
import {ProposalCardList} from './proposal-card-list';
import {ProposalCardSource} from './proposal-card-source';
import {ProposalCardState} from './proposal-card-state';
import {ProposalCardTable} from './proposal-card-table';
import type {ProposalCardScreenProps} from './proposal-card.types';
import {resolveProposalCardFooter} from './resolve-proposal-card-footer';

/**
 * Экран карточки отдельно от рендерера — чтобы ставить его в demo без
 * a2ui-хоста. Раскладка — канон `*Next`, как у `AttachmentChoiceCard`:
 * шапка утопленной полосой с пилюлей состояния, пункты, цитата источника,
 * заметка и подвал. Заменённая пачка приглушена целиком: решать по ней
 * нечего, актуальна новая карточка.
 */
export function ProposalCardScreen({props, readOnly, sent, sink}: ProposalCardScreenProps) {
  const footer = resolveProposalCardFooter(props, readOnly);
  const superseded = props.state === 'superseded';

  return (
    <div className={KIT_SCOPE}>
      <KitStyles />

      <Card>
        <div style={bodyStyle}>
          <Card flat>
            <CardHeader
              title={
                <span style={headTitleStyle} className="a2ui-t--body a2ui-t--strong">
                  {props.title}
                </span>
              }
              status={<ProposalCardState state={props.state} />}
            />
          </Card>

          <div className={superseded ? 'a2ui-t--muted' : undefined} style={itemsStyle}>
            {props.view === 'table' ? (
              <ProposalCardTable items={props.items} />
            ) : (
              <ProposalCardList items={props.items} />
            )}
          </div>

          <ProposalCardSource source={props.source} />

          {props.note !== undefined ? (
            <p className="a2ui-t--sub a2ui-t--muted" style={noteStyle}>
              {props.note}
            </p>
          ) : null}

          <ProposalCardFooter kind={footer} props={props} sent={sent} sink={sink} />
        </div>
      </Card>
    </div>
  );
}

const bodyStyle: React.CSSProperties = {display: 'grid', gap: 14, padding: 16};
const headTitleStyle: React.CSSProperties = {flex: 1, minWidth: 0};
const itemsStyle: React.CSSProperties = {minWidth: 0};
const noteStyle: React.CSSProperties = {margin: 0};
