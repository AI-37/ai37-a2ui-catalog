const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

/** `/api/artifacts/<uuid>` в пути, дальше — конец пути или следующий сегмент. */
const ARTIFACT_PATH = new RegExp(`/api/artifacts/(${UUID})(?:/|$)`, 'i');

/**
 * id артефакта выходной полки из `protocol.downloadUrl` отчёта
 * (`/api/artifacts/<id>/content?format=md`, план files-and-artifacts-layer §3.4).
 * Смотрим только путь: query и фрагмент отрезаны, чтобы `?next=/api/artifacts/…`
 * не выдал себя за артефакт. id — только uuid; любая другая форма (ресурс агента,
 * чужой адрес, не-uuid) — undefined, сохранять в проект нечего.
 */
export function reportArtifactId(downloadUrl: string): string | undefined {
  const path = downloadUrl.split(/[?#]/, 1)[0] ?? '';
  return ARTIFACT_PATH.exec(path)?.[1]?.toLowerCase();
}
