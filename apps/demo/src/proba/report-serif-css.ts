/**
 * Serif-заголовок вердикта. Ступень у него уже есть — `display` (26/1.2/500);
 * недостающее — семейство. Поэтому это ось существующей ступени, а не
 * четвёртая ступень шкалы: значение объявлено токеном, и поверхность может
 * перекрасить его у себя на корне, как остальные.
 */
export const PROBA_SERIF_CSS = `
.a2ui-kit { --a2ui-font-serif: Georgia, 'Times New Roman', serif; }

.a2ui-kit .a2ui-t--serif { font-family: var(--a2ui-font-serif); }
`;
