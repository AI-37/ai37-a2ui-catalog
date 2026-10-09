import {useArtifactCardHost} from './artifact-card-host';
import {reportArtifactId} from './report-artifact-id';
import {useSaveToProject, type SaveToProject} from './use-save-to-project';

/**
 * «Сохранить в проект» для протокола отчёта. Хост тот же, что у `ArtifactCard`
 * (`ArtifactCardHostProvider` → `onSaveToProject`), второго контекста нет.
 * Пункт появляется, только когда `downloadUrl` указывает на артефакт и хост дал
 * обработчик: без провайдера, в widget-канале и для `/api/agent-resource?…`
 * `canSave` — false.
 */
export function useReportSaveToProject(downloadUrl: string | undefined): SaveToProject {
  const {onSaveToProject} = useArtifactCardHost();
  const artifactId = downloadUrl === undefined ? undefined : reportArtifactId(downloadUrl);
  return useSaveToProject(artifactId, onSaveToProject);
}
