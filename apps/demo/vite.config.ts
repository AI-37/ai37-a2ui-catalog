import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {LOOKUP_SUGGEST_ROUTE} from '../../packages/catalog-schemas/src/components/form-card-lookup-fetch';
import {DEMO_CITIES} from './src/demo-cities';
import {DEMO_LIFT_RECOMMEND, DEMO_LIFT_RECOMMEND_RESOURCE} from './src/demo-lift-recommend';
import {DEMO_MATERIALS} from './src/demo-materials';

/**
 * Dev-имитация suggest-роута fetch-режима lookup (контракт
 * form-card-lookup-fetch-e2e): same-origin GET, справочники `cities`
 * (lookup-поле FormCard и вкладка «Общие данные» ConstructionsEditor, опции с
 * климатом) и `sp50-materials` (строки ConstructionsEditor, опции с λА/λБ),
 * неизвестный referenceId → 404 unknown_reference. Только
 * dev — в собранной статике роута нет (fetch-режим тихо деградирует).
 */
function referenceSuggestMiddleware(): Plugin {
  return {
    name: 'demo-reference-suggest',
    configureServer(server) {
      server.middlewares.use(LOOKUP_SUGGEST_ROUTE, (req, res) => {
        const url = new URL(req.url ?? '/', 'http://localhost');
        // Wire-параметр канала — `resource` (= referenceId справочника), см. use-lookup-suggest.
        const referenceId = url.searchParams.get('resource') ?? '';
        const query = (url.searchParams.get('query') ?? '').trim().toLowerCase();

        res.setHeader('content-type', 'application/json');
        if (referenceId === 'cities') {
          // Опции отдаются целиком, вместе с климатом: FormCard лишние поля
          // игнорирует, вкладка «Общие данные» подставляет tot/zot/tn.
          const options = DEMO_CITIES.filter(city => city.label.toLowerCase().includes(query));
          res.end(JSON.stringify({options}));
          return;
        }

        if (referenceId === 'sp50-materials') {
          // Ищем и по слотам оформления: раздел табл. М.1 живёт в `group`,
          // в `label` его может не быть — как у настоящего агента-справочника.
          const options = DEMO_MATERIALS.filter(material =>
            [material.label, material.group, material.title].some(text =>
              text?.toLowerCase().includes(query),
            ),
          );
          res.end(JSON.stringify({options}));
          return;
        }

        // Подбор конфигураций лифтов: ручка агента (`/api/recommend`) в dev
        // не поднята, а блок редактора ходит в ту же обобщённую ручку
        // ресурсов. `echo` возвращаем нормализованным числом — рендерер
        // обязан пережить «17» → 17, иначе свежий ответ считался бы протухшим.
        if (referenceId === DEMO_LIFT_RECOMMEND_RESOURCE) {
          // Живой агент вместо стаба: с `AGENT_RECOMMEND_URL` (напр.
          // http://localhost:8081/api/recommend от spai-elevator-calc-agent в
          // dev) середина цепочки повторяет оркестратор — форвардит весь query,
          // кроме служебного `resource`, и отдаёт ответ как есть. Так блок
          // видно на настоящем подборе, а не на пяти выдуманных строках.
          const agentUrl = process.env.AGENT_RECOMMEND_URL;
          if (agentUrl) {
            const target = new URL(agentUrl);
            for (const [name, value] of url.searchParams) {
              if (name === 'resource') continue;
              target.searchParams.set(name, value);
            }
            void fetch(target)
              .then(async agentRes => {
                res.statusCode = agentRes.status;
                res.end(await agentRes.text());
              })
              .catch(() => {
                // Агент не поднят — та же тихая деградация, что в проде.
                res.statusCode = 502;
                res.end(JSON.stringify({error: 'agent_unreachable'}));
              });
            return;
          }

          const echo: Record<string, string | number> = {};
          for (const [name, value] of url.searchParams) {
            if (name === 'resource' || name === 'taskId') continue;
            echo[name] = value.trim() !== '' && !Number.isNaN(Number(value)) ? Number(value) : value;
          }
          res.end(JSON.stringify({echo, variants: DEMO_LIFT_RECOMMEND}));
          return;
        }

        res.statusCode = 404;
        res.end(JSON.stringify({error: 'unknown_reference'}));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), referenceSuggestMiddleware()],
  server: {
    fs: {
      allow: ['../../'],
    },
  },
  resolve: {
    alias: {
      '@ai37/a2ui-catalog-schemas': path.resolve(__dirname, '../../packages/catalog-schemas/src/index.ts'),
      // Подпуть примитивов раньше корня пакета: алиасы матчатся по префиксу в
      // порядке объявления, иначе `…/primitives` склеится с путём до index.ts.
      '@ai37/a2ui-catalog-react/primitives': path.resolve(
        __dirname,
        '../../packages/catalog-react/src/primitives/index.ts',
      ),
      '@ai37/a2ui-catalog-react': path.resolve(__dirname, '../../packages/catalog-react/src/index.ts'),
    },
  },
});
