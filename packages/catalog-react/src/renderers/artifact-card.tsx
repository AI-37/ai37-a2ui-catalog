import React from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {artifactCardDefinition} from '@ai37/a2ui-catalog-schemas';
import {ArtifactCardScreen} from './artifact-card-screen';
import {useArtifactCardHost} from './artifact-card-host';
import {useA2uiBaseStyles} from './shared';

/**
 * Карточка артефакта агента (выходная полка chat-backend). Действий агенту у
 * неё нет: скачивание — ссылки, «Сохранить в проект» — вызов хоста через
 * `ArtifactCardHostProvider`.
 */
export const ArtifactCard = createComponentImplementation(artifactCardDefinition, ({props}) => {
  useA2uiBaseStyles();
  const host = useArtifactCardHost();
  return <ArtifactCardScreen props={props} host={host} />;
});
