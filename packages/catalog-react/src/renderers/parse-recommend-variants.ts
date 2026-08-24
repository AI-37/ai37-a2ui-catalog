import {
  recommendResourceResponseSchema,
  recommendResourceVariantSchema,
  type RecommendResourceVariant,
} from '@ai37/a2ui-catalog-schemas';

/**
 * Тело ответа подбора → варианты. `null` — это не наш ответ вовсе (мусор,
 * чужой JSON, отсутствующий `variants`): такой случай блок прячет, а не
 * показывает пустым — «ничего не подошло» и «канал сломан» пользователю
 * читаются одинаково, а значат разное.
 *
 * Разбор поэлементный: один кривой вариант выбрасывается, остальные
 * показываются. Вариант без `apply.values` применять нечем — он и есть кривой.
 */
export function parseRecommendVariants(body: unknown): RecommendResourceVariant[] | null {
  const envelope = recommendResourceResponseSchema.safeParse(body);
  if (!envelope.success) {
    return null;
  }

  const variants: RecommendResourceVariant[] = [];
  for (const item of envelope.data.variants) {
    const parsed = recommendResourceVariantSchema.safeParse(item);
    if (parsed.success) {
      variants.push(parsed.data);
    }
  }

  return variants;
}
