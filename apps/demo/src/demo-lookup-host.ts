import type {A2uiMessage, ComponentApi, MessageProcessor} from '@a2ui/web_core/v0_9';
import {
  LOOKUP_SUGGEST_ACTION,
  lookupOptionsPath,
  type LookupOption,
  type LookupSuggestActionContext,
} from '@ai37/a2ui-catalog-schemas';

/** Демо-справочник `cities`: города для превью lookup-поля FormCard. */
const DEMO_CITIES = [
  'Москва',
  'Санкт-Петербург',
  'Новосибирск',
  'Екатеринбург',
  'Казань',
  'Нижний Новгород',
  'Челябинск',
  'Самара',
  'Омск',
  'Ростов-на-Дону',
  'Уфа',
  'Красноярск',
  'Воронеж',
  'Пермь',
  'Волгоград',
  'Краснодар',
  'Сочи',
  'Мурманск',
  'Якутск',
  'Владивосток',
];

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
      city.toLowerCase().includes(needle),
    ).map(city => ({value: city, label: city}));

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
