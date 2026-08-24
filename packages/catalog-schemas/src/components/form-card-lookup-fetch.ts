import {AGENT_RESOURCE_ROUTE} from './lift-editor-recommend';

/**
 * Контракт fetch-канала lookup-поля FormCard (suggestMode: 'fetch').
 *
 * Рендерер шлёт debounced `GET {LOOKUP_SUGGEST_ROUTE}?resource=&query=`
 * (относительный same-origin путь: BFF потребителя проксирует на REST
 * оркестратора, тот резолвит `resource` в ручку агента-владельца справочника).
 * Ответ 200 — `LookupSuggestResponse`; неизвестный resource — 404
 * `{error: "unknown_resource"}`. Потребители контракта (BFF, оркестратор,
 * агенты) импортируют путь и тип отсюда, а не копируют строкой.
 *
 * `resource` = id справочника (значение `field.referenceId` поля lookup): fetch-канал
 * ходит через ОБОБЩЁННУЮ ручку ресурсов оркестратора (одна на все downstream-чтения),
 * а не через отдельный `/api/reference-suggest`.
 */

/**
 * Same-origin путь suggest-запросов fetch-режима lookup-поля. Значение не
 * своё: обобщённая ручка ресурсов одна на все downstream-чтения каталога, и
 * живёт она в `lift-editor-recommend.ts` — два литерала разъехались бы молча.
 */
export const LOOKUP_SUGGEST_ROUTE = AGENT_RESOURCE_ROUTE;

/** Задержка debounce перед запросом подсказок (оба режима lookup), мс. */
export const LOOKUP_DEBOUNCE_MS = 300;
