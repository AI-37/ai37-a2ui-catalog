import React from 'react';
import {
  LOOKUP_DEBOUNCE_MS,
  LOOKUP_MIN_CHARS_DEFAULT,
  LOOKUP_SUGGEST_ROUTE,
  type LookupOption,
} from '@ai37/a2ui-catalog-schemas';
import {parseLookupOptions} from './parse-lookup-options';

export type UseLookupSuggestParams = {
  referenceId: string;
  minChars?: number | undefined;
};

export type UseLookupSuggest = {
  /** Видимые опции дропдауна. */
  options: LookupOption[];
  /**
   * Идёт поиск: с момента прохождения порога `minChars` (включая паузу
   * debounce) и до ответа/ошибки. Отмена запроса следующим вводом `loading`
   * не гасит — его уже поднял этот следующий ввод.
   */
  loading: boolean;
  /** По текущему вводу уже был завершённый запрос: пустые `options` = «ничего не найдено». */
  queried: boolean;
  /** Ввод пользователя: debounce + запрос подсказок (или сброс ниже порога). */
  handleInputText: (text: string) => void;
  /** Закрыть дропдаун (blur, Escape, выбор опции); сбрасывает и статусы. */
  closeOptions: () => void;
};

/**
 * Fetch-канал подсказок lookup: debounced same-origin GET
 * `LOOKUP_SUGGEST_ROUTE?resource=&query=` (resource = referenceId справочника).
 * `AbortController` отменяет
 * предыдущий in-flight запрос, так что виден только ответ на последний ввод;
 * unmount отменяет активный запрос. Любой сбой канала — тихий fallback:
 * пустой дропдаун, поле остаётся редактируемым. Общий для lookup-поля
 * FormCard (fetch-режим) и строк слоёв ConstructionsEditor.
 */
export function useLookupSuggest({referenceId, minChars}: UseLookupSuggestParams): UseLookupSuggest {
  const [options, setOptions] = React.useState<LookupOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [queried, setQueried] = React.useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const abortRef = React.useRef<AbortController | null>(null);

  const threshold = minChars ?? LOOKUP_MIN_CHARS_DEFAULT;

  React.useEffect(
    () => () => {
      clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const requestOptions = async (query: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // `resource` = id справочника: fetch-канал ходит через обобщённую ручку ресурсов
    // оркестратора (LOOKUP_SUGGEST_ROUTE = /api/agent-resource), а не /api/reference-suggest.
    const params = new URLSearchParams({resource: referenceId, query});

    try {
      const response = await fetch(`${LOOKUP_SUGGEST_ROUTE}?${params}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        setOptions([]);
        setLoading(false);
        setQueried(true);
        return;
      }
      const body: unknown = await response.json();
      setOptions(parseLookupOptions(body));
      setLoading(false);
      setQueried(true);
    } catch {
      // Отменённый запрос (новый ввод/unmount) — не сбой: его ответ просто
      // не нужен, состояние (включая `loading` нового ввода) не трогаем.
      // Остальное — тихий fallback, но запрос считается завершённым.
      if (!controller.signal.aborted) {
        setOptions([]);
        setLoading(false);
        setQueried(true);
      }
    }
  };

  const handleInputText = (text: string) => {
    clearTimeout(debounceRef.current);

    const query = text.trim();
    if (query.length < threshold) {
      abortRef.current?.abort();
      setOptions([]);
      setLoading(false);
      setQueried(false);
      return;
    }
    // `loading` поднимается уже здесь, а не в момент fetch: пауза debounce —
    // та самая дырка, из-за которой поле выглядело пустым.
    setLoading(true);
    setQueried(false);
    debounceRef.current = setTimeout(() => {
      void requestOptions(query);
    }, LOOKUP_DEBOUNCE_MS);
  };

  const closeOptions = () => {
    setOptions([]);
    setLoading(false);
    setQueried(false);
  };

  return {options, loading, queried, handleInputText, closeOptions};
}
