import type {CherdachnyeSubtype} from '@ai37/a2ui-catalog-schemas';

/**
 * Подписи subtype-селекта карточки. Сам enum subtype — часть контракта схемы
 * (домен СП 50), поэтому и подписи фиксируются в рендерере, а не в props.
 */
export const CHERDACHNYE_SUBTYPE_LABELS: Record<CherdachnyeSubtype, string> = {
  cherdak: 'Чердачное перекрытие',
  podval_vent: 'Цокольное перекрытие (подполье вентилируемое)',
  podval_nevent: 'Цокольное перекрытие (подполье невентилируемое)',
  pol_po_gruntu: 'Пол по грунту',
};
