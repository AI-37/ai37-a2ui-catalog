import {useMemo, useState} from 'react';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {MessageProcessor, type A2uiMessage} from '@a2ui/web_core/v0_9';
import {ai37Catalog} from '@ai37-a2ui/catalog-react';
import simpleTableMessages from '../../../fixtures/messages/simple-table-surface.json';
import flexTableMessages from '../../../fixtures/messages/flex-table-surface.json';
import latexMessages from '../../../fixtures/messages/latex-formula-surface.json';

const examples = [
  {
    key: 'simple',
    title: 'Simple Table',
    description: 'Одноуровневая таблица для лаконичных выборок и перечней.',
    messages: simpleTableMessages as A2uiMessage[],
  },
  {
    key: 'flex',
    title: 'Flex Table',
    description: 'Многоуровневые заголовки для сравнительных отчетов и матриц.',
    messages: flexTableMessages as A2uiMessage[],
  },
  {
    key: 'latex',
    title: 'LaTeX Formula',
    description: 'Математические формулы для объяснений и аналитических выводов.',
    messages: latexMessages as A2uiMessage[],
  },
] as const;

export function App() {
  const [selectedKey, setSelectedKey] = useState<(typeof examples)[number]['key']>('simple');
  const selected = examples.find(example => example.key === selectedKey)!;

  const surface = useMemo(() => {
    const processor = new MessageProcessor([ai37Catalog]);
    processor.processMessages(selected.messages);
    return processor.model.getSurface('demo-surface');
  }, [selected]);

  return (
    <main className="demo-shell">
      <section className="demo-hero">
        <div>
          <span className="demo-eyebrow">AI37 A2UI Catalog</span>
          <h1>Custom components tuned for agent-generated analytical content</h1>
          <p>
            Demo показывает тот же контракт, который получают Python и TypeScript агенты: строгие схемы,
            фиксированный catalog ID и предсказуемый React renderer.
          </p>
        </div>
      </section>

      <section className="demo-grid">
        <aside className="demo-sidebar">
          {examples.map(example => (
            <button
              key={example.key}
              className={example.key === selectedKey ? 'demo-example demo-example-active' : 'demo-example'}
              onClick={() => setSelectedKey(example.key)}
              type="button"
            >
              <strong>{example.title}</strong>
              <span>{example.description}</span>
            </button>
          ))}
        </aside>

        <section className="demo-stage">
          <header className="demo-stage-header">
            <h2>{selected.title}</h2>
            <p>{selected.description}</p>
          </header>
          <div className="demo-surface-card">{surface ? <A2uiSurface surface={surface as any} /> : null}</div>
        </section>
      </section>
    </main>
  );
}
