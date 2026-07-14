/**
 * Контракт fetch-канала lookup-поля FormCard (suggestMode: 'fetch').
 *
 * Рендерер шлёт debounced `GET {LOOKUP_SUGGEST_ROUTE}?referenceId=&query=`
 * (относительный same-origin путь: BFF потребителя проксирует на REST
 * оркестратора, тот — агенту-владельцу справочника). Ответ 200 —
 * `LookupSuggestResponse`; неизвестный referenceId — 404
 * `{error: "unknown_reference"}`. Потребители контракта (BFF, оркестратор,
 * агенты) импортируют путь и тип отсюда, а не копируют строкой.
 */

/** Same-origin путь suggest-запросов fetch-режима lookup-поля. */
export const LOOKUP_SUGGEST_ROUTE = '/api/reference-suggest';

/** Задержка debounce перед запросом подсказок (оба режима lookup), мс. */
export const LOOKUP_DEBOUNCE_MS = 300;
