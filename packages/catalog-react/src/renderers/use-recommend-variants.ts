import React from 'react';
import {
  AGENT_RESOURCE_ROUTE,
  RECOMMEND_DEBOUNCE_MS,
  type LiftEditorRecommend,
  type RecommendResourceVariant,
} from '@ai37/a2ui-catalog-schemas';
import {buildRecommendQuery} from './build-recommend-query';
import {isRecommendEchoStale} from './is-recommend-echo-stale';
import {parseRecommendVariants} from './parse-recommend-variants';
import {readRecommendEcho} from './read-recommend-echo';
import type {LiftFieldValues} from './lift-editor.types';
import type {RecommendState, UseRecommendVariants} from './recommend.types';

/**
 * Побочный канал подбора: debounced same-origin
 * `GET {AGENT_RESOURCE_ROUTE}?resource=…`, `AbortController` гасит предыдущий
 * запрос, unmount отменяет активный. Устроен по образцу `useLookupSuggest` —
 * это второй канал каталога, а не новая механика.
 *
 * Любой сбой — тихий: 404, сеть, мусорное тело → блока просто нет. Форма
 * работает как без пропа: красным в форме расчёта пугать нечем, подбор — не
 * обязательная часть документа.
 *
 * Актуальность судится ключом запроса, а не порядком ответов: пришедший на
 * прежний ввод ответ выбрасывается молча, а прежний список до нового остаётся
 * на экране приглушённым (`stale`), чтобы блок не прыгал.
 */
export function useRecommendVariants({
  recommend,
  building,
  lift,
}: {
  recommend: LiftEditorRecommend;
  building: LiftFieldValues;
  lift: LiftFieldValues;
}): UseRecommendVariants {
  const query = buildRecommendQuery({recommend, building, lift});
  const queryKey = query?.key ?? null;

  const [result, setResult] = React.useState<{
    key: string;
    variants: RecommendResourceVariant[];
  } | null>(null);
  // Ключ, по которому идёт дебаунс или запрос: он и отличает `loading` от
  // «уже показанного».
  const [pendingKey, setPendingKey] = React.useState<string | null>(null);

  // Параметры читаются в момент срабатывания таймера, а не замыкаются: пока
  // идёт пауза, пользователь мог набрать ещё цифру.
  const latest = React.useRef(query);
  latest.current = query;

  React.useEffect(() => {
    if (queryKey === null) {
      setPendingKey(null);
      return undefined;
    }

    const controller = new AbortController();
    setPendingKey(queryKey);

    const timer = setTimeout(() => {
      const current = latest.current;
      if (current === null) return;

      void (async () => {
        try {
          const response = await fetch(`${AGENT_RESOURCE_ROUTE}?${current.params}`, {
            signal: controller.signal,
          });
          if (!response.ok) {
            setResult(null);
            setPendingKey(null);
            return;
          }

          const body: unknown = await response.json();
          const variants = parseRecommendVariants(body);
          // Не наш ответ либо эхо про другой ввод — тихий выброс: список не
          // трогаем, блок уходит в `hidden`, форма работает.
          if (variants === null || isRecommendEchoStale(readRecommendEcho(body), current.params)) {
            setResult(null);
            setPendingKey(null);
            return;
          }

          setResult({key: current.key, variants});
          setPendingKey(null);
        } catch {
          // Отменённый запрос — не сбой: его `pendingKey` уже поднял следующий
          // ввод, и гасить состояние нельзя.
          if (controller.signal.aborted) return;
          setResult(null);
          setPendingKey(null);
        }
      })();
    }, RECOMMEND_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [queryKey]);

  return {state: resolveState(queryKey, pendingKey, result), variants: result?.variants ?? []};
}

/**
 * Что показывать. Порядок веток и есть смысл: пока идёт запрос по новому
 * вводу, прежний список остаётся `stale`, и только при отсутствии прежнего
 * блок показывает `loading`.
 */
function resolveState(
  queryKey: string | null,
  pendingKey: string | null,
  result: {key: string; variants: RecommendResourceVariant[]} | null,
): RecommendState {
  if (queryKey === null) return 'hidden';

  if (result !== null && result.key === queryKey) {
    return result.variants.length > 0 ? 'shown' : 'empty';
  }

  if (pendingKey !== null) {
    return result !== null ? 'stale' : 'loading';
  }

  return 'hidden';
}
