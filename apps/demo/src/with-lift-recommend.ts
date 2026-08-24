import recommendFixture from '../../../fixtures/valid/lift-editor-recommend.json';

/**
 * Проп `recommend` для витрины: берётся из фикстуры каталога, а не пишется
 * здесь заново — контракт блока живёт в одном месте.
 *
 * В dev наполнение блока отдаёт стаб обобщённой ручки ресурсов
 * (`vite.config.ts` → `demo-lift-recommend.ts`): ручки агента `/api/recommend`
 * на этом origin нет. Поднять живой подбор:
 * `AGENT_RECOMMEND_URL=http://localhost:8081/api/recommend pnpm demo` — тогда
 * стенд форвардит query на агента, как это делает оркестратор. В собранной статике стаба тоже нет, и блок просто не
 * показывается — та же тихая деградация, что у fetch-режима lookup.
 */
export function withLiftRecommend(props: Record<string, unknown>): Record<string, unknown> {
  return {...props, recommend: recommendFixture.props.recommend};
}
