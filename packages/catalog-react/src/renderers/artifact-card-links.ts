import type {ArtifactCardProps} from '@ai37/a2ui-catalog-schemas';
import type {MenuItem} from '../primitives';

export const DEFAULT_ARTIFACTS_BASE_URL = '/api/artifacts';

const FORMAT_LABELS = {docx: 'Word (.docx)', md: 'Markdown (.md)'} as const;

/**
 * База ссылок: только путь от корня того же источника. `//host`, схема,
 * обратный слеш или управляющий символ означали бы ссылку наружу — такую
 * базу карточка не берёт и остаётся на `/api/artifacts`.
 */
export function safeArtifactsBaseUrl(baseUrl: string | undefined): string {
  if (baseUrl === undefined) return DEFAULT_ARTIFACTS_BASE_URL;
  const unsafe =
    !baseUrl.startsWith('/') ||
    baseUrl.startsWith('//') ||
    baseUrl.includes('\\') ||
    [...baseUrl].some(ch => ch < ' ') ||
    baseUrl.includes('..');
  return unsafe ? DEFAULT_ARTIFACTS_BASE_URL : baseUrl.replace(/\/+$/, '');
}

/**
 * Пункты «Скачать»: выгрузки из markdown (по умолчанию Word и Markdown), затем
 * файлы артефакта. Ссылки собираются из id, прошедших схему, — href из props
 * не берётся вовсе. Пункты — ссылки: download-заголовки ставит сервер.
 */
export function artifactDownloadItems(props: ArtifactCardProps, baseUrl: string): MenuItem[] {
  const root = `${baseUrl}/${encodeURIComponent(props.artifactId)}`;
  const formats = props.formats ?? ['docx', 'md'];
  const items: MenuItem[] = formats.map(format => ({
    label: FORMAT_LABELS[format],
    href: `${root}/content?format=${format}`,
  }));
  for (const file of props.files ?? []) {
    items.push({
      label: file.label ?? file.fileName,
      href: `${root}/files/${encodeURIComponent(file.id)}`,
    });
  }
  return items;
}

/** Строка меты: готовая `meta`, иначе выжимка, иначе тип домена. */
export function artifactMeta(props: ArtifactCardProps): string | undefined {
  return props.meta ?? props.summary ?? props.kind;
}
