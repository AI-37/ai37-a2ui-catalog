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

/** Same-origin путь suggest-запросов fetch-режима lookup-поля (обобщённая ручка ресурсов). */
export const LOOKUP_SUGGEST_ROUTE = '/api/agent-resource';

/** Задержка debounce перед запросом подсказок (оба режима lookup), мс. */
export const LOOKUP_DEBOUNCE_MS = 300;
