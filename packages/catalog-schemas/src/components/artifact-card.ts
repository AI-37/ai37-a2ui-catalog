import {z} from 'zod';
import {type CatalogComponentDefinition} from '../types';

/**
 * uuid артефакта или его файла. Регулярка, а не `z.string().uuid()`: JSON Schema
 * получает `pattern`, который один в один повторяет Pydantic-зеркало (формат
 * `uuid` там выглядел бы иначе). Ссылки рендерер собирает сам из этих id —
 * поэтому агент не может подсунуть в карточку произвольный href.
 */
export const ARTIFACT_ID_PATTERN =
  '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';

const artifactIdSchema = z.string().regex(new RegExp(ARTIFACT_ID_PATTERN));

/** Бинарный файл артефакта (ZIP, исходная таблица): id из ответа `publishArtifact`. */
export const artifactCardFileSchema = z
  .object({
    id: artifactIdSchema,
    fileName: z.string().min(1).max(255),
    /** Подпись пункта меню; по умолчанию — имя файла. */
    label: z.string().min(1).max(80).optional(),
  })
  .strict();

/**
 * Выгрузки из markdown, которые рендерит chat-backend: `docx` — Word, `md` —
 * сам markdown. Нет поля — обе. Пустой список — markdown не предлагается
 * (артефакт — только файлы).
 */
export const artifactCardFormatSchema = z.enum(['docx', 'md']);

/**
 * Карточка артефакта агента — результата хода, который сохранён в выходной
 * полке chat-backend (план files-and-artifacts-layer §3.3). Байты по A2A не
 * идут: карточка несёт id, а ссылки на скачивание рендерер строит сам под
 * `/api/artifacts/<id>/…` хоста.
 */
export const artifactCardPropsSchema = z
  .object({
    artifactId: artifactIdSchema,
    name: z.string().min(1).max(200),
    /** Тип домена (`lift-report`, `pdn-policy`, …) — мета, если нет `meta`. */
    kind: z.string().min(1).max(64).optional(),
    /** Готовая строка меты: «Расчёт лифтов · ГОСТ Р 52941-2008». */
    meta: z.string().min(1).max(200).optional(),
    /** Короткая выжимка: мета, если нет ни `meta`, ни `kind`. */
    summary: z.string().min(1).max(500).optional(),
    /** Полка на момент ответа: `project` — уже в проекте, кнопки сохранения нет. */
    scope: z.enum(['chat', 'project']).optional(),
    formats: z.array(artifactCardFormatSchema).max(2).optional(),
    files: z.array(artifactCardFileSchema).max(20).optional(),
  })
  .strict();

export type ArtifactCardFile = z.infer<typeof artifactCardFileSchema>;
export type ArtifactCardFormat = z.infer<typeof artifactCardFormatSchema>;
export type ArtifactCardProps = z.infer<typeof artifactCardPropsSchema>;

export const artifactCardDefinition: CatalogComponentDefinition<typeof artifactCardPropsSchema> = {
  name: 'ArtifactCard',
  slug: 'artifact-card',
  description:
    'A saved agent artifact (calculation protocol, generated document, package) stored in the chat-backend output shelf: one row with the artifact name, a meta line and a "Download" menu (Word and Markdown rendered from the artifact markdown, plus any binary files), and — when the host supports it — a "Save to project" button. Emit it after `publishArtifact` with the returned id; download links are built by the renderer from the ids, never taken from props. Always accompany it with a plain-text answer that contains the markdown link to `/api/artifacts/<id>` for clients that do not render this catalog.',
  schema: artifactCardPropsSchema,
};
