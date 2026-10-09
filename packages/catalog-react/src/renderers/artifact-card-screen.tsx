import React from 'react';
import type {ArtifactCardProps} from '@ai37/a2ui-catalog-schemas';
import {Button, KIT_SCOPE, KitStyles, Menu, ReportProtocolCard} from '../primitives';
import {artifactDownloadItems, artifactMeta, safeArtifactsBaseUrl} from './artifact-card-links';
import type {ArtifactCardHost} from './artifact-card-host';
import {useSaveToProject, type SaveToProjectState} from './use-save-to-project';

/**
 * Карточка артефакта на примитивах: одна строка протокола — имя, мета и
 * действия справа. Скачивать нечего (нет форматов и файлов) — меню нет.
 *
 * Отдельно от рендерера, как у отчётов: песочница ставит экран без a2ui-хоста.
 */
export function ArtifactCardScreen({props, host}: {props: ArtifactCardProps; host: ArtifactCardHost}) {
  const items = artifactDownloadItems(props, safeArtifactsBaseUrl(host.baseUrl));
  const save = useSaveToProject(
    props.artifactId,
    host.onSaveToProject,
    props.scope === 'project' ? 'saved' : 'idle',
  );

  return (
    <div className={KIT_SCOPE}>
      <KitStyles />
      <ReportProtocolCard
        label={props.name}
        meta={artifactMeta(props)}
        action={
          <span style={actionsStyle}>
            <SaveControl state={save.state} canSave={save.canSave} onSave={save.save} />
            {items.length > 0 ? <Menu label="Скачать" side="top" items={items} /> : null}
          </span>
        }
      />
    </div>
  );
}

function SaveControl({
  state,
  canSave,
  onSave,
}: {
  state: SaveToProjectState;
  canSave: boolean;
  onSave: () => void;
}) {
  if (state === 'saved') {
    return <span className="a2ui-t--sub a2ui-t--muted">В проекте</span>;
  }
  if (!canSave) return null;
  return (
    <>
      {state === 'failed' ? (
        <span className="a2ui-t--sub a2ui-t--muted" role="status">
          Не удалось сохранить
        </span>
      ) : null}
      <Button variant="outline" size="sm" disabled={state === 'saving'} onClick={onSave}>
        {state === 'saving' ? 'Сохраняю…' : 'Сохранить в проект'}
      </Button>
    </>
  );
}

const actionsStyle: React.CSSProperties = {display: 'inline-flex', alignItems: 'center', gap: 8};
