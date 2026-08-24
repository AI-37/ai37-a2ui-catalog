import type {RecommendVariant} from './recommend.types';

/**
 * Применение варианта в песочнице: получатель — консоль, как у черновиков
 * витрины. Настоящее применение (сборка `count` лифтовых секций, пометка
 * `touched`, немедленный черновик) живёт в `use-lift-editor-next.ts` пакета и
 * сюда не переносится: песочница смотрит на вид блока, а не второй раз
 * считает то же самое.
 */
export function applyRecommendVariant(variant: RecommendVariant): void {
  console.log('[recommend]', {id: variant.id, apply: variant.apply});
}
