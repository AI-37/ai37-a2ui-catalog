import {recommendResourceResponseSchema} from '@ai37/a2ui-catalog-schemas';

/** Эхо ручки: как она поняла query. Нет эха — сверять нечего, и это не сбой. */
export function readRecommendEcho(body: unknown): Record<string, string | number> | undefined {
  const envelope = recommendResourceResponseSchema.safeParse(body);
  return envelope.success ? envelope.data.echo : undefined;
}
