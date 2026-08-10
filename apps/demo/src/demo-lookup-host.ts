import type {A2uiMessage, ComponentApi, MessageProcessor} from '@a2ui/web_core/v0_9';
import {
  LOOKUP_SUGGEST_ACTION,
  lookupOptionsPath,
  type LookupOption,
  type LookupSuggestActionContext,
} from '@ai37/a2ui-catalog-schemas';
import {DEMO_CITIES} from './demo-cities';

/**
 * Локальная имитация агент-хоста для lookup-канала FormCard.
 *
 * Подписывается на action'ы surface'а и на `lookup:suggest` отвечает
 * `updateDataModel` по контрактному пути `lookupOptionsPath(fieldName)`
 * со значением `{query, options}` — тем же способом, каким это сделает
 * настоящий хост (через тот же MessageProcessor).
 */
export function attachDemoLookupHost(
  processor: MessageProcessor<ComponentApi>,
  surfaceId: string,
): void {
  const surface = processor.model.getSurface(surfaceId);
  if (!surface) return;

  surface.onAction.subscribe(action => {
    if (action.name !== LOOKUP_SUGGEST_ACTION) return;
    const {fieldName, query} = (action.context ?? {}) as Partial<LookupSuggestActionContext>;
    if (!fieldName || typeof query !== 'string') return;

    const needle = query.trim().toLowerCase();
    const options: LookupOption[] = DEMO_CITIES.filter(city =>
      city.label.toLowerCase().includes(needle),
    ).map(city => ({value: city.value, label: city.label}));

    processor.processMessages([
      {
        version: 'v0.9',
        updateDataModel: {
          surfaceId,
          path: lookupOptionsPath(fieldName),
          value: {query, options},
        },
      } as A2uiMessage,
    ]);
  });
}
