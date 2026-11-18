import type {CherdachnyeSubtype} from '@ai37/a2ui-catalog-schemas';
import {RU_MESSAGES, type A2uiMessages} from '../i18n';

/**
 * Подписи subtype-селекта карточки. Сам enum subtype — часть контракта схемы
 * (домен СП 50), поэтому и подписи фиксируются в рендерере, а не в props.
 */
export function cherdachnyeSubtypeLabels(
  messages: A2uiMessages = RU_MESSAGES,
): Record<CherdachnyeSubtype, string> {
  const m = messages.constructions;

  return {
    cherdak: m.subtypeCherdak,
    podval_vent: m.subtypePodvalVent,
    podval_nevent: m.subtypePodvalNevent,
    pol_po_gruntu: m.subtypePolPoGruntu,
  };
}
